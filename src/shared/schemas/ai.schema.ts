import { z } from "zod";

export const RelatorioImpactoRequestSchema = z.object({
  merchantId: z.string().min(1),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
});

export const RelatorioImpactoResponseSchema = z.object({
  merchantId: z.string().min(1),
  merchantName: z.string().min(1),
  period: z.object({
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
  }),
  metrics: z.object({
    totalLotes: z.number().int().min(0),
    totalWeight: z.number().min(0),
    totalCollections: z.number().int().min(0),
    co2Saved: z.number().min(0), // em kg
    wasteTypesBreakdown: z.record(z.string(), z.number().min(0)),
  }),
  socialMediaText: z.string().min(1),
  generatedAt: z.iso.datetime(),
});

export const AnalysisLoteRequestSchema = z.object({
  loteId: z.string().min(1),
  producerId: z.string().min(1),
});

export const AnalysisLoteResponseSchema = z.object({
  loteId: z.string().min(1),
  analysis: z.object({
    wasteComposition: z.record(z.string(), z.number().min(0).max(100)),
    compostingRecommendations: z.array(z.string().min(1)),
    expectedCompostTime: z.number().positive(), // em dias
    qualityScore: z.number().min(0).max(10),
    potentialIssues: z.array(z.string().min(1)),
    tips: z.array(z.string().min(1)),
  }),
  generatedAt: z.iso.datetime(),
});

export const ImageAnalysisRequestSchema = z.object({
  imageData: z.string().min(1),
  additionalInfo: z.object({
    weight: z.number().positive(),
    location: z.string().min(1),
  }).optional(),
});

export const ImageAnalysisResponseSchema = z.object({
  description: z.string().min(1),
  wasteTypes: z.array(z.enum([
    "frutas", "legumes", "folhagens", "outros",
  ])),
  estimatedComposition: z.record(z.string(), z.number().min(0).max(100)),
  qualityAssessment: z.enum(["excelente", "boa", "regular", "ruim"]),
  recommendations: z.array(z.string().min(1)),
  confidence: z.number().min(0).max(1), // 0-1 (confiança da IA)
});

export type RelatorioImpactoRequest =
  z.infer<typeof RelatorioImpactoRequestSchema>;
export type RelatorioImpactoResponse =
  z.infer<typeof RelatorioImpactoResponseSchema>;
export type AnalysisLoteRequest = z.infer<typeof AnalysisLoteRequestSchema>;
export type AnalysisLoteResponse = z.infer<typeof AnalysisLoteResponseSchema>;
export type ImageAnalysisRequest = z.infer<typeof ImageAnalysisRequestSchema>;
export type ImageAnalysisResponse = z.infer<typeof ImageAnalysisResponseSchema>;
