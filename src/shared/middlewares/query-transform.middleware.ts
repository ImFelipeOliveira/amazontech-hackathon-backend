import { NextFunction, Request, Response } from "express";

export function transformQueryToNumbers(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (req.query[field] && typeof req.query[field] === "string") {
        const numValue = parseFloat(req.query[field] as string);
        if (!isNaN(numValue)) {
          req.query[field] = numValue as any;
        }
      }
    }
    next();
  };
}


