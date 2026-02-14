import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json({ configured: isAdminConfigured() });
}
