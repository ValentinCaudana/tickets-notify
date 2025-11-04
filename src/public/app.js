// ----------------------------
// Date helpers
// ----------------------------
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
    const day = now.getDay() || 7; // 1..7 (Mon..Sun)
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
function yyyyMmDdLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatLocal(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}
function countdownText(iso) {
  const now = Date.now();
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const PAD = 5 * 60 * 1000; // 5 min
  const diff = t - now;
  if (diff <= -PAD) return "On sale now";
  if (diff <= PAD && diff >= -PAD) return "Starting now";
  const mins = Math.ceil((diff - PAD) / 60000);
  const days = Math.floor(mins / (60 * 24));
  const hours = Math.floor((mins % (60 * 24)) / 60);
  const m = Math.max(mins % 60, 0);
  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h ${m}m`;
  return `Starts in ${m}m`;
}

// ----------------------------
// DOM
// ----------------------------
const elCards = document.querySelector("#cards");
const elEmpty = document.querySelector("#empty");
const fltDate = document.querySelector("#flt-date");
const fltRegion = document.querySelector("#flt-region");
const fltOnlyToday = document.querySelector("#flt-only-today");
const chipsWrap = document.querySelector(".quick-filters");
const elLoading = document.querySelector("#loading");

fltDate.value = new Date().toISOString().slice(0, 10);
fltDate.disabled = fltOnlyToday.checked;

// ----------------------------
// State
// ----------------------------
let activeRange = "today";

// ----------------------------
// API
// ----------------------------
async function fetchSales() {
  const params = new URLSearchParams();

  if (activeRange) {
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

// ----------------------------
// Render
// ----------------------------
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
    card.dataset.onSaleAt = s.onSaleAt;

    const requires = s.requiresMembership
      ? '<span class="badge">Membership required</span>'
      : "";

    const cdown = countdownText(s.onSaleAt);
    const cdownStr = cdown ? ` · ${cdown}` : "";

    card.innerHTML = `
      <h3>${s.match}</h3>
      <div class="meta">${s.clubName} · ${s.league} · ${s.country}</div>
      <div class="meta">On sale: ${formatLocal(s.onSaleAt)}${cdownStr}</div>
      ${requires}
      <div class="actions" style="margin-top:10px">
        <a class="btn primary" href="${
          s.link
        }" target="_blank" rel="noopener">Official store</a>
        <a class="btn" href="/guide.html?sale=${encodeURIComponent(
          s.id
        )}">How to buy</a>
      </div>
    `;
    elCards.appendChild(card);
  }
}

setInterval(() => {
  document.querySelectorAll("#cards .card").forEach((card) => {
    const iso = card.dataset.onSaleAt;
    const metas = card.querySelectorAll(".meta");
    const dateMeta = metas[1];
    if (!iso || !dateMeta) return;
    const base = `On sale: ${formatLocal(iso)}`;
    const cd = countdownText(iso);
    dateMeta.textContent = cd ? `${base} · ${cd}` : base;
  });
}, 30000);

// ----------------------------
// Listeners
// ----------------------------
const apply = async () => {
  try {
    const sales = await fetchSales();
    renderCards(sales);
  } catch (e) {
    console.error(e);
    renderCards([]);
  }
};

fltDate.addEventListener("change", () => {
  activeRange = null;
  fltOnlyToday.checked = false;
  chipsWrap
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  apply();
});

fltRegion.addEventListener("change", apply);

fltOnlyToday.addEventListener("change", () => {
  activeRange = null;
  fltDate.disabled = fltOnlyToday.checked;
  if (fltOnlyToday.checked) {
    fltDate.value = new Date().toISOString().slice(0, 10);
  }
  chipsWrap
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  apply();
});

chipsWrap.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  chipsWrap
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  activeRange = btn.dataset.range; // today|week|month
  fltOnlyToday.checked = false;
  fltDate.disabled = true;
  apply();
});

chipsWrap.querySelector('[data-range="today"]')?.classList.add("active");

apply();
