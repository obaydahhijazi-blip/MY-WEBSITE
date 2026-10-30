import { chromium, devices } from "playwright";
import fs from "node:fs";

const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });
let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log("PASS", name); }
  catch (e) { failures++; console.error("FAIL", name, e instanceof Error ? e.message : e); }
}
for (const [kind, ctxOptions] of [["desktop",{ viewport:{width:1440,height:900} }],["mobile",{...devices["iPhone 13"],browserName:undefined}],["tablet",{viewport:{width:768,height:1024}}]]) {
  const ctx = await browser.newContext(ctxOptions);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on("pageerror",e => pageErrors.push(e.message));
  await check(kind+" homepage loads in Arabic", async () => {
    const resp = await page.goto(base+"/", {waitUntil:"domcontentloaded"});
    if (resp?.status()!==200) throw Error("status "+resp?.status());
    if (await page.locator("html").getAttribute("lang")!=="ar") throw Error("Arabic lang missing");
    await page.locator("h1").first().waitFor();
  });
  if (kind === "desktop") await check("branded cursor follows pointer and adapts to contrasting surfaces", async () => {
    await page.waitForFunction(() => document.documentElement.classList.contains("has-cursor"), null, {timeout:8000});
    const letters = page.locator(".cursor-orbit-letter");
    const phrase = await page.locator(".cursor-orbit-type").textContent();
    if (!phrase?.includes("OBAYDAH") || !phrase.includes("GRAPHIC")) throw Error("Branded ring characters missing");
    if (await letters.count() < 28) throw Error("Full radial typography ring not built");
    if (await page.locator(".cursor-orbit-type textPath").count() !== 0) throw Error("Legacy textPath must be removed");
    await page.evaluate(() => {
      const el = document.createElement("div");
      el.id = "cursor-tone-probe";
      el.style.cssText = "position:fixed;inset:10px auto auto 10px;width:160px;height:160px;background:#001e25;z-index:200";
      document.body.appendChild(el);
    });
    await page.mouse.move(50,50);
    await page.waitForTimeout(100);
    if (await page.locator(".cursor-orbit").getAttribute("data-tone") !== "light") throw Error("Cursor must be white above dark petrol");
    await page.mouse.move(250,190);
    await page.evaluate(() => { document.getElementById("cursor-tone-probe").style.background = "#fafaf8"; });
    await page.mouse.move(55,55);
    await page.waitForTimeout(100);
    if (await page.locator(".cursor-orbit").getAttribute("data-tone") !== "dark") throw Error("Cursor must be cyan above white");
    await page.locator("#cursor-tone-probe").evaluate(e=>e.remove());
    const rendered = await page.locator(".cursor-orbit-type").evaluate(el => {
      const glyphs = Array.from(el.querySelectorAll(".cursor-orbit-letter"));
      const rect = el.getBoundingClientRect();
      const positions = glyphs.map(g => {
        const r=g.getBoundingClientRect();
        return {x:r.x+r.width/2-(rect.x+rect.width/2),y:r.y+r.height/2-(rect.y+rect.height/2)};
      });
      return {size:parseFloat(getComputedStyle(el).width),css:getComputedStyle(el).animationDuration,
        quadrantCount:[
          positions.filter(p=>p.x>4&&p.y>4).length,
          positions.filter(p=>p.x< -4&&p.y>4).length,
          positions.filter(p=>p.x< -4&&p.y< -4).length,
          positions.filter(p=>p.x>4&&p.y< -4).length
        ],glyphs:glyphs.length,
        marker:!!document.querySelector(".cursor-point-mark"),
        ring:getComputedStyle(document.querySelector(".cursor-orbit-outline")).borderTopWidth,
        outlineSize:parseFloat(getComputedStyle(document.querySelector(".cursor-orbit-outline")).width),
        letterSize:parseFloat(getComputedStyle(glyphs[0]).fontSize)
      };
    });
    if (rendered.size < 64 || rendered.size > 68) throw Error("Expected smaller 66px typography orbit: "+rendered.size);
    if(rendered.quadrantCount.some(x=>x<3))throw Error("Letters not distributed across the ring: "+JSON.stringify(rendered));
    if(rendered.css!=="16s"||!rendered.marker||rendered.ring==="0px")throw Error("Custom pointer/ring/rotation missing: "+JSON.stringify(rendered));
    if(rendered.outlineSize < 42 || rendered.outlineSize > 46 || rendered.letterSize > 7.4)
      throw Error("Smaller unified ring geometry or type sizing is incorrect: "+JSON.stringify(rendered));
  });
  if (kind === "desktop") await check("eye-only and play cursor states stay upright without labels", async () => {
    await page.evaluate(() => {
      const el=document.createElement("button");
      el.type="button";el.id="cursor-state-probe";el.dataset.cursor="eye";
      el.style.cssText="position:fixed;inset:12px auto auto 12px;width:120px;height:120px;background:#001e25;z-index:400";
      document.body.append(el);
    });
    await page.mouse.move(46,46);
    await page.waitForTimeout(150);
    if(await page.locator(".cursor-orbit").getAttribute("data-state") !== "eye") throw Error("Work cursor should be eye");
    const eye = await page.locator(".cursor-orbit").evaluate(el=>({
      label:getComputedStyle(el.querySelector(".cursor-orbit-label")).display,
      rotation:getComputedStyle(el.querySelector(".cursor-orbit-shell")).transform,
      visible:getComputedStyle(el.querySelector(".cursor-orbit-eye")).opacity,
    }));
    if(eye.label!=="none"||eye.rotation!=="none"||eye.visible!=="1") throw Error("Eye must be visible, upright and without text: "+JSON.stringify(eye));
    const circle = await page.locator(".cursor-orbit-outline").evaluate(el=>({visible:getComputedStyle(el).display,border:getComputedStyle(el).borderTopWidth}));
    if(circle.visible==="none"||circle.border==="0px")throw Error("Ring must remain around eye: "+JSON.stringify(circle));
    await page.locator("#cursor-state-probe").evaluate(el=>el.dataset.cursor="play");
    await page.mouse.move(47,47);
    await page.waitForTimeout(100);
    if(await page.locator(".cursor-orbit").getAttribute("data-state") !== "play") throw Error("Video cursor should be play icon");
    if(await page.locator(".cursor-orbit-play").evaluate(el=>getComputedStyle(el).display)==="none") throw Error("Play icon must be visible");
    await page.locator("#cursor-state-probe").evaluate(el=>el.remove());
  });
  if (kind === "desktop") await check("unified cursor inertia moves typography and circle without stretching", async () => {
    await page.mouse.move(300,250);
    await page.waitForTimeout(200);
    await page.mouse.move(1100,410);
    await page.waitForTimeout(70);
    const moving = await page.locator(".cursor-orbit").evaluate(el => {
      const group = el.querySelector(".cursor-orbit-kinetic");
      const lettering = el.querySelector(".cursor-orbit-type");
      const outline = el.querySelector(".cursor-orbit-outline");
      return {
        dx:parseFloat(getComputedStyle(el).getPropertyValue("--cursor-inertia-x")),
        dy:parseFloat(getComputedStyle(el).getPropertyValue("--cursor-inertia-y")),
        tilt:parseFloat(getComputedStyle(el).getPropertyValue("--cursor-inertia-tilt")),
        shared:lettering?.parentElement===group && outline?.parentElement===group,
        groupTransform:getComputedStyle(group).transform,
        outlineTransform:getComputedStyle(outline).transform,
        letters:el.querySelectorAll(".cursor-orbit-letter").length,
        elasticX:getComputedStyle(el).getPropertyValue("--cursor-elastic-x").trim(),
        elasticY:getComputedStyle(el).getPropertyValue("--cursor-elastic-y").trim()
      };
    });
    if (!(moving.shared && moving.letters>=28 && Math.abs(moving.dx)>0.3 &&
      moving.groupTransform!=="none" && moving.outlineTransform==="none" &&
      moving.elasticX==="" && moving.elasticY===""))
      throw Error("Both ring layers should move rigidly without rubber deformation: "+JSON.stringify(moving));
    await page.waitForTimeout(1200);
    const settled=await page.locator(".cursor-orbit").evaluate(el => ({
      dx:parseFloat(getComputedStyle(el).getPropertyValue("--cursor-inertia-x")),
      dy:parseFloat(getComputedStyle(el).getPropertyValue("--cursor-inertia-y")),
      tilt:parseFloat(getComputedStyle(el).getPropertyValue("--cursor-inertia-tilt"))
    }));
    if(Math.abs(settled.dx)>.15 || Math.abs(settled.dy)>.15 || Math.abs(settled.tilt)>.15)
      throw Error("Inertial group must settle without spring or distortion: "+JSON.stringify(settled));
  });
  if (kind === "desktop") await check("editorial customer review layout switches featured story", async () => {
    const section=page.locator("#testimonials");
    if(await section.count()===0){ console.log("INFO No testimonials in test build (demo fixtures explicitly disabled)"); return; }
    const hero=section.locator(".review-showcase-feature");
    if(await section.locator(".review-showcase-pages button").count()>1){
      await hero.scrollIntoViewIfNeeded();
      await page.mouse.move(15,15); // Not hovering the testimonial section.
      await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
      const beforeAuto=await hero.locator(".review-showcase-feature-quote").textContent();
      await page.waitForFunction(previous=>{
        const node=document.querySelector(".review-showcase-feature-quote");
        return Boolean(node && node.textContent!==previous);
      }, beforeAuto, {timeout:8500});
      await section.hover();
      const pausedText=await hero.locator(".review-showcase-feature-quote").textContent();
      await page.waitForTimeout(5900);
      const afterHover=await hero.locator(".review-showcase-feature-quote").textContent();
      if(pausedText!==afterHover)throw Error("Autoplay must pause while reader hovers over the testimonials");
    }
    if(await hero.count()!==1)throw Error("Expected one large editorial featured card");
    if(await section.locator(".reviews-carousel").count()!==0)throw Error("Old visible scrollbar carousel must be removed");
    const previews=section.locator(".review-showcase-preview");
    if(await previews.count()<1)throw Error("Related testimonial previews missing");
    const oldText=await hero.locator(".review-showcase-feature-quote").textContent();
    await previews.first().click();
    const newText=await hero.locator(".review-showcase-feature-quote").textContent();
    if(!newText || oldText===newText)throw Error("Selecting a preview did not change the featured testimonial");
    if(await section.locator(".review-showcase-demo").count()!==1)throw Error("Sample testimonial must remain labelled as demo");
    if(await section.locator(".review-showcase-progress").count()!==1)throw Error("Pagination progress must be present");
  });
  if (kind === "desktop") await check("navigation mega menus expose real sections", async () => {
    if(await page.locator("header.site-header a[href='#expertise']").count() !== 0) throw Error("Removed specialty header item returned");
    if(await page.locator(".site-header img[src*='logo-']").count()!==0)throw Error("Striped header brand mark was not removed");
    if(await page.locator(".header-wordmark").count()!==1)throw Error("Replacement wordmark is missing");
    const works=page.locator(".nav-mega-parent").filter({has:page.locator("a[href='#works']")});
    await works.hover();
    if(await works.locator("a[href*='workCategory=identity']").count() !== 1) throw Error("Work categories missing");
  });
  if(kind === "desktop") await check("promotional ticker and modal cursor layering", async () => {
    if(await page.locator(".quote-banner-anchor").count()!==1)throw Error("Banner needs one top-only anchor");
    if(await page.locator(".promo-marquee").count()>1)throw Error("Promo strip should appear only once");
    const ticker=page.locator(".promo-marquee");
    if(await ticker.count() === 0)return; // Campaign not active.
    if(await ticker.locator(".promo-marquee-cta").count()!==0)throw Error("Removed ticker CTA returned");
    const location=await page.evaluate(()=>{
      const ticker=document.querySelector(".promo-marquee");
      const quote=document.querySelector("#quote");
      return Boolean(ticker&&quote&&(ticker.compareDocumentPosition(quote)&Node.DOCUMENT_POSITION_FOLLOWING));
    });
    if(!location)throw Error("Promo strip should be placed before quote section");
    const popup=page.locator(".promo-backdrop");
    await popup.waitFor({state:"visible",timeout:6000});
    const top=await page.evaluate(()=>({
      cursor:Number(getComputedStyle(document.querySelector(".cursor-orbit")).zIndex),
      overlay:Number(getComputedStyle(document.querySelector(".promo-backdrop")).zIndex),
      orbs:document.querySelectorAll(".promo-orb").length
    }));
    if(top.cursor<=top.overlay||top.orbs<2)throw Error("Cursor should appear above animated popup: "+JSON.stringify(top));
    const choices=popup.locator(".promo-service-choice");
    if(await choices.count()>1){
      await choices.nth(1).click();
      if(await choices.nth(1).getAttribute("aria-pressed")!=="true")throw Error("Promo service choice does not update");
    }
    await popup.locator(".promo-close").click();
    await popup.waitFor({state:"hidden",timeout:2000});
  });
  if(kind === "desktop") await check("service CTA alignment and centered stat details", async () => {
    const cards = page.locator("#expertise .service-card-cta");
    if(await cards.count() < 4) throw Error("Missing service CTAs");
    for(const text of await cards.allTextContents())if(text.includes("استكشف"))throw Error("Service CTA must be icon-only");
    if(await page.locator("#expertise .service-card-cta-icon svg").count()<4)throw Error("Service CTA icons are missing");
    const positions = await cards.evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().bottom));
    if(Math.max(...positions.slice(0,4))-Math.min(...positions.slice(0,4))>8) throw Error("First-row CTAs not aligned: "+positions.slice(0,4));
    const stat = page.locator(".stats-band .stat-cell").first();
    await stat.hover();
    const tooltip = stat.locator(".stat-detail");
    await tooltip.waitFor({state:"visible",timeout:2500});
    const center = await page.evaluate(() => {
      const rect=document.querySelector(".stats-band").getBoundingClientRect();
      const detail=document.querySelector(".stat-detail[data-open]").getBoundingClientRect();
      return {diff:Math.abs(rect.x+rect.width/2-(detail.x+detail.width/2)), overflow:getComputedStyle(document.querySelector(".stats-band")).overflow};
    });
    if(center.diff>15||center.overflow==="hidden") throw Error("Stat detail must be centered and unclipped: "+JSON.stringify(center));
  });
  if(kind === "desktop") await check("hover cursor preserves delayed outer ring over service links", async () => {
    await page.goto(base+"/",{waitUntil:"domcontentloaded"});
    const first=page.locator("#expertise .service-card").first();
    await first.scrollIntoViewIfNeeded();
    await first.hover();
    await page.waitForTimeout(160);
    if(await page.locator(".cursor-orbit").getAttribute("data-state")!=="link")throw Error("Service cursor should be an icon state");
    if(await page.locator(".cursor-orbit-arrow").evaluate(el=>getComputedStyle(el).display)==="none")throw Error("Service hover arrow not visible");
    const ring = await page.locator(".cursor-orbit-type").evaluate(el=>({animation:getComputedStyle(el).animationName,display:getComputedStyle(el).display}));
    if(ring.animation==="none"||ring.display==="none")throw Error("Hover should retain animated ring");
  });
  if (kind === "mobile") await check("custom cursor disabled on phones", async () => {
    const details = await page.evaluate(() => ({
      active: document.documentElement.classList.contains("has-cursor"),
      display: getComputedStyle(document.querySelector(".cursor-orbit")).display,
    }));
    if (details.active || details.display !== "none") throw Error("Mobile cursor must be disabled: "+JSON.stringify(details));
  });
  await check(kind+" service page has common header and footer", async () => {
    const resp = await page.goto(base+"/services/identity",{waitUntil:"domcontentloaded"});
    if (resp?.status()!==200) throw Error("status "+resp?.status());
    if (await page.locator("header.site-header").count() !== 1) throw Error("No shared site header");
    if (await page.locator("footer#contact").count() !== 1) throw Error("No shared site footer");
    const links = page.locator("header.site-header a[href='/#quote']");
    if (await links.count() === 0) throw Error("Interior quote CTA not linked home");
  });
  await check(kind+" missing project responds 404", async () => {
    const resp = await page.goto(base+"/projects/nonexistent-smoke-project",{waitUntil:"domcontentloaded"});
    if (resp?.status()!==404) throw Error("status "+resp?.status());
  });
  await check(kind+" quote form has expected fields", async () => {
    await page.goto(base+"/#quote",{waitUntil:"domcontentloaded"});
    if (await page.locator("form input[name='name']").count() < 1) throw Error("name input missing");
    if (await page.locator("form [name='details']").count() < 1) throw Error("description missing");
  });
  await check(kind+" no uncaught browser errors", async () => {
    if (pageErrors.length) throw Error(pageErrors.slice(0,4).join(" | "));
  });
  if(process.env.SMOKE_SCREENSHOTS) {
    fs.mkdirSync(process.env.SMOKE_SCREENSHOTS,{recursive:true});
    await page.screenshot({path:process.env.SMOKE_SCREENSHOTS+"/"+kind+".png",fullPage:true});
  }
  await ctx.close();
}
await browser.close();
if(failures) process.exitCode=1;
