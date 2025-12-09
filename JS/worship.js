document.getElementById("searchBtn").addEventListener("click", async () => {
  const query = document.getElementById("song").value.trim();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!query) return alert("Please enter a song title.");

  const API_KEY = "YOUR_REAL_YOUTUBE_API_KEY"; // replace this
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      return alert("No results found for this song.");
    }

    data.items.forEach(item => {
      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const thumbnail = item.snippet.thumbnails.medium.url;

      const videoCard = document.createElement("div");
      videoCard.style.width = "250px";
      videoCard.style.border = "1px solid #ddd";
      videoCard.style.borderRadius = "10px";
      videoCard.style.overflow = "hidden";
      videoCard.style.cursor = "pointer";
      videoCard.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      videoCard.innerHTML = `
        <img src="${thumbnail}" style="width:100%; display:block;">
        <div style="padding:10px;">
          <strong>${title}</strong>
        </div>
      `;

      videoCard.addEventListener("click", () => {
        resultsDiv.innerHTML = `
          <h3>${title}</h3>
          <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        `;
      });

      resultsDiv.appendChild(videoCard);
    });

  } catch (err) {
    console.error("Error fetching videos:", err);
    alert("Error fetching videos. Check console for details.");
  }
});
