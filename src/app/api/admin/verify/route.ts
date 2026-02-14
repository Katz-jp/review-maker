import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (password === adminSecret) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }
}
