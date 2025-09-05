import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/validation.utils";
import { HttpStatus } from "../http/protocols-enums";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ValidationError("Apenas arquivos de imagem são permitidos", HttpStatus.BAD_REQUEST));
    }
  },
});

export const uploadSingle = upload.single("photo"); // 'photo' é o nome do campo

export const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Arquivo muito grande. Máximo 5MB.",
      });
    }
  }

  if (error.message === "Apenas arquivos de imagem são permitidos") {
    return res.status(400).json({
      error: error.message,
    });
  }

  next(error);
};
