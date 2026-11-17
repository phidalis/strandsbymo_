/* ============================================================
   Strandsbymo_ — checkout
   ============================================================ */

function checkoutItemHTML(item) {
  const p = PRODUCTS.find(x => x.id === item.id);
  if (!p) return "";
  return `<div class="checkout-item">
    <span class="checkout-item-img"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"><i>${item.qty}</i></span>
    <div class="checkout-item-info">
      <strong>${esc(p.name)}</strong>
      <span>${esc(item.length)} · ${esc(item.color)}</span>
    </div>
    <strong class="checkout-item-price">${money(p.price * item.qty)}</strong>
  </div>`;
}

function renderCheckout() {
  const items = $("#checkout-items");
  if (!items) return;
  const layout = $("#checkout-layout");
  const empty = $("#checkout-empty");

  if (!cart.length) {
    if (layout) layout.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }
  if (layout) layout.hidden = false;
  if (empty) empty.hidden = true;

  items.innerHTML = cart.map(checkoutItemHTML).join("");
  const sub = cartSubtotal();
  const fee = deliveryFee();
  const total = cartTotal();
  const sc = $("#checkout-subtotal");
  const dc = $("#checkout-delivery");
  const tc = $("#checkout-total");
  const cc = $("#checkout-count");
  if (sc) sc.textContent = money(sub);
  if (dc) dc.innerHTML = fee === 0 ? '<span class="free-tag">FREE</span>' : money(fee);
  if (tc) tc.textContent = money(total);
  if (cc) cc.textContent = `${cartCount()} item${cartCount() > 1 ? "s" : ""}`;
}

function clearFieldErrors(form) {
  $$(".field.invalid", form).forEach(f => f.classList.remove("invalid"));
  $$(".field-msg", form).forEach(m => m.remove());
}

function fieldError(input, message, focus = false) {
  const field = input.closest(".field") || input.parentElement;
  if (!field) return;
  field.classList.add("invalid");
  let msg = field.querySelector(".field-msg");
  if (!msg) {
    msg = document.createElement("p");
    msg.className = "field-msg";
    field.appendChild(msg);
  }
  msg.textContent = message;
  if (focus) { input.focus(); input.scrollIntoView({ behavior: "smooth", block: "center" }); }
}

