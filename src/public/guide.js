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

    const { title, notes = [], steps = [], links = [] } = await res.json();

    // title
    elTitle.textContent = title || "How to buy";
    elTitle.hidden = false;

    // notes
    elNotesUl.innerHTML = "";
    for (const n of notes) {
      const li = document.createElement("li");
      li.textContent = n;
      elNotesUl.appendChild(li);
    }
    elNotes.hidden = notes.length === 0;

    // steps
    elStepsOl.innerHTML = "";
    steps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      elStepsOl.appendChild(li);
    });
    elSteps.hidden = steps.length === 0;

    // links
    elLinksUl.innerHTML = "";
    links.forEach((l) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = l.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = l.rel || l.href;
      li.appendChild(a);
      elLinksUl.appendChild(li);
    });
    elLinks.hidden = links.length === 0;
  } catch (e) {
    elLoading.hidden = true;
    elError.hidden = false;
    elError.textContent = "Internal error.";
    console.error(e);
  }
}

loadGuide();
