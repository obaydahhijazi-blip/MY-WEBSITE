import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CMS_TAG } from "@/lib/cms";

/**
 * Sanity webhook → refresh the public site right after "Publish".
 * Signed with SANITY_REVALIDATE_SECRET; unsigned or wrongly signed calls are rejected.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ error: "revalidate_not_configured" }, { status: 503 });
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
    if (!isValidSignature) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    revalidateTag(CMS_TAG, { expire: 0 });
    return NextResponse.json({ revalidated: true, type: body?._type ?? null });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
