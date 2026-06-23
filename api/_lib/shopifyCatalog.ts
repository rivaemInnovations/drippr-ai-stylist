import type { MerchantProduct } from "./schemas.js";
import { getAdminDb } from "./firebaseAdmin.js";

export type CatalogProductEntry = {
  product: MerchantProduct;
  storeUrl: string | null;
  addToCartUrl: string | null;
};

const STORE_BASE_URL = (
  process.env.STORE_BASE_URL || "https://drippr.in"
).replace(/\/$/, "");

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing ${name}`);
  }
  return value.trim();
}

async function shopifyGraphQL(
  query: string,
  variables: Record<string, unknown>,
) {
  const domain = requireEnv("SHOPIFY_STORE_DOMAIN");
  const token = requireEnv("SHOPIFY_ADMIN_TOKEN");
  const apiVersion = process.env.SHOPIFY_API_VERSION?.trim() || "2025-01";

  const res = await fetch(
    `https://${domain}/admin/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json));
  }

  return json;
}

function extractNumericIdFromGid(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/(\d+)$/);
  return match ? match[1] : null;
}

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function buildStoreSearchUrl(title: string) {
  return `${STORE_BASE_URL}/search?q=${encodeURIComponent(title)}`;
}

function buildAddToCartUrl(variantNumericId: string) {
  return `${STORE_BASE_URL}/cart/add?id=${encodeURIComponent(
    variantNumericId,
  )}&quantity=1&return_to=/cart`;
}

