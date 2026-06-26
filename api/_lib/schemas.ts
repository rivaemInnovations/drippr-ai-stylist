import { z } from "zod";

export const genderSchema = z.enum(["Women", "Men"]);
export const priceRangeSchema = z.enum([
  "\u20B90 - \u20B9999",
  "\u20B91,000 - \u20B91,999",
  "\u20B91,999 - \u20B92,499",
  "\u20B92,499 and above",
]);

export const imageSignalsSchema = z.object({
  dominantColors: z.array(z.string()).max(8),
  paletteTemperature: z.enum(["warm", "cool", "neutral", "unknown"]),
  skinToneBand: z.enum(["light", "medium", "deep", "unknown"]),
  undertone: z.enum(["warm", "cool", "neutral", "unknown"]),
  fitCues: z.array(z.string()).max(8),
  vibeTags: z.array(z.string()).max(8),
  visibleGarments: z.array(z.string()).max(8),
  confidence: z.number().min(0).max(1),
});

export const occasionContextSchema = z.object({
  eventType: z.string(),
  timeOfDay: z.enum(["day", "night", "evening", "unknown"]),
  season: z.enum([
    "summer",
    "winter",
    "monsoon",
    "spring",
    "autumn",
    "all_season",
    "unknown",
  ]),
  formality: z.enum([
    "casual",
    "smart_casual",
    "semi_formal",
    "formal",
    "festive",
    "unknown",
  ]),
  comfortPriority: z.enum(["low", "medium", "high"]),
  styleDirection: z.array(z.string()).max(10),
  preferredKeywords: z.array(z.string()).max(20),
  avoidKeywords: z.array(z.string()).max(20),
  preferredProductTypes: z.array(z.string()).max(10),
  confidence: z.number().min(0).max(1),
});

export const recommendRequestSchema = z.object({
  gender: genderSchema,
  sizeProfile: z
    .object({
      heightCm: z.number().positive().nullable().optional(),
      weightKg: z.number().positive().nullable().optional(),
      bust: z.number().positive().nullable().optional(),
      waist: z.number().positive().nullable().optional(),
      hip: z.number().positive().nullable().optional(),
      length: z.number().positive().nullable().optional(),
      preferredSize: z.string().trim().max(20).nullable().optional(),
    })
    .nullable()
    .optional(),
  vibe: z.string().min(1).max(80),
  category: z.string().min(1).max(120),
  occasion: z.string().trim().min(2).max(800),
  priceRange: priceRangeSchema,
});

const productMeasurementsSchema = z.object({
  bust: z.number().nullable().optional(),
  waist: z.number().nullable().optional(),
  hip: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
});

const variantMeasurementsSchema = z.object({
  variantId: z.string().nullable().optional(),
  variantNumericId: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  optionValues: z.array(z.string()).default([]),
  availableForSale: z.boolean().nullable().optional(),
  sku: z.string().nullable().optional(),
  measurements: productMeasurementsSchema.nullable().optional(),
});

export const merchantProductSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  description: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  published: z.boolean().nullable().optional(),
  vendor: z.string().nullable().optional(),
  productType: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  imageUrls: z.array(z.string()).nullable().optional(),
  images: z.array(z.string()).nullable().optional(),
  image: z.string().nullable().optional(),
  inventoryQty: z.number().nullable().optional(),
  merchantId: z.string().nullable().optional(),
  shopifyProductId: z.string().nullable().optional(),
  shopifyProductNumericId: z.string().nullable().optional(),
  shopifyVariantNumericIds: z
    .array(z.union([z.string(), z.number()]))
    .nullable()
    .optional(),
  measurements: productMeasurementsSchema.nullable().optional(),
  variantMeasurements: z.array(variantMeasurementsSchema).nullable().optional(),
  createdAt: z.number().nullable().optional(),
  updatedAt: z.number().nullable().optional(),
});

export const recommendedProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string(),
  imageUrl: z.string().nullable(),
  merchantId: z.string(),
  sku: z.string(),
  vendor: z.string(),
  score: z.number(),
  reason: z.string(),
  soldOut: z.boolean(),
  shopifyProductId: z.string().nullable(),
  storeUrl: z.string().nullable(),
  addToCartUrl: z.string().nullable(),
  fitVerified: z.boolean().optional(),
  fitMatchLabel: z.string().nullable().optional(),
  sizeMatchScore: z.number().optional(),
  matchedSize: z.string().nullable().optional(),
  matchedVariantNumericId: z.string().nullable().optional(),
});

export const recommendResponseSchema = z.object({
  occasionContext: occasionContextSchema,
  products: z.array(recommendedProductSchema),
});

export type Gender = z.infer<typeof genderSchema>;
export type PriceRange = z.infer<typeof priceRangeSchema>;
export type ImageSignals = z.infer<typeof imageSignalsSchema>;
export type OccasionContext = z.infer<typeof occasionContextSchema>;
export type RecommendRequest = z.infer<typeof recommendRequestSchema>;
export type MerchantProduct = z.infer<typeof merchantProductSchema>;
export type RecommendedProduct = z.infer<typeof recommendedProductSchema>;
export type RecommendResponse = z.infer<typeof recommendResponseSchema>;
export type UserSizeProfile = NonNullable<RecommendRequest["sizeProfile"]>;

