import jwt from "jsonwebtoken";
import express from "express";

export const authenticateToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err, data) => {
    if (err) return res.sendStatus(403);
    const isAdmin = (data as jwt.JwtPayload).admin;
    if (!isAdmin) return res.sendStatus(403);
    next();
  });
};
