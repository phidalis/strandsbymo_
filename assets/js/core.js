/* ============================================================
   Strandsbymo_ — core app (header, footer, cart, overlays, shared UI)
   ============================================================ */

/* ---------- tiny helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const money = n => "£" + Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const debounce = (fn, wait = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; };
const emailOK = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
const phoneOK = v => {
  let d = String(v).replace(/\D/g, "");
  if (d.startsWith("44")) d = "0" + d.slice(2);
  return /^0\d{9,10}$/.test(d);
};
const postcodeOK = v => /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(String(v).trim());
const safeStore = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};

/* ---------- icon set (Lucide-style, inlined for reliability) ---------- */
const ICONS = {
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42Z"/><circle cx="7.5" cy="7.5" r=".9" fill="currentColor" stroke="none"/>',
  headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z"/><path d="M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5Z"/><path d="M3 11a9 9 0 0 1 18 0"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  star: '<path d="M11.53 2.3a.53.53 0 0 1 .95 0l2.3 4.68a2.12 2.12 0 0 0 1.6 1.16l5.17.76a.53.53 0 0 1 .29.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .29-.9l5.17-.76a2.12 2.12 0 0 0 1.6-1.16Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  crown: '<path d="M11.56 3.27a.5.5 0 0 1 .88 0l2.49 4.8a1 1 0 0 0 1.46.32l3.95-2.79a.5.5 0 0 1 .78.59l-2.28 7.34A2 2 0 0 1 16.92 15H7.08a2 2 0 0 1-1.93-1.47L2.88 6.19a.5.5 0 0 1 .78-.59l3.95 2.79a1 1 0 0 0 1.46-.32Z"/><path d="M5 21h14"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/>',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z"/><path d="M17.5 6.5h.01"/>',
  youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3Z"/>',
  tiktok: '<path d="M9 18a4 4 0 1 0 4-4V4c.7 2.9 2.8 4.7 5.8 4.9"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54Z"/>',
  sliders: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><circle cx="14" cy="4" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="20" r="2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  mapPin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  creditCard: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .01-1 1.02V20c0 1 0 1 1 1Z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1Z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.22-8.56"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>'
};

function icon(name, cls = "") {
  const filled = name === "star";
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="${filled ? "none" : "currentColor"}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.sparkles}</svg>`;
}

function hydrateIcons(root = document) {
  $$("[data-icon]", root).forEach(el => {
    if (el.dataset.hydrated === "1") return;
    el.innerHTML = icon(el.dataset.icon);
    el.dataset.hydrated = "1";
  });
}

function logoMark() {
  return `<img src="assets/img/strandsbymo-logo.png" alt="" width="64" height="64" decoding="async" draggable="false">`;
}

function logoMarkup(light = false) {
  return `<a class="logo ${light ? "logo-light" : ""}" href="index.html" aria-label="Strandsbymo_ - Home">
    <span class="logo-mark">${logoMark()}</span>
    <span class="logo-text">
      <span class="logo-name">Strands<span>bymo_</span></span>
      <span class="logo-tag">Beauty in Every Strand</span>
    </span>
  </a>`;
}

function stars(rating) {
  const full = Math.round(Number(rating) || 0);
  let out = "";
  for (let i = 1; i <= 5; i++) out += icon("star", i <= full ? "star-on" : "star-off");
  return `<span class="stars" aria-hidden="true">${out}</span>`;
}

