// public/app.js
const $ = (sel) => document.querySelector(sel);

// Lists
const salesList = $("#sales-list");

// Filters
const fltRegion = $("#flt-region");
const fltSearch = $("#flt-search");
const fltLeague = $("#flt-league");
const fltCountry = $("#flt-country");
const fltMembership = $("#flt-membership");
const fltSort = $("#flt-sort");
const fltDate = $("#flt-date");
const btnCalendar = $("#btn-calendar");

// Subscribe
const subForm = $("#subscribe-form");
const subEmail = $("#sub-email");
const subClub = $("#sub-club");
const subMsg = $("#sub-msg");
const subBtn = $("#sub-btn");

// Create sale
const createForm = $("#create-form");
const saleClub = $("#sale-club");
const saleMatch = $("#sale-match");
const saleDate = $("#sale-date");
const saleLink = $("#sale-link");
const saleMembership = $("#sale-membership");
const clubsList = $("#clubs-list");
const createMsg = $("#create-msg");
const createBtn = $("#create-btn");
const errClub = $("#err-club");
const errMatch = $("#err-match");
const errDate = $("#err-date");
const errLink = $("#err-link");

// Toast
const toastEl = $("#toast");

// Calendar modal
const calModal = $("#calendar-modal");
const calBody = $("#calendar-body");
const calClose = $("#calendar-close");

const API = {
  sales: "/api/sales",
  subscribe: "/api/subscriptions",
  clubs: "/api/clubs",
};

const state = {
  sales: [],
  clubs: [],
  clubMap: new Map(),
  leagues: [],
  countries: [],
};

const EUROPE = new Set([
  "es",
  "pt",
  "fr",
  "de",
  "it",
  "gb",
  "uk",
  "nl",
  "be",
  "dk",
  "se",
  "no",
  "fi",
  "is",
  "ie",
  "ch",
  "at",
  "pl",
  "cz",
  "sk",
  "hu",
  "ro",
  "bg",
  "gr",
  "hr",
  "si",
  "rs",
  "ba",
  "mk",
  "al",
  "me",
  "xk",
  "md",
  "ua",
  "by",
  "lt",
  "lv",
  "ee",
  "lu",
  "li",
  "sm",
  "mc",
  "ad",
  "va",
  "mt",
  "cy",
  "tr",
]);

const todayYMD = new Date().toISOString().slice(0, 10);

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
};

function showToast(msg, kind = "ok") {
  toastEl.textContent = msg;
  toastEl.className = `toast ${kind}`;
  toastEl.style.display = "block";
  clearTimeout(showToast.__t);
  showToast.__t = setTimeout(() => (toastEl.style.display = "none"), 2500);
}

function cardHTML(sale) {
  const club = state.clubMap.get(sale.clubId);
  const clubName = club?.name ?? sale.clubId.toUpperCase();
  const league = club?.league ? ` · ${club.league}` : "";
  const country = club?.country ? ` · ${club.country}` : "";
  return `
    <div class="card">
      <div class="title">${sale.match}</div>
      <div class="muted"><b>${clubName}</b>${league}${country}</div>
      <div class="muted">On sale: ${fmtDate(sale.onSaleAt)}</div>
      <div style="margin:10px 0 12px 0">
        ${
          sale.requiresMembership
            ? '<span class="badge badge--membership">Membership required</span>'
            : '<span class="badge">Open sale</span>'
        }
      </div>
      <a class="btn" href="${
        sale.link
      }" target="_blank" rel="noopener noreferrer">Official store</a>
    </div>
  `;
}

