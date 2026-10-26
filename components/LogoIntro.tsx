/** Draw the original transparent logo silhouette, never a stroked bounding-box path. */
export function LogoIntro() {
  return <>
    <script dangerouslySetInnerHTML={{
      __html: 'try{if(sessionStorage.getItem("intro-seen")){document.documentElement.classList.add("intro-seen")}else{sessionStorage.setItem("intro-seen","1")}}catch(e){}',
    }} />
    <div className="logo-intro" aria-hidden="true">
      <div className="logo-intro-mark">
        <span className="logo-intro-ink" />
        <span className="logo-intro-glow" />
      </div>
    </div>
  </>;
}
