/**
 * Lógica de la tienda RECARGAS FAST.
 *
 * Flujo: elegir juego -> elegir paquete -> verificar ID de jugador (Free Fire y
 * Blood Strike) -> pagar por Nequi -> reportar el pago. Al reportar, el pedido
 * se guarda en la base de datos del sitio (/api/orders) y se abre WhatsApp con
 * el resumen listo para enviar.
 */
import { GAMES, NEQUI_NUMBER, WHATSAPP_NUMBER, money } from "./catalog.js";

const $ = (id) => document.getElementById(id);

const state = {
  game: "free-fire",
  selected: null,
  playerId: "",
  verified: false,
  order: null,
  receipt: null,
};

/* ------------------------------------------------------------------ utilidades */

const ID_PATTERN = /^\d{6,20}$/;

function showToast(text) {
  const toast = $("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function status(id, text, ok = false) {
  const element = $(id);
  element.textContent = text;
  element.className = "mt-3 text-sm " + (ok ? "status-ok" : "status-error");
}

function scrollToSection(id) {
  $(id).scrollIntoView({ behavior: "smooth", block: "start" });
}

/* --------------------------------------------- historial de IDs (localStorage) */

const HISTORY = {
  "free-fire": { suffix: "freefire", input: "player-id", container: "player-id-history" },
  "blood-strike": { suffix: "bloodstrike", input: "blood-player-id", container: "blood-player-id-history" },
};

function readIds(game) {
  try {
    const stored = JSON.parse(localStorage.getItem(`historialIds_${HISTORY[game].suffix}`) || "[]");
    return Array.isArray(stored) ? stored.filter((id) => typeof id === "string" && ID_PATTERN.test(id)) : [];
  } catch {
    return [];
  }
}

function renderIdHistory(game) {
  const { input, container } = HISTORY[game];
  const target = $(container);
  target.replaceChildren();
  readIds(game)
    .slice(0, 3)
    .forEach((id) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "soft focus-ring rounded-lg px-3 py-2 text-xs font-bold";
      button.textContent = id;
      button.addEventListener("click", () => {
        const field = $(input);
        field.value = id;
        field.dispatchEvent(new Event("input", { bubbles: true }));
      });
      target.appendChild(button);
    });
}

function saveId(game, value) {
  const id = String(value || "").trim();
  if (!ID_PATTERN.test(id)) return;
  const { suffix } = HISTORY[game];
  const ids = [id, ...readIds(game).filter((existing) => existing !== id)].slice(0, 3);
  try {
    localStorage.setItem(`ultimoId_${suffix}`, id);
    localStorage.setItem(`historialIds_${suffix}`, JSON.stringify(ids));
  } catch {
    /* almacenamiento no disponible (modo privado): no es crítico */
  }
  renderIdHistory(game);
}

function restoreIds() {
  Object.entries(HISTORY).forEach(([game, { suffix, input }]) => {
    let last = null;
    try {
      last = localStorage.getItem(`ultimoId_${suffix}`);
    } catch {
      last = null;
    }
    if (last) $(input).value = last;
    renderIdHistory(game);
  });
}

/* ------------------------------------------------------------ tarjetas de paquetes */

function popularTag() {
  return '<span class="roblox-popular-tag inline-block rounded-full px-2 py-1 text-[.6rem] font-extrabold tracking-[.08em]">POPULAR</span>';
}

function freeFireCard(pkg) {
  const card = document.createElement("article");
  card.className = "package-card rounded-2xl p-4 text-left";
  card.dataset.package = pkg.name;
  card.dataset.price = pkg.price;
  card.innerHTML = `
    <span class="product-thumb flex h-11 w-11 items-center justify-center rounded-xl text-xl">${pkg.icon}</span>
    <h4 class="mt-3 font-bold">${pkg.name}</h4>
    <p class="mt-1 font-extrabold text-[#00BFFF]">${money(pkg.price)}</p>
    <button class="primary focus-ring mt-4 w-full rounded-xl px-2 py-3 text-xs font-bold" type="button" style="background: rgb(34, 229, 255); color: rgb(10, 15, 42); font-weight: 800; font-size: 14px;">ELEGIR PAQUETE</button>`;
  card.querySelector("button").addEventListener("click", () => choosePackage(card));
  return card;
}

