import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Obaydah Hijazi — Graphic Designer & Visual Artist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social sharing artwork, rendered at the size expected by WhatsApp/LinkedIn/Facebook. */
export default async function OpenGraphImage() {
  const [portrait, logo] = await Promise.all([
    readFile(join(process.cwd(), "public", "images", "hero", "portrait.webp")),
    readFile(join(process.cwd(), "public", "images", "brand", "logo-white.png")),
  ]);
  return new ImageResponse(
    <div style={{ display: "flex", position: "relative", height: "100%", width: "100%", overflow: "hidden",
      background: "linear-gradient(120deg, #001E25 0%, #00373E 95%)", color: "#FAFAF8" }}>
      <div style={{ display: "flex", position: "absolute", width: 640, height: 640, left: -230, top: -135,
        borderRadius: "50%", border: "2px solid rgba(0,187,212,0.2)" }} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", top: 70, right: 90, width: 650, height: 530, justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <img src={"data:image/png;base64," + logo.toString("base64")} width={125} height={84} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ display: "flex", height: 5, width: 95, background: "#00BBD4", borderRadius: 10, marginBottom: 26 }} />
          <div style={{ fontSize: 65, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, textAlign: "right" }}>OBAYDAH</div>
          <div style={{ fontSize: 65, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, textAlign: "right" }}>HIJAZI</div>
          <div style={{ marginTop: 18, fontSize: 23, letterSpacing: 1.5, color: "#00BBD4" }}>GRAPHIC DESIGNER · VISUAL ARTIST</div>
          <div style={{ marginTop: 16, fontSize: 22, color: "#b5d1d5" }}>Creative Direction · Identity · AI Production</div>
        </div>
        <div style={{ display: "flex", fontSize: 16, color: "#b5d1d5", justifyContent: "flex-end" }}>PORTFOLIO · SELECTED WORKS & SERVICES</div>
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: -6, left: 32, width: 460, height: 570 }}>
        <img src={"data:image/webp;base64," + portrait.toString("base64")} width={460} height={560}
          style={{ objectFit: "contain", objectPosition: "bottom" }} alt="" />
      </div>
      <div style={{ display: "flex", position: "absolute", left: 0, bottom: 0, right: 0, height: 7, background: "#00BBD4" }} />
    </div>,
    { ...size },
  );
}
