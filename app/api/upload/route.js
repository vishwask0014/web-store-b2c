import { NextResponse } from "next/server";
import { getRequestUser, unauthorized } from "@/app/lib/auth";
import cloudinary, { CLOUDINARY_ROOT_FOLDER } from "@/app/lib/cloudinary";

const ALLOWED_SUBFOLDERS = ["profiles", "products", "services"];

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    const { file, subfolder } = await req.json().catch(() => ({}));

    if (!file || typeof file !== "string" || !file.startsWith("data:")) {
      return NextResponse.json({ error: "Missing or invalid file data." }, { status: 400 });
    }

    const folder = ALLOWED_SUBFOLDERS.includes(subfolder)
      ? `${CLOUDINARY_ROOT_FOLDER}/${subfolder}`
      : CLOUDINARY_ROOT_FOLDER;

    const resourceType = /^data:(video|audio)\//.test(file) ? "video" : "image";

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resourceType,
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Upload failed. Check your Cloudinary configuration." },
      { status: 500 }
    );
  }
}
