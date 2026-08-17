import type {
  ImageSignals,
  MerchantProduct,
  OccasionContext,
  PriceRange,
  RecommendedProduct,
  UserSizeProfile,
} from "./schemas.js";

/* ------------------------------------------------------------------ */
/*  Vibe keywords                                                      */
/* ------------------------------------------------------------------ */

const VIBE_KEYWORDS: Record<string, string[]> = {
  Streetwear: [
    "streetwear",
    "oversized",
    "graphic",
    "utility",
    "bomber",
    "cargo",
  ],
  Minimal: ["minimal", "clean", "plain", "solid", "tailored", "classic"],
  "Daily Drip": ["daily", "everyday", "casual", "basic", "comfortable", "easy"],
  Daily: ["daily", "everyday", "casual", "basic", "comfortable", "easy"],
  Thrift: ["vintage", "retro", "washed", "distressed", "denim", "corduroy"],
  Fusion: ["fusion", "ethnic", "indo", "traditional", "kurta", "embroidered"],
  Athleisure: [
    "athleisure",
    "sport",
    "sports",
    "gym",
    "track",
    "active",
    "running",
  ],
};

/* ------------------------------------------------------------------ */
/*  Category constants (updated names)                                 */
/* ------------------------------------------------------------------ */

export const WOMEN_CATEGORY_OPTIONS = [
  "Tops & Dresses",
  "Cargo & Pants",
  "Tees",
  "Shorts & Skirts",
  "Sweatshirt & Hoods",
  "Jackets",
  "Co-rd Set",
  "Womens Athleisure",
] as const;

export const MEN_CATEGORY_OPTIONS = [
  "Mens T-Shirt & Upper",
  "Mens Lifestyle & Bottoms",
  "Mens Athleisure",
] as const;

export const ALL_CATEGORY_OPTIONS = [
  ...WOMEN_CATEGORY_OPTIONS,
  ...MEN_CATEGORY_OPTIONS,
] as const;

export function categoryOptionsForGender(gender: "Women" | "Men") {
  return gender === "Men"
    ? (MEN_CATEGORY_OPTIONS as readonly string[])
    : (WOMEN_CATEGORY_OPTIONS as readonly string[]);
}

/* ------------------------------------------------------------------ */
/*  Category alias maps (keys renamed to match new category names)     */
/* ------------------------------------------------------------------ */

const CATEGORY_PRODUCT_TYPE_ALIASES: Record<string, string[]> = {
  "Tops & Dresses": [
    "top",
    "tops",
    "dress",
    "dresses",
    "blouse",
    "shirt",
    "shirts",
    "kurta",
    "tank",
  ],
  "Cargo & Pants": [
    "cargo",
    "pant",
    "pants",
    "trouser",
    "trousers",
    "jogger",
    "joggers",
    "jeans",
  ],
  Tees: ["tee", "tees", "t shirt", "tshirt", "polo"],
  "Shorts & Skirts": ["short", "shorts", "skirt", "skirts"],
  "Sweatshirt & Hoods": [
    "sweatshirt",
    "sweatshirts",
    "hoodie",
    "hoodies",
    "pullover",
    "sweater",
    "sweaters",
    "knit",
    "knit sweater",
    "graphic sweater",
    "crewneck",
    "crew neck",
    "turtleneck",
    "turtle neck",
    "varsity",
  ],
  Jackets: [
    "jacket",
    "jackets",
    "coat",
    "blazer",
    "overshirt",
    "windbreaker",
    "bomber",
  ],
  "Co-rd Set": ["cord set", "co ord", "coord", "set", "sets", "kurta set"],
  "Womens Athleisure": [
    "athleisure",
    "sportswear",
    "activewear",
    "gymwear",
    "trackwear",
  ],
  "Mens T-Shirt & Upper": [
    "tee",
    "tees",
    "t shirt",
    "tshirt",
    "shirt",
    "shirts",
    "polo",
    "henley",
    "top",
    "tops",
  ],
  "Mens Lifestyle & Bottoms": [
    "cargo",
    "pant",
    "pants",
    "trouser",
    "trousers",
    "jogger",
    "joggers",
    "jeans",
    "short",
    "shorts",
    "bottom",
    "bottoms",
    "chino",
    "chinos",
  ],
  "Mens Athleisure": [
    "athleisure",
    "sportswear",
    "activewear",
    "gymwear",
    "trackwear",
  ],
};