// --- Fetchers ---
async function loadClubs() {
  const res = await fetch(API.clubs);
  if (!res.ok) throw new Error("Failed to fetch clubs");
  const data = await res.json();
  state.clubs = data;
  state.clubMap = new Map(data.map((c) => [c.id, c]));
  state.leagues = [...new Set(data.map((c) => c.league).filter(Boolean))];
  state.countries = [...new Set(data.map((c) => c.country).filter(Boolean))];

  fltLeague.innerHTML =
    `<option value="">All leagues</option>` +
    state.leagues.map((l) => `<option value="${l}">${l}</option>`).join("");

  fltCountry.innerHTML =
    `<option value="">All countries</option>` +
    state.countries.map((c) => `<option value="${c}">${c}</option>`).join("");

  clubsList.innerHTML = state.clubs
    .map((c) => `<option value="${c.id}">${c.name} (${c.league})</option>`)
    .join("");
}

async function loadSales() {
  const res = await fetch(API.sales);
  if (!res.ok) throw new Error("Failed to fetch sales");
  state.sales = await res.json();
}

// --- Helpers ---
const isoToYMD = (iso) => new Date(iso).toISOString().slice(0, 10);

// --- Render + filters ---
function applyFilters() {
  const selectedDate = fltDate.value; // 'YYYY-MM-DD'
  if (selectedDate) {
    rows = rows.filter((s) => {
      const d = new Date(s.onSaleAt); // o la fecha que quieras comparar
      const ymd = d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
      return ymd === selectedDate;
    });
  }
  const q = fltSearch.value.trim().toLowerCase();
  const league = fltLeague.value;
  const country = fltCountry.value;
  const onlyMembership = fltMembership.checked;
  const sortMode = fltSort.value; // soon | latest
  const ymd = fltDate.value; // si viene vacío = no filtra por fecha
  const region = fltRegion.value; // '' | 'europe' | 'argentina'
  if (region === "europe") {
    rows = rows.filter((s) =>
      EUROPE.has((state.clubMap.get(s.clubId)?.country || "").toLowerCase())
    );
  } else if (region === "argentina") {
    rows = rows.filter(
      (s) => (state.clubMap.get(s.clubId)?.country || "").toLowerCase() === "ar"
    );
  }
  fltDate.value = new Date().toISOString().slice(0, 10);
  applyFilters();

  let rows = state.sales.slice();

  if (q) {
    rows = rows.filter((s) => {
      const club = state.clubMap.get(s.clubId);
      return (
        s.match.toLowerCase().includes(q) ||
        s.clubId.toLowerCase().includes(q) ||
        (club?.name?.toLowerCase() ?? "").includes(q)
      );
    });
  }

  if (league)
    rows = rows.filter((s) => state.clubMap.get(s.clubId)?.league === league);
  if (country)
    rows = rows.filter((s) => state.clubMap.get(s.clubId)?.country === country);
  if (onlyMembership) rows = rows.filter((s) => s.requiresMembership);

  if (ymd) rows = rows.filter((s) => isoToYMD(s.onSaleAt) === ymd);

  rows.sort((a, b) => {
    const da = +new Date(a.onSaleAt);
    const db = +new Date(b.onSaleAt);
    return sortMode === "latest" ? db - da : da - db;
  });

  salesList.innerHTML = rows.length
    ? rows.map(cardHTML).join("")
    : '<div class="muted">No matching results.</div>';
}

async function refreshAll() {
  try {
    await Promise.all([loadClubs(), loadSales()]);
    // por defecto: hoy
    fltDate.value = todayYMD;
    applyFilters();
  } catch (err) {
    salesList.innerHTML = `<div class="muted">${String(err)}</div>`;
  }
}

// --- Calendar ---
function buildCalendar() {
  const counts = {};
  state.sales.forEach((s) => {
    const ymd = isoToYMD(s.onSaleAt);
    counts[ymd] = (counts[ymd] || 0) + 1;
  });

  const items = Object.entries(counts).sort(([a], [b]) => (a < b ? -1 : 1));
  calBody.innerHTML =
    items
      .map(
        ([ymd, count]) =>
          `<button class="cal-row" data-ymd="${ymd}">
            <span>${ymd}</span><span>${count} match${
            count > 1 ? "es" : ""
          }</span>
          </button>`
      )
      .join("") ||
    '<div class="muted" style="padding:10px">No dates yet.</div>';
}

