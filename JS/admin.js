// /JS/admin.js
// Admin functions: upcoming programs (Firestore), announcements are kept local in HTML
import { db, storage } from './firebase.js';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

/* ---------- Helpers ---------- */
function el(id) { return document.getElementById(id); }
function q(sel) { return document.querySelector(sel); }

function escapeHtml(s='') {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

/* ---------- Collections ---------- */
const programsCol = () => collection(db, 'upcomingPrograms');
const announcementsCol = () => collection(db, 'announcements');
const testimoniesCol = () => collection(db, 'testimonies');

/* ---------- Year + menu ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (el('year')) el('year').textContent = new Date().getFullYear();
});

window.toggleMenu = function() {
  const nav = document.querySelector('.nav');
  if (nav) nav.classList.toggle('open');
};

/* ===========================
   Upcoming Programs (Admin)
   =========================== */
async function saveProgram() {
  const title = (el('progTitle') || {}).value?.trim();
  const schedule = (el('progSchedule') || {}).value?.trim();
  const date = (el('progDate') || {}).value;
  const description = (el('progDesc') || {}).value?.trim();

  if (!title || !schedule || !date || !description) {
    alert('Please fill all fields.');
    return;
  }

  try {
    await addDoc(programsCol(), {
      title,
      schedule,
      date,
      description,
      createdAt: serverTimestamp()
    });

    (el('progTitle')||{}).value = '';
    (el('progSchedule')||{}).value = '';
    (el('progDate')||{}).value = '';
    (el('progDesc')||{}).value = '';

    alert('Program added.');
  } catch (err) {
    console.error('Error adding program:', err);
    alert('Failed to add program.');
  }
}
window.saveProgram = saveProgram;

/* Render programs in admin (realtime) */
function loadProgramsAdmin() {
  const qPrograms = query(collection(db, 'upcomingPrograms'), orderBy('date', 'asc'));
  const list = q('.program-list');
  if (!list) return;

  onSnapshot(qPrograms, snapshot => {
    list.innerHTML = '';
    if (snapshot.empty) {
      list.innerHTML = '<p>No programs found.</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;

      const block = document.createElement('div');
      block.className = 'program-card';
      block.style.marginBottom = '10px';

      const dateText = data.date ? new Date(data.date).toLocaleString() : '';

      block.innerHTML = `
        <h4>${escapeHtml(data.title)}</h4>
        <div class="meta">${escapeHtml(data.schedule || '')}</div>
        <div class="meta">${escapeHtml(dateText)}</div>
        <p style="margin:8px 0;">${escapeHtml(data.description || '')}</p>
        <div class="program-actions">
          <button class="btn-primary" data-id="${id}" data-action="edit">Edit</button>
          <button class="btn-danger" data-id="${id}" data-action="delete">Delete</button>
        </div>
      `;

      list.appendChild(block);
    });

    // attach delegation listeners
    list.querySelectorAll('button[data-action]').forEach(btn => {
      const id = btn.getAttribute('data-id');
      const act = btn.getAttribute('data-action');
      btn.onclick = act === 'edit'
        ? () => editProgram(id)
        : () => deleteProgram(id);
    });
  }, err => {
    console.error('onSnapshot error (programs):', err);
    const list = q('.program-list');
    if (list) list.innerHTML = '<p>Error loading programs.</p>';
  });
}
loadProgramsAdmin();

window.deleteProgram = async function(id) {
  if (!confirm('Delete this program?')) return;
  try {
    await deleteDoc(doc(db, 'upcomingPrograms', id));
    alert('Program deleted.');
  } catch (err) {
    console.error('deleteProgram error:', err);
    alert('Failed to delete program.');
  }
};

window.editProgram = async function(id) {
  try {
    const docRef = doc(db, 'upcomingPrograms', id);
    const snap = await getDoc(docRef).catch(err => { throw err; });
    // If getDoc not available via import above, import dynamically:
    // But we already imported getDoc at top (we used getDoc in previous code path),
    // Ensure using getDoc: we already have getDoc imported - but top didn't import getDoc, so:
  } catch (err) {
    // fallback to dynamic import to get getDoc
  }

  // Use dynamic getDoc + updateDoc to avoid import issues
  const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const docRef = doc(db, 'upcomingPrograms', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) { alert('Program not found'); return; }
  const data = snap.data();

  const newTitle = prompt('Edit Title:', data.title) ?? data.title;
  const newSchedule = prompt('Edit Schedule:', data.schedule) ?? data.schedule;
  const newDate = prompt('Edit Date (YYYY-MM-DDTHH:MM):', data.date) ?? data.date;
  const newDesc = prompt('Edit Description:', data.description) ?? data.description;

  try {
    await updateDoc(docRef, {
      title: newTitle,
      schedule: newSchedule,
      date: newDate,
      description: newDesc
    });
    alert('Program updated.');
  } catch (err) {
    console.error('editProgram update error:', err);
    alert('Failed to update program.');
  }
};

/* ===========================
   Announcements (Admin)
   =========================== */