const CATEGORY_TITLE_TAG_ALIASES: Record<string, string[]> = {
  "Tops & Dresses": [
    "top",
    "dress",
    "blouse",
    "shirt",
    "kurta",
    "tank",
    "crop top",
  ],
  "Cargo & Pants": ["cargo", "pants", "pant", "trouser", "jogger", "jeans"],
  Tees: ["tee", "t shirt", "tshirt", "polo"],
  "Shorts & Skirts": ["short", "shorts", "skirt"],
  "Sweatshirt & Hoods": [
    "sweatshirt",
    "hoodie",
    "pullover",
    "sweater",
    "knit",
    "knit sweater",
    "graphic sweater",
    "crewneck",
    "crew neck",
    "turtleneck",
    "turtle neck",
    "varsity",
  ],
  Jackets: [
    "jacket",
    "coat",
    "blazer",
    "overshirt",
    "windbreaker",
    "bomber",
    "denim jacket",
  ],
  "Co-rd Set": ["co ord", "coord", "cord set", "set", "kurta set"],
  "Womens Athleisure": [
    "athleisure",
    "sport",
    "sports",
    "gym",
    "running",
    "track",
    "activewear",
  ],
  "Mens T-Shirt & Upper": [
    "tee",
    "t shirt",
    "tshirt",
    "shirt",
    "polo",
    "henley",
    "top",
  ],
  "Mens Lifestyle & Bottoms": [
    "cargo",
    "pants",
    "pant",
    "trouser",
    "jogger",
    "jeans",
    "short",
    "shorts",
    "bottom",
    "chino",
  ],
  "Mens Athleisure": [
    "athleisure",
    "sport",
    "sports",
    "gym",
    "running",
    "track",
    "activewear",
  ],
};

const CATEGORY_CONFLICT_ALIASES: Record<string, string[]> = {
  "Tops & Dresses": [
    "pant",
    "pants",
    "trouser",
    "trousers",
    "jogger",
    "joggers",
    "jeans",
    "cargo",
    "jacket",
    "hoodie",
    "sweatshirt",
  ],
  "Cargo & Pants": [
    "top",
    "tops",
    "tank",
    "tee",
    "t shirt",
    "tshirt",
    "shirt",
    "blouse",
    "dress",
    "dresses",
    "kurta",
    "jacket",
    "blazer",
    "coat",
    "overshirt",
    "windbreaker",
    "bomber",
    "hoodie",
    "sweatshirt",
  ],
  Tees: [
    "pant",
    "pants",
    "jogger",
    "joggers",
    "jeans",
    "cargo",
    "dress",
    "jacket",
    "hoodie",
    "sweatshirt",
  ],
  "Shorts & Skirts": [
    "pant",
    "pants",
    "jogger",
    "joggers",
    "jeans",
    "hoodie",
    "jacket",
    "dress",
  ],
  "Sweatshirt & Hoods": [
    "tank",
    "tee",
    "t shirt",
    "tshirt",
    "dress",
    "pants",
    "jeans",
    "skirt",
    "blazer",
  ],
  Jackets: [
    "tank",
    "tee",
    "t shirt",
    "tshirt",
    "dress",
    "pants",
    "jeans",
    "skirt",
    "hoodie",
    "sweatshirt",
  ],
  "Co-rd Set": [
    "tank",
    "tee",
    "t shirt",
    "tshirt",
    "pants",
    "jeans",
    "hoodie",
    "jacket",
  ],
  "Womens Athleisure": ["dress", "blazer", "kurta"],
  "Mens T-Shirt & Upper": [
    "pant",
    "pants",
    "trouser",
    "trousers",
    "jogger",
    "joggers",
    "jeans",
    "cargo",
    "jacket",
    "hoodie",
    "sweatshirt",
    "dress",
    "skirt",
  ],
  "Mens Lifestyle & Bottoms": [
    "tee",
    "t shirt",
    "tshirt",
    "shirt",
    "top",
    "tops",
    "jacket",
    "blazer",
    "hoodie",
    "sweatshirt",
    "dress",
    "skirt",
  ],
  "Mens Athleisure": ["dress", "blazer", "kurta"],
};

/* ------------------------------------------------------------------ */
/*  Collection handle mappings (Step 3 → vibe, Step 4 → category)      */
/* ------------------------------------------------------------------ */

/**
 * Maps Step 3 vibe option labels to their Shopify collection handles.
 * Handles are auto-generated by Shopify from collection titles:
 *   lowercase, spaces → hyphens, special chars removed, collapsed.
 * If a handle doesn't resolve, verify in Shopify Admin → Collections → URL.
 */
