import { spawn } from "node:child_process";

const port = 9229;
const browser = spawn(
  "/usr/bin/chromium",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/metrcmatch-landing-keyboard-check-${Date.now()}`,
    "http://127.0.0.1:3000/",
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

  await command("Runtime.enable");
  await wait(2_500);
  const focused = [];
  for (let index = 0; index < 9; index += 1) {
    await command("Input.dispatchKeyEvent", {
      type: "keyDown",
      windowsVirtualKeyCode: 9,
      code: "Tab",
      key: "Tab",
    });
    await command("Input.dispatchKeyEvent", {
      type: "keyUp",
      windowsVirtualKeyCode: 9,
      code: "Tab",
      key: "Tab",
    });
    const active = await command("Runtime.evaluate", {
      expression: `(() => {
        const element = document.activeElement;
        return element ? {
          tag: element.tagName.toLowerCase(),
          label: element.getAttribute('aria-label') || element.textContent.trim().replace(/\\s+/g, ' '),
          href: element.getAttribute('href') || null
        } : null;
      })()`,
      returnByValue: true,
    });
    focused.push(active.result.value);
  }
  const labels = focused.map(item => item?.label);
  const expected = [
    "MetrcMatch home",
    "Workflow",
    "Capabilities",
    "Customer proof",
    "FAQ",
    "Sign in",
    "Claim free audit",
    "Claim Your 14-Day Free Audit",
    "Schedule a Live Demo",
  ];
  if (JSON.stringify(labels) !== JSON.stringify(expected)) {
    throw new Error(
      `Unexpected landing focus sequence: ${JSON.stringify(labels)}`
    );
  }
  console.log(`Verified focus sequence: ${labels.join(" → ")}`);
  socket.close();
}

try {
  await main();
} finally {
  browser.kill("SIGTERM");
}
