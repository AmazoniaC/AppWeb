// Firma y verificación del token de sesión. Sin "server-only" porque
// también lo usa proxy.ts; no importa nada de base de datos.
import { SignJWT, jwtVerify } from "jose";
import type { Rol } from "@/generated/prisma/enums";

export const SESSION_COOKIE = "session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  userId: string;
  rol: Rol;
  expiresAt: string;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET debe estar definido y tener al menos 32 caracteres");
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
