// ---------------------
// Fetch and render guide
// ---------------------

// Utility to get query string parameter
function qs(k, def = null) {
  const u = new URL(location.href);
  return u.searchParams.get(k) ?? def;
}

// Utility to format date locally
function formatLocal(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

const root = document.getElementById("guide-root");
const elLoading = document.getElementById("loading");
const elError = document.getElementById("error");

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

    // Match / Club Card
    const card1 = document.createElement("article");
    card1.className = "card";
    card1.innerHTML = `
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

    // Guide / Steps Card
    const card2 = document.createElement("article");
    card2.className = "card";
    const steps = (guide.steps || []).map((s, i) => `<li>${s}</li>`).join("");
    const links = (guide.officialPages || [])
      .map(
        (l) =>
          `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`
      )
      .join("");

    card2.innerHTML = `
      <h3>Steps</h3>
      <ol class="steps">${steps}</ol>
      ${
        guide.notes
          ? `<p class="subtle" style="margin-top:10px">${guide.notes}</p>`
          : ""
      }
      ${links ? `<div class="links">${links}</div>` : ""}
    `;

    root.innerHTML = "";
    root.appendChild(card1);
    root.appendChild(card2);
  } catch (e) {
    console.error(e);
    elLoading.hidden = true;
    elError.hidden = false;
  }
}

main();