function robloxCard(pkg) {
  const card = document.createElement("article");
  card.className = `roblox-package package-card cursor-pointer rounded-2xl p-4 text-left${pkg.popular ? " roblox-popular" : ""}`;
  card.dataset.package = pkg.name;
  card.dataset.price = pkg.price;
  card.innerHTML = `
    ${pkg.popular ? popularTag() : ""}
    <span class="product-thumb flex h-11 w-11 items-center justify-center rounded-xl text-xl">${pkg.icon}</span>
    <h4 class="mt-3 font-bold">${pkg.name}</h4>
    <p class="mt-1 font-extrabold text-[#5BEDFE]">${money(pkg.price)}</p>
    <p class="mt-2 text-sm text-[#dce9ff]">Código de regalo por WhatsApp</p>`;
  card.addEventListener("click", () => choosePackage(card));
  return card;
}

function bloodCard(pkg) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = `blood-card package-card rounded-2xl p-4 text-left ${pkg.group}-card${pkg.popular ? " roblox-popular" : ""}`;
  card.dataset.package = pkg.name;
  card.dataset.price = pkg.price;
  card.innerHTML = `
    ${pkg.popular ? popularTag() : ""}
    <span class="block text-2xl">${pkg.icon}</span>
    <strong class="mt-3 block">${pkg.name}</strong>
    <span class="mt-1 block font-extrabold text-[#5BEDFE]">${money(pkg.price)}</span>
    <span class="mt-2 block text-sm text-[#dce9ff]">Llega directo a tu ID</span>`;
  card.addEventListener("click", () => choosePackage(card));
  return card;
}

function buildCatalog() {
  GAMES["free-fire"].packages.forEach((pkg) => $("free-fire-package-grid").appendChild(freeFireCard(pkg)));
  GAMES.roblox.packages.forEach((pkg) => $("roblox-package-grid").appendChild(robloxCard(pkg)));
  GAMES["blood-strike"].packages.forEach((pkg) => {
    const grid = pkg.group === "pass" ? $("blood-pass-grid") : $("blood-gold-grid");
    grid.appendChild(bloodCard(pkg));
  });
}

/* ------------------------------------------------------------------- selección */

function refreshSelection() {
  const selected = state.selected;
  const game = GAMES[state.game];

  if (!selected) {
    $("chosen-summary").textContent = "Elige un paquete para continuar.";
    $("selection-status").textContent = "Selecciona un paquete existente";
    $("pay-button").textContent = `PAGAR CON NEQUI ${NEQUI_NUMBER}`;
  } else {
    const idSuffix = game.requiresPlayerId && state.playerId ? ` - ID ${state.playerId}` : "";
    $("chosen-summary").textContent = `Elegiste ${game.name}: ${selected.name} - ${money(selected.price)}${idSuffix}`;
    $("selection-status").textContent = `Paquete activo: ${selected.name}`;
    $("pay-button").textContent = `PAGAR ${money(selected.price)} CON NEQUI ${NEQUI_NUMBER}`;
  }

  document.querySelectorAll(".package-card").forEach((card) => {
    const isSelected =
      Boolean(selected) && card.dataset.package === selected.name && Number(card.dataset.price) === selected.price;
    card.classList.toggle("selected", isSelected);
  });
}

function choosePackage(card) {
  document.querySelectorAll(".package-context-message").forEach((message) => message.remove());

  state.selected = { name: card.dataset.package, price: Number(card.dataset.price) };
  state.order = null;
  state.receipt = null;
  $("receipt-file").value = "";
  $("receipt-status").textContent = "";
  $("report-section").classList.add("hidden-view");
  $("payment-status").textContent = "";

  const needsId = GAMES[state.game].requiresPlayerId && !state.verified;
  const message = document.createElement("span");
  message.className = "package-context-message";
  message.textContent = needsId
    ? `✅ Verifica tu ID de ${GAMES[state.game].name} antes de continuar al método de pago.`
    : "✅ Ahora realiza el pago para completar tu recarga.";
  card.appendChild(message);

  refreshSelection();

  if (state.game === "free-fire" && needsId) {
    status("player-status", `✅ Verifica tu ID de ${GAMES[state.game].name} antes de continuar al método de pago.`);
    scrollToSection("player-section");
  } else if (state.game === "blood-strike" && needsId) {
    status("blood-player-status", "✅ Verifica tu ID de Blood Strike antes de continuar al método de pago.");
    scrollToSection("blood-player-section");
  } else {
    scrollToSection("payment-section");
  }

  showToast("Paquete actualizado.");
}

