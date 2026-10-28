"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";
import type { CustomerQuote, QuoteLine } from "@/lib/quotes-types";

const dataset=process.env.NEXT_PUBLIC_SANITY_QUOTES_DATASET||"";
const sourceDataset=process.env.NEXT_PUBLIC_SANITY_DATASET||"production";
const currencies=["USD","SYP","EUR"] as const;
const S={
  card:{border:"1px solid #dfe8e9",borderRadius:18,padding:20,background:"#fff"} as React.CSSProperties,
  input:{width:"100%",border:"1px solid #c6d6d9",borderRadius:10,padding:"10px 12px",font:"inherit",color:"#16363c",background:"#fff",minHeight:44} as React.CSSProperties,
  button:{border:0,borderRadius:12,padding:"10px 16px",fontWeight:700,cursor:"pointer",background:"#00373e",color:"#fff"} as React.CSSProperties,
};
const pad=(n:number)=>String(n).padStart(2,"0");
const today=()=>new Date().toISOString().slice(0,10);
const uid=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,"0")).join("");
const blank=():CustomerQuote=>({
  _id:`quote.${crypto.randomUUID()}`,_type:"customerQuote",
  reference:`Q-${new Date().getFullYear()}-${Math.floor(Math.random()*8999)+1000}`,
  title:"",clientName:"",clientCompany:"",createdDate:today(),validUntil:"",
  currency:"USD",items:[{_key:crypto.randomUUID(),label:"",quantity:1,unitPrice:0}],
  discount:0,notes:"",terms:"السعر النهائي ونطاق التسليم حسب البنود المذكورة. لا يشمل العرض أي خدمات إضافية لم تُذكر صراحة.",
  accent:"#00373e",shareEnabled:false,shareToken:uid(),status:"draft",
});
const money=(n:number)=>new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(n);
const label={display:"block",fontSize:12,fontWeight:750,color:"#4e686d",marginBottom:6} as React.CSSProperties;

