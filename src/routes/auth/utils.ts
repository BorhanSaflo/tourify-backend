import cookie from "cookie";
import { Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET_KEY } from "@/config";
import { UnauthorizedError } from "@/utils/errors";

export const createAccessToken = (id: number, email: string, name: string) => {
  const payload = { id, email, name };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "24h" });
  return token;
};

export const createRefreshToken = (id: number, email: string, name: string) => {
  const payload = { id, email, name };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "360d" });
  return token;
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY) as {
      id: number;
      email: string;
      name: string;
    };
  } catch {
    throw new UnauthorizedError("Invalid access token.");
  }
};

export const setRefreshCookie = (res: Response, refreshToken: string) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("refreshToken", refreshToken, {
      httpOnly: true,
      expires: date,
      sameSite: "none",
      secure: true,
      path: "/",
    })
  );
};