/* ------------------------------------------------------------ cambio de vistas */

function updatePurchaseHeading() {
  Object.keys(GAMES).forEach((game) => {
    $("purchase-heading-" + game).classList.toggle("hidden-view", state.game !== game);
  });
}

function showPurchase(game) {
  state.game = game;
  state.selected = null;
  state.playerId = "";
  state.verified = false;
  state.order = null;
  updatePurchaseHeading();

  const isRoblox = game === "roblox";
  const isBlood = game === "blood-strike";

  $("promo-hero").classList.add("hidden-view");
  $("verified-badge").classList.add("hidden-view");
  $("report-section").classList.add("hidden-view");
  $("player-section").classList.toggle("hidden-view", game !== "free-fire");
  $("packages-section").classList.toggle("hidden-view", isBlood);
  $("free-fire-package-grid").classList.toggle("hidden-view", game !== "free-fire");
  $("roblox-package-grid").classList.toggle("hidden-view", !isRoblox);
  $("blood-strike-flow").classList.toggle("hidden-view", !isBlood);
  $("payment-section").classList.remove("hidden-view");
  $("report-button").textContent = isRoblox ? "YA PAGUÉ" : "YA PAGUÉ, REPORTAR PEDIDO";
  refreshSelection();

  const games = $("games-view");
  const purchase = $("purchase-view");
  games.classList.remove("view-enter");
  games.classList.add("view-exit");
  setTimeout(() => {
    games.classList.add("hidden-view");
    games.classList.remove("view-exit");
    purchase.classList.remove("hidden-view");
    purchase.classList.add("view-enter");
    requestAnimationFrame(() =>
      scrollToSection(isRoblox ? "packages-section" : isBlood ? "blood-player-section" : "player-section"),
    );
  }, 330);
}

