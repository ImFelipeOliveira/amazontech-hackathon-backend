import { NextFunction, RequestHandler, Request, Response } from "express";
// eslint-disable-next-line import/no-named-as-default
import z from "zod";

type Schemas = {
  body?: z.ZodObject<any>;
  params?: z.ZodObject<any>;
  query?: z.ZodObject<any>;
  headers?: z.ZodObject<any>;
  isMultipart?: boolean;
};

export function validateRequestMiddleware(schemas: Schemas): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
    }

    if (schemas.isMultipart && !req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    next();
  };
}