async function addAnnouncement() {
  const title = (el('annTitle')||{}).value?.trim();
  const text = (el('annText')||{}).value?.trim();
  const fileInput = el('annImage');

  if (!title || !text) { alert('Title and text required'); return; }

  let imageUrl = '';
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const storageReference = storageRef(window.storage, `announcement_images/${Date.now()}_${file.name}`);
    await uploadBytes(storageReference, file);
    imageUrl = await getDownloadURL(storageReference);
  }

  try {
    await addDoc(announcementsCol(), {
      title,
      text,
      image: imageUrl,
      date: new Date().toDateString(),
      createdAt: serverTimestamp()
    });
    (el('annTitle')||{}).value = '';
    (el('annText')||{}).value = '';
    if (fileInput) fileInput.value = '';
    alert('Announcement posted.');
  } catch (err) {
    console.error('addAnnouncement error:', err);
    alert('Failed to post announcement.');
  }
}
window.addAnnouncement = addAnnouncement;

/* Realtime load announcements (admin view) */
function loadAdminAnnouncements() {
  const container = q('.ann-list');
  if (!container) return;

  onSnapshot(announcementsCol(), snapshot => {
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p>No announcements yet.</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const a = docSnap.data();
      const id = docSnap.id;

      const article = document.createElement('article');
      article.className = 'ann-item admin-ann';
      article.style.display = 'flex';
      article.style.gap = '12px';
      article.style.padding = '10px';
      article.style.borderBottom = '1px solid #eee';

      article.innerHTML = `
        <div class="ann-thumb" style="width:80px;height:70px;flex:0 0 80px;">
          ${a.image ? `<img src="${a.image}" style="width:80px;height:70px;object-fit:cover;border-radius:8px;">` : '<div style="width:80px;height:70px;background:#f0f0f0;border-radius:6px"></div>'}
        </div>
        <div style="flex:1;">
          <strong>${escapeHtml(a.title)}</strong>
          <div class="meta" style="font-size:0.9rem;color:#666">${escapeHtml(a.date || '')}</div>
          <p class="meta" style="margin-top:6px">${escapeHtml(a.text)}</p>
          <div style="margin-top:8px;">
            <button class="btn-danger" data-id="${id}" data-action="delete-ann">Delete</button>
          </div>
        </div>
      `;
      container.appendChild(article);
    });

    container.querySelectorAll('button[data-action="delete-ann"]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Delete this announcement?')) return;
        try {
          await deleteDoc(doc(db, 'announcements', id));
          alert('Announcement deleted.');
        } catch (err) {
          console.error('delete announcement error:', err);
          alert('Failed to delete announcement.');
        }
      };
    });
  }, err => {
    console.error('onSnapshot error (announcements):', err);
  });
}
loadAdminAnnouncements();

/* ===========================
   Testimonies (Admin)
   =========================== */
function loadTestimoniesAdminLocal() {
  const list = el('testimonyList');
  if (!list) return;
  const local = JSON.parse(localStorage.getItem('testimonies') || '[]');
  list.innerHTML = '';
  if (local.length === 0) list.innerHTML = '<p>No local testimonies.</p>';
  local.forEach((t, i) => {
    const div = document.createElement('div');
    div.style.border = '1px solid #eee';
    div.style.padding = '10px';
    div.style.marginBottom = '8px';
    div.style.borderRadius = '8px';
    div.innerHTML = `
      <p><strong>${escapeHtml(t.name || 'Anonymous')}</strong> ${t.email ? `(${escapeHtml(t.email)})` : ''}</p>
      <p>${escapeHtml(t.text || t.message || '')}</p>
      <button class="btn-danger" data-index="${i}">Delete</button>
    `;
    list.appendChild(div);
  });

  list.querySelectorAll('button[data-index]').forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.getAttribute('data-index'));
      const arr = JSON.parse(localStorage.getItem('testimonies') || '[]');
      const removed = arr.splice(i,1);
      localStorage.setItem('testimonies', JSON.stringify(arr));
      loadTestimoniesAdminLocal();
      alert(`Deleted testimony ${removed[0]?.name || 'Anonymous'}`);
    };
  });
}
loadTestimoniesAdminLocal();

/* Realtime testimonies from Firestore (for cross-device) */
function loadTestimoniesRealtime() {
  onSnapshot(testimoniesCol(), snapshot => {
    const list = el('testimonyList');
    if (!list) return;
    list.innerHTML = '';
    if (snapshot.empty) {
      list.innerHTML = '<p>No testimonies found.</p>';
      return;
    }
    snapshot.forEach(docSnap => {
      const t = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement('div');
      div.style.border = '1px solid #eee';
      div.style.padding = '10px';
      div.style.marginBottom = '8px';
      div.style.borderRadius = '8px';
      div.innerHTML = `
        <p><strong>${escapeHtml(t.name || 'Anonymous')}</strong></p>
        <p>${escapeHtml(t.text)}</p>
        <div style="margin-top:8px;">
          <button class="btn-danger" data-id="${id}">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });

    list.querySelectorAll('button[data-id]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Delete this testimony?')) return;
        try {
          await deleteDoc(doc(db, 'testimonies', id));
          alert('Testimony deleted.');
        } catch (err) {
          console.error('delete testimony error:', err);
          alert('Failed to delete testimony.');
        }
      };
    });
  }, err => {
    console.error('onSnapshot error (testimonies):', err);
  });
}
loadTestimoniesRealtime();

/* expose helpers (for debugging / inline handlers if used) */
window.loadProgramsAdmin = loadProgramsAdmin;
window.saveProgram = saveProgram;
window.deleteProgram = window.deleteProgram; // already defined above
window.addAnnouncement = addAnnouncement;