function backToGames() {
  state.game = "free-fire";
  state.selected = null;
  state.playerId = "";
  state.verified = false;
  state.order = null;
  state.receipt = null;

  ["player-id", "blood-player-id", "reference", "receipt-file"].forEach((id) => ($(id).value = ""));
  [
    "receipt-status",
    "reference-status",
    "player-status",
    "blood-player-status",
    "payment-status",
    "report-status",
    "chosen-summary",
    "order-code",
    "report-amount",
    "report-package",
  ].forEach((id) => ($(id).textContent = ""));

  $("copy-button").textContent = "COPIAR";
  $("verified-badge").classList.add("hidden-view");
  $("report-section").classList.add("hidden-view");
  document.querySelectorAll(".package-card.selected").forEach((card) => card.classList.remove("selected"));
  document.querySelectorAll(".package-context-message").forEach((message) => message.remove());
  document.querySelectorAll(".faq-item.open").forEach(closeFaqItem);
  refreshSelection();

  const games = $("games-view");
  const purchase = $("purchase-view");
  purchase.classList.remove("view-enter");
  purchase.classList.add("view-exit");
  setTimeout(() => {
    purchase.classList.add("hidden-view");
    purchase.classList.remove("view-exit");
    $("blood-strike-flow").classList.add("hidden-view");
    $("player-section").classList.remove("hidden-view");
    $("packages-section").classList.remove("hidden-view");
    $("free-fire-package-grid").classList.remove("hidden-view");
    $("roblox-package-grid").classList.add("hidden-view");
    $("promo-hero").classList.remove("hidden-view");
    games.classList.remove("hidden-view");
    games.classList.add("view-enter");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 330);
}

/* ----------------------------------------------------------- ID, pago, reporte */

function verifyPlayer() {
  const isBlood = state.game === "blood-strike";
  const statusId = isBlood ? "blood-player-status" : "player-status";
  const playerId = $(isBlood ? "blood-player-id" : "player-id").value.trim();

  if (!state.selected) {
    status(statusId, "Elige un paquete antes de verificar tu ID.");
    scrollToSection(isBlood ? "blood-packages-section" : "packages-section");
    return;
  }

  if (!ID_PATTERN.test(playerId)) {
    state.verified = false;
    state.playerId = "";
    if (!isBlood) $("verified-badge").classList.add("hidden-view");
    status(statusId, `Ingresa un ID de ${GAMES[state.game].name} válido (solo números) para continuar.`);
    return;
  }

  saveId(state.game, playerId);
  state.playerId = playerId;
  state.verified = true;
  if (!isBlood) $("verified-badge").classList.remove("hidden-view");
  status(statusId, "✅ Ahora realiza el pago para recibir tu recarga", true);
  refreshSelection();
  document.querySelectorAll(".package-context-message").forEach((message) => message.remove());
  $("payment-section").classList.remove("hidden-view");
  setTimeout(() => scrollToSection("payment-section"), 180);
}

function startOrder() {
  if (!state.selected) {
    status("payment-status", "Selecciona uno de los paquetes existentes antes de pagar.");
    scrollToSection(state.game === "blood-strike" ? "blood-packages-section" : "packages-section");
    return;
  }
  if (GAMES[state.game].requiresPlayerId && !state.verified) {
    status("payment-status", "Primero verifica tu ID de jugador.");
    scrollToSection(state.game === "blood-strike" ? "blood-player-section" : "player-section");
    return;
  }

  if (!state.order) state.order = "K-" + String(Math.floor(1000 + Math.random() * 9000));
  $("order-code").textContent = state.order;
  $("report-amount").textContent = money(state.selected.price);
  $("report-package").textContent = state.selected.name;
  $("report-section").classList.remove("hidden-view");
  status("payment-status", "Orden creada. Realiza el pago y reporta tu comprobante.", true);
  setTimeout(() => scrollToSection("report-section"), 100);
}

async function copyNequi() {
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(NEQUI_NUMBER);
      copied = true;
    }
  } catch {
    copied = false;
  }
  if (!copied) {
    const field = document.createElement("input");
    field.value = NEQUI_NUMBER;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    copied = document.execCommand("copy");
    field.remove();
  }
  if (copied) {
    $("copy-button").textContent = "¡COPIADO!";
    showToast("¡Número Nequi copiado!");
    setTimeout(() => ($("copy-button").textContent = "COPIAR"), 1800);
  } else {
    status("payment-status", `No fue posible copiar automáticamente. Número: ${NEQUI_NUMBER}`);
  }
}

function whatsappMessage(reference) {
  const lines = [
    "_⚡HOLA FAST! YA HICE MI PAGO✅_",
    "",
    `🔔_Orden ${state.order}_🔔`,
    `🎮 _Juego:_ ${GAMES[state.game].name}`,
  ];
  if (state.playerId) lines.push(`🆔 _ID de jugador:_ ${state.playerId}`);
  lines.push(
    `📦 _Paquete:_ ${state.selected.name}`,
    `💰 _Valor:_ ${money(state.selected.price)}`,
    "💳 _Método de pago:_ Nequi",
    `🧾 _Referencia:_ ${reference}`,
    "🕒 _Estado:_ Pendiente",
    "✅ Solicitud enviada para revisión.",
    "📸 Adjunto comprobante 👇",
  );
  return lines.join("\n");
}

