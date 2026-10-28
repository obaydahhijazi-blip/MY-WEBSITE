import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QuoteQR } from "@/components/QuoteQR";
import { QuotePrintButton } from "@/components/QuotePrintButton";
import { calculateQuote, getSharedQuote } from "@/lib/quotes";
import { siteUrl } from "@/lib/site";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"عرض سعر خاص | OBAYDAH GRAPHIC",robots:{index:false,follow:false,nocache:true}};
type P={params:Promise<{token:string}>};
const money=(n:number,currency:string)=>new Intl.NumberFormat("en-US",{maximumFractionDigits:2,minimumFractionDigits:2}).format(n)+" "+currency;

export default async function OfferPage({params}:P){
  const {token}=await params;
  const quote=await getSharedQuote(token).catch(()=>null);
  if(!quote)notFound();
  const values=calculateQuote(quote);
  const verificationUrl=`${siteUrl}/verify/${encodeURIComponent(token)}`;
  const expired=Boolean(quote.expired);
  const accent=/^#[0-9a-f]{6}$/i.test(quote.accent||"")?quote.accent:"#00373e";
  return <main className="offer-page" dir="rtl" style={{"--offer-accent":accent} as React.CSSProperties}>
    <div className="offer-actions"><Link href="/" className="offer-back-link">الرئيسية</Link><QuotePrintButton /></div>
    <article className="offer-sheet">
      <header className="offer-header">
        <div><p className="offer-kicker">OBAYDAH.GRAPHIC</p><h1>عرض سعر</h1><p>تصميم وإنتاج بصري باهتمام بالتفاصيل</p></div>
        <div className="offer-meta"><strong>{quote.reference}</strong><span>التاريخ: {quote.createdDate}</span><span>صالح حتى: {quote.validUntil||"يُحدّد بالاتفاق"}</span></div>
      </header>
      <section className="offer-intro"><div><small>مُقدّم إلى</small><h2>{quote.clientName}</h2>{quote.clientCompany&&<p>{quote.clientCompany}</p>}</div><div><small>المشروع</small><h2>{quote.title}</h2>{expired&&<span className="offer-expired">انتهت صلاحية هذا العرض</span>}</div></section>
      <table className="offer-table"><thead><tr><th>الخدمة / البند</th><th>الكمية</th><th>سعر الوحدة</th><th>المجموع</th></tr></thead><tbody>
      {quote.items.map(item=><tr key={item._key}><td>{item.label}</td><td>{item.quantity}</td><td dir="ltr">{money(item.unitPrice,quote.currency)}</td><td dir="ltr">{money(item.quantity*item.unitPrice,quote.currency)}</td></tr>)}
      </tbody></table>
      <div className="offer-totals"><p><span>المجموع الفرعي</span><strong dir="ltr">{money(values.subtotal,quote.currency)}</strong></p>
      {quote.discount>0&&<p><span>خصم {quote.discount}%</span><strong dir="ltr">− {money(values.discountValue,quote.currency)}</strong></p>}
      <p className="offer-grand"><span>الإجمالي</span><strong dir="ltr">{money(values.total,quote.currency)}</strong></p></div>
      {(quote.notes||quote.terms)&&<div className="offer-extra">{quote.notes&&<section><h3>تفاصيل العرض</h3><p>{quote.notes}</p></section>}{quote.terms&&<section><h3>الشروط والملاحظات</h3><p>{quote.terms}</p></section>}</div>}
      <footer className="offer-footer"><div><strong>تحقّق من أصالة العرض</strong><p>امسح رمز QR؛ سيتم التحقق من حالة العرض مباشرة عبر الموقع الرسمي.</p><span className="offer-verification-url">{verificationUrl}</span></div><QuoteQR url={verificationUrl}/></footer>
      <div className="offer-footline">OBAYDAH GRAPHIC — هذا المستند خاص بالمستلم، ولا يُعدّ فاتورة ضريبية أو إثبات دفع.</div>
    </article>
  </main>;
}