/* ---------- toasts ---------- */
function showToast(message, type = "success", action = null) {
  let stack = $("#toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    stack.className = "toast-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icon(type === "error" ? "info" : type === "info" ? "sparkles" : "checkCircle")}</span>
    <span class="toast-msg">${esc(message)}</span>
    ${action ? `<button class="toast-action" type="button">${esc(action.label)}</button>` : ""}
    <button class="toast-close" type="button" aria-label="Dismiss">${icon("x")}</button>`;
  stack.appendChild(el);
  hydrateIcons(el);
  requestAnimationFrame(() => el.classList.add("show"));
  const remove = () => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); };
  const timer = setTimeout(remove, 4200);
  el.querySelector(".toast-close").addEventListener("click", () => { clearTimeout(timer); remove(); });
  if (action) el.querySelector(".toast-action").addEventListener("click", () => { clearTimeout(timer); remove(); action.fn(); });
}

/* ---------- layers / body lock ---------- */
function openLayer(el) {
  if (!el) return;
  closeLayers(el);
  el.classList.add("open");
  el.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}
function closeLayers(except = null) {
  $$(".modal.open, .cart-drawer.open, .mobile-menu.open, .filter-drawer.open").forEach(el => {
    if (el === except) return;
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
  });
  $$(".mobile-menu-overlay.show, .cart-overlay.show, .filter-overlay.show").forEach(el => {
    el.classList.remove("show");
  });
  if (!document.querySelector(".modal.open, .cart-drawer.open, .mobile-menu.open, .filter-drawer.open")) {
    document.body.classList.remove("no-scroll");
  }
}

/* ---------- cart ---------- */
const CART_KEY = "strandsbymo_cart_v1";
const FREE_SHIPPING = 30;
const DELIVERY_FEE = 3.99;
let cart = [];

function loadCart() {
  const c = safeStore.get(CART_KEY, []);
  cart = Array.isArray(c) ? c.filter(i => i && i.id && PRODUCTS.some(p => p.id === i.id)) : [];
}
function persistCart() {
  safeStore.set(CART_KEY, cart);
  updateCartBadge();
  renderCart();
}
function cartKey(item) { return `${item.id}|${item.length}|${item.color}`; }
function cartCount() { return cart.reduce((n, i) => n + i.qty, 0); }
function cartSubtotal() {
  return cart.reduce((sum, i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}
function deliveryFee() {
  const s = cartSubtotal();
  return s === 0 ? 0 : (s >= FREE_SHIPPING ? 0 : DELIVERY_FEE);
}
function cartTotal() { return cartSubtotal() + deliveryFee(); }

function addToCart(id, opts = {}) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const item = {
    id,
    length: opts.length || p.lengths[0],
    color: opts.color || p.colors[0],
    qty: Math.max(1, parseInt(opts.qty, 10) || 1)
  };
  const existing = cart.find(i => cartKey(i) === cartKey(item));
  if (existing) existing.qty += item.qty;
  else cart.push(item);
  persistCart();
  showToast(`${p.name} added to your bag`, "success", { label: "View bag", fn: openCart });
}

function updateCartBadge() {
  const badge = $("#cart-count");
  if (!badge) return;
  const n = cartCount();
  badge.textContent = n > 99 ? "99+" : n;
  badge.classList.toggle("is-empty", n === 0);
  badge.classList.remove("bump");
  void badge.offsetWidth;
  if (n > 0) badge.classList.add("bump");
}

function cartItemHTML(item) {
  const p = PRODUCTS.find(x => x.id === item.id);
  if (!p) return "";
  return `<article class="cart-item" data-key="${esc(cartKey(item))}">
    <a class="cart-item-img" href="product.html?id=${p.id}"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"></a>
    <div class="cart-item-info">
      <div class="cart-item-top">
        <a class="cart-item-name" href="product.html?id=${p.id}">${esc(p.name)}</a>
        <button class="cart-remove" type="button" data-cart-remove="${esc(cartKey(item))}" aria-label="Remove ${esc(p.name)}">${icon("trash")}</button>
      </div>
      <p class="cart-item-specs">${esc(item.length)} · ${esc(item.color)}</p>
      <div class="cart-item-bottom">
        <div class="qty-stepper qty-sm">
          <button type="button" data-cart-qty="down" data-key="${esc(cartKey(item))}" aria-label="Decrease quantity">${icon("minus")}</button>
          <span aria-live="polite">${item.qty}</span>
          <button type="button" data-cart-qty="up" data-key="${esc(cartKey(item))}" aria-label="Increase quantity">${icon("plus")}</button>
        </div>
        <strong class="cart-item-price">${money(p.price * item.qty)}</strong>
      </div>
    </div>
  </article>`;
}

function renderCart() {
  const list = $("#cart-items");
  if (!list) return;
  const countEl = $("#cart-drawer-count");
  if (countEl) countEl.textContent = cartCount() ? `(${cartCount()})` : "";
  const subtotal = cartSubtotal();
  const fee = deliveryFee();
  const total = cartTotal();

  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING) * 100));
  const ship = $("#cart-shipping");
  if (ship) {
    if (cart.length === 0) {
      ship.innerHTML = `<p class="ship-note">${icon("truck")} Free delivery on orders over ${money(FREE_SHIPPING)}</p>`;
    } else if (subtotal >= FREE_SHIPPING) {
      ship.innerHTML = `<p class="ship-note success">${icon("truck")} You’ve unlocked FREE delivery</p>
        <div class="ship-bar"><span style="width:100%"></span></div>`;
    } else {
      ship.innerHTML = `<p class="ship-note">${icon("truck")} You’re <strong>${money(FREE_SHIPPING - subtotal)}</strong> away from FREE delivery</p>
        <div class="ship-bar"><span style="width:${progress}%"></span></div>`;
    }
    hydrateIcons(ship);
  }

  if (cart.length === 0) {
    list.innerHTML = `<div class="cart-empty">
      <span class="cart-empty-icon">${icon("bag")}</span>
      <h3>Your bag is empty</h3>
      <p>Discover luxurious human hair, wigs and care made to make you feel beautiful.</p>
      <a class="btn btn-pink" href="shop.html">Start Shopping ${icon("arrowRight")}</a>
    </div>`;
    const foot = $("#cart-foot");
    if (foot) foot.innerHTML = "";
    hydrateIcons(list);
    return;
  }

  list.innerHTML = cart.map(cartItemHTML).join("");
  hydrateIcons(list);

  const foot = $("#cart-foot");
  if (foot) {
    foot.innerHTML = `
      <div class="cart-totals">
        <div class="cart-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
        <div class="cart-line"><span>Delivery</span><strong>${fee === 0 ? '<span class="free-tag">FREE</span>' : money(fee)}</strong></div>
        <div class="cart-line cart-grand"><span>Total</span><strong>${money(total)}</strong></div>
      </div>
      <a href="checkout.html" class="btn btn-pink btn-block">Proceed to Checkout ${icon("arrowRight")}</a>
      <button class="btn btn-ghost btn-block" type="button" data-close-cart>Continue Shopping</button>
      <p class="cart-secure">${icon("shield")} Secure checkout · Easy 7-day returns</p>`;
    hydrateIcons(foot);
  }
}

function initCart() {
  loadCart();
  updateCartBadge();
  renderCart();

  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) {
      e.preventDefault();
      e.stopPropagation();
      addToCart(add.dataset.add, {
        length: add.dataset.length || undefined,
        color: add.dataset.color || undefined,
        qty: add.dataset.qty || 1
      });
      return;
    }
    if (e.target.closest("[data-open-cart]")) { openCart(); return; }
    if (e.target.closest("[data-close-cart]")) { closeCart(); return; }
  });

  const drawer = $("#cart-drawer");
  if (drawer) {
    drawer.addEventListener("click", e => {
      const qtyBtn = e.target.closest("[data-cart-qty]");
      if (qtyBtn) {
        const key = qtyBtn.dataset.key;
        const item = cart.find(i => cartKey(i) === key);
        if (!item) return;
        item.qty += qtyBtn.dataset.cartQty === "up" ? 1 : -1;
        if (item.qty <= 0) cart = cart.filter(i => cartKey(i) !== key);
        persistCart();
        return;
      }
      const rm = e.target.closest("[data-cart-remove]");
      if (rm) {
        cart = cart.filter(i => cartKey(i) !== rm.dataset.cartRemove);
        persistCart();
        showToast("Item removed from your bag", "info");
      }
    });
  }
  const overlay = $("#cart-overlay");
  if (overlay) overlay.addEventListener("click", closeCart);
}

function openCart() {
  openLayer($("#cart-drawer"));
  const overlay = $("#cart-overlay");
  if (overlay) overlay.classList.add("show");
}
function closeCart() {
  const d = $("#cart-drawer");
  if (d) { d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); }
  closeLayers();
}

/* ---------- announcement + header ---------- */
function hairHeaderMarkup() {
  const page = document.body.dataset.page || "home";
  const is = k => (page === k ? " active" : "");
  const shopActive = (page === "shop" || page === "product") ? " active" : "";
  const count = cartCount();

  return `
  <div class="announcement" id="announcement">
    <div class="container announcement-inner">
      <span class="announce-item is-active">${icon("truck")} Free UK Delivery Over ${money(FREE_SHIPPING)}</span>
      <span class="announce-item">${icon("tag")} Easy Returns</span>
      <span class="announce-item">${icon("headset")} 24/7 Support</span>
    </div>
  </div>
  <header class="navbar" id="navbar">
    <div class="container nav-inner">
      ${logoMarkup()}
      <nav class="main-nav" aria-label="Main navigation">
        <a href="index.html" class="nav-link${is("home")}">Home</a>
        <div class="nav-dropdown has-dropdown">
          <a href="shop.html" class="nav-link${shopActive}" aria-haspopup="true" aria-expanded="false">Shop ${icon("chevronDown", "nav-caret")}</a>
          <div class="dropdown" role="menu">
            <span class="dropdown-label">Shop by category</span>
            ${CATEGORIES.map(c => `<a href="shop.html?category=${c.slug}" role="menuitem">${c.name}</a>`).join("")}
            <a href="shop.html" class="dropdown-all" role="menuitem">View all products ${icon("arrowRight")}</a>
          </div>
        </div>
        <a href="about.html" class="nav-link${is("about")}">About</a>
        <a href="blog.html" class="nav-link${is("blog")}">Blog</a>
        <a href="contact.html" class="nav-link${is("contact")}">Contact</a>
      </nav>
      <div class="nav-actions">
        <form class="header-search" data-search-form role="search">
          <span class="hs-icon">${icon("search")}</span>
          <input type="search" name="q" placeholder="Search for hair..." aria-label="Search for hair" autocomplete="off">
          <kbd>Enter</kbd>
        </form>
        <button class="icon-btn search-trigger" type="button" data-open-search aria-label="Search">${icon("search")}</button>
        <button class="icon-btn account-trigger" type="button" data-open-account aria-label="Account">${icon("user")}</button>
        <button class="icon-btn cart-trigger" type="button" data-open-cart aria-label="Open shopping bag">${icon("bag")}<span class="cart-badge${count === 0 ? " is-empty" : ""}" id="cart-count">${count > 99 ? "99+" : count}</span></button>
        <button class="hamburger" type="button" data-open-menu aria-label="Open menu" aria-expanded="false">${icon("menu")}</button>
      </div>
    </div>
  </header>
  <div class="mobile-menu-overlay" data-close-menu></div>
  <aside class="mobile-menu" id="mobile-menu" aria-hidden="true" aria-label="Mobile navigation">
    <div class="mobile-menu-head">
      ${logoMarkup()}
      <button class="icon-btn" type="button" data-close-menu aria-label="Close menu">${icon("x")}</button>
    </div>
    <nav class="mobile-nav">
      <a href="index.html" class="${is("home") === " active" ? "active" : ""}">Home ${icon("chevronRight")}</a>
      <a href="shop.html" class="${shopActive ? "active" : ""}">Shop ${icon("chevronRight")}</a>
      <a href="about.html" class="${is("about") === " active" ? "active" : ""}">About ${icon("chevronRight")}</a>
      <a href="blog.html" class="${is("blog") === " active" ? "active" : ""}">Blog ${icon("chevronRight")}</a>
      <a href="contact.html" class="${is("contact") === " active" ? "active" : ""}">Contact ${icon("chevronRight")}</a>
    </nav>
    <div class="mobile-cats">
      <span class="dropdown-label">Categories</span>
      ${CATEGORIES.map(c => `<a href="shop.html?category=${c.slug}">${c.name}</a>`).join("")}
    </div>
    <div class="mobile-menu-actions">
      <button class="btn btn-ghost" type="button" data-open-account>${icon("user")} My Account</button>
      <button class="btn btn-pink" type="button" data-open-cart>${icon("bag")} View Bag (${cartCount()})</button>
    </div>
    <p class="mobile-help">${icon("headset")} Need help? <a href="contact.html">Talk to us</a></p>
  </aside>`;
}

function initHeader() {
  const mount = $("#site-header");
  if (!mount) return;
  mount.innerHTML = hairHeaderMarkup();
  hydrateIcons(mount);

  const nav = $("#navbar");
  const setScrolled = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  $$("[data-open-menu]").forEach(b => b.addEventListener("click", () => openMenu()));
  $$("[data-close-menu]").forEach(b => b.addEventListener("click", closeMenu));
  $$("[data-open-search]").forEach(b => b.addEventListener("click", openSearch));
  $$("[data-open-account]").forEach(b => b.addEventListener("click", () => { closeMenu(); openAccount(); }));
  $$("[data-open-cart]").forEach(b => b.addEventListener("click", () => { closeMenu(); openCart(); }));

  $$("[data-search-form]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const q = (form.querySelector("input").value || "").trim();
      window.location.href = q ? `shop.html?q=${encodeURIComponent(q)}` : "shop.html";
    });
  });

  const dd = $(".has-dropdown");
  if (dd) {
    const trigger = dd.querySelector(".nav-link");
    trigger.addEventListener("click", e => {
      if (window.matchMedia("(hover: none)").matches) {
        e.preventDefault();
        dd.classList.toggle("open");
        trigger.setAttribute("aria-expanded", dd.classList.contains("open") ? "true" : "false");
      }
    });
  }

  hydrateIcons(document);
}

function openMenu() {
  const menu = $("#mobile-menu");
  const overlay = $(".mobile-menu-overlay");
  if (!menu) return;
  openLayer(menu);
  if (overlay) overlay.classList.add("show");
  const burger = $("[data-open-menu]");
  if (burger) burger.setAttribute("aria-expanded", "true");
}
function closeMenu() {
  const menu = $("#mobile-menu");
  const overlay = $(".mobile-menu-overlay");
  if (menu) { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); }
  if (overlay) overlay.classList.remove("show");
  const burger = $("[data-open-menu]");
  if (burger) burger.setAttribute("aria-expanded", "false");
  closeLayers();
}

/* ---------- footer ---------- */
function footerMarkup() {
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-col footer-brand">
        ${logoMarkup(true)}
        <p class="footer-slogan">Beauty in Every Strand</p>
        <p class="footer-blurb">Premium human hair, wigs and care essentials — thoughtfully sourced, beautifully finished, delivered across the UK.</p>
        <div class="footer-badge">${icon("shield")} Authentic 100% Human Hair</div>
      </div>

      <div class="footer-col">
        <h3 class="footer-title"><button type="button" class="footer-toggle">Quick Links <span>${icon("chevronDown")}</span></button></h3>
        <div class="footer-body">
          <a href="index.html">Home</a>
          <a href="shop.html">Shop</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>

      <div class="footer-col">
        <h3 class="footer-title"><button type="button" class="footer-toggle">Customer Care <span>${icon("chevronDown")}</span></button></h3>
        <div class="footer-body">
          <a href="#faqs" data-info="faqs">FAQs</a>
          <a href="#shipping" data-info="shipping">Shipping Policy</a>
          <a href="#returns" data-info="returns">Returns &amp; Refunds</a>
          <a href="contact.html?subject=Track%20my%20order">Track Order</a>
        </div>
      </div>

      <div class="footer-col">
        <h3 class="footer-title"><button type="button" class="footer-toggle">Follow Us <span>${icon("chevronDown")}</span></button></h3>
        <div class="footer-body">
          <div class="socials">
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Strandsbymo_ on Facebook">${icon("facebook")}</a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Strandsbymo_ on Instagram">${icon("instagram")}</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener" aria-label="Strandsbymo_ on TikTok">${icon("tiktok")}</a>
            <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="Strandsbymo_ on YouTube">${icon("youtube")}</a>
          </div>
          <p class="social-handle">@strandsbymo_</p>
          <p class="footer-small">Tag us in your looks for a chance to be featured.</p>
        </div>
      </div>

      <div class="footer-col footer-newsletter">
        <h3 class="footer-title"><button type="button" class="footer-toggle">Subscribe for Updates <span>${icon("chevronDown")}</span></button></h3>
        <div class="footer-body">
          <p class="newsletter-copy">Get the latest deals and offers!</p>
          <form class="newsletter-form" data-newsletter>
            <label class="sr-only" for="footer-email">Email address</label>
            <div class="newsletter-row">
              <input id="footer-email" type="email" name="email" placeholder="Enter your email" required autocomplete="email">
              <button class="newsletter-btn" type="submit" aria-label="Subscribe">${icon("send")}</button>
            </div>
            <p class="form-note">By subscribing you agree to our privacy policy.</p>
          </form>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p>© <span id="year">2026</span> Strandsbymo_. All rights reserved.</p>
        <div class="payment-logos" aria-label="Accepted payment methods">
          <span class="pay pay-visa">VISA</span>
          <span class="pay pay-mc"><i></i><i></i></span>
          <span class="pay pay-apple">Apple Pay</span>
          <span class="pay pay-paypal">PayPal</span>
        </div>
      </div>
    </div>
  </footer>`;
}

