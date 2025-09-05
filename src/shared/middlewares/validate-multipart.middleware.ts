import { NextFunction, RequestHandler, Request, Response } from "express";
import { z } from "zod";

type MultipartValidationSchemas = {
  body?: z.ZodObject<any>;
  requireFile?: boolean;
  fileFieldName?: string;
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
};

export function validateMultipartMiddleware(schemas: MultipartValidationSchemas): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): any => {
    // Validate file requirements
    if (schemas.requireFile && !req.file) {
      return res.status(400).json({
        error: `File is required${schemas.fileFieldName ? ` for field '${schemas.fileFieldName}'` : ""}`,
      });
    }

    // Validate file size
    if (req.file && schemas.maxFileSize && req.file.size > schemas.maxFileSize) {
      const maxSizeMB = (schemas.maxFileSize / (1024 * 1024)).toFixed(1);
      return res.status(400).json({
        error: `File size exceeds limit of ${maxSizeMB}MB`,
      });
    }

    // Validate file type
    if (req.file && schemas.allowedMimeTypes && !schemas.allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: `File type not allowed. Allowed types: ${schemas.allowedMimeTypes.join(", ")}`,
      });
    }

    // Validate body schema
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        const firstError = result.error.issues[0];
        return res.status(400).json({
          error: `Validation error: ${firstError.message}`,
        });
      }
    }

    next();
  };
}

// Configuração específica para cadastro de lote
export const loteValidationConfig: MultipartValidationSchemas = {
  requireFile: true,
  fileFieldName: "photo",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
};
