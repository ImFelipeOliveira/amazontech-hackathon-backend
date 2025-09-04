import { ZodError, z, ZodType } from "zod";
import { ErrorResponse } from "../schemas";

/**
 * Valida dados usando um schema Zod
 * @param {ZodType<T>} schema - Schema Zod para validação
 * @param {unknown} data - Dados a serem validados
 * @return {T} Dados validados ou lança erro
 */
export function validateSchema<T>(schema: ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Dados inválidos", error.issues);
    }
    throw error;
  }
}

/**
 * Valida dados usando um schema Zod de forma segura
 * @param {ZodType<T>} schema - Schema Zod para validação
 * @param {unknown} data - Dados a serem validados
 * @return {object} Resultado da validação
 */
export function safeValidateSchema<T>(
  schema: ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Classe customizada para erros de validação
 */
export class ValidationError extends Error {
  public readonly code = "VALIDATION_ERROR";
  public readonly details: ZodError["issues"];

  constructor(message: string, details: ZodError["issues"]) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }

  /**
   * Converte o erro para formato de resposta da API
   * @return {ErrorResponse} Resposta formatada do erro
   */
  toErrorResponse(): ErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details.map((err: z.core.$ZodIssue) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
