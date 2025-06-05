import type { Response } from "express";

export const handleError = (error: unknown, res: Response, statusCode = 400) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  return res.status(statusCode).json({ message });
};