function initFooter() {
  const mount = $("#site-footer");
  if (!mount) return;
  mount.innerHTML = footerMarkup();
  hydrateIcons(mount);
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  $$(".footer-toggle", mount).forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.innerWidth > 760) return;
      btn.closest(".footer-col").classList.toggle("open");
    });
  });
}

/* ---------- newsletter ---------- */
function initNewsletter() {
  document.addEventListener("submit", e => {
    const form = e.target.closest("[data-newsletter]");
    if (!form) return;
    e.preventDefault();
    const input = form.querySelector("input[type=email]");
    if (!input) return;
    if (!emailOK(input.value)) {
      input.classList.add("invalid");
      showToast("Please enter a valid email address", "error");
      input.focus();
      return;
    }
    input.classList.remove("invalid");
    const list = safeStore.get("strandsbymo_subscribers", []);
    if (!list.includes(input.value.trim().toLowerCase())) list.push(input.value.trim().toLowerCase());
    safeStore.set("strandsbymo_subscribers", list);
    showToast("You're subscribed. Welcome to Strandsbymo_!", "success");
    form.reset();
  });
}

/* ---------- search overlay ---------- */
function searchModalMarkup() {
  return `<div class="modal search-modal" id="search-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Search products">
    <div class="modal-card search-card">
      <div class="search-head">
        <span class="search-head-icon">${icon("search")}</span>
        <input type="search" id="search-input" placeholder="Search for hair..." aria-label="Search for hair" autocomplete="off">
        <button class="icon-btn" type="button" data-close-modal aria-label="Close search">${icon("x")}</button>
      </div>
      <div class="search-body">
        <div class="search-popular" id="search-popular">
          <span>Popular:</span>
          <button type="button" data-search-term="straight bundles">Straight bundles</button>
          <button type="button" data-search-term="lace wig">Lace wigs</button>
          <button type="button" data-search-term="braids">Braids</button>
          <button type="button" data-search-term="hair care">Hair care</button>
        </div>
        <div class="search-results" id="search-results"></div>
      </div>
    </div>
  </div>`;
}

