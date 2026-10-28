import fs from "node:fs";
import path from "node:path";

/**
 * Only generate @font-face for files PRESENT at build time. This prevents
 * repeated 404 font requests when licensed binaries are not deployed.
 * Never checks licensed binaries into source control.
 */
const dir = path.join(process.cwd(), "public", "fonts");
const output = path.join(process.cwd(), "styles", "ko-sans-generated.css");
const weights = [100, 200, 300, 400, 500, 600, 700];
const found = [];
for (const weight of weights) {
  const base = `KO-Sans-${weight}`;
  const ext = [".woff2", ".otf"].find(e => fs.existsSync(path.join(dir, base + e)));
  if (!ext) continue;
  found.push(`@font-face { font-family:"KO Sans"; src:url("/fonts/${base}${ext}") format("${ext === ".woff2" ? "woff2" : "opentype"}"); font-style:normal; font-weight:${weight}; font-display:swap; }`);
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `/* Build-generated; ${found.length} installed licensed KO Sans weights. */\n` + found.join("\n") + "\n");
process.stdout.write(`KO Sans: ${found.length}/7 weights available; ${found.length ? "webfont enabled" : "using licensed-safe IBM Plex fallback"}.\n`);
