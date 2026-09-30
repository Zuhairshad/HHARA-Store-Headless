// End-to-end test of every form on the HHARA site, driven through your installed Google Chrome.
// Usage: npm run test:forms -- [baseUrl]          (default https://www.hhara.com)
//        ONLY=1,5 npm run test:forms              (run only sections 1 and 5)
// Creates real test signups/accounts named zuhairshad140+hhtest-<form>-<run>@gmail.com.
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const BASE = (process.argv[2] || "https://www.hhara.com").replace(/\/$/, "");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const RUN = Date.now().toString(36);
const mail = (tag) => `zuhairshad140+hhtest-${tag}-${RUN}@gmail.com`;
const SHOTS = new URL("../.form-test/shots/", import.meta.url).pathname;
fs.mkdirSync(SHOTS, { recursive: true });

// ONLY=6,7 runs just those sections
const want = (n) => !process.env.ONLY || process.env.ONLY.split(",").includes(String(n));
const results = [];
const created = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// page.close() can hang after a full-page reload; never let it block the run
const closePage = (page) => Promise.race([page.close().catch(() => {}), sleep(5000)]);

async function newPage(browser, { mobile = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport(mobile ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1400, height: 900 });
  // Pre-accept the cookie banner so it doesn't cover forms
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("hhara_consent_v1", JSON.stringify({ analytics: false, marketing: false, decided: true, ts: Date.now() }));
    } catch {}
  });
  page.consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") page.consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => page.consoleErrors.push("pageerror: " + e.message));
  page.dialogs = [];
  page.on("dialog", async (d) => { page.dialogs.push(d.message()); console.log(`      (browser alert: "${d.message()}")`); await d.dismiss().catch(() => {}); });
  return page;
}

async function dismissBanner(page) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /essential only/i.test(x.textContent || ""));
    b?.click();
  });
}

async function typeInto(page, selector, value) {
  const el = await page.waitForSelector(selector, { visible: true, timeout: 15000 });
  await el.click({ clickCount: 3 });
  await el.type(value, { delay: 15 });
}

async function clickText(page, re, scope = "button") {
  const ok = await page.evaluate((src, flags, scope) => {
    const re = new RegExp(src, flags);
    const el = [...document.querySelectorAll(scope)].find((x) => re.test((x.textContent || "").trim()) && x.offsetParent !== null);
    if (el) { el.scrollIntoView({ block: "center" }); el.click(); return true; }
    return false;
  }, re.source, re.flags, scope);
  if (!ok) throw new Error(`No visible ${scope} matching ${re}`);
}

const bodyText = (page) => page.evaluate(() => document.body.innerText);
async function waitForText(page, re, timeout = 20000) {
  await page.waitForFunction((src, flags) => new RegExp(src, flags).test(document.body?.innerText || ""), { timeout, polling: 250 }, re.source, re.flags);
}