export const VIBE_COLLECTION_HANDLES: Record<string, string> = {
  Streetwear: "streetwear",
  Minimal: "minimalism",
  "Daily Drip": "daily-drip",
  Thrift: "thrift",
  Fusion: "fusion",
  Athleisure: "athleisure",
};

/**
 * Maps Step 4 category option labels to their Shopify collection handles.
 */
export const CATEGORY_COLLECTION_HANDLES: Record<string, string> = {
  "Tops & Dresses": "tops-dresses",
  "Cargo & Pants": "cargos-pants",
  Tees: "tees",
  "Shorts & Skirts": "shorts-skirts",
  "Sweatshirt & Hoods": "sweatshirt-hoods",
  Jackets: "jackets",
  "Co-rd Set": "co-rd-set",
  "Womens Athleisure": "womens-athleisure",
  "Mens T-Shirt & Upper": "mens-t-shirt-upper",
  "Mens Lifestyle & Bottoms": "mens-lifestyle-bottoms",
  "Mens Athleisure": "mens-athleisure",
};

/* ------------------------------------------------------------------ */
/*  Collection intersection + filtering                                */
/* ------------------------------------------------------------------ */

export type CollectionIntersectionResult = {
  products: MerchantProduct[];
  counts: {
    vibeCollectionCount: number;
    categoryCollectionCount: number;
    intersectionCount: number;
    afterPriceFilter: number;
    finalCount: number;
  };
};

/**
 * Finds products common to BOTH the vibe and category collections,
 * then applies price filter and removes junk / invalid entries.
 * Falls back to category-only products if the intersection is empty.
 */