function initSearch() {
  const modal = $("#search-modal");
  if (!modal) return;
  const input = $("#search-input");
  const results = $("#search-results");

  const render = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = `<p class="search-hint">Start typing to discover your next look.</p>`;
      return;
    }
    const found = PRODUCTS.filter(p =>
      [p.name, p.category, p.type, p.short].join(" ").toLowerCase().includes(q)
    ).slice(0, 6);
    if (!found.length) {
      results.innerHTML = `<div class="search-none"><p>No matches for “${esc(input.value.trim())}”.</p><button class="btn btn-pink btn-sm" type="button" data-search-all>Browse all hair</button></div>`;
      hydrateIcons(results);
      return;
    }
    results.innerHTML = `<p class="search-count">${found.length} result${found.length > 1 ? "s" : ""}</p>` +
      found.map(p => `<a class="search-result" href="product.html?id=${p.id}">
        <span class="search-result-img"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"></span>
        <span class="search-result-info">
          <span class="search-result-cat">${esc(p.category)}</span>
          <span class="search-result-name">${esc(p.name)}</span>
          <span class="search-result-price">${money(p.price)}</span>
        </span>
        ${icon("arrowRight")}
      </a>`).join("") +
      `<button class="search-all-link" type="button" data-search-all>See all results for “${esc(input.value.trim())}” ${icon("arrowRight")}</button>`;
    hydrateIcons(results);
  };

  input.addEventListener("input", debounce(render, 120));
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = input.value.trim();
      if (q) window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
    }
  });

  modal.addEventListener("click", e => {
    if (e.target.closest("[data-close-modal]") || e.target === modal) closeSearch();
    const term = e.target.closest("[data-search-term]");
    if (term) { input.value = term.dataset.searchTerm; render(); input.focus(); }
    if (e.target.closest("[data-search-all]")) {
      const q = input.value.trim();
      window.location.href = q ? `shop.html?q=${encodeURIComponent(q)}` : "shop.html";
    }
  });
}