btnCalendar.addEventListener("click", () => {
  buildCalendar();
  calModal.style.display = "flex";
});

calClose.addEventListener("click", () => (calModal.style.display = "none"));
calModal.addEventListener("click", (e) => {
  if (e.target === calModal) calModal.style.display = "none";
});
calBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".cal-row");
  if (!btn) return;
  const ymd = btn.dataset.ymd;
  fltDate.value = ymd;
  calModal.style.display = "none";
  applyFilters();
});

fltRegion.addEventListener("change", applyFilters);

// --- Validation helpers (create) ---
function resetErrors() {
  [saleClub, saleMatch, saleDate, saleLink].forEach((el) =>
    el.classList.remove("is-invalid")
  );
  [errClub, errMatch, errDate, errLink].forEach((el) => (el.textContent = ""));
}

function validateCreate(payload) {
  const errors = {};
  if (!payload.clubId) errors.club = "Club ID is required";
  if (!payload.match || payload.match.length < 3)
    errors.match = "Match is too short";
  const t = Date.parse(payload.onSaleAt || "");
  if (!Number.isFinite(t)) errors.date = "Invalid date/time";
  try {
    new URL(payload.link);
  } catch {
    errors.link = "Invalid URL";
  }
  return { ok: Object.keys(errors).length === 0, errors };
}
function applyInlineErrors(errors) {
  if (errors.club) {
    saleClub.classList.add("is-invalid");
    errClub.textContent = errors.club;
  }
  if (errors.match) {
    saleMatch.classList.add("is-invalid");
    errMatch.textContent = errors.match;
  }
  if (errors.date) {
    saleDate.classList.add("is-invalid");
    errDate.textContent = errors.date;
  }
  if (errors.link) {
    saleLink.classList.add("is-invalid");
    errLink.textContent = errors.link;
  }
}

// --- Subscribe ---
subForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  subMsg.textContent = "";
  subMsg.className = "msg";
  subBtn.disabled = true;
  const payload = {
    email: subEmail.value.trim(),
    clubId: subClub.value.trim() || undefined,
  };
  try {
    const res = await fetch(API.subscribe, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Subscription failed");
    }
    subMsg.textContent = "You are subscribed! ✅";
    subMsg.classList.add("ok");
    showToast("Subscribed successfully", "ok");
    subForm.reset();
  } catch (err) {
    subMsg.textContent = err.message;
    subMsg.classList.add("err");
    showToast(err.message, "err");
  } finally {
    subBtn.disabled = false;
  }
});

// --- Create sale ---
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resetErrors();
  createMsg.textContent = "";
  createMsg.className = "msg";
  createBtn.disabled = true;

  const iso = saleDate.value ? new Date(saleDate.value).toISOString() : "";
  const payload = {
    clubId: saleClub.value.trim(),
    match: saleMatch.value.trim(),
    onSaleAt: iso,
    requiresMembership: !!saleMembership.checked,
    link: saleLink.value.trim(),
  };
  const { ok, errors } = validateCreate(payload);
  if (!ok) {
    applyInlineErrors(errors);
    createMsg.textContent = "Please fix the errors above.";
    createMsg.classList.add("err");
    createBtn.disabled = false;
    return;
  }
  try {
    const res = await fetch(API.sales, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Create sale failed");
    }
    createMsg.textContent = "Sale created! ✅";
    createMsg.classList.add("ok");
    showToast("Sale created", "ok");
    createForm.reset();
    await loadSales();
    applyFilters();
  } catch (err) {
    createMsg.textContent = err.message;
    createMsg.classList.add("err");
    showToast(err.message, "err");
  } finally {
    createBtn.disabled = false;
  }
});

// Boot
refreshAll();
