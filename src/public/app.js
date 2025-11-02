function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function getRange(range) {
  const now = new Date();
  if (range === "today") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (range === "week") {
    // Lunes-domingo de la semana actual (local)
    const day = now.getDay() || 7; // 1..7
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: startOfDay(monday), to: endOfDay(sunday) };
  }
  if (range === "month") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: startOfDay(first), to: endOfDay(last) };
  }
  return null;
}

const elCards = document.querySelector("#cards");
const elEmpty = document.querySelector("#empty");
const fltDate = document.querySelector("#flt-date");
const fltRegion = document.querySelector("#flt-region");
const fltOnlyToday = document.querySelector("#flt-only-today");
const chipsWrap = document.querySelector(".quick-filters");
const elLoading = document.querySelector("#loading");

// Setear valor inicial (YYYY-MM-DD) y bloquear date si "Only today"
fltDate.value = new Date().toISOString().slice(0, 10);
fltDate.disabled = fltOnlyToday.checked;

// --- Utils fecha/hora ---
function yyyyMmDdLocal(d) {
  // convierte Date local -> 'YYYY-MM-DD' (sin UTC shift)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLocal(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

// Countdown “local-aware” con colchón de 5 minutos
function countdownText(iso) {
  const now = Date.now();
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";

  // colchón anti “se adelanta por UTC”
  const PAD = 5 * 60 * 1000; // 5 min
  const diff = t - now;

  if (diff <= -PAD) return "On sale now"; // ya empezó (superado el colchón)
  if (diff <= PAD && diff >= -PAD) return "Starting now"; // ventana de arranque

  const mins = Math.ceil((diff - PAD) / 60000);
  const days = Math.floor(mins / (60 * 24));
  const hours = Math.floor((mins % (60 * 24)) / 60);
  const m = Math.max(mins % 60, 0);

  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h ${m}m`;
  return `Starts in ${m}m`;
}

let activeRange = "today"; // default

async function fetchSales() {
  const params = new URLSearchParams();

  if (activeRange) {
    // chips
    const { from, to } = getRange(activeRange);
    params.set("from", from.toISOString());
    params.set("to", to.toISOString());
  } else if (fltOnlyToday.checked) {
    params.set("date", yyyyMmDdLocal(new Date()));
  } else if (fltDate.value) {
    params.set("date", fltDate.value);
  }

  if (fltRegion.value && fltRegion.value !== "all") {
    params.set("region", fltRegion.value);
  }

  elLoading.hidden = false;
  const res = await fetch(`/api/sales?${params.toString()}`);
  elLoading.hidden = true;

  if (!res.ok) throw new Error("Failed to fetch sales");
  return res.json();
}

function renderCards(sales) {
  elCards.innerHTML = "";
  if (!sales.length) {
    elEmpty.hidden = false;
    return;
  }
  elEmpty.hidden = true;

  for (const s of sales) {
    const card = document.createElement("article");
    card.className = "card";

    const requires = s.requiresMembership
      ? '<span class="badge">Membership required</span>'
      : "";

    const cdown = countdownText(s.onSaleAt);

    card.innerHTML = `
      <h3>${s.match}</h3>
      <div class="meta">${s.clubName} · ${s.league} · ${s.country}</div>
      <div class="meta">On sale: ${formatLocal(s.onSaleAt)}${
      cdown ? ` · ${cdown}` : ""
    }</div>
      ${requires}
      <div class="actions">
        <a class="btn primary" href="${
          s.link
        }" target="_blank" rel="noopener">Official store</a>
      </div>
    `;
    elCards.appendChild(card);
  }
}

// Listeners
fltDate.addEventListener("change", apply);
fltRegion.addEventListener("change", apply);
fltOnlyToday.addEventListener("change", () => {
  activeRange = null; // ← apaga chips si decide usar fecha
  fltDate.disabled = fltOnlyToday.checked;
  if (fltOnlyToday.checked) {
    fltDate.value = new Date().toISOString().slice(0, 10);
  }
  // limpiar selección visual de chips
  chipsWrap
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  apply();
});

chipsWrap.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  // activar
  chipsWrap
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");

  activeRange = btn.dataset.range; // 'today' | 'week' | 'month'
  // cuando hay chip, ignoramos el date picker
  fltOnlyToday.checked = false;
  fltDate.disabled = true;
  apply();
});

// marcar “Today” activo al cargar
chipsWrap.querySelector('[data-range="today"]')?.classList.add("active");

setInterval(() => {
  document.querySelectorAll("#cards .card .meta").forEach((meta) => {
    if (meta.textContent.startsWith("On sale:")) {
      const article = meta.closest(".card");
      const iso = article?.dataset?.onSaleAt; // lo agregamos ahora
    }
  });
}, 30000);

// Para alimentar el setInterval anterior guardamos onSaleAt en dataset al render
const _origRender = renderCards;
renderCards = function (sales) {
  elCards.innerHTML = "";
  if (!sales.length) {
    elEmpty.hidden = false;
    return;
  }
  elEmpty.hidden = true;

  for (const s of sales) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.onSaleAt = s.onSaleAt;

    const requires = s.requiresMembership
      ? '<span class="badge">Membership required</span>'
      : "";

    const cdown = countdownText(s.onSaleAt);

    card.innerHTML = `
      <h3>${s.match}</h3>
      <div class="meta">${s.clubName} · ${s.league} · ${s.country}</div>
      <div class="meta">On sale: ${formatLocal(s.onSaleAt)}${
      cdown ? ` · ${cdown}` : ""
    }</div>
      ${requires}
      <div class="actions">
        <a class="btn primary" href="${
          s.link
        }" target="_blank" rel="noopener">Official store</a>
      </div>
    `;
    elCards.appendChild(card);
  }
};

// Primer render
apply();

async function apply() {
  try {
    const sales = await fetchSales();
    renderCards(sales);
  } catch (e) {
    console.error(e);
    renderCards([]);
  }
}
