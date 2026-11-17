/* ============================================================
   Strandsbymo_ — product UI, homepage & shop logic
   ============================================================ */

function badgeClass(text) {
  if (!text) return "";
  const t = text.toLowerCase();
  if (t.includes("hot")) return "badge-hot";
  if (t.includes("best")) return "badge-best";
  if (t.includes("new")) return "badge-new";
  return "badge-plain";
}

function productCard(p, index = 0) {
  return `<article class="product-card" data-card-id="${p.id}" style="animation-delay:${Math.min(index * 55, 330)}ms">
    <div class="product-media">
      <a class="product-media-link" href="product.html?id=${p.id}" aria-label="${esc(p.name)}">
        <img src="${p.image}" alt="${esc(p.name)}" loading="lazy" decoding="async">
      </a>
      ${p.badge ? `<span class="product-badge ${badgeClass(p.badge)}">${esc(p.badge)}</span>` : ""}
      <button class="product-wish" type="button" data-wish="${p.id}" aria-label="Save ${esc(p.name)}">${icon("heart")}</button>
    </div>
    <div class="product-body">
      <span class="product-cat">${esc(p.category)}</span>
      <a class="product-name" href="product.html?id=${p.id}">${esc(p.name)}</a>
      <div class="product-rating">
        ${stars(p.rating)}
        <span class="rating-num">${p.rating}</span>
        <span class="rating-reviews">(${p.reviewsLabel} reviews)</span>
      </div>
      <div class="product-price">
        <strong>${money(p.price)}</strong>
        <s>${money(p.oldPrice)}</s>
      </div>
      <button class="btn btn-pink product-add" type="button" data-add="${p.id}">
        ${icon("bag")} Add to Cart
      </button>
    </div>
  </article>`;
}

function skeletonCard() {
  return `<div class="skeleton-card" aria-hidden="true">
    <div class="skeleton-media"></div>
    <div class="skeleton-line w-40"></div>
    <div class="skeleton-line w-90"></div>
    <div class="skeleton-line w-60"></div>
    <div class="skeleton-btn"></div>
  </div>`;
}

function relatedProducts(product, count = 4) {
  let list = PRODUCTS.filter(p => p.id !== product.id && p.categorySlug === product.categorySlug);
  if (list.length < count) {
    list = list.concat(PRODUCTS.filter(p => p.id !== product.id && p.categorySlug !== product.categorySlug));
  }
  return list.slice(0, count);
}

/* ---------- homepage ---------- */
function initHome() {
  const cats = $("#category-track");
  if (cats) {
    cats.innerHTML = CATEGORIES.map((c, i) => `<a class="category-card" href="shop.html?category=${c.slug}" style="animation-delay:${i * 45}ms">
      <span class="category-media"><img src="${c.image}" alt="${esc(c.name)}" loading="lazy" decoding="async"></span>
      <span class="category-name">${esc(c.name)}</span>
      <span class="category-arrow">${icon("arrowUpRight")}</span>
    </a>`).join("");
    hydrateIcons(cats);
  }

  const featured = $("#featured-grid");
  if (featured) {
    featured.innerHTML = PRODUCTS.filter(p => p.featured).slice(0, 4).map((p, i) => productCard(p, i)).join("");
    hydrateIcons(featured);
  }
}

/* ---------- wishlist (local, demo) ---------- */
function initWishlist() {
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-wish]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.dataset.wish;
    const saved = safeStore.get("strandsbymo_wishlist", []);
    const has = saved.includes(id);
    const next = has ? saved.filter(x => x !== id) : [...saved, id];
    safeStore.set("strandsbymo_wishlist", next);
    btn.classList.toggle("saved", !has);
    showToast(has ? "Removed from saved looks" : "Saved to your looks", "info");
  });
  const saved = safeStore.get("strandsbymo_wishlist", []);
  $$("[data-wish]").forEach(b => { if (saved.includes(b.dataset.wish)) b.classList.add("saved"); });
}

/* ---------- shop page ---------- */
const PRICE_OPTIONS = [
  { value: "all", label: "All prices", match: () => true },
  { value: "under-20", label: "Under £20", match: p => p.price < 20 },
  { value: "20-30", label: "£20 – £30", match: p => p.price >= 20 && p.price < 30 },
  { value: "30-40", label: "£30 – £40", match: p => p.price >= 30 && p.price <= 40 },
  { value: "over-40", label: "Over £40", match: p => p.price > 40 }
];
const TYPES = ["Straight", "Wavy", "Curly", "Braided", "Coily"];
const LENGTHS = [
  { value: "Medium", label: 'Medium (14"–20")' },
  { value: "Long", label: 'Long (22"–30")' }
];
const PAGE_SIZE = 9;

