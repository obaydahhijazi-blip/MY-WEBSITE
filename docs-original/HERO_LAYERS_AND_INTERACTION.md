# Hero assets and interaction notes

The original Facebook-cover composition is in `references/facebook-cover-original.jpg` (a flattened *reference* only). Use the following actual transparent layers to reconstruct it dynamically:

| Asset | Role | Design motion suggestion |
|---|---|---|
| background-master.png | Full scenic background, includes some glow/colors | translation max 3–5px, or static |
| obaydah-portrait-cutout.png | Main figure and focal point | gentle opposite parallax, max 8–12px |
| name-title-lockup-reference.png | Visual reference for Latin name and title | replace with actual accessible web text / brand SVG later |
| brand-three-bars.png | Small cyan/yellow/white motif | nearly static, one instance |
| cyan-glow-star-large.png | Decorative corner accent | optional, low-intensity parallax |
| cyan-glow-star-small.png | Supporting accent | optional, avoid repeated motifs |
| floating-photoshop-left.png | Left Photoshop icon | optional, max ~14px |
| floating-photoshop-right.png | Right Photoshop icon | optional, max ~14px |
| teal-light-sweep.png | Wide color-light wash | optional, subtle and low-opacity |

## Implementation

Position elements with CSS in a centered responsive art-directed stage, using percentages/layout constraints. Use pointer movement normalized [-1,+1] from the hero center, smooth transform updates via requestAnimationFrame or animation library; avoid React setState every pointer tick. Pause animations when offscreen and return home on leave. On touch and `prefers-reduced-motion`, render an art-directed static arrangement with simple entrance only. Name/CTA needs high contrast and legible line lengths. Text locked inside image should not be the only semantic heading.

Mobile must use separate composition rules: portrait anchored thoughtfully, simple stable name, CTA not offscreen, less/no decorative objects. Target limited LCP transfer size using derivatives/webp, don't lazy-load essential hero image.
