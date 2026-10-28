import type { Metadata } from "next";
import Link from "next/link";
import { getSharedQuote } from "@/lib/quotes";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"التحقق من عرض السعر | OBAYDAH GRAPHIC",robots:{index:false,follow:false,nocache:true}};
type P={params:Promise<{token:string}>};
export default async function VerifyPage({params}:P){
  const {token}=await params;
  const quote=await getSharedQuote(token).catch(()=>null);
  const expired=!!quote?.validUntil&&Date.parse(quote.validUntil+"T23:59:59")<Date.now();
  return <main className="flex min-h-dvh items-center justify-center bg-paper-2 px-5 py-14" dir="rtl"><section className="w-full max-w-xl rounded-3xl border border-line bg-white p-8 text-center shadow-xl">
    <p className="mb-3 text-sm font-bold tracking-widest text-cyan-ink">OBAYDAH.GRAPHIC</p>
    <div className={`mx-auto mb-5 grid size-16 place-items-center rounded-full text-3xl ${quote?"bg-teal/10 text-teal":"bg-red-50 text-red-600"}`} aria-hidden="true">{quote?"✓":"!"}</div>
    <h1 className="text-2xl font-bold text-ink">{!quote?"تعذّر التحقق من العرض":expired?"عرض أصلي انتهت صلاحيته":"تم التحقق من أصالة عرض السعر"}</h1>
    <p className="mt-4 leading-8 text-muted">{!quote?"الرابط غير صالح أو تم إلغاء مشاركة العرض.":expired?"العرض مسجّل في الموقع، لكن فترة صلاحيته انتهت.":"هذا العرض موجود ومسجّل في نظام عروض الأسعار الخاص بالموقع."}</p>
    {quote&&<dl className="mt-7 grid gap-4 rounded-2xl bg-paper-2 p-5 text-right"><div><dt className="text-sm text-muted">رقم العرض</dt><dd className="font-bold">{quote.reference}</dd></div><div><dt className="text-sm text-muted">المشروع</dt><dd>{quote.title}</dd></div><div><dt className="text-sm text-muted">تاريخ الصلاحية</dt><dd>{quote.validUntil||"حسب الاتفاق"}</dd></div></dl>}
    {quote&&<Link href={`/offer/${encodeURIComponent(token)}`} className="mt-7 inline-flex rounded-full bg-petrol px-7 py-3 font-bold text-white">فتح عرض السعر</Link>}
    <div className="mt-5"><Link href="/" className="text-sm text-cyan-ink underline">العودة للموقع</Link></div>
  </section></main>;
}
