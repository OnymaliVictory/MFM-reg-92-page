// Example using Bible API (wldeh) to fetch a verse
document.getElementById('searchBtn').addEventListener('click', () => {
  const book = document.getElementById('book').value.trim().toLowerCase();
  const chapter = document.getElementById('chapter').value.trim();
  const verse = document.getElementById('verse').value.trim();

  // Use Bible API endpoint
  const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/${book}/chapters/${chapter}/verses/${verse}.json`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Verse not found');
      return res.json();
    })
    .then(data => {
      document.getElementById('result-card').style.display = 'block';
      document.getElementById('result-reference').textContent = `${book.charAt(0).toUpperCase() + book.slice(1)} ${chapter}:${verse}`;
      document.getElementById('result-text').textContent = data.text;
    })
    .catch(error => {
      document.getElementById('result-card').style.display = 'block';
      document.getElementById('result-reference').textContent = 'Error';
      document.getElementById('result-text').textContent = error.message;
    });
});
