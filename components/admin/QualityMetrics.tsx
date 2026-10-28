"use client";
import { useState } from "react";

type Scores = { performance: number|null; accessibility: number|null; seo: number|null; bestPractices: number|null };
type Report = { ok: boolean; message?: string; source?: string; checkedAt?: string; scores?: Scores; lab?: { lcpMs: number|null; cls: number|null }; field?: { inpMs: number|null }; note?: string };
type Version = { commit: string|null; branch: string|null; provider: string|null; note: string };
const card: React.CSSProperties = { border: "1px solid #dfe6e5", background: "#fff", padding: "16px", borderRadius: 14 };
export function QualityMetrics() {
  const [report, setReport] = useState<Report|null>(null);
  const [version, setVersion] = useState<Version|null>(null);
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState("");
  const [cms, setCms] = useState<{ok:boolean;message:string;projectCount?:number}|null>(null);
  const [strategy, setStrategy] = useState<"mobile"|"desktop">("mobile");
  const run = async () => {
    setLoading(true);
    try {
      const [m,v,c] = await Promise.all([
        fetch("/api/performance?strategy=" + strategy, { cache: "no-store", headers: {"x-diagnostics-key": key} }).then(r=>r.json() as Promise<Report>),
        fetch("/api/site-version", { cache: "no-store" }).then(r=>r.json() as Promise<Version>),
        fetch("/api/cms-health", { cache: "no-store", headers: {"x-diagnostics-key": key} }).then(r=>r.json() as Promise<{ok:boolean;message:string;projectCount?:number}>),
      ]);
      setReport(m);setVersion(v);setCms(c);
    } catch { setReport({ok:false,message:"تعذّر قراءة تقرير الأداء أو الإصدار."}); }
    finally {setLoading(false);}
  };
  return <section style={{ display:"grid", gap:15 }}>
    <h2 style={{fontSize:18,fontWeight:700}}>جودة الموقع والإصدار المنشور</h2>
    <p style={{fontSize:13,margin:0,color:"#5a6567"}}>قراءات فعلية عند طلب الفحص فقط، وليست أرقاماً تجريبية. يمكن أن تتأخر خدمة Google أو تعيد خطأً عند تجاوز حد الطلبات.</p>
    <div style={{...card,display:"grid",gap:7}}><label htmlFor="diagnostics-key" style={{fontSize:13,fontWeight:700}}>مفتاح الفحوص المحمية</label><input id="diagnostics-key" type="password" value={key} onChange={e=>setKey(e.target.value)} autoComplete="off" placeholder="SITE_DIAGNOSTICS_SECRET" style={{padding:10,border:"1px solid #dfe6e5",borderRadius:9,maxWidth:360}} /><p style={{margin:0,fontSize:12,color:"#5a6567"}}>أضف قيمة سرية من 24 حرفاً أو أكثر في Netlify باسم SITE_DIAGNOSTICS_SECRET. أدخل القيمة هنا للفحص فقط؛ لا تُحفظ في المتصفح ولا تُعرض في الرابط.</p></div>
    <div style={{display:"flex",flexWrap:"wrap",gap:9,alignItems:"center"}}>
      <label htmlFor="perf-strategy" style={{fontSize:13}}>الجهاز:</label>
      <select id="perf-strategy" value={strategy} onChange={e=>setStrategy(e.target.value as "mobile"|"desktop")} style={{padding:10,border:"1px solid #dfe6e5",borderRadius:9}}>
        <option value="mobile">موبايل</option><option value="desktop">كمبيوتر</option>
      </select>
      <button type="button" disabled={loading || !key} onClick={run} style={{padding:"10px 16px",borderRadius:99,background:"#00373E",color:"#fff",cursor:loading?"wait":"pointer"}}>{loading?"جارٍ الفحص…":"فحص الجودة والإصدار"}</button>
      <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer" style={{color:"#007a89",fontSize:13}}>فتح PageSpeed</a>
      <a href="https://search.google.com/search-console/" target="_blank" rel="noopener noreferrer" style={{color:"#007a89",fontSize:13}}>فتح Search Console</a>
    </div>
    {report ? !report.ok ? <p role="status" style={{...card,color:"#a53220"}}>{report.message}</p> :
      <div style={{display:"grid",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
          {([["performance","الأداء"],["accessibility","إمكانية الوصول"],["seo","SEO"],["bestPractices","أفضل الممارسات"]] as const).map(([key,label])=><div style={card} key={key}><span style={{fontSize:12,color:"#5a6567"}}>{label}</span><strong style={{display:"block",fontSize:30}}>{report.scores?.[key]??"—"}{report.scores?.[key]!==null&&report.scores?.[key]!==undefined?"/100":""}</strong></div>)}
        </div>
        <div style={card}>
          <strong>مؤشرات الأداء</strong>
          <p>LCP (مختبري): {report.lab?.lcpMs != null ? (report.lab.lcpMs/1000).toFixed(2)+" ثانية" : "غير متوفر"}</p>
          <p>CLS (مختبري): {report.lab?.cls ?? "غير متوفر"}</p>
          <p>INP (ميداني): {report.field?.inpMs != null ? report.field.inpMs+" ms" : "لا تتوفر بيانات ميدانية كافية"}</p>
          <p style={{fontSize:12,color:"#5a6567"}}>{report.note} · تاريخ الفحص: {report.checkedAt?new Date(report.checkedAt).toLocaleString("ar"):"—"}</p>
        </div>
      </div> : null}
    {cms ? <div role="status" style={{...card,borderColor:cms.ok?"#88cdb7":"#e7b687"}}><strong>حالة المحتوى المباشر (Sanity)</strong><p style={{color:cms.ok?"#0c7157":"#a53220"}}>{cms.message}</p>{cms.ok && typeof cms.projectCount === "number" ? <p>عدد سجلات المشاريع: {cms.projectCount}</p> : null}</div> : null}
    {version ? <div style={card}><strong>إصدار Netlify الحالي</strong><p>Commit: <code dir="ltr">{version.commit?.slice(0,12) || "غير متاح"}</code></p><p>Branch: {version.branch || "غير متاح"} · {version.provider || "بيئة أخرى"}</p><p style={{fontSize:12,color:"#5a6567"}}>{version.note}</p></div>:null}
  </section>;
}
