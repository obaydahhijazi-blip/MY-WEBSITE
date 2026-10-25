import { Star8 } from "@/components/icons";

/** Infinite text band under the hero. Two identical halves loop seamlessly; pauses on hover/focus and for reduced motion. */
export function IdentityMarquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const run = Array.from({ length: 3 }, () => items).flat();
  const half = (key: string, hidden: boolean) => (
    <ul className="marquee-half" aria-hidden={hidden || undefined} key={key}>
      {run.map((text, i) => (
        <li key={i} className="flex items-center gap-8">
          <span className={/[a-z]/i.test(text) && !/[؀-ۿ]/.test(text) ? "font-latin tracking-[0.18em] text-[0.8em] text-white/70" : ""}>{text}</span>
          <Star8 className="size-3 shrink-0 text-cyan" />
        </li>
      ))}
    </ul>
  );
  return (
    <section className="marquee-band" aria-label={items[0]} tabIndex={0}>
      <div className="marquee-track">
        {half("a", false)}
        {half("b", true)}
      </div>
    </section>
  );
}
