#!/usr/bin/env bash
# macOS / Linux equivalent of setup-ko-sans.ps1 — copies YOUR licensed KO Sans OTF files into public/fonts.
# Usage: bash scripts/setup-ko-sans.sh "/path/to/KOSans-folder"
set -euo pipefail
SRC="${1:?Usage: bash scripts/setup-ko-sans.sh /path/to/KOSans-folder}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/fonts"
mkdir -p "$DEST"
for pair in Thin:100 ExtraLight:200 Light:300 Regular:400 Medium:500 SemiBold:600 Bold:700; do
  name="${pair%%:*}"; weight="${pair##*:}"
  matches=()
  while IFS= read -r -d '' f; do matches+=("$f"); done < <(find "$SRC" -maxdepth 1 -type f -iname "KOSans-${name}*.otf" -print0)
  if [ "${#matches[@]}" -ne 1 ]; then echo "Expected one KOSans-${name} OTF in $SRC, found ${#matches[@]}" >&2; exit 1; fi
  cp "${matches[0]}" "$DEST/KO-Sans-${weight}.otf"
  echo "$(basename "${matches[0]}") -> public/fonts/KO-Sans-${weight}.otf"
done
echo "Done. Restart 'npm run dev' and confirm in DevTools → Network that KO-Sans-*.otf load with status 200."
