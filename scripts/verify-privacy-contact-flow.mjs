import { spawn } from "node:child_process";

const port = 9230;
const baseUrl = "http://127.0.0.1:3000";
const browser = spawn(
  "/usr/bin/chromium",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/metrcmatch-privacy-contact-check-${Date.now()}`,
    `${baseUrl}/`,
  ],
  { stdio: "ignore" }
);

const wait = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

async function main() {
  let targets = [];
  for (let attempt = 0; attempt < 20 && !targets.length; attempt += 1) {
    try {
      targets = await fetch(`http://127.0.0.1:${port}/json`).then(response =>
        response.json()
      );
    } catch {}
    if (!targets.length) await wait(150);
  }
  const page = targets.find(target => target.type === "page");
  if (!page?.webSocketDebuggerUrl)
    throw new Error("Chromium did not expose a debuggable page target.");

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let requestId = 0;
  const pending = new Map();
  socket.addEventListener("message", event => {
    const payload = JSON.parse(event.data);
    const resolver = pending.get(payload.id);
    if (!resolver) return;
    pending.delete(payload.id);
    if (payload.error) resolver.reject(new Error(payload.error.message));
    else resolver.resolve(payload.result);
  });
  const command = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = (requestId += 1);
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async expression => {
    const result = await command("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return result.result.value;
  };

  await command("Runtime.enable");
  await wait(2_000);
  const banner = await evaluate(
    "Boolean(document.querySelector('[aria-label=\"Cookie preferences\"]'))"
  );
  if (!banner) throw new Error("Cookie consent banner was not displayed.");
  await evaluate(
    "[...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Accept')?.click()"
  );
  await wait(100);
  const consent = await evaluate(
    "localStorage.getItem('metrcmatch-cookie-consent-v1')"
  );
  const dismissed = await evaluate(
    "!document.querySelector('[aria-label=\"Cookie preferences\"]')"
  );
  if (consent !== "accepted" || !dismissed)
    throw new Error("Cookie preference was not persisted after accepting.");

  await command("Page.navigate", { url: `${baseUrl}/contact` });
  await wait(1_000);
  const contactSurface = await evaluate(`(() => ({
    title: document.querySelector('h1')?.textContent?.trim(),
    requestType: Boolean(document.querySelector('#requestType')),
    email: Boolean(document.querySelector('#email')),
    message: Boolean(document.querySelector('#message')),
    consent: Boolean(document.querySelector('input[type=checkbox]')),
    privacy: [...document.querySelectorAll('a')].some(link => link.getAttribute('href') === '/privacy')
  }))()`);
  if (
    contactSurface.title !== "Privacy requests and general inquiries." ||
    !Object.values(contactSurface).slice(1).every(Boolean)
  )
    throw new Error(
      `Contact request surface did not render as expected: ${JSON.stringify(contactSurface)}`
    );
  console.log(
    "Verified cookie consent persistence and public contact surface."
  );
  socket.close();
}

try {
  await main();
} finally {
  browser.kill("SIGTERM");
}
