/** The three-bar personal motif (yellow / cyan / white) from the cover. */
export function BrandBars({ className = "", light = true }: { className?: string; light?: boolean }) {
  return (
    <span className={`brand-bars ${className}`} aria-hidden="true">
      <i className="bg-yellow" />
      <i className="bg-cyan" />
      <i className={light ? "bg-white" : "bg-ink"} />
    </span>
  );
}