async function submitReport(event) {
  event.preventDefault();
  const reference = $("reference").value.trim();

  if (!state.selected) {
    status("report-status", "Selecciona un paquete e inicia el pago.");
    return;
  }
  if (GAMES[state.game].requiresPlayerId && !state.verified) {
    status("report-status", "Falta tu ID de jugador. Verifícalo antes de reportar.");
    return;
  }
  if (!/^M/i.test(reference)) {
    status("report-status", "La referencia debe comenzar con la letra M.");
    return;
  }

  if (!state.order) state.order = "K-" + String(Math.floor(1000 + Math.random() * 9000));
  $("order-code").textContent = state.order;

  const button = $("report-button");
  button.disabled = true;
  status("report-status", "Guardando tu reporte…", true);

  let saved = false;
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderCode: state.order,
        game: state.game,
        playerId: state.playerId || null,
        packageName: state.selected.name,
        amount: state.selected.price,
        reference,
        hasReceipt: Boolean(state.receipt),
      }),
    });
    saved = response.ok;
  } catch {
    saved = false;
  }
  button.disabled = false;

  if (!saved) {
    status("report-status", "No pudimos guardar el reporte, pero puedes enviarlo por WhatsApp ahora.", true);
  }
  if (state.receipt) showToast("Recuerda adjuntar la captura en WhatsApp");

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage(reference))}`,
    "_blank",
    "noopener,noreferrer",
  );
  if (saved) backToGames();
}

/* ----------------------------------------------------------------------- FAQ */

function closeFaqItem(item) {
  item.classList.remove("open");
  const question = item.querySelector(".faq-question");
  question.setAttribute("aria-expanded", "false");
  question.querySelector("strong").textContent = "+";
}

function initFaq() {
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.closest(".faq-item");
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        if (openItem !== item) closeFaqItem(openItem);
      });
      const isOpen = item.classList.toggle("open");
      question.setAttribute("aria-expanded", String(isOpen));
      question.querySelector("strong").textContent = isOpen ? "−" : "+";
    });
  });
}

/* ------------------------------------------------------------------ arranque */

function initRotator() {
  const words = ["FREE FIRE", "ROBLOX", "BLOOD STRIKE"];
  const rotator = $("rotativo");
  let index = 0;
  setInterval(() => {
    rotator.classList.remove("is-entering", "is-exiting");
    void rotator.offsetWidth;
    rotator.classList.add("is-exiting");
    index = (index + 1) % words.length;
    setTimeout(() => {
      rotator.textContent = words[index];
      rotator.classList.remove("is-exiting");
      rotator.classList.add("is-entering");
    }, 450);
  }, 2600);
}

function initSocialProof() {
  const message = $("toast").textContent.trim();
  setInterval(() => {
    // Solo cuando el visitante está eligiendo juego, para no tapar los avisos del flujo de compra.
    if ($("purchase-view").classList.contains("hidden-view")) showToast(message);
  }, 14000);
}

function setViewportUnit() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight / 100}px`);
}

function init() {
  setViewportUnit();
  window.addEventListener("resize", setViewportUnit);

  buildCatalog();
  restoreIds();
  refreshSelection();
  initFaq();
  initRotator();
  initSocialProof();

  $("free-fire-card").addEventListener("click", () => showPurchase("free-fire"));
  $("blood-strike-card").addEventListener("click", () => showPurchase("blood-strike"));
  $("roblox-card").addEventListener("click", () => showPurchase("roblox"));
  $("back-to-games").addEventListener("click", backToGames);
  $("verify-id").addEventListener("click", verifyPlayer);
  $("blood-verify-id").addEventListener("click", verifyPlayer);
  $("pay-button").addEventListener("click", startOrder);
  $("copy-button").addEventListener("click", copyNequi);
  $("report-form").addEventListener("submit", submitReport);

  ["player-id", "blood-player-id"].forEach((id, index) => {
    const game = index === 0 ? "free-fire" : "blood-strike";
    const field = $(id);
    field.addEventListener("blur", () => saveId(game, field.value));
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        verifyPlayer();
      }
    });
    field.addEventListener("input", () => {
      if (state.verified && field.value.trim() !== state.playerId) {
        state.verified = false;
        if (id === "player-id") $("verified-badge").classList.add("hidden-view");
        status(id === "player-id" ? "player-status" : "blood-player-status", "Tu ID cambió. Verifícalo nuevamente.");
      }
    });
  });

  $("receipt-file").addEventListener("change", () => {
    const file = $("receipt-file").files[0];
    state.receipt = null;
    if (!file) {
      $("receipt-status").textContent = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      $("receipt-file").value = "";
      status("receipt-status", "Selecciona una imagen válida del comprobante.");
      return;
    }
    state.receipt = file;
    status("receipt-status", `Comprobante listo: ${file.name}`, true);
  });

  $("reference").addEventListener("input", () => {
    const reference = $("reference").value.trim();
    if (!reference) {
      $("reference-status").textContent = "";
      return;
    }
    const valid = /^M/i.test(reference);
    status("reference-status", valid ? "Referencia válida." : "La referencia debe comenzar con la letra M.", valid);
  });
}

init();
