// /JS/upcomingPrograms_display.js
import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function safe(text='') {
  return String(text)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

const container = document.getElementById('programList');

if (!container) {
  console.warn("No #programList element found on page.");
} else {
  const q = query(collection(db, 'upcomingPrograms'), orderBy('date', 'asc'));
  onSnapshot(q, snapshot => {
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p>No upcoming programs yet.</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const dateText = p.date ? new Date(p.date).toLocaleString() : (p.createdAt ? new Date(p.createdAt).toLocaleString() : 'No date');

      const card = document.createElement('div');
      card.className = 'program-card';
      card.innerHTML = `
        <h3>${safe(p.title || 'Untitled')}</h3>
        <div class="meta"><strong>Schedule:</strong> ${safe(p.schedule || '')}</div>
        <div class="meta"><strong>Date:</strong> ${safe(dateText)}</div>
        <p>${safe(p.description || p.desc || '')}</p>
      `;
      container.appendChild(card);
    });
  }, err => {
    console.error('Error loading upcoming programs:', err);
    container.innerHTML = '<p>Error loading programs.</p>';
  });
}