function openSearch() {
  closeMenu();
  const modal = $("#search-modal");
  if (!modal) return;
  openLayer(modal);
  const input = $("#search-input");
  if (input) { input.value = ""; setTimeout(() => input.focus(), 120); }
  const results = $("#search-results");
  if (results) results.innerHTML = `<p class="search-hint">Start typing to discover your next look.</p>`;
}
function closeSearch() {
  const m = $("#search-modal");
  if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  closeLayers();
}

/* ---------- account ---------- */
const USER_KEY = "strandsbymo_user_v1";

function accountModalMarkup() {
  return `<div class="modal account-modal" id="account-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Your account">
    <div class="modal-card account-card">
      <button class="modal-x" type="button" data-close-modal aria-label="Close">${icon("x")}</button>
      <div id="account-body"></div>
    </div>
  </div>`;
}

function renderAccount() {
  const body = $("#account-body");
  if (!body) return;
  const user = safeStore.get(USER_KEY, null);
  if (user && user.email) {
    body.innerHTML = `
      <div class="account-avatar">${esc((user.name || user.email).charAt(0).toUpperCase())}</div>
      <p class="eyebrow">Welcome back</p>
      <h2 class="account-title">${esc(user.name || "Strandsbymo_ Client")}</h2>
      <p class="account-email">${esc(user.email)}</p>
      <div class="account-panel">
        <div class="account-row">${icon("bag")} <span>Bag items</span> <strong>${cartCount()}</strong></div>
        <div class="account-row">${icon("heart")} <span>Saved looks</span> <strong>0</strong></div>
        <div class="account-row">${icon("package")} <span>Orders</span> <strong>No orders yet</strong></div>
      </div>
      <div class="account-actions">
        <a class="btn btn-pink btn-block" href="shop.html">Continue Shopping</a>
        <button class="btn btn-ghost btn-block" type="button" data-logout>Sign Out</button>
      </div>
      <p class="account-note">${icon("shield")} This is a front-end demo account stored only in your browser.</p>`;
  } else {
    body.innerHTML = `
      <div class="account-icon">${icon("user")}</div>
      <p class="eyebrow">Strandsbymo_ Account</p>
      <h2 class="account-title">Welcome back</h2>
      <p class="account-sub">Sign in to track orders, save your favourite looks and check out faster.</p>
      <div class="account-tabs" role="tablist">
        <button class="account-tab active" type="button" data-tab="login">Sign In</button>
        <button class="account-tab" type="button" data-tab="register">Create Account</button>
      </div>
      <form class="account-form" id="account-form" novalidate>
        <div class="field" data-register-only hidden>
          <label for="acc-name">Full name</label>
          <input id="acc-name" name="name" type="text" placeholder="Your full name" autocomplete="name">
        </div>
        <div class="field">
          <label for="acc-email">Email address</label>
          <input id="acc-email" name="email" type="email" placeholder="you@example.com" required autocomplete="email">
        </div>
        <div class="field">
          <label for="acc-pass">Password</label>
          <input id="acc-pass" name="password" type="password" placeholder="Enter your password" required minlength="6" autocomplete="current-password">
        </div>
        <button class="btn btn-pink btn-block" type="submit" id="account-submit">Sign In</button>
      </form>
      <p class="account-note">${icon("lock")} Demo only — no real account or payment is created.</p>`;
  }
  hydrateIcons(body);
}

