import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { UserRole } from "@/generated/prisma";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_SIZE = 5 * 1024 * 1024;

function sanitizeFilename(filename: string): string {
  const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 100) || `upload-${Date.now()}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Missing filename query parameter" },
      { status: 400 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
      { status: 400 }
    );
  }

  const arrayBuffer = await request.arrayBuffer().catch(() => null);
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    return NextResponse.json(
      { error: "Missing request body" },
      { status: 400 }
    );
  }

  if (arrayBuffer.byteLength > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 5MB." },
      { status: 400 }
    );
  }

  const safeName = sanitizeFilename(filename);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    try {
      const blob = await put(safeName, arrayBuffer, {
        access: "public",
        token,
        contentType,
      });
      return NextResponse.json(blob);
    } catch (err) {
      console.error("Vercel Blob upload failed:", err);
      return NextResponse.json(
        { error: "Vercel Blob upload failed" },
        { status: 500 }
      );
    }
  }

  if (
    process.env.NODE_ENV === "development" &&
    session.user.role === UserRole.ADMIN
  ) {
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const dest = path.join(uploadsDir, safeName);
      await fs.writeFile(dest, Buffer.from(arrayBuffer));

      const base =
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const url = `${base.replace(/\/$/, "")}/uploads/${encodeURIComponent(safeName)}`;
      return NextResponse.json({ url });
    } catch (err) {
      console.error("Local upload fallback failed:", err);
    }
  }

  return NextResponse.json(
    { error: "Upload storage not configured" },
    { status: 503 }
  );
}
