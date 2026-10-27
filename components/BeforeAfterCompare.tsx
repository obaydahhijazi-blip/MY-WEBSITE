"use client";
import Image from "next/image";
import { useId, useState } from "react";
import type { ImageAsset } from "@/lib/cms/types";

/** Only rendered if the owner has provided BOTH true assets for the same project. */
export function BeforeAfterCompare({ before, after }: { before: ImageAsset; after: ImageAsset }) {
  const id = useId();
  const [position, setPosition] = useState(50);
  return (
    <figure className="mx-auto max-w-5xl">
      <div className="before-after relative aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-paper-2" dir="ltr">
        <Image src={after.src} alt={after.alt || "النتيجة بعد التعديل"} fill sizes="(min-width:1024px) 80vw,100vw" className="object-contain" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Image src={before.src} alt={before.alt || "النتيجة قبل التعديل"} fill sizes="(min-width:1024px) 80vw,100vw" className="object-contain" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 z-10 w-[2px] bg-white shadow-lg" style={{ left: `${position}%` }}>
          <div className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-petrol text-sm text-white shadow-xl">↔</div>
        </div>
        <span className="absolute left-4 top-4 z-10 rounded-full bg-petrol/85 px-3 py-1 text-xs text-white">قبل</span>
        <span className="absolute right-4 top-4 z-10 rounded-full bg-petrol/85 px-3 py-1 text-xs text-white">بعد</span>
        <input id={id} type="range" min={0} max={100} step={1} value={position} onChange={e => setPosition(Number(e.target.value))}
          aria-label="اسحب للمقارنة بين الصورة قبل التعديل وبعده" className="before-after-range absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0" />
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted">اسحب المؤشر للمقارنة بين العمل قبل التعديل وبعده.</figcaption>
    </figure>
  );
}
