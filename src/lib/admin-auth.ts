import { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function requireAdminSecret(req: NextRequest): boolean {
  if (!ADMIN_SECRET || ADMIN_SECRET.length === 0) return false;
  const provided = req.headers.get("x-admin-secret") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === ADMIN_SECRET;
}

export function isAdminConfigured(): boolean {
  return Boolean(ADMIN_SECRET && ADMIN_SECRET.length > 0);
}
