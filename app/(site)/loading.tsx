export default function Loading() {
  return <div role="status" aria-live="polite" className="grid min-h-[65svh] place-items-center bg-paper px-5 py-20 text-center">
    <div>
      <div className="mx-auto size-9 animate-pulse rounded-full border-2 border-cyan bg-petrol/10" aria-hidden="true" />
      <p className="mt-5 text-sm text-muted">جارٍ تحميل الصفحة…</p>
    </div>
  </div>;
}
