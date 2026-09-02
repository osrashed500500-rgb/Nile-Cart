/* =========================================================================
   NileCart Lab — shared logic
   This file does three jobs on purpose, kept separate so you can see each
   one clearly:
     1) PRODUCT DATA + CART   — plain storefront logic, nothing to do with tracking
     2) UTM CAPTURE           — reads ?utm_... from the URL and remembers it
     3) DATA LAYER HELPER     — the ONLY place that talks to window.dataLayer

   >>> This is where you install Google Tag Manager <<<
   In the real deploy, GTM's container snippet goes in the <head> of every
   HTML file (see the comment block near the top of index.html), and the
   dataLayer.push() calls below are exactly what GTM would be listening for.
   ========================================================================= */

// ---- 1) PRODUCT CATALOG --------------------------------------------------
const PRODUCTS = [
  { id: "SKU_LAMP",  name: "Aurora Desk Lamp",       price: 45.00, color: "#C1673D", desc: "Warm dimmable light with a brushed-brass base. Built for late work sessions that don't feel like work." },
  { id: "SKU_PACK",  name: "Nomad Backpack",          price: 89.00, color: "#14424A", desc: "A 20L daily carry with a padded laptop sleeve and a strap system that actually sits right on your shoulders." },
  { id: "SKU_MUGS",  name: "Terra Ceramic Mug Set",   price: 28.00, color: "#8A9A5B", desc: "Two hand-glazed mugs, no two exactly alike. Dishwasher safe, but they deserve better." },
  { id: "SKU_BUDS",  name: "Pulse Wireless Earbuds",  price: 65.00, color: "#4A5A6A", desc: "18-hour battery, real noise isolation, and a case that fits in a coin pocket." }
];

function getProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

// ---- CART (localStorage-backed, with a safe in-memory fallback) --------
let memoryCart = [];
function readCart() {
  try {
    const raw = localStorage.getItem("nilecart_cart");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return memoryCart;
  }
}
function writeCart(cart) {
  memoryCart = cart;
  try {
    localStorage.setItem("nilecart_cart", JSON.stringify(cart));
  } catch (e) {
    // storage unavailable (e.g. sandboxed preview) — memoryCart still works
  }
}
function addToCart(productId, qty) {
  const cart = readCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty: qty });
  writeCart(cart);
}
function removeFromCart(productId) {
  writeCart(readCart().filter(i => i.id !== productId));
}
function cartWithDetails() {
  return readCart().map(i => ({ ...i, product: getProduct(i.id) }));
}
function cartTotal() {
  return cartWithDetails().reduce((sum, i) => sum + i.product.price * i.qty, 0);
}
function cartCount() {
  return readCart().reduce((sum, i) => sum + i.qty, 0);
}

// ---- 2) UTM CAPTURE -------------------------------------------------------
// Reads utm_source / utm_medium / utm_campaign / utm_content / utm_term from
// the URL on ANY page landing, and stores it for the session so it "survives"
// navigation to product -> cart -> checkout -> purchase, the same way a real
// analytics/attribution setup needs campaign context to persist across pages.
function captureUTMs() {
  const params = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const found = {};
  let hasAny = false;
  keys.forEach(k => {
    if (params.has(k)) { found[k] = params.get(k); hasAny = true; }
  });
  if (hasAny) {
    try { sessionStorage.setItem("nilecart_utms", JSON.stringify(found)); } catch (e) {}
  }
}
function getStoredUTMs() {
  try {
    const raw = sessionStorage.getItem("nilecart_utms");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ---- 3) DATA LAYER HELPER -------------------------------------------------
window.dataLayer = window.dataLayer || [];

function pushDL(payload) {
  // GA4/GTM convention: clear the previous ecommerce object before pushing
  // a new one, so old item arrays don't "leak" into the next event.
  if (payload.ecommerce) window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(payload);
  console.log("[dataLayer.push]", payload);
  logToDebugPanel(payload);
}

function itemPayload(product, qty) {
  return { item_id: product.id, item_name: product.name, price: product.price, quantity: qty };
}

// ---- DEBUG PANEL (teaching aid only — not part of a real production site)
let panelEventCount = 0; // counts real events only — NOT every raw dataLayer.push()
                          // (a single event actually causes 2 pushes: one to
                          // clear the old ecommerce object, one for the event
                          // itself — that clear-push isn't a "real" event)
function logToDebugPanel(payload) {
  const body = document.getElementById("debug-body");
  if (!body) return;
  const entry = document.createElement("div");
  entry.className = "debug-entry";
  const evName = payload.event || "(no 'event' key)";
  entry.innerHTML = `<span class="ev-name">${evName}</span><pre>${JSON.stringify(payload, null, 2)}</pre>`;
  body.prepend(entry);
  panelEventCount++;
  const badge = document.getElementById("debug-count");
  if (badge) badge.textContent = panelEventCount;
}

function initDebugPanel() {
  const header = document.getElementById("debug-header");
  const panel = document.getElementById("debug-panel");
  if (!header || !panel) return;
  header.addEventListener("click", () => panel.classList.toggle("open"));
}

function renderCartBadge() {
  const el = document.getElementById("cart-count");
  if (el) el.textContent = cartCount();
}

document.addEventListener("DOMContentLoaded", () => {
  captureUTMs();
  initDebugPanel();
  renderCartBadge();
});
