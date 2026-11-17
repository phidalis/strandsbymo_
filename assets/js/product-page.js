/* ============================================================
   Strandsbymo_ — product details page
   ============================================================ */

function seedReviews(product) {
  return [
    { name: "Amelia R.", rating: 5, date: "2 weeks ago", text: `Honestly the best ${product.category.toLowerCase()} I have ordered online. True to length, soft, and the packaging was gorgeous.` },
    { name: "Grace T.", rating: 5, date: "1 month ago", text: "Delivery was so fast and the quality is unreal. Minimal shedding after washing — I will definitely reorder." },
    { name: "Chloe B.", rating: 4, date: "1 month ago", text: "Beautiful hair and great customer service. Took one star off only because I wish there were more colour options." }
  ];
}

function getStoredReviews(productId) {
  return safeStore.get(`strandsbymo_reviews_${productId}`, []);
}

function getReviews(product) {
  return [...getStoredReviews(product.id), ...seedReviews(product)];
}

function reviewStars(n) {
  return stars(n);
}

function renderReviews(product) {
  const all = getReviews(product);
  const avg = (all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1);
  const bars = [
    { n: 5, pct: 82 }, { n: 4, pct: 12 }, { n: 3, pct: 4 }, { n: 2, pct: 1 }, { n: 1, pct: 1 }
  ];
  return `<section class="reviews-section" id="reviews">
    <div class="container">
      <div class="reviews-head">
        <div>
          <p class="eyebrow">Loved by our clients</p>
          <h2>Reviews &amp; Ratings</h2>
        </div>
        <button class="btn btn-ghost" type="button" id="write-review-btn">${icon("sparkles")} Write a review</button>
      </div>
      <div class="reviews-layout">
        <aside class="review-summary">
          <div class="review-score">${avg}<span>/5</span></div>
          ${stars(avg)}
          <p>Based on ${product.reviewsLabel} verified reviews</p>
          <div class="review-bars">
            ${bars.map(b => `<div class="review-bar-row"><span>${b.n} star</span><div class="review-bar"><i style="width:${b.pct}%"></i></div><span>${b.pct}%</span></div>`).join("")}
          </div>
          <div class="review-verified">${icon("shield")} All reviews are from verified purchases</div>
        </aside>
        <div class="review-list-wrap">
          <div class="review-list" id="review-list">
            ${all.map(r => `<article class="review-card">
              <div class="review-top">
                <span class="review-avatar">${esc(r.name.charAt(0))}</span>
                <div><strong>${esc(r.name)}</strong><span class="review-date">${esc(r.date)} · Verified purchase</span></div>
                ${reviewStars(r.rating)}
              </div>
              <p>${esc(r.text)}</p>
            </article>`).join("")}
          </div>
          <form class="review-form" id="review-form" hidden novalidate>
            <h3>Share your experience</h3>
            <div class="field-row">
              <div class="field">
                <label for="review-name">Your name</label>
                <input id="review-name" name="name" type="text" placeholder="e.g. Amelia R." required>
              </div>
              <div class="field">
                <label for="review-rating">Rating</label>
                <select id="review-rating" name="rating" required>
                  <option value="5">5 — Loved it</option>
                  <option value="4">4 — Very good</option>
                  <option value="3">3 — Good</option>
                  <option value="2">2 — Fair</option>
                  <option value="1">1 — Not for me</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label for="review-text">Your review</label>
              <textarea id="review-text" name="text" rows="4" placeholder="Tell us about the quality, length and install..." required></textarea>
            </div>
            <div class="review-form-actions">
              <button class="btn btn-pink" type="submit">Submit Review</button>
              <button class="btn btn-ghost" type="button" id="cancel-review">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>`;
}