function setAccountTab(tab) {
  $$(".account-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  const nameField = $("[data-register-only]");
  if (nameField) nameField.hidden = tab !== "register";
  const submit = $("#account-submit");
  if (submit) submit.textContent = tab === "register" ? "Create Account" : "Sign In";
  const form = $("#account-form");
  if (form) form.dataset.mode = tab;
}

function initAccount() {
  const modal = $("#account-modal");
  if (!modal) return;
  renderAccount();

  modal.addEventListener("click", e => {
    if (e.target.closest("[data-close-modal]") || e.target === modal) closeAccount();
    const tab = e.target.closest(".account-tab");
    if (tab) setAccountTab(tab.dataset.tab);
    if (e.target.closest("[data-logout]")) {
      safeStore.del(USER_KEY);
      showToast("You have been signed out", "info");
      renderAccount();
    }
  });

  modal.addEventListener("submit", e => {
    const form = e.target.closest("#account-form");
    if (!form) return;
    e.preventDefault();
    const mode = form.dataset.mode || "login";
    const email = form.querySelector("[name=email]");
    const pass = form.querySelector("[name=password]");
    const name = form.querySelector("[name=name]");
    if (!emailOK(email.value)) { showToast("Please enter a valid email address", "error"); email.focus(); return; }
    if ((pass.value || "").length < 6) { showToast("Password must be at least 6 characters", "error"); pass.focus(); return; }
    if (mode === "register" && !(name.value || "").trim()) { showToast("Please enter your full name", "error"); name.focus(); return; }
    safeStore.set(USER_KEY, { name: (name && name.value.trim()) || email.value.split("@")[0], email: email.value.trim().toLowerCase() });
    showToast(mode === "register" ? "Account created. Welcome to Strandsbymo_!" : "Signed in successfully", "success");
    renderAccount();
  });
}

function openAccount() {
  const modal = $("#account-modal");
  if (!modal) return;
  openLayer(modal);
  renderAccount();
  setAccountTab("login");
}
function closeAccount() {
  const m = $("#account-modal");
  if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); }
  closeLayers();
}

