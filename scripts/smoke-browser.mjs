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
