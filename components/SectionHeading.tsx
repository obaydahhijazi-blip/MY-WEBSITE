type Props = {
  index: string;
  label: string;
  id?: string;
  title: string;
  intro?: string;
  className?: string;
  tone?: "light" | "dark";
};

export function SectionHeading({ index, label, id, title, intro, className = "", tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <header className={`reveal ${className}`}>
      <p className={`section-index ${dark ? "!text-white/60" : ""}`}>
        <span className={`num ${dark ? "!text-cyan" : ""}`}>{index}</span>
        <span className="rule" aria-hidden="true" />
        <span>{label}</span>
      </p>
      <h2 id={id} className={`headline mt-6 text-[clamp(1.9rem,4.2vw,3.25rem)] ${dark ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      {intro ? <p className={`mt-5 max-w-xl text-lg leading-9 ${dark ? "text-white/70" : "text-muted"}`}>{intro}</p> : null}
    </header>
  );
}