function initProductPage() {
  const root = $("#product-root");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  document.title = `${product.name} | Strandsbymo_`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", product.short);

  let selectedColor = product.colors[0];
  let selectedLength = product.lengths[0];
  let qty = 1;

  const discount = Math.round((1 - product.price / product.oldPrice) * 100);

  root.innerHTML = `
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a> ${icon("chevronRight")}
        <a href="shop.html">Shop</a> ${icon("chevronRight")}
        <a href="shop.html?category=${product.categorySlug}">${esc(product.category)}</a> ${icon("chevronRight")}
        <span aria-current="page">${esc(product.name)}</span>
      </nav>

      <div class="product-layout">
        <div class="product-gallery">
          <div class="gallery-main">
            ${product.badge ? `<span class="product-badge ${badgeClass(product.badge)}">${esc(product.badge)}</span>` : ""}
            <img id="gallery-main-img" src="${product.image}" alt="${esc(product.name)}">
            <span class="gallery-zoom-hint">${icon("eye")} Hover to zoom</span>
          </div>
          <div class="gallery-thumbs" role="group" aria-label="Product images">
            ${product.images.map((src, i) => `<button class="gallery-thumb ${i === 0 ? "active" : ""}" type="button" data-thumb="${src}" aria-label="View image ${i + 1}">
              <img src="${src}" alt="${esc(product.name)} — image ${i + 1}" loading="lazy">
            </button>`).join("")}
          </div>
          <div class="gallery-note">${icon("sparkles")} Photos are of the exact hair quality you will receive</div>
        </div>

        <div class="product-info">
          <div class="product-meta-row">
            <a class="product-cat-link" href="shop.html?category=${product.categorySlug}">${esc(product.category)}</a>
            <span class="stock-pill">${icon("checkCircle")} In stock</span>
          </div>
          <h1 class="product-title">${esc(product.name)}</h1>
          <div class="product-rating-row">
            ${stars(product.rating)}
            <span class="rating-num">${product.rating}</span>
            <a href="#reviews" class="review-link">(${product.reviewsLabel} reviews)</a>
            <span class="sold-tag">${icon("bag")} 500+ sold</span>
          </div>
          <div class="product-price-row">
            <strong class="product-price-now">${money(product.price)}</strong>
            <s>${money(product.oldPrice)}</s>
            <span class="save-pill">Save ${discount}%</span>
          </div>
          <p class="product-short">${esc(product.short)}</p>

          <div class="option-group">
            <div class="option-head"><span>Colour</span><strong id="selected-color">${esc(selectedColor)}</strong></div>
            <div class="option-pills" id="color-options">
              ${product.colors.map((c, i) => `<button class="option-pill ${i === 0 ? "active" : ""}" type="button" data-color="${esc(c)}">${esc(c)}</button>`).join("")}
            </div>
          </div>

          <div class="option-group">
            <div class="option-head"><span>Length / Size</span><strong id="selected-length">${esc(selectedLength)}</strong></div>
            <div class="option-pills" id="length-options">
              ${product.lengths.map((l, i) => `<button class="option-pill ${i === 0 ? "active" : ""}" type="button" data-length="${esc(l)}">${esc(l)}</button>`).join("")}
            </div>
            <a href="#" class="size-guide" id="size-guide">${icon("scissors")} Not sure which length? Read our guide</a>
          </div>

          <div class="purchase-row">
            <div class="qty-stepper">
              <button type="button" data-prod-qty="down" aria-label="Decrease quantity">${icon("minus")}</button>
              <span id="product-qty" aria-live="polite">1</span>
              <button type="button" data-prod-qty="up" aria-label="Increase quantity">${icon("plus")}</button>
            </div>
            <button class="btn btn-pink btn-lg" type="button" id="add-to-cart-btn">${icon("bag")} Add to Cart</button>
          </div>
          <button class="btn btn-dark btn-lg btn-block" type="button" id="buy-now">Buy Now ${icon("arrowRight")}</button>

          <div class="assurance-grid">
            <div class="assurance">${icon("truck")}<span><strong>Fast delivery</strong>1–3 days UK-wide</span></div>
            <div class="assurance">${icon("refresh")}<span><strong>Easy returns</strong>7-day return policy</span></div>
            <div class="assurance">${icon("shield")}<span><strong>Secure checkout</strong>Card, PayPal &amp; Apple Pay</span></div>
          </div>

          <div class="product-accordion">
            <details open>
              <summary>Product description <span>${icon("chevronDown")}</span></summary>
              <p>${esc(product.description)}</p>
            </details>
            <details>
              <summary>Hair specifications <span>${icon("chevronDown")}</span></summary>
              <div class="spec-table">
                ${product.specs.map(([k, v]) => `<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("")}
              </div>
            </details>
            <details>
              <summary>Delivery &amp; returns <span>${icon("chevronDown")}</span></summary>
              <p>${esc(product.delivery)}</p>
              <p>Free delivery on orders over ${money(FREE_SHIPPING)}. Unopened items can be returned within 7 days — see our returns policy for details.</p>
            </details>
          </div>

          <div class="delivery-estimate">
            ${icon("clock")}
            <div><strong>Order today, receive by <span id="delivery-date"></span></strong><p>Order within the next 3 hours for same-day dispatch.</p></div>
          </div>
        </div>
      </div>
    </div>

    ${renderReviews(product)}

    <section class="section related-section">
      <div class="container">
        <div class="section-head">
          <div class="section-title-wrap"><span class="title-bar"></span><h2>You May Also Love</h2></div>
          <a class="link-arrow" href="shop.html?category=${product.categorySlug}">View category ${icon("arrowRight")}</a>
        </div>
        <div class="product-grid" id="related-grid">
          ${relatedProducts(product).map((p, i) => productCard(p, i)).join("")}
        </div>
      </div>
    </section>`;

  hydrateIcons(root);
  if (typeof initVisibleWishStates === "function") initVisibleWishStates(root);

  /* delivery estimate date */
  const now = new Date();
  const eta = new Date(now.getTime() + 2 * 86400000);
  const dateEl = $("#delivery-date");
  if (dateEl) dateEl.textContent = eta.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });

  /* gallery */
  $$(".gallery-thumb", root).forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".gallery-thumb", root).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const main = $("#gallery-main-img");
      if (main) {
        main.style.opacity = "0";
        setTimeout(() => { main.src = btn.dataset.thumb; main.style.opacity = "1"; }, 120);
      }
    });
  });

  /* options */
  $$("#color-options .option-pill", root).forEach(btn => {
    btn.addEventListener("click", () => {
      $$("#color-options .option-pill", root).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedColor = btn.dataset.color;
      $("#selected-color").textContent = selectedColor;
    });
  });
  $$("#length-options .option-pill", root).forEach(btn => {
    btn.addEventListener("click", () => {
      $$("#length-options .option-pill", root).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedLength = btn.dataset.length;
      $("#selected-length").textContent = selectedLength;
    });
  });

  /* size guide toast */
  const sizeGuide = $("#size-guide");
  if (sizeGuide) sizeGuide.addEventListener("click", e => {
    e.preventDefault();
    showToast("Length guide: 16\" shoulder, 20\" chest, 24\" mid-back, 28\" waist. Need help? Chat with us.", "info");
  });

  /* quantity */
  $$("[data-prod-qty]", root).forEach(btn => {
    btn.addEventListener("click", () => {
      qty = Math.max(1, Math.min(10, qty + (btn.dataset.prodQty === "up" ? 1 : -1)));
      $("#product-qty").textContent = qty;
    });
  });

  const addBtn = $("#add-to-cart-btn");
  if (addBtn) addBtn.addEventListener("click", () => {
    addToCart(product.id, { length: selectedLength, color: selectedColor, qty });
  });

  const buyBtn = $("#buy-now");
  if (buyBtn) buyBtn.addEventListener("click", () => {
    addToCart(product.id, { length: selectedLength, color: selectedColor, qty });
    setTimeout(() => { window.location.href = "checkout.html"; }, 350);
  });

  const saved = safeStore.get("strandsbymo_wishlist", []);

  /* reviews */
  const list = $("#review-list");
  const form = $("#review-form");
  const writeBtn = $("#write-review-btn");
  const cancelBtn = $("#cancel-review");

  if (writeBtn) writeBtn.addEventListener("click", () => {
    if (!form) return;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => $("#review-name") && $("#review-name").focus(), 400);
  });
  if (cancelBtn) cancelBtn.addEventListener("click", () => { if (form) form.hidden = true; });
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#review-name").value.trim();
    const rating = parseInt($("#review-rating").value, 10);
    const text = $("#review-text").value.trim();
    if (name.length < 2) { showToast("Please enter your name", "error"); return; }
    if (text.length < 10) { showToast("Please write a little more in your review", "error"); return; }
    const newReview = { name, rating, date: "Just now", text };
    const stored = getStoredReviews(product.id);
    stored.unshift(newReview);
    safeStore.set(`strandsbymo_reviews_${product.id}`, stored);
    if (list) {
      list.insertAdjacentHTML("afterbegin", `<article class="review-card">
        <div class="review-top">
          <span class="review-avatar">${esc(name.charAt(0))}</span>
          <div><strong>${esc(name)}</strong><span class="review-date">Just now · Website review</span></div>
          ${reviewStars(rating)}
        </div>
        <p>${esc(text)}</p>
      </article>`);
      hydrateIcons(list);
    }
    form.reset();
    form.hidden = true;
    showToast("Thank you! Your review has been added.", "success");
  });

  if (saved.includes(product.id)) {
    const wishBtn = document.querySelector(".product-wish");
    if (wishBtn) wishBtn.classList.add("saved");
  }
}

document.addEventListener("DOMContentLoaded", initProductPage);
