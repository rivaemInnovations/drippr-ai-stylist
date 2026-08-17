import {
  scoreProducts,
  VIBE_COLLECTION_TITLES,
  CATEGORY_COLLECTION_TITLES,
  filterCollectionIntersection,
} from "./_lib/recommendation.js";
import {
  addToCartUrlForVariant,
  fetchProductsByCollectionTitle,
} from "./_lib/shopifyCatalog.js";
import {
  recommendRequestSchema,
  recommendResponseSchema,
} from "./_lib/schemas.js";

export const config = {
  maxDuration: 60,
};

function setCors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getBody(req: any) {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body ?? {};
}

export default async function handler(req: any, res: any) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = recommendRequestSchema.parse(getBody(req));

    /* ── Resolve collection titles ── */
    const vibeTitle = VIBE_COLLECTION_TITLES[body.vibe];
    const categoryTitle = CATEGORY_COLLECTION_TITLES[body.category];

    if (!vibeTitle) {
      return res.status(400).json({
        error: `Unknown vibe: "${body.vibe}". Valid options: ${Object.keys(VIBE_COLLECTION_TITLES).join(", ")}`,
      });
    }
    if (!categoryTitle) {
      return res.status(400).json({
        error: `Unknown category: "${body.category}". Valid options: ${Object.keys(CATEGORY_COLLECTION_TITLES).join(", ")}`,
      });
    }

    /* ── Fetch both collections in parallel (by title search) ── */
    const [vibeEntries, categoryEntries] = await Promise.all([
      fetchProductsByCollectionTitle(vibeTitle),
      fetchProductsByCollectionTitle(categoryTitle),
    ]);

    console.log(
      `[recommend] Fetched — vibe "${vibeTitle}": ${vibeEntries.length} products, ` +
        `category "${categoryTitle}": ${categoryEntries.length} products`,
    );

    /* ── Intersect + filter ── */
    const vibeProducts = vibeEntries.map((e) => e.product);
    const categoryProducts = categoryEntries.map((e) => e.product);

    const pool = filterCollectionIntersection({
      vibeProducts,
      categoryProducts,
      priceRange: body.priceRange,
    });

    /* ── Score & rank ── */
    const rankedProducts = scoreProducts({
      products: pool.products,
      gender: body.gender,
      sizeProfile: body.sizeProfile,
      vibe: body.vibe,
      category: body.category,
      priceRange: body.priceRange,
      occasionContext: {
        eventType: "unknown",
        timeOfDay: "unknown",
        season: "unknown",
        formality: "unknown",
        comfortPriority: "medium",
        styleDirection: [],
        preferredKeywords: [],
        avoidKeywords: [],
        preferredProductTypes: [],
        confidence: 0,
      },
      imageSignals: {
        dominantColors: [],
        paletteTemperature: "unknown",
        skinToneBand: "unknown",
        undertone: "unknown",
        fitCues: [],
        vibeTags: [],
        visibleGarments: [],
        confidence: 0,
      },
      maxResults: 100,
    });

    /* ── Build response with store/cart URLs ── */
    const allEntries = [...vibeEntries, ...categoryEntries];
    const byId = new Map(
      allEntries.map((entry) => [entry.product.id, entry] as const),
    );

    const finalProducts = rankedProducts.map((product) => {
      const source = byId.get(product.id);

      return {
        ...product,
        imageUrl: product.imageUrl ?? source?.product.image ?? null,
        storeUrl: source?.storeUrl ?? null,
        addToCartUrl: product.soldOut
          ? null
          : product.matchedVariantNumericId
            ? addToCartUrlForVariant(product.matchedVariantNumericId)
            : (source?.addToCartUrl ?? null),
      };
    });

    const response = recommendResponseSchema.parse({
      occasionContext: {
        eventType: "unknown",
        timeOfDay: "unknown",
        season: "unknown",
        formality: "unknown",
        comfortPriority: "medium",
        styleDirection: [],
        preferredKeywords: [],
        avoidKeywords: [],
        preferredProductTypes: [],
        confidence: 0,
      },
      products: finalProducts,
    });

    return res.status(200).json({
      ...response,
      debugApplied: {
        engineVersion: "collection-intersection-v2",
        category: body.category,
        categoryCollection: categoryTitle,
        vibe: body.vibe,
        vibeCollection: vibeTitle,
        priceRange: body.priceRange,
        vibeCollectionCount: pool.counts.vibeCollectionCount,
        categoryCollectionCount: pool.counts.categoryCollectionCount,
        intersectionCount: pool.counts.intersectionCount,
        afterPriceFilter: pool.counts.afterPriceFilter,
        finalPoolCount: pool.counts.finalCount,
      },
    });
  } catch (error) {
    console.error("[recommend] Error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate recommendations",
    });
  }
}
