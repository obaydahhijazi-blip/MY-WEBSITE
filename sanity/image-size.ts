/**
 * Sanity asset ids carry the pixel size: "image-<hash>-<W>x<H>-<ext>". These helpers warn
 * (never block) when an upload is too small to look sharp on large screens.
 */
type ImageValue = { asset?: { _ref?: string } } | undefined;

export function imageSize(value: ImageValue): { w: number; h: number; ext: string } | null {
  const m = value?.asset?._ref?.match(/^image-[a-f0-9]+-(\d+)x(\d+)-(\w+)$/);
  return m ? { w: Number(m[1]), h: Number(m[2]), ext: m[3] } : null;
}

export const minWidth = (min: number, label: string) => (value: ImageValue) => {
  const s = imageSize(value);
  if (!s || s.ext === "svg" || s.w >= min) return true;
  return `${label}: عرض الصورة ${s.w}px وقد تبدو غير حادة. يُفضّل ${min}px على الأقل.`;
};