export function filterCollectionIntersection(args: {
  vibeProducts: MerchantProduct[];
  categoryProducts: MerchantProduct[];
  priceRange: PriceRange;
}): CollectionIntersectionResult {
  const vibeIds = new Set(args.vibeProducts.map((p) => p.id));

  // Intersection: products present in both collections
  let intersection = args.categoryProducts.filter((p) => vibeIds.has(p.id));
  const intersectionCount = intersection.length;

  // If intersection is empty, fall back to category-only products
  if (intersection.length === 0) {
    console.log(
      "[recommendation] Empty intersection, falling back to category collection products",
    );
    intersection = [...args.categoryProducts];
  }

  // Apply price filter
  const afterPrice = intersection.filter((p) => {
    if (typeof p.price !== "number" || p.price <= 0) return false;
    return priceMatches(args.priceRange, p.price);
  });

  // Remove junk and invalid products
  const clean = afterPrice.filter((p) => {
    if (!inventoryAllowed(p)) return false;
    if (isJunkProduct(p)) return false;
    return true;
  });

  return {
    products: clean,
    counts: {
      vibeCollectionCount: args.vibeProducts.length,
      categoryCollectionCount: args.categoryProducts.length,
      intersectionCount,
      afterPriceFilter: afterPrice.length,
      finalCount: clean.length,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Phase 1: Imputation engine                                         */
/* ------------------------------------------------------------------ */

type BodyMeasurements = {
  bust: number | null;
  waist: number | null;
  hip: number | null;
  shoulder: number | null;
  length: number | null;
  inseam: number | null;
};

/** Level 1 — Size Dictionary (bust/chest, waist, hip in inches) */
const SIZE_DICT: Record<string, Record<string, { bust: number; waist: number; hip: number }>> = {
  Men: {
    s:  { bust: 36, waist: 30, hip: 37 },
    m:  { bust: 39, waist: 33, hip: 40 },
    l:  { bust: 42, waist: 36, hip: 43 },
    xl: { bust: 45, waist: 40, hip: 46 },
  },
  Women: {
    s:  { bust: 34, waist: 27, hip: 37 },
    m:  { bust: 36, waist: 29, hip: 39 },
    l:  { bust: 39, waist: 32, hip: 42 },
    xl: { bust: 42, waist: 35, hip: 45 },
  },
};

function imputeBodyMeasurements(
  sizeProfile: UserSizeProfile,
  gender: "Women" | "Men",
): BodyMeasurements {
  let bust = numericValue(sizeProfile.bust);
  let waist = numericValue(sizeProfile.waist);
  let hip = numericValue(sizeProfile.hip);
  let shoulder: number | null = null;
  let inseam: number | null = null;
  let length: number | null = numericValue(sizeProfile.length);

  const heightCm = numericValue(sizeProfile.heightCm);
  const weightKg = numericValue(sizeProfile.weightKg);
  const heightInches = heightCm != null ? heightCm / 2.54 : null;
  const preferredSize = (sizeProfile.preferredSize ?? "").trim().toLowerCase();

  // ── Level 1: Size dictionary fill ──
  if (preferredSize && SIZE_DICT[gender]?.[preferredSize]) {
    const dict = SIZE_DICT[gender][preferredSize];
    if (bust == null) bust = dict.bust;
    if (waist == null) waist = dict.waist;
    if (hip == null) hip = dict.hip;
  }

  // ── Level 2: Height/Weight baseline formulas ──
  if (gender === "Men") {
    if (bust == null && weightKg != null) bust = weightKg * 0.40 + 26;
    if (waist == null && weightKg != null) waist = weightKg * 0.35 + 22;
    if (inseam == null && heightInches != null) inseam = heightInches * 0.43;
    if (shoulder == null && bust != null) shoulder = bust * 0.45;
    if (hip == null && waist != null) hip = waist + 4;
  } else {
    // Women
    if (bust == null && weightKg != null) bust = weightKg * 0.38 + 24;
    if (waist == null && weightKg != null) waist = weightKg * 0.32 + 20;
    if (inseam == null && heightInches != null) inseam = heightInches * 0.45;
    if (shoulder == null && bust != null) shoulder = bust * 0.42;
    if (hip == null && waist != null) hip = waist + 10;
  }

  // ── Level 3: Cross-calculation from available measurements ──
  if (gender === "Men") {
    if (bust != null && waist == null) waist = bust - 6;
    if (bust != null && hip == null) hip = bust - 2;
    if (waist != null && bust == null) bust = waist + 6;
    if (waist != null && hip == null) hip = waist + 4;
  } else {
    if (bust != null && waist == null) waist = bust - 7;
    if (bust != null && hip == null) hip = bust + 3;
    if (waist != null && bust == null) bust = waist + 7;
    if (waist != null && hip == null) hip = waist + 10;
  }

  // Shoulder fallback if still null
  if (shoulder == null && bust != null) {
    shoulder = gender === "Men" ? bust * 0.45 : bust * 0.42;
  }

  return { bust, waist, hip, shoulder, length, inseam };
}

/* ------------------------------------------------------------------ */
/*  Phase 2: Category → metafield routing                              */
/* ------------------------------------------------------------------ */

type FitField = "bust" | "waist" | "hip" | "shoulder" | "length" | "inseam";

const CATEGORY_FIT_FIELDS: Record<string, FitField[]> = {
  "Tops & Dresses":          ["bust", "waist", "length"],
  "Cargo & Pants":           ["waist", "hip", "inseam", "length"],
  "Tees":                    ["bust", "shoulder", "length"],
  "Shorts & Skirts":         ["waist", "hip", "length"],
  "Sweatshirt & Hoods":      ["bust", "shoulder", "length"],
  "Jackets":                 ["bust", "shoulder", "length"],
  "Co-rd Set":               ["bust", "waist", "hip", "length"],
  "Womens Athleisure":       ["bust", "waist", "hip"],
  "Mens T-Shirt & Upper":    ["bust", "shoulder", "length"],
  "Mens Lifestyle & Bottoms":["waist", "hip", "inseam", "length"],
  "Mens Athleisure":         ["bust", "waist", "hip"],
};

function fitFieldsForCategory(category: string): FitField[] {
  return CATEGORY_FIT_FIELDS[category] ?? ["bust", "waist", "length"];
}

/* ------------------------------------------------------------------ */
/*  Phase 3: Vibe-based ease modifiers (inches)                        */
/* ------------------------------------------------------------------ */

type EaseRange = { min: number; max: number };

const VIBE_EASE: Record<string, EaseRange> = {
  Athleisure:           { min: 0.5, max: 2.5 },
  Fusion:               { min: 0.5, max: 2.5 },
  "Womens Athleisure":  { min: 0.5, max: 2.5 },
  "Mens Athleisure":    { min: 0.5, max: 2.5 },
  Minimal:              { min: 2.0, max: 4.5 },
  "Daily Drip":         { min: 2.0, max: 4.5 },
  Daily:                { min: 2.0, max: 4.5 },
  Streetwear:           { min: 4.0, max: 8.0 },
  Thrift:               { min: 4.0, max: 8.0 },
};

function easeRangeForVibe(vibe: string): EaseRange {
  return VIBE_EASE[vibe] ?? { min: 2.0, max: 4.5 };
}

/* ------------------------------------------------------------------ */
/*  Phase 4: 0-100 fit scoring algorithm                               */
/* ------------------------------------------------------------------ */

/** Upper-wear fields (bust, shoulder, hip on upper garments) */
const UPPER_FIELDS = new Set<FitField>(["bust", "shoulder"]);
/** Bottom-specific field */
const BOTTOM_WAIST_FIELDS = new Set<FitField>(["waist"]);

function isBottomCategory(category: string): boolean {
  return [
    "Cargo & Pants",
    "Shorts & Skirts",
    "Mens Lifestyle & Bottoms",
  ].includes(category);
}

type FitScoreResult = {
  score: number;
  verified: boolean;
  label: string | null;
  matchedSize: string | null;
  matchedVariantNumericId: string | null;
};

function computeFitScoreForMeasurements(
  garmentMeasurements: MerchantProduct["measurements"],
  body: BodyMeasurements,
  fields: FitField[],
  vibe: string,
  category: string,
  heightCm: number | null,
): { score: number; comparedCount: number } | null {
  const ease = easeRangeForVibe(vibe);
  const isBottom = isBottomCategory(category);
  let score = 100;
  let comparedCount = 0;

  for (const field of fields) {
    const garmentVal = numericValue(garmentMeasurements?.[field]);
    const bodyVal = body[field];

    if (garmentVal == null || bodyVal == null) continue;

    const easeActual = garmentVal - bodyVal;
    comparedCount++;

    // ── Rule 1: Hard failure — garment smaller than body ──
    if (
      (field === "bust" || field === "waist" || field === "hip") &&
      garmentVal < bodyVal
    ) {
      return { score: 0, comparedCount };
    }

    // ── Rule 3: Bottoms waist scoring ──
    if (isBottom && BOTTOM_WAIST_FIELDS.has(field)) {
      const bottomMin = 0.5;
      const bottomMax = 2.0;
      if (easeActual < bottomMin) {
        score -= (bottomMin - easeActual) * 25;
      } else if (easeActual > bottomMax) {
        score -= (easeActual - bottomMax) * 25;
      }
      continue;
    }

    // ── Rule 2: Upper-wear / general ease scoring ──
    if (easeActual < ease.min) {
      // Too tight
      score -= (ease.min - easeActual) * 20;
    } else if (easeActual > ease.max) {
      // Too baggy
      score -= (easeActual - ease.max) * 10;
    }
    // If within [ease.min, ease.max]: no penalty
  }

  // ── Rule 4: Height/length sanity check ──
  if (heightCm != null) {
    const garmentLength = numericValue(garmentMeasurements?.length);
    if (garmentLength != null) {
      if (heightCm > 180 && garmentLength < 26) {
        score -= 20; // tall person + short garment
      }
      if (heightCm < 160 && garmentLength > 32) {
        score -= 15; // short person + long garment
      }
    }
  }

  if (comparedCount === 0) return null;

  return { score: Math.max(0, Math.min(100, Math.round(score))), comparedCount };
}

function sizeLabel(optionValues: string[], title: string | null | undefined) {
  const recognized = optionValues.find((value) =>
    /^(xxs|xs|s|m|l|xl|xxl|xxxl|\d{1,3})$/i.test(value.trim()),
  );
  return recognized || title || optionValues.join(" / ") || null;
}

function computeFitScore(
  product: MerchantProduct,
  sizeProfile: UserSizeProfile | null | undefined,
  category: string,
  vibe: string,
  gender: "Women" | "Men",
): FitScoreResult {
  const noFit: FitScoreResult = {
    score: 0,
    verified: false,
    label: null,
    matchedSize: null,
    matchedVariantNumericId: null,
  };

  if (!sizeProfile) return noFit;

  const body = imputeBodyMeasurements(sizeProfile, gender);
  const fields = fitFieldsForCategory(category);
  const heightCm = numericValue(sizeProfile.heightCm);
  const preferredSize = (sizeProfile.preferredSize ?? "").trim().toLowerCase();

  // Try variant-level matching first
  const variantCandidates = (product.variantMeasurements || [])
    .filter((variant) => variant.availableForSale !== false)
    .map((variant) => {
      const result = computeFitScoreForMeasurements(
        variant.measurements,
        body,
        fields,
        vibe,
        category,
        heightCm,
      );
      if (!result) return null;

      const label = sizeLabel(variant.optionValues || [], variant.title);
      const preferredBonus =
        preferredSize && (label ?? "").trim().toLowerCase() === preferredSize
          ? 5
          : 0;

      return {
        score: Math.min(100, result.score + preferredBonus),
        comparedCount: result.comparedCount,
        matchedSize: label,
        matchedVariantNumericId: variant.variantNumericId || null,
      };
    })
    .filter(
      (c): c is NonNullable<typeof c> => c !== null,
    )
    .sort((a, b) => b.score - a.score || b.comparedCount - a.comparedCount);

  const bestVariant = variantCandidates[0];
  if (bestVariant) {
    const verified = bestVariant.score >= 70;
    return {
      score: bestVariant.score,
      verified,
      label: verified
        ? `Verified size match${bestVariant.matchedSize ? ` (${bestVariant.matchedSize})` : ""}`
        : bestVariant.score >= 40
          ? bestVariant.matchedSize
            ? `Closest size: ${bestVariant.matchedSize}`
            : "Close size match"
          : bestVariant.matchedSize
            ? `Size ${bestVariant.matchedSize} available`
            : null,
      matchedSize: bestVariant.matchedSize,
      matchedVariantNumericId: bestVariant.matchedVariantNumericId,
    };
  }

  // Fallback: product-level measurements
  const fallback = computeFitScoreForMeasurements(
    product.measurements,
    body,
    fields,
    vibe,
    category,
    heightCm,
  );

  if (!fallback) return noFit;

  const verified = fallback.score >= 70;
  return {
    score: fallback.score,
    verified,
    label: verified ? "Verified size match" : fallback.score >= 40 ? "Close size match" : null,
    matchedSize: null,
    matchedVariantNumericId: null,
  };
}

/* ------------------------------------------------------------------ */
/*  Utility helpers (unchanged)                                        */
/* ------------------------------------------------------------------ */

const JUNK_PATTERNS = [
  "test",
  "workflow",
  "debug",
  "sdfe",
  "sdf",
  "dummy",
  "demo",
  "sample",
  "multi image prod",
];

export type CandidatePoolStage =
  | "strict_product_type"
  | "title_tag_match"
  | "empty";

export type CandidatePoolResult = {
  products: MerchantProduct[];
  stage: CandidatePoolStage;
  counts: {
    baseEligible: number;
    strictProductType: number;
    titleTagMatch: number;
  };
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string | null | undefined) {
  const normalized = normalizeText(value);
  return new Set(normalized.split(" ").filter(Boolean));
}

function hasExactAlias(text: string, tokens: Set<string>, alias: string) {
  const normalizedAlias = normalizeText(alias);
  if (!normalizedAlias) return false;

  if (normalizedAlias.includes(" ")) {
    return ` ${text} `.includes(` ${normalizedAlias} `);
  }

  return tokens.has(normalizedAlias);
}

function countExactAliasMatches(
  text: string,
  tokens: Set<string>,
  aliases: string[],
) {
  return aliases.reduce(
    (count, alias) => count + (hasExactAlias(text, tokens, alias) ? 1 : 0),
    0,
  );
}

function joinedText(product: MerchantProduct) {
  return normalizeText(
    [
      product.title,
      product.description ?? "",
      product.productType ?? "",
      (product.tags ?? []).join(" "),
      product.vendor ?? "",
    ].join(" "),
  );
}

function priceMatches(priceRange: PriceRange, price: number) {
  if (priceRange === "₹0 - ₹999") {
    return price >= 0 && price <= 999;
  }

  if (priceRange === "₹1,000 - ₹2,499") {
    return price >= 1000 && price <= 2499;
  }

  return price >= 2500;
}

function numericValue(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isTempStagedUrl(url: string | null | undefined) {
  if (!url) return false;
  return (
    url.includes("shopify-staged-uploads.storage.googleapis.com") ||
    url.includes("/tmp/")
  );
}

export function getPrimaryImage(product: MerchantProduct) {
  if (product.image && !isTempStagedUrl(product.image)) {
    return product.image;
  }

  const fromImages = (product.images ?? []).find(
    (url) => !!url && !isTempStagedUrl(url),
  );
  if (fromImages) return fromImages;

  const fromImageUrls = (product.imageUrls ?? []).find(
    (url) => !!url && !isTempStagedUrl(url),
  );
  if (fromImageUrls) return fromImageUrls;

  return null;
}

function isSoldOut(product: MerchantProduct) {
  const status = normalizeText(product.status);

  if (
    ["sold out", "sold_out", "out of stock", "out_of_stock"].includes(status)
  ) {
    return true;
  }

  if (typeof product.inventoryQty === "number") {
    return product.inventoryQty <= 0;
  }

  return false;
}

function inventoryAllowed(product: MerchantProduct) {
  if (typeof product.price !== "number" || product.price <= 0) {
    return false;
  }

  const status = normalizeText(product.status);

  if (status === "rejected" || status === "deleted") {
    return false;
  }

  if (product.published === true) {
    return true;
  }

  if (!status) {
    return true;
  }

  return [
    "active",
    "approved",
    "pending",
    "update_in_review",
    "sold out",
    "sold_out",
    "out of stock",
    "out_of_stock",
  ].includes(status);
}

function isJunkProduct(product: MerchantProduct) {
  const title = normalizeText(product.title);
  const sku = normalizeText(product.sku);
  const full = joinedText(product);

  return JUNK_PATTERNS.some(
    (pattern) =>
      title.includes(pattern) ||
      sku.includes(pattern) ||
      full.includes(pattern),
  );
}

function detectGenderMarkers(product: MerchantProduct) {
  const compactText = normalizeText(
    [
      product.title,
      product.productType ?? "",
      (product.tags ?? []).join(" "),
      product.vendor ?? "",
    ].join(" "),
  );

  const hasWomen =
    /\bwomen\b|\bwomens\b|\bladies\b|\bfemale\b|\bgirl\b|\bgirls\b/.test(
      compactText,
    );

  const hasMen = /\bmen\b|\bmens\b|\bmale\b|\bboy\b|\bboys\b/.test(compactText);

  return { hasWomen, hasMen };
}

function isGenderAllowed(product: MerchantProduct, gender: "Women" | "Men") {
  const { hasWomen, hasMen } = detectGenderMarkers(product);

  if (gender === "Men") {
    return hasMen && !hasWomen;
  }

  return !hasMen;
}

function categorySignals(product: MerchantProduct, selectedCategory: string) {
  const productTypeText = normalizeText(product.productType);
  const productTypeTokens = tokenize(product.productType);

  const titleTagText = normalizeText(
    [product.title, (product.tags ?? []).join(" ")].join(" "),
  );
  const titleTagTokens = tokenize(
    [product.title, (product.tags ?? []).join(" ")].join(" "),
  );

  const allText = normalizeText(
    [product.productType, product.title, (product.tags ?? []).join(" ")].join(
      " ",
    ),
  );
  const allTokens = tokenize(
    [product.productType, product.title, (product.tags ?? []).join(" ")].join(
      " ",
    ),
  );

  const productTypeAliases =
    CATEGORY_PRODUCT_TYPE_ALIASES[selectedCategory] ?? [];
  const titleTagAliases = CATEGORY_TITLE_TAG_ALIASES[selectedCategory] ?? [];
  const conflictAliases = CATEGORY_CONFLICT_ALIASES[selectedCategory] ?? [];

  const productTypeHits = countExactAliasMatches(
    productTypeText,
    productTypeTokens,
    productTypeAliases,
  );
  const titleTagHits = countExactAliasMatches(
    titleTagText,
    titleTagTokens,
    titleTagAliases,
  );
  const conflictHits = countExactAliasMatches(
    allText,
    allTokens,
    conflictAliases,
  );

  const strictMatch = productTypeHits > 0 && conflictHits === 0;
  const titleTagMatch =
    productTypeHits === 0 && titleTagHits > 0 && conflictHits === 0;

  return {
    strictMatch,
    titleTagMatch,
    productTypeHits,
    titleTagHits,
    conflictHits,
    totalScore: productTypeHits * 10 + titleTagHits * 5 - conflictHits * 20,
  };
}

function buildReason(parts: string[], soldOut: boolean) {
  const filtered = [...new Set(parts.filter(Boolean))];
  const base =
    filtered.length > 0
      ? filtered.join(" ")
      : "Good match for your selected filters.";

  return soldOut ? `${base} Currently sold out.` : base;
}

function vibeHitsForProduct(product: MerchantProduct, vibe: string) {
  const aliases = VIBE_KEYWORDS[vibe] ?? [normalizeText(vibe)];
  const text = joinedText(product);
  const tokens = tokenize(text);
  return countExactAliasMatches(text, tokens, aliases);
}

/* ------------------------------------------------------------------ */
/*  Public exports: getAvailableCategories, buildCandidatePool, score  */
/* ------------------------------------------------------------------ */

export function getAvailableCategories(args: {
  products: MerchantProduct[];
  gender: "Women" | "Men";
  vibe: string;
}) {
  const genderCategories = categoryOptionsForGender(args.gender);

  const baseEligible = args.products.filter((product) => {
    if (!inventoryAllowed(product)) return false;
    if (isJunkProduct(product)) return false;
    if (!isGenderAllowed(product, args.gender)) return false;
    return true;
  });

  const vibeFiltered = baseEligible.filter(
    (product) => vibeHitsForProduct(product, args.vibe) > 0,
  );
  const source = vibeFiltered.length > 0 ? vibeFiltered : baseEligible;

  return genderCategories.filter((category) =>
    source.some((product) => {
      const signals = categorySignals(product, category);
      return signals.strictMatch || signals.titleTagMatch;
    }),
  );
}

export function buildCandidatePool(args: {
  products: MerchantProduct[];
  gender: "Women" | "Men";
  category: string;
  priceRange: PriceRange;
}): CandidatePoolResult {
  const baseEligible = args.products.filter((product) => {
    if (!inventoryAllowed(product)) return false;
    if (isJunkProduct(product)) return false;
    if (
      typeof product.price !== "number" ||
      !priceMatches(args.priceRange, product.price)
    ) {
      return false;
    }
    if (!isGenderAllowed(product, args.gender)) return false;

    return true;
  });

  const strict = baseEligible.filter(
    (product) => categorySignals(product, args.category).strictMatch,
  );
  const soft = baseEligible.filter(
    (product) => categorySignals(product, args.category).titleTagMatch,
  );

  const merged = [
    ...strict,
    ...soft.filter(
      (softProduct) =>
        !strict.some((strictProduct) => strictProduct.id === softProduct.id),
    ),
  ];

  if (merged.length > 0) {
    return {
      products: merged,
      stage: strict.length > 0 ? "strict_product_type" : "title_tag_match",
      counts: {
        baseEligible: baseEligible.length,
        strictProductType: strict.length,
        titleTagMatch: soft.length,
      },
    };
  }

  return {
    products: [],
    stage: "empty",
    counts: {
      baseEligible: baseEligible.length,
      strictProductType: strict.length,
      titleTagMatch: soft.length,
    },
  };
}

export function scoreProducts(args: {
  products: MerchantProduct[];
  gender: "Women" | "Men";
  sizeProfile?: UserSizeProfile | null;
  vibe: string;
  category: string;
  priceRange: PriceRange;
  occasionContext: OccasionContext;
  imageSignals: ImageSignals;
  maxResults?: number;
}): RecommendedProduct[] {
  const vibeAliases = VIBE_KEYWORDS[args.vibe] ?? [normalizeText(args.vibe)];
  const maxResults = args.maxResults ?? 100;

  const scored = args.products.map((product) => {
    const fullText = joinedText(product);
    const fullTokens = tokenize(fullText);

    const imageUrl = getPrimaryImage(product);
    const cat = categorySignals(product, args.category);
    const vibeHits = countExactAliasMatches(fullText, fullTokens, vibeAliases);
    const soldOut = isSoldOut(product);

    // New fit scoring engine
    const fitResult = computeFitScore(
      product,
      args.sizeProfile,
      args.category,
      args.vibe,
      args.gender,
    );

    let score = 0;
    const reasons: string[] = [];

    score += 30 + Math.max(0, cat.totalScore) * 3;
    if (cat.totalScore > 0) {
      reasons.push("Strong category fit.");
    }

    score += vibeHits * 8;
    if (vibeHits > 0) {
      reasons.push("Matches your selected vibe.");
    }

    if (imageUrl) {
      score += 5;
    }

    // Integrate fit score — scale the 0-100 fit score into the overall scoring
    if (fitResult.score > 0) {
      // Weight the fit score: max contribution of ~30 points to overall score
      score += Math.round((fitResult.score / 100) * 30);
      if (fitResult.verified) {
        reasons.push("Verified against your size details.");
      } else if (fitResult.score >= 40) {
        reasons.push("Close to your size details.");
      }
    }

    return {
      id: product.id,
      title: product.title || "Untitled product",
      description: product.description ?? "",
      price: product.price ?? 0,
      currency: product.currency ?? "INR",
      soldOut,
      imageUrl,
      merchantId: product.merchantId ?? "",
      sku: product.sku ?? "",
      vendor: product.vendor ?? "DRIPPR Marketplace",
      score,
      reason: buildReason(reasons, soldOut),
      shopifyProductId: product.shopifyProductId ?? null,
      storeUrl: null,
      addToCartUrl: null,
      fitVerified: fitResult.verified,
      fitMatchLabel: fitResult.label,
      sizeMatchScore: fitResult.score,
      matchedSize: fitResult.matchedSize,
      matchedVariantNumericId: fitResult.matchedVariantNumericId,
    };
  });

  const inStock = scored
    .filter((item) => !item.soldOut)
    .sort((a, b) => b.score - a.score || a.price - b.price);

  const soldOut = scored
    .filter((item) => item.soldOut)
    .sort((a, b) => b.score - a.score || a.price - b.price);

  return [...inStock, ...soldOut].slice(0, maxResults);
}