/* ---------- info modal (policies / FAQs) ---------- */
const INFO_CONTENT = {
  faqs: {
    title: "Frequently Asked Questions",
    html: `<div class="info-list">
      <details open><summary>Is your hair 100% human hair?</summary><p>Yes. Every bundle, closure and wig in our signature range is made from authentic human hair. Product pages list the exact quality, origin and care details.</p></details>
      <details><summary>How much hair do I need for a full install?</summary><p>We recommend 3 bundles for lengths up to 20", and 4 bundles for 22" and above. Add a closure or frontal for a complete finish.</p></details>
      <details><summary>Can I dye or bleach the hair?</summary><p>Our virgin and raw hair can be dyed. We recommend professional colouring up to level 8 to protect the integrity of the hair.</p></details>
      <details><summary>Do you offer installation services?</summary><p>Yes — our London studio offers wig installs, braiding and sew-ins by appointment. Message us on WhatsApp to book.</p></details>
    </div>`
  },
  shipping: {
    title: "Shipping Policy",
    html: `<div class="info-copy">
      <p><strong>Free delivery</strong> on all orders over ${money(FREE_SHIPPING)}. Orders below this amount have a flat delivery fee of ${money(DELIVERY_FEE)}.</p>
      <h4>UK delivery</h4><p>We deliver to addresses across the UK. Orders placed before 2pm are dispatched the same day.</p>
      <h4>Delivery times</h4><p>Standard delivery takes 1–3 business days via our trusted courier partners, with tracking sent by email.</p>
      <h4>Tracking</h4><p>You will receive a tracking number by SMS and email as soon as your order is dispatched.</p>
    </div>`
  },
  returns: {
    title: "Returns & Refunds",
    html: `<div class="info-copy">
      <p><strong>7-day easy returns.</strong> We accept returns on unopened, unworn hair and care products within 7 days of delivery.</p>
      <h4>Eligibility</h4><p>Items must be in their original packaging with the hygiene seal intact. For hygiene reasons, wigs, closures and lace products cannot be returned once the seal is broken.</p>
      <h4>How to return</h4><p>Contact our support team with your order number and reason for return. We will arrange a pickup or share our return address.</p>
      <h4>Refunds</h4><p>Approved refunds are processed within 5–7 business days to your original payment method or as store credit.</p>
    </div>`
  }
};

function openInfo(key) {
  const data = INFO_CONTENT[key];
  if (!data) return;
  let modal = $("#info-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "info-modal";
    modal.className = "modal info-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal);
    modal.addEventListener("click", e => {
      if (e.target.closest("[data-close-modal]") || e.target === modal) {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        closeLayers();
      }
    });
  }
  modal.innerHTML = `<div class="modal-card info-card">
    <button class="modal-x" type="button" data-close-modal aria-label="Close">${icon("x")}</button>
    <p class="eyebrow">Strandsbymo_ Care</p>
    <h2 class="info-title">${esc(data.title)}</h2>
    ${data.html}
    <a class="btn btn-pink btn-block" href="contact.html">Still have questions? Contact us</a>
  </div>`;
  hydrateIcons(modal);
  openLayer(modal);
}

