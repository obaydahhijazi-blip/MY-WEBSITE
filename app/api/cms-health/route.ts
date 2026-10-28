import { NextResponse } from "next/server";
import { authorizeDiagnostics } from "@/lib/diagnostics-auth";
import { client } from "@/sanity/client";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const denied = authorizeDiagnostics(request);
  if (denied) return denied;
  if (!client) return NextResponse.json({ok:false,connected:false,message:"Sanity غير مرتبط: الموقع يعرض المحتوى المحلي."},{headers:{"Cache-Control":"private, no-store"}});
  try {
    // Query the same dataset and API configuration that the public site uses.
    const count = await client.withConfig({useCdn:false}).fetch<number>('count(*[_type == "project"])',{}, {cache:"no-store"});
    return NextResponse.json({ok:true,connected:true,projectCount:count,message:"الاتصال بـ Sanity يعمل."},{headers:{"Cache-Control":"private, no-store"}});
  } catch {
    return NextResponse.json({ok:false,connected:false,message:"فشل الاتصال بـ Sanity. قد يظهر المحتوى المحلي بدلاً من التحديثات."},{headers:{"Cache-Control":"private, no-store"}});
  }
}