function initCheckout() {
  const form = $("#checkout-form");
  if (!form) return;

  renderCheckout();

  const radios = $$('input[name="payment"]', form);
  const panels = $$(".pay-panel", form);
  const syncPayment = () => {
    const val = (radios.find(r => r.checked) || radios[0]).value;
    panels.forEach(p => p.hidden = p.dataset.payment !== val);
  };
  radios.forEach(r => r.addEventListener("change", syncPayment));
  syncPayment();

  /* input formatting + live error clearing */
  form.addEventListener("input", e => {
    const t = e.target;
    const field = t.closest(".field");
    if (field && field.classList.contains("invalid")) {
      field.classList.remove("invalid");
      const msg = field.querySelector(".field-msg");
      if (msg) msg.remove();
    }
    if (t.name === "cardNumber") {
      const digits = t.value.replace(/\D/g, "").slice(0, 16);
      t.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
    if (t.name === "cardExpiry") {
      let d = t.value.replace(/\D/g, "").slice(0, 4);
      if (d.length > 2) d = d.slice(0, 2) + "/" + d.slice(2);
      t.value = d;
    }
    if (t.name === "cardCvv") t.value = t.value.replace(/\D/g, "").slice(0, 4);
    if (t.name === "postcode") t.value = t.value.toUpperCase();
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    clearFieldErrors(form);

    const get = name => form.elements[name];
    const fullName = get("fullName");
    const email = get("email");
    const phone = get("phone");
    const address = get("address");
    const postcode = get("postcode");
    const county = get("county");
    const town = get("town");
    const payment = (radios.find(r => r.checked) || radios[0]).value;

    let firstInvalid = null;
    const fail = (input, msg) => {
      fieldError(input, msg, !firstInvalid);
      if (!firstInvalid) firstInvalid = input;
    };

    if (!fullName.value.trim() || fullName.value.trim().length < 3) fail(fullName, "Please enter your full name.");
    if (!emailOK(email.value)) fail(email, "Enter a valid email address.");
    if (!phoneOK(phone.value)) fail(phone, "Enter a valid UK phone number, e.g. 07345 368680.");
    if (!address.value.trim() || address.value.trim().length < 5) fail(address, "Please enter your delivery address.");
    if (!town.value.trim()) fail(town, "Please enter your town or city.");
    if (!postcodeOK(postcode.value)) fail(postcode, "Enter a valid UK postcode, e.g. SW1A 1AA.");

    if (payment === "card") {
      const num = get("cardNumber");
      const exp = get("cardExpiry");
      const cvv = get("cardCvv");
      const cardName = get("cardName");
      if (!cardName.value.trim()) fail(cardName, "Enter the name on your card.");
      if (num.value.replace(/\s/g, "").length !== 16) fail(num, "Enter a valid 16-digit card number.");
      if (!/^\d{2}\/\d{2}$/.test(exp.value)) fail(exp, "Use MM/YY format.");
      if (cvv.value.length < 3) fail(cvv, "Enter a valid CVV.");
    }

    if (firstInvalid) {
      showToast("Please check the highlighted fields", "error");
      return;
    }

    const payLabels = { card: "Card", paypal: "PayPal", applepay: "Apple Pay" };
    const order = {
      number: "SBM-" + String(Date.now()).slice(-6),
      name: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      address: address.value.trim(),
      postcode: postcode.value.trim().toUpperCase(),
      county: county ? county.value.trim() : "",
      town: town.value.trim(),
      notes: get("notes").value.trim(),
      payment: payLabels[payment],
      items: cart.map(i => {
        const p = PRODUCTS.find(x => x.id === i.id);
        return { name: p ? p.name : i.id, qty: i.qty, length: i.length, color: i.color, price: p ? p.price : 0 };
      }),
      subtotal: cartSubtotal(),
      delivery: deliveryFee(),
      total: cartTotal(),
      date: new Date().toISOString()
    };

    const btn = $("#place-order");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${icon("loader", "spin")} Processing…`;

    setTimeout(() => {
      const orders = safeStore.get("strandsbymo_orders", []);
      orders.unshift(order);
      safeStore.set("strandsbymo_orders", orders);
      safeStore.set("strandsbymo_user_v1", safeStore.get("strandsbymo_user_v1", null) || { name: order.name, email: order.email });

      cart = [];
      persistCart();

      form.hidden = true;
      const layout = $("#checkout-layout");
      if (layout) layout.hidden = true;
      const success = $("#order-success");
      if (success) {
        success.hidden = false;
        success.innerHTML = `<div class="success-card">
          <span class="success-icon">${icon("checkCircle")}</span>
          <p class="eyebrow">Order confirmed</p>
          <h1>Thank you, ${esc(order.name.split(" ")[0])}!</h1>
          <p class="success-sub">Your Strandsbymo_ order has been received. We will send an email confirmation shortly.</p>
          <div class="success-order">
            <div><span>Order number</span><strong>${esc(order.number)}</strong></div>
            <div><span>Payment method</span><strong>${esc(order.payment)}</strong></div>
            <div><span>Items</span><strong>${order.items.reduce((n, i) => n + i.qty, 0)}</strong></div>
            <div><span>Total</span><strong>${money(order.total)}</strong></div>
            <div><span>Delivering to</span><strong>${esc(order.town)}${order.county ? ", " + esc(order.county) : ""}, ${esc(order.postcode)}</strong></div>
            <div><span>Estimated delivery</span><strong>${new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })}</strong></div>
          </div>
          <div class="success-note">${icon("info")} This is a front-end demonstration. No payment has been processed and no funds were taken.</div>
          <div class="success-actions">
            <a class="btn btn-pink" href="shop.html">Continue Shopping</a>
            <a class="btn btn-ghost" href="index.html">Back to Home</a>
          </div>
        </div>`;
        hydrateIcons(success);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      showToast("Order placed successfully", "success");
      btn.disabled = false;
      btn.innerHTML = original;
    }, 1300);
  });
}

document.addEventListener("DOMContentLoaded", initCheckout);