export function addToCartUrlForVariant(variantNumericId: string) {
  return buildAddToCartUrl(variantNumericId);
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function normalizeMeasurements(input: any) {
  if (!input || typeof input !== "object") return null;

  const toNumOrNull = (value: any) => {
    if (value === "" || value == null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const measurements = {
    bust: toNumOrNull(input.bust),
    waist: toNumOrNull(input.waist),
    hip: toNumOrNull(input.hip),
    length: toNumOrNull(input.length),
    unit: typeof input.unit === "string" ? input.unit : "in",
  };

  return Object.values({
    bust: measurements.bust,
    waist: measurements.waist,
    hip: measurements.hip,
    length: measurements.length,
  }).some((value) => typeof value === "number")
    ? measurements
    : null;
}

function normalizeMeasurementMetafields(nodes: any[]) {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;

  const raw = nodes.reduce<Record<string, string>>((acc, node) => {
    if (typeof node?.key === "string") {
      acc[node.key] = String(node.value ?? "");
    }
    return acc;
  }, {});

  return normalizeMeasurements(raw);
}

function normalizeVariantMeasurements(input: any) {
  if (!Array.isArray(input)) return [];

  return input
    .map((variant: any) => {
      const variantId =
        typeof variant?.variantId === "string"
          ? variant.variantId
          : typeof variant?.id === "string"
            ? variant.id
            : null;
      const optionValues = Array.isArray(variant?.optionValues)
        ? variant.optionValues.map((value: any) => String(value).trim()).filter(Boolean)
        : Array.isArray(variant?.options)
          ? variant.options.map((value: any) => String(value).trim()).filter(Boolean)
          : [];

      return {
        variantId,
        variantNumericId: extractNumericIdFromGid(variantId),
        title:
          typeof variant?.title === "string" && variant.title.trim()
            ? variant.title.trim()
            : optionValues.join(" / ") || null,
        optionValues,
        availableForSale:
          typeof variant?.availableForSale === "boolean"
            ? variant.availableForSale
            : null,
        sku: typeof variant?.sku === "string" ? variant.sku : null,
        measurements: normalizeMeasurements(variant?.measurements),
      };
    })
    .filter((variant: any) => variant.variantId || variant.optionValues.length);
}

function mergeVariantMeasurements(shopifyVariants: any[], firestoreVariants: any[]) {
  const merged = new Map<string, any>();
  const keyFor = (variant: any) =>
    variant.variantId ||
    (variant.optionValues || []).map((value: string) => value.toLowerCase()).join("|");

  for (const variant of normalizeVariantMeasurements(shopifyVariants)) {
    merged.set(keyFor(variant), variant);
  }

  for (const variant of normalizeVariantMeasurements(firestoreVariants)) {
    const key = keyFor(variant);
    const current = merged.get(key);
    merged.set(key, {
      ...current,
      ...variant,
      measurements: variant.measurements ?? current?.measurements ?? null,
      availableForSale:
        current?.availableForSale ?? variant.availableForSale ?? null,
    });
  }

  return [...merged.values()];
}

async function fetchMerchantProductLookup(productIds: string[]) {
  const lookup = new Map<string, Partial<MerchantProduct>>();
  if (productIds.length === 0) return lookup;

  const db = getAdminDb();
  for (const productIdChunk of chunk(productIds, 10)) {
    const snap = await db
      .collection("merchantProducts")
      .where("shopifyProductId", "in", productIdChunk)
      .get();

    snap.forEach((doc) => {
      const data = doc.data();
      const shopifyProductId =
        typeof data.shopifyProductId === "string" ? data.shopifyProductId : "";
      if (!shopifyProductId) return;

      lookup.set(shopifyProductId, {
        merchantId:
          typeof data.merchantId === "string" ? data.merchantId : undefined,
        sku: typeof data.sku === "string" ? data.sku : undefined,
        measurements: normalizeMeasurements(data.measurements),
        variantMeasurements: normalizeVariantMeasurements(
          data.variantMeasurements || data.variantDraft?.variants,
        ),
      });
    });
  }

  return lookup;
}

async function enrichWithMerchantProductData(entries: CatalogProductEntry[]) {
  const shopifyProductIds = entries
    .map((entry) => entry.product.shopifyProductId)
    .filter((value): value is string => Boolean(value));

  try {
    const lookup = await fetchMerchantProductLookup(shopifyProductIds);

    return entries.map((entry) => {
      const merchantData = entry.product.shopifyProductId
        ? lookup.get(entry.product.shopifyProductId)
        : undefined;

      if (!merchantData) return entry;

      return {
        ...entry,
        product: {
          ...entry.product,
          merchantId: merchantData.merchantId ?? entry.product.merchantId,
          sku: merchantData.sku ?? entry.product.sku,
          measurements:
            merchantData.measurements ?? entry.product.measurements ?? null,
          variantMeasurements: mergeVariantMeasurements(
            entry.product.variantMeasurements || [],
            merchantData.variantMeasurements || [],
          ),
        },
      };
    });
  } catch (error) {
    console.warn(
      "[shopifyCatalog] Unable to enrich products with merchant measurements",
      error,
    );
    return entries;
  }
}

const SHOPIFY_PRODUCTS_QUERY = `
  query CatalogProducts($cursor: String) {
    products(first: 100, after: $cursor, query: "status:active") {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        description
        handle
        vendor
        productType
        tags
        status
        onlineStoreUrl
        featuredImage {
          url
        }
        images(first: 10) {
          nodes {
            url
          }
        }
        metafields(first: 10, namespace: "drippr_sizing") {
          nodes {
            key
            value
            type
          }
        }
        variants(first: 50) {
          nodes {
            id
            title
            sku
            availableForSale
            price
            selectedOptions {
              name
              value
            }
            metafields(first: 10, namespace: "drippr_sizing") {
              nodes {
                key
                value
                type
              }
            }
          }
        }
      }
    }
  }
`;

function normalizeShopifyProduct(node: any): CatalogProductEntry | null {
  const title =
    typeof node?.title === "string" && node.title.trim()
      ? node.title.trim()
      : "";
  if (!title) return null;

  const variantNodes = Array.isArray(node?.variants?.nodes)
    ? node.variants.nodes
    : [];

  const priceValues = variantNodes
    .map((variant: any) => Number(variant?.price))
    .filter((value: number) => Number.isFinite(value));

  const price = priceValues.length > 0 ? Math.min(...priceValues) : null;
  if (price === null) return null;

  const availableVariant = variantNodes.find(
    (variant: any) =>
      variant?.availableForSale && typeof variant?.id === "string",
  );

  const fallbackVariant = variantNodes.find(
    (variant: any) => typeof variant?.id === "string",
  );

  const variantNumericIds = variantNodes
    .map((variant: any) => extractNumericIdFromGid(variant?.id))
    .filter((value: string | null): value is string => Boolean(value));

  const variantMeasurements = variantNodes.map((variant: any) => ({
    variantId: typeof variant?.id === "string" ? variant.id : null,
    variantNumericId: extractNumericIdFromGid(variant?.id),
    title: typeof variant?.title === "string" ? variant.title : null,
    optionValues: Array.isArray(variant?.selectedOptions)
      ? variant.selectedOptions
          .map((option: any) => String(option?.value || "").trim())
          .filter(Boolean)
      : [],
    availableForSale: Boolean(variant?.availableForSale),
    sku: typeof variant?.sku === "string" ? variant.sku : null,
    measurements: normalizeMeasurementMetafields(variant?.metafields?.nodes),
  }));

  const liveVariantNumericId =
    extractNumericIdFromGid(availableVariant?.id) ??
    extractNumericIdFromGid(fallbackVariant?.id);

  const soldOut =
    variantNodes.length > 0
      ? !variantNodes.some((variant: any) => variant?.availableForSale)
      : false;

  const imageCandidates = dedupe([
    typeof node?.featuredImage?.url === "string"
      ? node.featuredImage.url.trim()
      : "",
    ...(Array.isArray(node?.images?.nodes)
      ? node.images.nodes
          .map((image: any) =>
            typeof image?.url === "string" ? image.url.trim() : "",
          )
          .filter(Boolean)
      : []),
  ]);

  let storeUrl: string | null = buildStoreSearchUrl(title);

  if (typeof node?.onlineStoreUrl === "string" && node.onlineStoreUrl.trim()) {
    storeUrl = node.onlineStoreUrl.trim();
  } else if (typeof node?.handle === "string" && node.handle.trim()) {
    storeUrl = `${STORE_BASE_URL}/products/${node.handle.trim()}`;
  }

  const product: MerchantProduct = {
    id: String(node.id),
    title,
    description: typeof node?.description === "string" ? node.description : "",
    price,
    currency: "INR",
    sku: null,
    status: soldOut ? "sold_out" : "active",
    published:
      typeof node?.onlineStoreUrl === "string" &&
      node.onlineStoreUrl.trim().length > 0,
    vendor:
      typeof node?.vendor === "string" ? node.vendor : "DRIPPR Marketplace",
    productType:
      typeof node?.productType === "string" ? node.productType : null,
    tags: Array.isArray(node?.tags) ? node.tags : [],
    imageUrls: imageCandidates,
    images: imageCandidates,
    image: imageCandidates[0] ?? null,
    measurements: normalizeMeasurementMetafields(node?.metafields?.nodes),
    variantMeasurements,
    inventoryQty: soldOut ? 0 : 1,
    merchantId: null,
    shopifyProductId: typeof node?.id === "string" ? node.id : null,
    shopifyVariantNumericIds: variantNumericIds,
    createdAt: null,
    updatedAt: null,
  };

  return {
    product,
    storeUrl,
    addToCartUrl:
      !soldOut && liveVariantNumericId
        ? buildAddToCartUrl(liveVariantNumericId)
        : null,
  };
}

export async function fetchShopifyCatalogProducts(): Promise<
  CatalogProductEntry[]
> {
  const results: CatalogProductEntry[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await shopifyGraphQL(SHOPIFY_PRODUCTS_QUERY, { cursor });
    const connection = data?.data?.products;
    const nodes = Array.isArray(connection?.nodes) ? connection.nodes : [];

    for (const node of nodes) {
      const normalized = normalizeShopifyProduct(node);
      if (normalized) {
        results.push(normalized);
      }
    }

    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    cursor =
      typeof connection?.pageInfo?.endCursor === "string"
        ? connection.pageInfo.endCursor
        : null;
  }

  return enrichWithMerchantProductData(results);
}