export function QuoteManager(){
  const base=useClient({apiVersion:"2025-10-01"});
  const client=useMemo(()=>dataset&&dataset!==sourceDataset?base.withConfig({dataset}):null,[base]);
  const [quotes,setQuotes]=useState<CustomerQuote[]>([]);
  const [form,setForm]=useState<CustomerQuote|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const load=useCallback(async()=>{
    if(!client)return;
    try {
      const docs=await client.fetch<CustomerQuote[]>('*[_type=="customerQuote"]|order(_createdAt desc){_id,_type,reference,title,clientName,clientCompany,createdDate,validUntil,currency,items[]{_key,label,quantity,unitPrice},discount,notes,terms,accent,shareEnabled,shareToken,status}',{}, {perspective:"published"});
      setQuotes(docs);
    }catch(e){setError(e instanceof Error?e.message:"تعذّر تحميل العروض");}
  },[client]);
  useEffect(()=>{void load();},[load]);
  const patch=(fields:Partial<CustomerQuote>)=>setForm(old=>old?{...old,...fields}:old);
  const patchItem=(key:string,fields:Partial<QuoteLine>)=>patch({items:(form?.items||[]).map(x=>x._key===key?{...x,...fields}:x)});
  const addItem=(service="")=>patch({items:[...(form?.items||[]),{_key:crypto.randomUUID(),label:service,quantity:1,unitPrice:0}]});
  const save=async(publish=false)=>{
    if(!client||!form)return;
    if(!form.clientName.trim()||!form.title.trim()||!form.items.length||form.items.some(x=>!x.label.trim()||!Number.isFinite(x.quantity)||x.quantity<=0||!Number.isFinite(x.unitPrice)||x.unitPrice<0)){setError("أدخل اسم العميل والمشروع وبنوداً صحيحة (الكمية موجبة والسعر غير سالب).");return;}
    if(form.discount<0||form.discount>100){setError("الخصم يجب أن يكون بين 0 و100.");return;}
    const doc={...form,shareEnabled:publish?true:form.shareEnabled,status:publish?"sent":form.status};
    setBusy(true);setError("");setNotice("");
    try{
      await client.createOrReplace(doc);
      setForm(doc);
      await load();
      setNotice(publish?"تم الحفظ وتفعيل رابط العرض.":"تم حفظ عرض السعر.");
    }catch(e){setError(e instanceof Error?e.message:"فشل حفظ عرض السعر");}
    finally{setBusy(false);}
  };
  const subtotal=(form?.items||[]).reduce((sum,x)=>sum+(Number(x.quantity)||0)*(Number(x.unitPrice)||0),0);
  const total=subtotal*(1-Math.max(0,Math.min(100,form?.discount||0))/100);
  const share=form?`${typeof window!=="undefined"?window.location.origin:""}/offer/${form.shareToken}`:"";
  return <main dir="rtl" style={{background:"#f7f8f7",minHeight:"100%",fontFamily:"system-ui,sans-serif",color:"#153a41",padding:"26px 20px",lineHeight:1.7}}>
    <div style={{maxWidth:1160,margin:"auto"}}>
      <header style={{...S.card,background:"linear-gradient(110deg,#00373e,#001e25)",color:"#fff",marginBottom:20}}>
        <div style={{fontSize:12,color:"#75dae4",letterSpacing:2}}>OBAYDAH.GRAPHIC</div>
        <h1 style={{fontSize:28,margin:"6px 0"}}>منشئ عروض الأسعار</h1>
        <p style={{margin:0,opacity:.8}}>أنشئ عروضاً خاصة، خصّص البنود والخصم والألوان، ثم أرسل رابطاً مع QR للتحقق وطباعة PDF.</p>
      </header>
      {(!dataset||dataset===sourceDataset)&&<div style={{...S.card,borderColor:"#bd6d16",background:"#fff9e9",marginBottom:20}} role="alert">
        <strong>نظام العروض الخاصة يحتاج قاعدة بيانات خاصة منفصلة.</strong>
        <p>أنشئ Dataset خاصة (Private) باسم <code>quotes-private</code> داخل Sanity، ثم أضف إلى الاستضافة <code>NEXT_PUBLIC_SANITY_QUOTES_DATASET=quotes-private</code> و<code>SANITY_QUOTES_DATASET=quotes-private</code> مع <code>SANITY_API_READ_TOKEN</code> بصلاحية قراءة هذه البيانات. لا تخزّن عروض العملاء في قاعدة محتوى الموقع العامة.</p>
      </div>}
      {error&&<p role="alert" style={{padding:12,background:"#ffe8e8",color:"#a22",borderRadius:12,marginBottom:14}}>{error}</p>}
      {notice&&<p role="status" style={{padding:12,background:"#e8f5ee",color:"#176641",borderRadius:12,marginBottom:14}}>{notice}</p>}
      <div style={{display:"grid",gridTemplateColumns:"minmax(220px,290px) minmax(0,1fr)",gap:20,alignItems:"start"}}>
        <aside style={S.card}>
          <button disabled={!client} onClick={()=>{setForm(blank());setError("");setNotice("");}} style={{...S.button,width:"100%",opacity:client?1:.5}}>+ عرض سعر جديد</button>
          <h2 style={{margin:"20px 0 10px",fontSize:15}}>العروض المحفوظة</h2>
          <div style={{display:"grid",gap:9}}>
            {quotes.map(q=><button key={q._id} onClick={()=>{setForm({...q,items:q.items||[]});setError("");setNotice("");}} style={{border:"1px solid #dce7e8",borderRadius:12,background:form?._id===q._id?"#e1f9f9":"#fff",padding:"10px",textAlign:"right",cursor:"pointer"}}>
              <strong style={{display:"block",fontSize:14}}>{q.reference||q.title}</strong><small>{q.clientName} · {q.status==="sent"?"مُرسل":q.status==="accepted"?"مقبول":q.status==="revoked"?"ملغى":"مسودة"}</small>
            </button>)}
            {!quotes.length&&<p style={{fontSize:13,color:"#72868a"}}>ما في عروض محفوظة بعد.</p>}
          </div>
        </aside>
        <section style={S.card}>
          {!form?<p style={{textAlign:"center",padding:"50px 12px",color:"#72868a"}}>اختَر عرضاً من القائمة أو أنشئ عرضاً جديداً.</p>:<>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}><h2 style={{margin:0,fontSize:21}}>تفاصيل العرض</h2><span style={{fontSize:12,color:"#72868a"}}>{form.reference}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14}}>
            {([["reference","رقم العرض"],["title","عنوان المشروع"],["clientName","اسم العميل"],["clientCompany","الشركة / الجهة"]] as const).map(([key,title])=><label key={key}><span style={label}>{title}</span><input style={S.input} value={form[key]||""} onChange={e=>patch({[key]:e.target.value})}/></label>)}
            <label><span style={label}>تاريخ الإصدار</span><input type="date" style={S.input} value={form.createdDate} onChange={e=>patch({createdDate:e.target.value})}/></label>
            <label><span style={label}>صالح حتى</span><input type="date" style={S.input} value={form.validUntil||""} onChange={e=>patch({validUntil:e.target.value})}/></label>
            <label><span style={label}>العملة</span><select style={S.input} value={form.currency} onChange={e=>patch({currency:e.target.value as CustomerQuote["currency"]})}>{currencies.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
            <label><span style={label}>اللون الأساسي للعرض</span><input type="color" style={{...S.input,padding:4}} value={form.accent||"#00373e"} onChange={e=>patch({accent:e.target.value})}/></label>
          </div>
          <h3 style={{fontSize:17,margin:"25px 0 10px"}}>الخدمات والأسعار</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
            {["هوية بصرية","تصميم سوشيال ميديا","إنتاج ريلز","فيديو إعلاني","موشن جرافيك","إنتاج بالذكاء الاصطناعي"].map(x=><button type="button" key={x} onClick={()=>addItem(x)} style={{...S.button,padding:"7px 11px",background:"#e6f3f4",color:"#00505b",fontSize:12}}>+ {x}</button>)}
          </div>
          <div style={{display:"grid",gap:12}}>
            {form.items.map((item,n)=><div key={item._key} style={{border:"1px solid #e2eaeb",borderRadius:13,padding:12,display:"grid",gridTemplateColumns:"minmax(0,1fr) 85px 116px 34px",gap:10,alignItems:"end"}}>
              <label><span style={label}>الخدمة {n+1}</span><input style={S.input} value={item.label} onChange={e=>patchItem(item._key,{label:e.target.value})}/></label>
              <label><span style={label}>الكمية</span><input style={S.input} type="number" min="0.01" step=".01" value={item.quantity} onChange={e=>patchItem(item._key,{quantity:Number(e.target.value)})}/></label>
              <label><span style={label}>سعر الوحدة</span><input style={S.input} type="number" min="0" step=".01" value={item.unitPrice} onChange={e=>patchItem(item._key,{unitPrice:Number(e.target.value)})}/></label>
              <button type="button" onClick={()=>patch({items:form.items.filter(x=>x._key!==item._key)})} aria-label="حذف البند" style={{...S.button,padding:0,height:42,background:"#feecec",color:"#aa3333"}}>×</button>
            </div>)}
            <button style={{...S.button,background:"#e3eff0",color:"#00515b"}} onClick={()=>addItem()}>+ إضافة بند جديد</button>
          </div>
          <div style={{...S.card,background:"#f4fafa",marginTop:22}}>
            <label style={{display:"block",maxWidth:230}}><span style={label}>الخصم %</span><input type="number" min={0} max={100} step={1} style={S.input} value={form.discount} onChange={e=>patch({discount:Number(e.target.value)})}/></label>
            <p>المجموع الفرعي: <b dir="ltr">{money(subtotal)} {form.currency}</b></p>
            <p style={{fontWeight:800,fontSize:23,margin:"4px 0 0"}}>الإجمالي: <b dir="ltr">{money(total)} {form.currency}</b></p>
          </div>
          <div style={{display:"grid",gap:15,marginTop:22}}>
            <label><span style={label}>ملاحظات وتفاصيل المشروع</span><textarea style={{...S.input,minHeight:95}} value={form.notes||""} onChange={e=>patch({notes:e.target.value})}/></label>
            <label><span style={label}>الشروط والأحكام</span><textarea style={{...S.input,minHeight:100}} value={form.terms||""} onChange={e=>patch({terms:e.target.value})}/></label>
            <label><span style={label}>حالة العرض</span><select style={S.input} value={form.status} onChange={e=>patch({status:e.target.value as CustomerQuote["status"]})}><option value="draft">مسودة</option><option value="sent">مرسل</option><option value="accepted">مقبول</option><option value="revoked">ملغى</option></select></label>
            <label style={{display:"flex",alignItems:"center",gap:9}}><input type="checkbox" checked={form.shareEnabled} onChange={e=>patch({shareEnabled:e.target.checked})}/><strong>السماح بفتح الرابط من قِبل العميل</strong></label>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:26}}>
            <button disabled={busy} style={{...S.button,opacity:busy?.5:1}} onClick={()=>void save(false)}>{busy?"جارٍ الحفظ…":"حفظ العرض"}</button>
            <button disabled={busy} style={{...S.button,background:"#007b88"}} onClick={()=>void save(true)}>حفظ وتفعيل المشاركة</button>
            <button style={{...S.button,background:"#e4f0f1",color:"#00414c"}} onClick={()=>setForm({...form,_id:`quote.${crypto.randomUUID()}`,shareToken:uid(),reference:form.reference+"-COPY",shareEnabled:false,status:"draft"})}>إنشاء نسخة</button>
          </div>
          {form.shareEnabled&&["sent","accepted"].includes(form.status)&&<>
            <div style={{...S.card,marginTop:20,background:"#f1f8f8",overflowWrap:"anywhere"}}>
              <strong>رابط العميل الخاص</strong><p dir="ltr" style={{fontSize:12,textAlign:"left"}}>{share}</p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button style={S.button} onClick={()=>{void navigator.clipboard.writeText(share).then(()=>setNotice("تم نسخ رابط عرض السعر")).catch(()=>setError("تعذّر النسخ التلقائي"));}}>نسخ الرابط</button>
                <a href={share} target="_blank" rel="noopener noreferrer" style={{...S.button,textDecoration:"none",background:"#006b78"}}>معاينة / PDF / QR</a>
              </div>
            </div>
            <p style={{fontSize:12,color:"#856b22"}}>الرابط سرّي؛ كل من يمتلكه يستطيع مشاهدة العرض. لتعطيله ألغِ خيار المشاركة ثم احفظ، أو غيّر الحالة إلى «ملغى».</p>
          </>}
          </>}
        </section>
      </div>
    </div>
  </main>;
}
