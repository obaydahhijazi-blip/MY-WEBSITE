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
    if (!(await page.locator(".cursor-orbit-type textPath").textContent())?.includes("OBAYDAH GRAPHIC")) throw Error("Brand typography missing");
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
    const rendered = await page.locator(".cursor-orbit-type").evaluate(el => ({
      size: parseFloat(getComputedStyle(el).width), // CSS size, not the rotated transform bounding box
      text: el.querySelector("text")?.getComputedTextLength() || 0,
      css: getComputedStyle(el).animationDuration,
    }));
    if (rendered.size > 90) throw Error("Cursor is too large: "+rendered.size);
    if (rendered.text > 267 || rendered.text < 230) throw Error("Circular text must fit its path: "+rendered.text);
    if (rendered.css !== "16s") throw Error("Circular text animation must be active");
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
    await page.locator("#cursor-state-probe").evaluate(el=>el.dataset.cursor="play");
    await page.mouse.move(47,47);
    await page.waitForTimeout(100);
    if(await page.locator(".cursor-orbit").getAttribute("data-state") !== "play") throw Error("Video cursor should be play icon");
    if(await page.locator(".cursor-orbit-play").evaluate(el=>getComputedStyle(el).display)==="none") throw Error("Play icon must be visible");
    await page.locator("#cursor-state-probe").evaluate(el=>el.remove());
  });
  if (kind === "desktop") await check("navigation mega menus expose real sections", async () => {
    const expert=page.locator(".nav-mega-parent").filter({has:page.locator("a[href='#expertise']")});
    if(await expert.count() !== 1) throw Error("Expertise mega menu missing");
    await expert.hover();
    const menu=expert.locator(".nav-mega-panel");
    await menu.waitFor({state:"visible",timeout:2500});
    if(await menu.locator("a[href='/services/identity']").count() !== 1) throw Error("Expertise destinations not linked");
    const works=page.locator(".nav-mega-parent").filter({has:page.locator("a[href='#works']")});
    await works.hover();
    if(await works.locator("a[href*='workCategory=identity']").count() !== 1) throw Error("Work categories missing");
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
