// HYMN SEARCH ENGINE — Hybrid API + Local Database

const resultsDiv = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");

// Fetch hymn from Gospel-Hymns API
async function fetchHymnAPI(num) {
  try {
    const res = await fetch(`https://gospel-hymns.onrender.com/api/v1/hymn/${num}`);
    if (!res.ok) return null;

    const json = await res.json();
    const d = json.data;

    return {
      source: "API",
      number: d.number,
      title: d.title,
      lyrics: (d.verses || []).join("\n\n")
    };

  } catch (err) {
    return null;
  }
}

// Search local public domain hymns
function searchLocal(query) {
  query = query.toLowerCase();
  return HYMNS_PUBLIC.filter(h =>
    h.title.toLowerCase().includes(query) ||
    h.lyrics.toLowerCase().includes(query)
  ).map(h => ({ ...h, source: "Local" }));
}

async function searchHymns() {
  const query = searchInput.value.trim();
  if (!query) return;

  loading.style.display = "block";
  resultsDiv.innerHTML = "";

  let results = [];

  // local search first
  results = results.concat(searchLocal(query));

  // if numeric, also search API
  if (!isNaN(parseInt(query))) {
    const apiRes = await fetchHymnAPI(parseInt(query));
    if (apiRes) results.push(apiRes);
  }

  loading.style.display = "none";

  if (results.length === 0) {
    resultsDiv.innerHTML = `<p>No hymns found.</p>`;
    return;
  }

  // Render results
  resultsDiv.innerHTML = results.map(h => `
    <div class="result-card" style="margin-bottom: 20px;">
      <h3>${h.number ? "#" + h.number + " — " : ""}${h.title}</h3>
      <p style="white-space: pre-line;">${h.lyrics}</p>
      <span style="font-size:12px;color:#888;">Source: ${h.source}</span>
    </div>
  `).join("");
}

searchBtn.addEventListener("click", searchHymns);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchHymns();
});
