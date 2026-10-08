let setupPromise = null;
let scramjetCtrl = null;
let conn = null;

function wispUrl() {
  const custom = (localStorage.getItem("gl_wisp") || "").trim();
  if (/^wss?:\/\//i.test(custom)) return custom;
  return (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
}

const SJ_DBS = ["scramjet-data", "scrambase", "ScramjetData", "scramjet", "$scramjet"];
const EPOXY = "/sj/tp-a.mjs";
const LIBCURL = "/sj/tp-b.mjs";

export function transportPath() {
  return (localStorage.getItem("gl_transport") || "").trim() === "libcurl" ? LIBCURL : EPOXY;
}

async function setTransportFallback(c, wisp) {
  const first = transportPath();
  const other = first === EPOXY ? LIBCURL : EPOXY;
  try {
    await c.setTransport(first, [{ wisp }]);
  } catch (e) {
    console.warn(first + " transport failed, using " + other + ":", e && e.message);
    await c.setTransport(other, [{ wisp }]);
  }
}

export async function setTransport(name) {
  localStorage.setItem("gl_transport", name === "libcurl" ? "libcurl" : "epoxy");
  if (conn) await setTransportFallback(conn, wispUrl());
}

export async function setWisp(url) {
  localStorage.setItem("gl_wisp", (url || "").trim());
  if (conn) await setTransportFallback(conn, wispUrl());
}

export function ensureEngine() {
  if (setupPromise) return setupPromise;
  setupPromise = (async () => {
    if (!window.BareMux) throw new Error("BareMux not loaded");
    if (!self.__uv$config) throw new Error("UV config not loaded");

    conn = new window.BareMux.BareMuxConnection("/wk.js?v=v2b");
    const wisp = wispUrl();
    const cur = await conn.getTransport().catch(() => null);
    if (cur !== transportPath()) await setTransportFallback(conn, wisp);

    if (!("serviceWorker" in navigator)) throw new Error("Service workers required");

    const uvReg = await navigator.serviceWorker.register("/cdn/svc.js?v=3", { scope: "/cdn/", updateViaCache: "none" });
    try { uvReg.update(); } catch {}
    await waitActive(uvReg);
  })();
  return setupPromise;
}

function waitActive(reg) {
  if (reg.active) return Promise.resolve();
  return new Promise((resolve) => {
    const installing = reg.installing || reg.waiting;
    if (!installing) { resolve(); return; }
    installing.addEventListener("statechange", () => {
      if (installing.state === "activated") resolve();
    });
  });
}

export function uvUrl(url) {
  if (!self.__uv$config) throw new Error("UV not initialized");
  return self.__uv$config.prefix + self.__uv$config.encodeUrl(url);
}

export async function viaUV(url) {
  await ensureEngine();
  return uvUrl(url);
}

let scramjetBoot = null;
export function ensureScramjet() {
  if (scramjetCtrl) return Promise.resolve(scramjetCtrl);
  if (!scramjetBoot) scramjetBoot = _ensureScramjet().catch((e) => { scramjetBoot = null; throw e; });
  return scramjetBoot;
}
async function _ensureScramjet() {
  await ensureEngine();
  if (scramjetCtrl) return scramjetCtrl;

  self.$scramjet = {
    files: {
      wasm: "/sj/core.wasm?v=v2b",
      sync: "/sj/sync.js?v=v2b",
      all: "/sj/core.js?v=v2b",
    },
  };
  await loadScript("/sj/core.js?v=v2b");
  if (!self.$scramjetLoadController) throw new Error("scramjet bundle missing $scramjetLoadController");
  const { ScramjetController } = self.$scramjetLoadController();
  scramjetCtrl = new ScramjetController({ prefix: "/data/", files: self.$scramjet.files });
  const ready = Promise.resolve()
    .then(() => scramjetCtrl.init())
    .catch(() => { for (const db of SJ_DBS) { try { indexedDB.deleteDatabase(db); } catch {} } });
  await Promise.race([ready, new Promise((r) => setTimeout(r, 3000))]);
  window.__scramjet = scramjetCtrl;

  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  try { reg.update(); } catch {}
  await waitActive(reg);
  await waitController();

  return scramjetCtrl;
}

function waitController(timeout = 5000) {
  if (navigator.serviceWorker.controller) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (done) return; done = true; navigator.serviceWorker.removeEventListener("controllerchange", finish); resolve(); };
    navigator.serviceWorker.addEventListener("controllerchange", finish);
    setTimeout(finish, timeout);
  });
}

export async function viaScramjet(url) {
  const ctrl = await ensureScramjet();
  return ctrl.encodeUrl(url);
}

function loadScript(src) {
  return new Promise((res, rej) => {
    const existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      if (existing.dataset.loaded === "1") { res(); return; }
      existing.addEventListener("load", () => res(), { once: true });
      existing.addEventListener("error", () => rej(new Error("failed to load " + src)), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src; s.async = false;
    s.onload = () => { s.dataset.loaded = "1"; res(); };
    s.onerror = () => rej(new Error("failed to load " + src));
    document.head.appendChild(s);
  });
}
