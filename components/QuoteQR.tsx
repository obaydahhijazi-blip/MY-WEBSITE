import { qrSvgPath } from "@/lib/qr";

export function QuoteQR({url}:{url:string}) {
  const qr=qrSvgPath(url);
  if(!qr)return <span className="text-xs">الرابط طويل جداً لإنشاء رمز QR، افتحه من المتصفح.</span>;
  return <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="رمز QR للتحقق من صحة عرض السعر عبر الموقع" viewBox={`-4 -4 ${qr.size+8} ${qr.size+8}`} width="136" height="136" shapeRendering="crispEdges">
    <rect x="-4" y="-4" width={qr.size+8} height={qr.size+8} fill="#fff"/>
    <path d={qr.path} fill="#00373e"/>
  </svg>;
}
