/* ============================================================
   Strandsbymo_ — blog & contact pages
   ============================================================ */

function blogCard(post, featured = false) {
  return `<article class="blog-card ${featured ? "blog-featured" : ""}">
    <div class="blog-media">
      <img src="${post.image}" alt="${esc(post.title)}" loading="lazy">
      <span class="blog-tag">${esc(post.tag)}</span>
    </div>
    <div class="blog-body">
      <div class="blog-meta"><span>${esc(post.date)}</span><span class="dot"></span><span>${esc(post.read)}</span></div>
      <h3><a href="#" data-article="${post.id}">${esc(post.title)}</a></h3>
      <p>${esc(post.excerpt)}</p>
      <button class="link-arrow" type="button" data-article="${post.id}">Read More ${icon("arrowRight")}</button>
    </div>
  </article>`;
}

function initBlog() {
  const grid = $("#blog-grid");
  const featured = $("#blog-featured");
  if (!grid && !featured) return;

  if (featured && BLOG_POSTS[0]) featured.innerHTML = blogCard(BLOG_POSTS[0], true);
  if (grid) grid.innerHTML = BLOG_POSTS.slice(1).map(p => blogCard(p)).join("");
  hydrateIcons(featured || document);
  hydrateIcons(grid || document);

  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-article]");
    if (!trigger) return;
    e.preventDefault();
    openArticle(trigger.dataset.article);
  });
}

function openArticle(id) {
  const post = BLOG_POSTS.find(p => p.id === id);
  if (!post) return;
  let modal = $("#article-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "article-modal";
    modal.className = "modal article-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal);
    modal.addEventListener("click", e => {
      if (e.target === modal || e.target.closest("[data-close-modal]")) {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        closeLayers();
      }
    });
  }
  modal.innerHTML = `<div class="modal-card article-card">
    <button class="modal-x" type="button" data-close-modal aria-label="Close article">${icon("x")}</button>
    <div class="article-cover"><img src="${post.image}" alt="${esc(post.title)}"></div>
    <div class="article-content">
      <div class="blog-meta"><span class="blog-tag inline">${esc(post.tag)}</span><span>${esc(post.date)}</span><span class="dot"></span><span>${esc(post.read)}</span></div>
      <h1>${esc(post.title)}</h1>
      <p class="article-lede">${esc(post.excerpt)}</p>
      ${post.body.map(par => `<p>${esc(par)}</p>`).join("")}
      <div class="article-cta">
        <div><strong>Ready for your next look?</strong><p>Shop premium human hair, wigs and care essentials.</p></div>
        <a class="btn btn-pink" href="shop.html">Shop Strandsbymo_ ${icon("arrowRight")}</a>
      </div>
    </div>
  </div>`;
  hydrateIcons(modal);
  openLayer(modal);
  const card = modal.querySelector(".modal-card");
  if (card) card.scrollTop = 0;
}

/* ---------- contact ---------- */
function initContact() {
  const form = $("#contact-form");
  if (!form) return;

  const params = new URLSearchParams(location.search);
  const subject = params.get("subject");
  const subjectField = form.elements["subject"];
  if (subject && subjectField) {
    if (subjectField.tagName === "SELECT") {
      const match = Array.from(subjectField.options).find(o => o.value.toLowerCase() === subject.toLowerCase());
      if (match) subjectField.value = match.value;
    } else {
      subjectField.value = subject;
    }
  }

  form.addEventListener("input", e => {
    const field = e.target.closest(".field");
    if (field && field.classList.contains("invalid")) {
      field.classList.remove("invalid");
      const msg = field.querySelector(".field-msg");
      if (msg) msg.remove();
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    clearFieldErrors(form);

    const name = form.elements["name"];
    const email = form.elements["email"];
    const phone = form.elements["phone"];
    const subject = form.elements["subject"];
    const message = form.elements["message"];

    let ok = true;
    const fail = (input, msg) => {
      fieldError(input, msg, ok);
      ok = false;
    };

    if (!name.value.trim() || name.value.trim().length < 2) fail(name, "Please enter your full name.");
    if (!emailOK(email.value)) fail(email, "Enter a valid email address.");
    if (phone.value.trim() && !phoneOK(phone.value)) fail(phone, "Enter a valid phone number or leave it blank.");
    if (!subject.value) fail(subject, "Please choose a subject.");
    if (!message.value.trim() || message.value.trim().length < 10) fail(message, "Tell us a little more (at least 10 characters).");

    if (!ok) {
      showToast("Please check the highlighted fields", "error");
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${icon("loader", "spin")} Sending…`;

    setTimeout(() => {
      const messages = safeStore.get("strandsbymo_messages", []);
      messages.unshift({
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        subject: subject.value,
        message: message.value.trim(),
        date: new Date().toISOString()
      });
      safeStore.set("strandsbymo_messages", messages);

      btn.disabled = false;
      btn.innerHTML = original;
      form.reset();
      const success = $("#contact-success");
      if (success) {
        success.hidden = false;
        form.hidden = true;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showToast("Message sent — we'll reply within 24 hours", "success");
    }, 900);
  });

  const reset = $("#contact-reset");
  if (reset) reset.addEventListener("click", () => {
    const success = $("#contact-success");
    if (success) success.hidden = true;
    form.hidden = false;
    const first = form.querySelector("input, select, textarea");
    if (first) first.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initBlog();
  initContact();
});
