import { ZodError, ZodType } from "zod";
import { ErrorResponse } from "../schemas";
import { HttpStatus } from "../http/protocols-enums";


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
      throw new ValidationError("Dados inválidos", HttpStatus.BAD_REQUEST);
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
  public readonly statusCode: HttpStatus | number;
  constructor(message = "Internal server error", statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
  }

  /**
   * Converte o erro para formato de resposta da API
   * @return {ErrorResponse} Resposta formatada do erro
   */
  toErrorResponse(): ErrorResponse {
    return {
      error: this.message,
    };
  }
}
