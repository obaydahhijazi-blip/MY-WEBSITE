import { LOGO_PATH } from "@/lib/logo-path";

/**
 * One-second opening: the calligraphic logo is drawn, filled, then the curtain lifts.
 * Pure CSS so it always ends even without JavaScript; skipped on later page views in the
 * same session (inline script below) and for reduced motion.
 */
export function LogoIntro() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("intro-seen")){document.documentElement.classList.add("intro-seen")}else{sessionStorage.setItem("intro-seen","1")}}catch(e){}`,
        }}
      />
      <div className="logo-intro" aria-hidden="true">
        <svg viewBox="0 0 600 600" className="logo-intro-mark">
          <path d={LOGO_PATH} pathLength={1} fillRule="evenodd" />
        </svg>
      </div>
    </>
  );
}