async function test(name, fn, page) {
  const t0 = Date.now();
  try {
    const note = await Promise.race([fn(), sleep(60000).then(() => { throw new Error("timed out after 60s"); })]);
    results.push({ name, ok: true, note: note || "", ms: Date.now() - t0 });
    console.log(`PASS  ${name}${note ? " - " + note : ""}`);
  } catch (e) {
    const file = `${SHOTS}${name.replace(/[^a-z0-9]+/gi, "_")}.png`;
    try { await page?.screenshot({ path: file }); } catch {}
    results.push({ name, ok: false, note: e.message.split("\n")[0], ms: Date.now() - t0, shot: file });
    console.log(`FAIL  ${name} - ${e.message.split("\n")[0]}  (screenshot: ${file})`);
  }
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-first-run"] });

// 1. Coming-soon signup at "/"
if (want(1)) {
  const page = await newPage(browser, { mobile: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await dismissBanner(page);
  await test("Coming soon: rejects invalid email", async () => {
    await typeInto(page, "#cs-email", "not-an-email");
    await sleep(1200);
    await clickText(page, /^join$/i);
    await waitForText(page, /valid email/i, 5000);
  }, page);
  await test("Coming soon: valid signup", async () => {
    const email = mail("comingsoon");
    await typeInto(page, "#cs-email", email);
    await clickText(page, /^join$/i);
    await sleep(800);
    await page.waitForFunction(() => /Welcome to the Circle/i.test(document.body.innerText) || document.querySelector(".cs-error")?.textContent, { timeout: 25000 });
    const err = await page.$eval(".cs-error", (e) => e.textContent).catch(() => "");
    if (err) throw new Error(`Site showed error: "${err}"`);
    created.push(email);
    return email;
  }, page);
  await closePage(page);
}

// 2. Signup popup on /home (opens on scroll)
if (want(2)) {
  const page = await newPage(browser);
  await page.goto(BASE + "/home", { waitUntil: "networkidle2" });
  await dismissBanner(page);
  await test("Popup: opens on scroll", async () => {
    await sleep(1500);
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForSelector('input[placeholder="Email Address"]', { visible: true, timeout: 8000 });
  }, page);
  await test("Popup: signup with name, birthday and phone", async () => {
    const email = mail("popup");
    await typeInto(page, 'input[placeholder="First Name"]', "Hhtest");
    await page.$eval('input[type="date"][placeholder="Birthday"]', (el) => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      set.call(el, "1995-05-20");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const phone = "50" + String(Math.floor(1e6 + Math.random() * 8e6));
    await typeInto(page, 'input[placeholder="Phone Number"]', phone);
    await typeInto(page, 'input[placeholder="Email Address"]', email);
    await sleep(1200);
    await page.$eval('input[placeholder="Email Address"]', (el) => el.form.requestSubmit());
    await page.waitForFunction(
      () => !document.querySelector('input[placeholder="Email Address"]') || /welcome|thank|you're in|error|failed|invalid|too many|couldn't/i.test(document.querySelector('input[placeholder="Email Address"]')?.closest("div.fixed, [role=dialog], form")?.parentElement?.innerText || ""),
      { timeout: 25000 }
    );
    const popupText = await page.evaluate(() => {
      const f = document.querySelector('input[placeholder="Email Address"]')?.form;
      return (f?.parentElement?.innerText || document.body.innerText).slice(0, 400);
    });
    if (/error|failed|invalid|too many|couldn't|already been taken|phone/i.test(popupText) && !/welcome|thank/i.test(popupText)) {
      throw new Error(`Site showed: "${popupText.replace(/\s+/g, " ").slice(0, 200)}"`);
    }
    created.push(email);
    return `${email} (phone +971${phone})`;
  }, page);
  await closePage(page);
}

// 3. Footer newsletter on store pages
if (want(3)) {
  const page = await newPage(browser);
  await page.goto(BASE + "/shop", { waitUntil: "networkidle2" });
  await dismissBanner(page);
  await test("Footer newsletter (store pages)", async () => {
    await sleep(1200);
    const email = mail("footer");
    await typeInto(page, 'footer input[placeholder="Your email"]', email);
    await page.$eval('footer input[placeholder="Your email"]', (el) => el.form.requestSubmit());
    await page.waitForFunction(() => {
      const b = document.querySelector("footer .footer-newsletter button");
      const err = b?.closest(".footer-brand")?.querySelector("div[style]")?.textContent;
      return b?.textContent?.includes("✓") || err;
    }, { timeout: 25000 });
    const btn = await page.$eval("footer .footer-newsletter button", (b) => b.textContent);
    if (!btn.includes("✓")) {
      const err = await page.evaluate(() => document.querySelector("footer .footer-newsletter")?.parentElement?.innerText);
      throw new Error(`Site showed error: ${err}`);
    }
    created.push(email);
    return email;
  }, page);
  await closePage(page);
}

// 4. Order tracking (+ its footer newsletter)
if (want(4)) {
  const page = await newPage(browser);
  await page.goto(BASE + "/orders/track", { waitUntil: "networkidle2" });
  await dismissBanner(page);
  const submit = () => page.$eval("form.ot-form", (f) => f.requestSubmit());
  await test("Order tracking: rejects bad order number", async () => {
    await typeInto(page, "#orderName", "abc");
    await typeInto(page, "#email", "someone@example.com");
    await submit();
    await waitForText(page, /should look like #1001/i, 15000);
  }, page);
  await test("Order tracking: unknown order shows not-found", async () => {
    await typeInto(page, "#orderName", "#999999");
    await typeInto(page, "#email", "nobody@example.com");
    await submit();
    await waitForText(page, /couldn't find an order/i, 20000);
  }, page);
  if (process.env.REAL_ORDER_NAME && process.env.REAL_ORDER_EMAIL) {
    await test("Order tracking: real order is found", async () => {
      await typeInto(page, "#orderName", process.env.REAL_ORDER_NAME);
      await typeInto(page, "#email", process.env.REAL_ORDER_EMAIL);
      await submit();
      await page.waitForFunction(() => !document.querySelector(".ot-error") && /status|placed|fulfil|shipped|processing|delivered/i.test(document.querySelector("main")?.innerText.split("Track order")[1] || ""), { timeout: 25000 })
        .catch(async () => { throw new Error(await page.$eval(".ot-error", (e) => e.textContent).catch(() => "no result shown")); });
      return `order ${process.env.REAL_ORDER_NAME}`;
    }, page);
  }
  await test("Footer newsletter (order tracking page)", async () => {
    const email = mail("trackfooter");
    const sel = 'footer input[type="email"]';
    await typeInto(page, sel, email);
    await sleep(1200);
    await page.$eval(sel, (el) => el.form.requestSubmit());
    await page.waitForFunction((sel) => {
      const f = document.querySelector(sel)?.form;
      const t = f?.parentElement?.innerText || "";
      return /✓|thank|welcome|subscribed/i.test(t + (f?.querySelector("button")?.textContent || "")) || /error|failed|invalid|couldn't|too many/i.test(t);
    }, { timeout: 25000 }, sel);
    const t = await page.$eval(sel, (el) => el.form.parentElement.innerText + " " + el.form.querySelector("button").textContent);
    if (/error|failed|invalid|couldn't|too many/i.test(t)) throw new Error(`Site showed: ${t.replace(/\s+/g, " ").slice(0, 200)}`);
    created.push(email);
    return email;
  }, page);
  await closePage(page);
}

// 5. Account: create, sign out, wrong password, sign in
if (want(5)) {
  const page = await newPage(browser);
  await page.goto(BASE + "/account", { waitUntil: "networkidle2" });
  await dismissBanner(page);
  const email = mail("account");
  const password = "Hh-test-" + RUN + "!";
  await test("Account: create account", async () => {
    await clickText(page, /^create account$/i);
    await typeInto(page, 'input[placeholder="First name"]', "Hhtest");
    await typeInto(page, 'form.auth-form input[type="email"]', email);
    await typeInto(page, 'form.auth-form input[placeholder="At least 8 characters"]', password);
    await sleep(1200);
    await page.$eval('form.auth-form input[type="email"]', (el) => el.form.requestSubmit());
    await Promise.race([
      page.waitForNavigation({ timeout: 30000 }),
      page.waitForFunction(() => /failed|error|invalid|taken|exists|too many|couldn't/i.test(document.querySelector(".auth-form")?.parentElement?.innerText || ""), { timeout: 30000 }),
    ]);
    await waitForText(page, /Hello,/i, 15000).catch(() => {});
    const t = await bodyText(page);
    if (!/Hello,/i.test(t)) throw new Error("Not signed in after sign-up: " + (await page.evaluate(() => document.querySelector(".auth-form")?.parentElement?.innerText.slice(0, 300))));
    created.push(email);
    return email;
  }, page);
  await test("Account: sign out", async () => {
    await Promise.all([page.waitForNavigation({ timeout: 20000 }), clickText(page, /^sign out$/i)]);
    await page.waitForSelector("form.auth-form", { timeout: 15000 });
  }, page);
  await test("Account: wrong password is rejected", async () => {
    await typeInto(page, 'form.auth-form input[type="email"]', email);
    await typeInto(page, 'form.auth-form input[type="password"], form.auth-form input[placeholder*="assword"], form.auth-form input:not([type=email]):not([type=hidden])', "wrong-password-123");
    await page.$eval('form.auth-form input[type="email"]', (el) => el.form.requestSubmit());
    await page.waitForFunction(() => /incorrect|invalid|unidentified|failed|wrong/i.test(document.querySelector(".auth-form")?.parentElement?.innerText || ""), { timeout: 20000 });
    return (await page.evaluate(() => document.querySelector(".auth-form")?.parentElement?.innerText.match(/[^\n]*(incorrect|invalid|unidentified|failed|wrong)[^\n]*/i)?.[0]));
  }, page);
  await test("Account: sign in", async () => {
    await typeInto(page, 'form.auth-form input:not([type=email]):not([type=hidden])', password);
    await Promise.all([page.waitForNavigation({ timeout: 25000 }), page.$eval('form.auth-form input[type="email"]', (el) => el.form.requestSubmit())]);
    await waitForText(page, /Hello,/i, 15000);
    // Clean up: sign out again (not part of what's being tested)
    await clickText(page, /^sign out$/i).catch(() => {});
    await page.waitForSelector("form.auth-form", { timeout: 20000 }).catch(() => {});
  }, page);
  await closePage(page);
}

// 6. Gift card -> bag -> checkout link
if (want(6)) {
  const page = await newPage(browser);
  await page.goto(BASE + "/gift-card", { waitUntil: "networkidle2" });
  await dismissBanner(page);
  await test("Gift card: add to bag and reach checkout", async () => {
    await typeInto(page, 'input[placeholder="First name"]', "Hhtest Recipient");
    await typeInto(page, 'input[placeholder="Where it should arrive"]', mail("giftcard"));
    const senders = await page.$$('form input[type="text"]');
    for (const s of senders) {
      const empty = await s.evaluate((el) => !el.value && el.offsetParent !== null && !/amount/i.test(el.placeholder));
      if (empty) await s.type("Hhtest Sender", { delay: 10 });
    }
    await page.$eval('input[placeholder="Where it should arrive"]', (el) => el.form.requestSubmit());
    await waitForText(page, /E-Gift Card – AED|launching soon|couldn't add/i, 25000);
    const t = await bodyText(page);
    if (/launching soon/i.test(t)) throw new Error('Page says "Gift cards are launching soon": no gift card product in Shopify yet');
    if (/couldn't add/i.test(t)) throw new Error("Shopify rejected the gift card: " + t.match(/[^\n]*couldn't add[^\n]*/i)[0]);
    // Bag -> "Review Order" -> "Proceed to Checkout" -> Shopify checkout (no payment made)
    await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => /review order/i.test(b.textContent) && !b.disabled && b.offsetParent), { timeout: 20000 })
      .catch(() => { throw new Error('"Review Order" stayed disabled (no Shopify checkout was created)'); });
    await clickText(page, /review order/i);
    await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => /proceed to checkout/i.test(b.textContent) && !b.disabled), { timeout: 20000 });
    await Promise.all([page.waitForNavigation({ timeout: 30000, waitUntil: "domcontentloaded" }), clickText(page, /proceed to checkout/i)]);
    const url = page.url();
    if (!/checkout|cart\/c\//i.test(url)) throw new Error("Did not land on Shopify checkout: " + url);
    const text = await bodyText(page);
    if (!/gift card/i.test(text)) throw new Error("Checkout page doesn't list the gift card");
    return `reached Shopify checkout (${new URL(url).host}) with the gift card`;
  }, page);
  await closePage(page);
}

// 7. Product review form (opens the visitor's email app)
if (want(7)) {
  const page = await newPage(browser);
  await page.goto(BASE + "/products/imara-bra", { waitUntil: "networkidle2" });
  await dismissBanner(page);
  await test("Product review: builds email to hello@hhara.com", async () => {
    await clickText(page, /write a review/i);
    await page.waitForSelector('input[placeholder="Enter your name"]', { visible: true, timeout: 10000 });
    await typeInto(page, 'input[placeholder="Enter your name"]', "Hhtest");
    await typeInto(page, 'input[placeholder="Enter your location"]', "Dubai");
    await typeInto(page, "textarea", "Automated form test, please ignore.");
    const cdp = await page.target().createCDPSession();
    await cdp.send("Page.enable");
    let mailto = null;
    cdp.on("Page.frameRequestedNavigation", (e) => { if (e.url.startsWith("mailto:")) mailto = e.url; });
    await page.$eval("textarea", (el) => el.form.requestSubmit());
    await sleep(2000);
    if (!mailto) throw new Error("Submitting did not open an email to hello@hhara.com");
    return decodeURIComponent(mailto).slice(0, 70);
  }, page);
  await closePage(page);
}

await Promise.race([browser.close().catch(() => {}), sleep(5000)]);

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} passed`);
console.log("Test signups created:\n  " + created.join("\n  "));
fs.writeFileSync(new URL("../.form-test/results.json", import.meta.url), JSON.stringify({ base: BASE, run: RUN, results, created }, null, 2));
process.exit(passed === results.length ? 0 : 1);
