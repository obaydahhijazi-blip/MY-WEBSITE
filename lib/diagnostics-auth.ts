import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

const hits = new Map<string,{ count: number; until: number }>();
/** One server-side shared secret set in Netlify, never passed in URLs or stored in browser. */
export function authorizeDiagnostics(request: Request): Response | null {
  const secret = process.env.SITE_DIAGNOSTICS_SECRET;
  if (!secret || secret.length < 24) return Response.json({ ok:false, message:"يجب ضبط SITE_DIAGNOSTICS_SECRET (24 حرفاً على الأقل) في Netlify لتفعيل الفحوص المحمية." }, {status:503,headers:{"Cache-Control":"no-store"}});
  const ip = request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  if (hits.size > 2000) hits.clear();
  const entry = hits.get(ip);
  const reset = entry && entry.until > now ? entry : { count: 0, until: now + 60_000 };
  reset.count++;
  hits.set(ip, reset);
  if (reset.count > 10) return Response.json({ok:false,message:"طلبات كثيرة، أعد المحاولة بعد دقيقة."},{status:429,headers:{"Cache-Control":"no-store"}});
  const supplied = request.headers.get("x-diagnostics-key") || "";
  const hashed = (v: string) => createHash("sha256").update(v).digest();
  if (!supplied || !timingSafeEqual(hashed(supplied),hashed(secret))) return Response.json({ok:false,message:"المفتاح غير صحيح. استخدم المفتاح المضبوط في Netlify."},{status:401,headers:{"Cache-Control":"no-store"}});
  return null;
}
