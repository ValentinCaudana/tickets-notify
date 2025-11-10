// public/guide.js
const q = new URLSearchParams(location.search);
const sale = q.get("sale")?.trim();
const lang = (q.get("lang") || navigator.language || "en").slice(0, 2);

const elTitle = document.querySelector("#g-title");
const elNotes = document.querySelector("#g-notes");
const elNotesUl = document.querySelector("#g-notes-list");
const elSteps = document.querySelector("#g-steps");
const elStepsOl = document.querySelector("#g-steps-list");
const elLinks = document.querySelector("#g-links");
const elLinksUl = document.querySelector("#g-links-list");
const elLoading = document.querySelector("#g-loading");
const elError = document.querySelector("#g-error");

async function loadGuide() {
  elLoading.hidden = false;
  elError.hidden = true;

  if (!sale) {
    elLoading.hidden = true;
    elError.hidden = false;
    elError.textContent = "Missing sale parameter.";
    return;
  }

  try {
    const res = await fetch(
      `/api/guides?sale=${encodeURIComponent(sale)}&lang=${encodeURIComponent(
        lang
      )}`
    );
    elLoading.hidden = true;

    if (!res.ok) {
      elError.hidden = false;
      elError.textContent = "Guide not found.";
      return;
    }

    const data = await res.json();
    const { title, notes, steps, links } = data;

    // Title
    elTitle.textContent = title || "How to Buy";
    elTitle.hidden = false;

    // --- Notes (normalizamos a array) ---
    const notesArr = Array.isArray(notes)
      ? notes
      : notes
      ? String(notes).split("\n").filter(Boolean)
      : [];
    elNotesUl.innerHTML = "";
    for (const line of notesArr) {
      const li = document.createElement("li");
      li.textContent = line;
      elNotesUl.appendChild(li);
    }
    elNotes.hidden = notesArr.length === 0;

    // --- Steps ---
    const stepsArr = Array.isArray(steps)
      ? steps
      : steps
      ? String(steps).split("\n").filter(Boolean)
      : [];
    elStepsOl.innerHTML = "";
    for (const s of stepsArr) {
      const li = document.createElement("li");
      li.textContent = s;
      elStepsOl.appendChild(li);
    }
    elSteps.hidden = stepsArr.length === 0;

    // --- Links ---
    const linksArr = Array.isArray(links) ? links : [];
    elLinksUl.innerHTML = "";
    for (const l of linksArr) {
      if (!l?.href) continue;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = l.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = l.rel || l.href;
      li.appendChild(a);
      elLinksUl.appendChild(li);
    }
    elLinks.hidden = elLinksUl.children.length === 0;
  } catch (e) {
    elLoading.hidden = true;
    elError.hidden = false;
    elError.textContent = "Internal error.";
    console.error(e);
  }
}

loadGuide();
