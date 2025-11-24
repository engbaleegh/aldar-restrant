// import cloudinary from "@/lib/cloudinary";
// import { NextResponse } from "next/server";

// // Define the type for the form data file
// type FormDataFile = Blob & {
//   name?: string; // Optional: Some browsers may add this
// };

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as FormDataFile | null;
//     const pathName = formData.get("pathName") as string;

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 });
//     }
//     // Convert the file to a format Cloudinary can handle (Buffer or Base64)
//     const fileBuffer = await file.arrayBuffer();
//     const base64File = Buffer.from(fileBuffer).toString("base64");
//     // Upload to Cloudinary
//     const uploadResponse = await cloudinary.uploader.upload(
//       `data:${file.type};base64,${base64File}`,
//       {
//         folder: pathName,
//         transformation: [
//           { width: 200, height: 200, crop: "fill", gravity: "face" },
//         ],
//       }
//     );
//     return NextResponse.json({ url: uploadResponse.secure_url });
//   } catch (error) {
//     console.error("Error uploading file to Cloudinary:", error);
//     return NextResponse.json(
//       { error: "Failed to upload image" },
//       { status: 500 }
//     );
//   }
// }

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Missing filename query parameter" },
      { status: 400 }
    );
  }

  // read body as ArrayBuffer (works for binary body or streams)
  const arrayBuffer = await request.arrayBuffer().catch(() => null);
  if (!arrayBuffer) {
    return NextResponse.json(
      { error: "Missing request body" },
      { status: 400 }
    );
  }

  // If Vercel Blob token is configured, use @vercel/blob, otherwise fall back to saving locally (dev).
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    // Use the token-aware put; @vercel/blob will pick token from env if set, but put also accepts token option.
    try {
      const blob = await put(filename, arrayBuffer, {
        access: "public",
        token,
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

  // Dev fallback: write file to public/uploads so it can be served by Next.js dev server
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const dest = path.join(uploadsDir, filename);
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(dest, buffer);

    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const url = `${base.replace(/\/$/, "")}/uploads/${encodeURIComponent(
      filename
    )}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Local upload fallback failed:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}

// The next lines are required for Pages API Routes only
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
