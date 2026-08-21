import { spawn } from "node:child_process";
import { SignJWT } from "jose";

const port = 9231;
const baseUrl = "http://127.0.0.1:3000";
const ownerOpenId = process.env.OWNER_OPEN_ID;
const appId = process.env.VITE_APP_ID;
const cookieSecret = process.env.JWT_SECRET;

if (!ownerOpenId || !appId || !cookieSecret)
  throw new Error("Owner session verification requires managed auth settings.");

const token = await new SignJWT({
  openId: ownerOpenId,
  appId,
  name: "Owner verification",
})
  .setProtectedHeader({ alg: "HS256", typ: "JWT" })
  .setExpirationTime(Math.floor(Date.now() / 1000) + 120)
  .sign(new TextEncoder().encode(cookieSecret));

const browser = spawn(
  "/usr/bin/chromium",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/metrcmatch-owner-inbox-check-${Date.now()}`,
    "about:blank",
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

  await command("Network.enable");
  await command("Network.setCookie", {
    name: "app_session_id",
    value: token,
    url: baseUrl,
    httpOnly: true,
    sameSite: "Lax",
  });
  await command("Page.navigate", { url: `${baseUrl}/admin/contact-requests` });
  await command("Runtime.enable");
  await wait(3_800);

  const initial = await evaluate(`(() => ({
    title: document.querySelector('h1')?.textContent?.trim(),
    ownerNav: [...document.querySelectorAll('span')].some(node => node.textContent?.trim() === 'Contact requests'),
    listRows: document.querySelectorAll('button[class*="border-b"]').length,
    detail: Boolean(document.querySelector('article')),
    statusControl: Boolean(document.querySelector('#contact-status')),
    refresh: [...document.querySelectorAll('button')].some(button => button.textContent?.trim().includes('Refresh'))
  }))()`);
  if (
    initial.title !== "Contact requests" ||
    !initial.ownerNav ||
    !initial.detail ||
    !initial.statusControl ||
    !initial.refresh
  )
    throw new Error(
      "Owner inbox did not render its required protected controls."
    );
  await evaluate(
    "[...document.querySelectorAll('button')].find(button => button.textContent?.trim().includes('Reset Demo Data'))?.click()"
  );
  await wait(150);
  const resetDialog = await evaluate(`(() => ({
    title: [...document.querySelectorAll('[role=alertdialog] h2')].some(node => node.textContent?.trim() === 'Reset marked demo requests?'),
    confirmationInput: Boolean(document.querySelector('[role=alertdialog] input[placeholder="RESET DEMO DATA"]')),
    destructiveDisabled: [...document.querySelectorAll('[role=alertdialog] button')].some(button => button.textContent?.trim() === 'Delete marked demo data' && button.disabled)
  }))()`);
  if (
    !resetDialog.title ||
    !resetDialog.confirmationInput ||
    !resetDialog.destructiveDisabled
  )
    throw new Error("Demo reset dialog did not require explicit confirmation.");
  await evaluate(
    "[...document.querySelectorAll('[role=alertdialog] button')].find(button => button.textContent?.trim() === 'Cancel')?.click()"
  );
  await evaluate(
    "[...document.querySelectorAll('button')].find(button => button.textContent?.trim().includes('Refresh'))?.click()"
  );
  await wait(450);
  const afterRefresh = await evaluate(
    "Boolean(document.querySelector('#contact-status')) && document.querySelector('h1')?.textContent?.trim() === 'Contact requests'"
  );
  if (!afterRefresh)
    throw new Error("Owner inbox did not remain available after refresh.");
  await command("Page.navigate", { url: `${baseUrl}/admin/notifications` });
  await wait(1_200);
  const notificationsPage = await evaluate(`(() => ({
    title: document.querySelector('h1')?.textContent?.trim(),
    ownerNav: [...document.querySelectorAll('span')].some(node => node.textContent?.trim() === 'Custom notices'),
    titleInput: Boolean(document.querySelector('input[placeholder="e.g., Planned system maintenance"]')),
    messageInput: Boolean(document.querySelector('textarea')),
    publish: [...document.querySelectorAll('button')].some(button => button.textContent?.trim().includes('Publish notification'))
  }))()`);
  if (
    notificationsPage.title !== "Custom notifications" ||
    !notificationsPage.ownerNav ||
    !notificationsPage.titleInput ||
    !notificationsPage.messageInput ||
    !notificationsPage.publish
  )
    throw new Error(
      "Owner custom-notification controls did not render as expected."
    );
  await command("Page.navigate", { url: `${baseUrl}/workspace` });
  let workspace;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await wait(500);
    workspace = await evaluate(`(() => ({
      path: window.location.pathname,
      title: document.querySelector('h1')?.textContent?.trim(),
      redirectedToPricing: window.location.pathname === '/pricing'
    }))()`);
    if (
      workspace.path === "/pricing" ||
      workspace.title === "Compliance control center"
    )
      break;
  }
  if (
    workspace?.path !== "/workspace" ||
    workspace?.title !== "Compliance control center" ||
    workspace?.redirectedToPricing
  )
    throw new Error(
      `Configured owner workspace verification failed: ${JSON.stringify(workspace)}`
    );
  await command("Page.navigate", { url: `${baseUrl}/settings` });
  await wait(1_200);
  const settingsOnboarding = await evaluate(`(() => ({
    path: window.location.pathname,
    title: document.querySelector('h1')?.textContent?.trim(),
    onboardingHeading: [...document.querySelectorAll('h2')].some(node => node.textContent?.trim() === 'Oregon OLCC onboarding'),
    illustration: Boolean(document.querySelector('img[src*="metrcmatch-onboarding-reconciliation_8b9db974.png"]')),
    illustrationAlt: document.querySelector('img[src*="metrcmatch-onboarding-reconciliation_8b9db974.png"]')?.getAttribute('alt')
  }))()`);
  if (
    settingsOnboarding?.path !== "/settings" ||
    settingsOnboarding?.title !== "Facility & Metrc" ||
    !settingsOnboarding?.onboardingHeading ||
    !settingsOnboarding?.illustration ||
    settingsOnboarding?.illustrationAlt !==
      "Abstract illustration of package records resolving into verified reconciliation evidence."
  )
    throw new Error(
      `Settings onboarding illustration verification failed: ${JSON.stringify(settingsOnboarding)}`
    );
  console.log(
    "Verified authenticated owner inbox, notification composer, direct workspace access, and illustrated Settings onboarding without a subscription redirect."
  );
  socket.close();
}

try {
  await main();
} finally {
  browser.kill("SIGTERM");
}
