// ---------------------
// Fetch and render composed guide
// ---------------------

function qs(k, def = null) {
  const u = new URL(location.href);
  return u.searchParams.get(k) ?? def;
}

function formatLocal(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

const root = document.getElementById("guide-root");
const elLoading = document.getElementById("loading");
const elError = document.getElementById("error");

function renderSections(sections = []) {
  if (!sections.length) return "";
  return sections
    .map(
      (sec) => `
      <article class="card">
        <h3>${sec.title}</h3>
        ${
          Array.isArray(sec.items) && sec.items.length
            ? `<ol class="steps">${sec.items
                .map((x) => `<li>${x}</li>`)
                .join("")}</ol>`
            : `<p class="subtle">No steps available.</p>`
        }
      </article>
    `
    )
    .join("");
}

function renderLinks(links = []) {
  if (!links.length) return "";
  return `
    <div class="links" style="margin-top:10px">
      ${links
        .map(
          (l) =>
            `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`
        )
        .join("")}
    </div>
  `;
}

async function main() {
  const saleId = qs("sale");
  if (!saleId) {
    elLoading.hidden = true;
    elError.hidden = false;
    elError.textContent = "Missing sale ID.";
    return;
  }

  try {
    const res = await fetch(
      `/api/guides/by-sale/${encodeURIComponent(saleId)}`
    );
    if (!res.ok) throw new Error("Guide not found");
    const data = await res.json();
    elLoading.hidden = true;

    const { sale, club, guide } = data;

    const head = document.createElement("article");
    head.className = "card";
    head.innerHTML = `
      <h3>${sale.match}</h3>
      <div class="meta">${club.name} · ${club.league} · ${club.country}</div>
      <div class="meta">On sale: ${formatLocal(sale.onSaleAt)}</div>
      ${
        sale.requiresMembership
          ? '<span class="badge">Membership required</span>'
          : ""
      }
      <div class="actions" style="margin-top:10px">
        <a class="btn primary" href="${
          sale.link
        }" target="_blank" rel="noopener">Buy (official)</a>
        ${
          club.officialStore
            ? `<a class="btn" href="${club.officialStore}" target="_blank" rel="noopener">Club Store</a>`
            : ""
        }
      </div>
    `;

    const bodyHtml = `
      ${renderSections(guide.sections)}
      ${
        guide.notes
          ? `<article class="card"><h3>Notes</h3><p class="subtle">${
              guide.notes
            }</p>${renderLinks(guide.links)}</article>`
          : renderLinks(guide.links)
      }
    `;

    const body = document.createElement("div");
    body.innerHTML = bodyHtml;

    root.innerHTML = "";
    root.appendChild(head);
    root.appendChild(body);
  } catch (e) {
    console.error(e);
    elLoading.hidden = true;
    elError.hidden = false;
  }
}

main();