const shopState = {
  q: "",
  categories: [],
  price: "all",
  types: [],
  lengths: [],
  sort: "featured",
  visible: PAGE_SIZE,
  ready: false
};

function shopCategoryCount(slug) {
  return PRODUCTS.filter(p => p.categorySlug === slug).length;
}

function renderFilterPanel() {
  const panel = $("#filter-panel");
  if (!panel) return;
  panel.innerHTML = `
    <div class="filter-head">
      <h2>${icon("sliders")} Filters</h2>
      <button class="clear-filters" type="button" data-clear-filters>Clear all</button>
      <button class="icon-btn filter-close" type="button" data-close-filters aria-label="Close filters">${icon("x")}</button>
    </div>

    <div class="filter-block">
      <label class="filter-search-label" for="filter-search">Search products</label>
      <div class="filter-search">
        ${icon("search")}
        <input id="filter-search" type="search" placeholder="Search hair..." autocomplete="off">
      </div>
    </div>

    <div class="filter-block">
      <h3 class="filter-title">Category</h3>
      <div class="filter-options">
        ${CATEGORIES.map(c => `<label class="check-row">
          <input type="checkbox" data-filter="category" value="${c.slug}">
          <span class="check-box">${icon("check")}</span>
          <span class="check-label">${esc(c.name)}</span>
          <span class="filter-count">${shopCategoryCount(c.slug)}</span>
        </label>`).join("")}
      </div>
    </div>

    <div class="filter-block">
      <h3 class="filter-title">Price range</h3>
      <div class="filter-options">
        ${PRICE_OPTIONS.map(o => `<label class="radio-row">
          <input type="radio" name="price" data-filter="price" value="${o.value}" ${o.value === "all" ? "checked" : ""}>
          <span class="radio-dot"></span>
          <span class="check-label">${o.label}</span>
        </label>`).join("")}
      </div>
    </div>

    <div class="filter-block">
      <h3 class="filter-title">Hair type</h3>
      <div class="filter-options">
        ${TYPES.map(t => `<label class="check-row">
          <input type="checkbox" data-filter="type" value="${t}">
          <span class="check-box">${icon("check")}</span>
          <span class="check-label">${t}</span>
        </label>`).join("")}
      </div>
    </div>

    <div class="filter-block">
      <h3 class="filter-title">Hair length</h3>
      <div class="filter-options">
        ${LENGTHS.map(l => `<label class="check-row">
          <input type="checkbox" data-filter="length" value="${l.value}">
          <span class="check-box">${icon("check")}</span>
          <span class="check-label">${l.label}</span>
        </label>`).join("")}
      </div>
    </div>

    <div class="filter-trust">
      <span>${icon("shield")} Authentic human hair</span>
      <span>${icon("truck")} Free delivery over ${money(FREE_SHIPPING)}</span>
    </div>`;
  hydrateIcons(panel);
}

function matchFilters(p) {
  if (shopState.q) {
    const hay = [p.name, p.category, p.type, p.short, p.colors.join(" ")].join(" ").toLowerCase();
    if (!hay.includes(shopState.q.toLowerCase())) return false;
  }
  if (shopState.categories.length && !shopState.categories.includes(p.categorySlug)) return false;
  const priceOpt = PRICE_OPTIONS.find(o => o.value === shopState.price) || PRICE_OPTIONS[0];
  if (!priceOpt.match(p)) return false;
  if (shopState.types.length && !shopState.types.includes(p.type)) return false;
  if (shopState.lengths.length && !shopState.lengths.includes(p.lengthGroup)) return false;
  return true;
}

function sortedProducts(list) {
  const copy = [...list];
  switch (shopState.sort) {
    case "price-asc": return copy.sort((a, b) => a.price - b.price);
    case "price-desc": return copy.sort((a, b) => b.price - a.price);
    case "rating": return copy.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "best": return copy.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0) || b.reviews - a.reviews);
    case "newest": return copy.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    default: return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviews - a.reviews);
  }
}

