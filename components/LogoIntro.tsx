import { CLEAN_LOGO_PATH } from "@/lib/logo-path-clean";

/** Animate real vector contours of the calligraphic logo, never an outer rectangle. */
export function LogoIntro() {
  return <>
    <script dangerouslySetInnerHTML={{
      __html: 'try{if(sessionStorage.getItem("intro-seen")){document.documentElement.classList.add("intro-seen")}else{sessionStorage.setItem("intro-seen","1")}}catch(e){}',
    }} />
    <div className="logo-intro" aria-hidden="true">
      <svg className="logo-intro-mark" viewBox="0 0 600 402" role="presentation" focusable="false">
        <path d={CLEAN_LOGO_PATH} fillRule="evenodd" pathLength={1} />
      </svg>
    </div>
  </>;
}