/* ---------- hero carousel ---------- */
function initHero() {
  const hero = $("#hero-carousel");
  if (!hero) return;
  const slides = $$(".hero-slide", hero);
  const dots = $$(".hero-dot", hero);
  const prev = $(".hero-arrow-prev", hero);
  const next = $(".hero-arrow-next", hero);
  if (!slides.length) return;
  let index = 0;
  let timer = null;

  const go = i => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      s.classList.toggle("active", n === index);
      s.setAttribute("aria-hidden", n === index ? "false" : "true");
    });
    dots.forEach((d, n) => {
      d.classList.toggle("active", n === index);
      d.setAttribute("aria-selected", n === index ? "true" : "false");
    });
  };
  const start = () => { stop(); timer = setInterval(() => go(index + 1), 6500); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };

  dots.forEach((d, n) => d.addEventListener("click", () => { go(n); start(); }));
  prev && prev.addEventListener("click", () => { go(index - 1); start(); });
  next && next.addEventListener("click", () => { go(index + 1); start(); });
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

  let touchX = 0;
  hero.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) { go(index + (dx < 0 ? 1 : -1)); start(); }
  }, { passive: true });

  go(0);
  start();
}

/* ---------- announcement rotator (mobile) ---------- */
function initAnnouncement() {
  const items = $$(".announce-item");
  if (items.length < 2) return;
  let i = 0;
  setInterval(() => {
    if (window.innerWidth > 760) return;
    items[i].classList.remove("is-active");
    i = (i + 1) % items.length;
    items[i].classList.add("is-active");
  }, 3800);
}

/* ---------- reveal on scroll ---------- */
let revealObserver = null;
function initReveal() {
  if (!("IntersectionObserver" in window)) {
    $$(".reveal").forEach(el => el.classList.add("in"));
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  refreshReveals();
}
function refreshReveals() {
  $$(".reveal:not(.in)").forEach(el => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add("in");
  });
}

/* ---------- global events & boot ---------- */
function initGlobal() {
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeLayers();
      $$(".modal.open").forEach(m => { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); });
      closeMenu();
    }
  });

  document.addEventListener("click", e => {
    const info = e.target.closest("[data-info]");
    if (info) {
      e.preventDefault();
      openInfo(info.dataset.info);
      return;
    }
    if (e.target.closest("[data-close-modal]")) {
      const m = e.target.closest(".modal");
      if (m) { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); closeLayers(); }
    }
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("open");
      e.target.setAttribute("aria-hidden", "true");
      closeLayers();
    }
  });

  document.addEventListener("error", e => {
    const img = e.target;
    if (img && img.tagName === "IMG" && !img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="880"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCE1EF"/><stop offset="1" stop-color="#FFD3E7"/></linearGradient></defs><rect width="700" height="880" fill="url(#g)"/><text x="350" y="430" text-anchor="middle" font-family="Georgia,serif" font-size="44" fill="#F72585">Strandsbymo_</text><text x="350" y="472" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#777">Beauty in Every Strand</text></svg>`
      );
      img.classList.add("img-fallback");
    }
  }, true);
}

function boot() {
  loadCart();
  initHeader();
  initFooter();
  $("#site-footer") && hydrateIcons(document);

  const modalRoot = $("#modal-root") || document.body;
  if (!$("#cart-overlay")) {
    const frag = document.createElement("div");
    frag.innerHTML = `
      <div class="cart-overlay" id="cart-overlay"></div>
      <aside class="cart-drawer" id="cart-drawer" aria-hidden="true" aria-label="Shopping bag">
        <div class="cart-head">
          <div>
            <p class="eyebrow">Your selection</p>
            <h2>Shopping Bag <span id="cart-drawer-count"></span></h2>
          </div>
          <button class="icon-btn" type="button" data-close-cart aria-label="Close bag">${icon("x")}</button>
        </div>
        <div class="cart-shipping" id="cart-shipping"></div>
        <div class="cart-items" id="cart-items"></div>
        <div class="cart-foot" id="cart-foot"></div>
      </aside>
      ${searchModalMarkup()}
      ${accountModalMarkup()}
      <div class="toast-stack" id="toast-stack" aria-live="polite"></div>`;
    while (frag.firstChild) modalRoot.appendChild(frag.firstChild);
  }
  hydrateIcons(document);

  initGlobal();
  initCart();
  initSearch();
  initAccount();
  initNewsletter();
  initHero();
  initAnnouncement();
  initReveal();

  document.body.classList.add("page-ready");
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