function activeChips() {
  const chips = [];
  if (shopState.q) chips.push({ label: `“${shopState.q}”`, type: "q" });
  shopState.categories.forEach(slug => {
    const c = CATEGORIES.find(x => x.slug === slug);
    if (c) chips.push({ label: c.name, type: "category", value: slug });
  });
  if (shopState.price !== "all") {
    const o = PRICE_OPTIONS.find(x => x.value === shopState.price);
    if (o) chips.push({ label: o.label, type: "price", value: shopState.price });
  }
  shopState.types.forEach(t => chips.push({ label: t, type: "type", value: t }));
  shopState.lengths.forEach(l => {
    const opt = LENGTHS.find(x => x.value === l);
    if (opt) chips.push({ label: opt.label, type: "length", value: l });
  });
  return chips;
}

function syncShopURL() {
  if (!location.pathname.endsWith("shop.html")) return;
  const params = new URLSearchParams();
  if (shopState.q) params.set("q", shopState.q);
  if (shopState.categories.length) params.set("category", shopState.categories.join(","));
  if (shopState.price !== "all") params.set("price", shopState.price);
  if (shopState.types.length) params.set("type", shopState.types.join(","));
  if (shopState.lengths.length) params.set("length", shopState.lengths.join(","));
  if (shopState.sort !== "featured") params.set("sort", shopState.sort);
  const qs = params.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

function renderShop() {
  const grid = $("#shop-grid");
  if (!grid) return;
  const filtered = sortedProducts(PRODUCTS.filter(matchFilters));
  const shown = filtered.slice(0, shopState.visible);

  const countEl = $("#shop-count");
  if (countEl) {
    countEl.innerHTML = filtered.length
      ? `Showing <strong>${shown.length}</strong> of <strong>${filtered.length}</strong> product${filtered.length > 1 ? "s" : ""}`
      : `No products found`;
  }

  const chipsEl = $("#shop-chips");
  if (chipsEl) {
    const chips = activeChips();
    chipsEl.innerHTML = chips.length
      ? chips.map(c => `<button class="chip" type="button" data-chip-type="${c.type}" data-chip-value="${esc(c.value || "")}">${esc(c.label)} ${icon("x")}</button>`).join("") +
        `<button class="chip-clear" type="button" data-clear-filters>Clear all</button>`
      : "";
    hydrateIcons(chipsEl);
  }

  if (!filtered.length) {
    grid.classList.remove("is-loading");
    grid.innerHTML = `<div class="shop-empty">
      <span class="empty-icon">${icon("search")}</span>
      <h3>No hair found — yet</h3>
      <p>Try adjusting your filters or search for something else. Your perfect strand is waiting.</p>
      <button class="btn btn-pink" type="button" data-clear-filters>Clear all filters</button>
    </div>`;
    hydrateIcons(grid);
  } else {
    grid.classList.remove("is-loading");
    grid.innerHTML = shown.map((p, i) => productCard(p, i)).join("");
    hydrateIcons(grid);
    initVisibleWishStates(grid);
  }

  const more = $("#load-more");
  if (more) {
    const left = filtered.length - shown.length;
    more.hidden = left <= 0;
    more.innerHTML = `Load More ${icon("chevronDown")} <span>${left} remaining</span>`;
    hydrateIcons(more);
  }

  syncShopURL();
}

function initVisibleWishStates(root) {
  const saved = safeStore.get("strandsbymo_wishlist", []);
  $$("[data-wish]", root).forEach(b => b.classList.toggle("saved", saved.includes(b.dataset.wish)));
}

function showShopSkeletons() {
  const grid = $("#shop-grid");
  if (!grid) return;
  grid.classList.add("is-loading");
  grid.innerHTML = Array.from({ length: 6 }, skeletonCard).join("");
}

function setCheckboxesFromState() {
  $$('[data-filter="category"]').forEach(cb => { cb.checked = shopState.categories.includes(cb.value); });
  $$('[data-filter="type"]').forEach(cb => { cb.checked = shopState.types.includes(cb.value); });
  $$('[data-filter="length"]').forEach(cb => { cb.checked = shopState.lengths.includes(cb.value); });
  $$('[data-filter="price"]').forEach(r => { r.checked = r.value === shopState.price; });
  const fs = $("#filter-search");
  if (fs) fs.value = shopState.q;
  const ss = $("#shop-search");
  if (ss) ss.value = shopState.q;
  const sort = $("#sort-select");
  if (sort) sort.value = shopState.sort;
}

function resetShop(keepQuery = false) {
  if (!keepQuery) shopState.q = "";
  shopState.categories = [];
  shopState.price = "all";
  shopState.types = [];
  shopState.lengths = [];
  shopState.sort = "featured";
  shopState.visible = PAGE_SIZE;
  setCheckboxesFromState();
  const sort = $("#sort-select");
  if (sort) sort.value = "featured";
  renderShop();
}

function toggleArray(arr, val) {
  const i = arr.indexOf(val);
  if (i > -1) arr.splice(i, 1);
  else arr.push(val);
}

function initShop() {
  if (!$("#shop-grid")) return;
  renderFilterPanel();

  const params = new URLSearchParams(location.search);
  shopState.q = (params.get("q") || "").trim();
  shopState.categories = (params.get("category") || "").split(",").filter(s => CATEGORIES.some(c => c.slug === s));
  shopState.price = PRICE_OPTIONS.some(o => o.value === params.get("price")) ? params.get("price") : "all";
  shopState.types = (params.get("type") || "").split(",").filter(t => TYPES.includes(t));
  shopState.lengths = (params.get("length") || "").split(",").filter(l => LENGTHS.some(x => x.value === l));
  shopState.sort = (params.get("sort") || "featured");
  setCheckboxesFromState();

  showShopSkeletons();
  setTimeout(() => {
    shopState.ready = true;
    renderShop();
  }, 550);

  /* filter changes */
  const panel = $("#filter-panel");
  panel.addEventListener("change", e => {
    const el = e.target.closest("[data-filter]");
    if (!el) return;
    const kind = el.dataset.filter;
    if (kind === "category") toggleArray(shopState.categories, el.value);
    if (kind === "type") toggleArray(shopState.types, el.value);
    if (kind === "length") toggleArray(shopState.lengths, el.value);
    if (kind === "price") shopState.price = el.value;
    shopState.visible = PAGE_SIZE;
    renderShop();
  });

  panel.addEventListener("input", debounce(e => {
    if (e.target.id !== "filter-search") return;
    shopState.q = e.target.value.trim();
    shopState.visible = PAGE_SIZE;
    const ss = $("#shop-search");
    if (ss) ss.value = e.target.value;
    renderShop();
  }, 160));

  const shopSearch = $("#shop-search");
  if (shopSearch) {
    shopSearch.addEventListener("input", debounce(e => {
      shopState.q = e.target.value.trim();
      shopState.visible = PAGE_SIZE;
      const fs = $("#filter-search");
      if (fs) fs.value = e.target.value;
      renderShop();
    }, 160));
  }

  const sort = $("#sort-select");
  if (sort) sort.addEventListener("change", () => {
    shopState.sort = sort.value;
    renderShop();
  });

  document.addEventListener("click", e => {
    if (e.target.closest("#load-more")) {
      shopState.visible += PAGE_SIZE;
      renderShop();
    }
    if (e.target.closest("[data-clear-filters]")) {
      resetShop();
      if (window.innerWidth <= 900) closeFilters();
    }
    const chip = e.target.closest(".chip");
    if (chip) {
      const type = chip.dataset.chipType;
      const val = chip.dataset.chipValue;
      if (type === "q") shopState.q = "";
      if (type === "category") toggleArray(shopState.categories, val);
      if (type === "type") toggleArray(shopState.types, val);
      if (type === "length") toggleArray(shopState.lengths, val);
      if (type === "price") shopState.price = "all";
      shopState.visible = PAGE_SIZE;
      setCheckboxesFromState();
      renderShop();
    }
    if (e.target.closest("[data-open-filters]")) openFilters();
    if (e.target.closest("[data-close-filters]")) closeFilters();
  });

  $$(".filter-overlay, #filter-overlay").forEach(el => el.addEventListener("click", closeFilters));
}

function openFilters() {
  const d = $("#filter-drawer");
  const o = $("#filter-overlay");
  if (!d) return;
  closeLayers();
  d.classList.add("open");
  d.setAttribute("aria-hidden", "false");
  if (o) o.classList.add("show");
  document.body.classList.add("no-scroll");
}
function closeFilters() {
  const d = $("#filter-drawer");
  if (d) { d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); }
  closeLayers();
}

function initProductCardNavigation() {
  document.addEventListener("click", e => {
    if (e.target.closest("a, button, input, select, textarea, label")) return;
    const card = e.target.closest(".product-card[data-card-id]");
    if (card) window.location.href = `product.html?id=${encodeURIComponent(card.dataset.cardId)}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHome();
  initShop();
  initWishlist();
  initProductCardNavigation();
});
