    // Header menu toggle
    function toggleMenu() {
      const nav = document.querySelector('.nav');
      nav.classList.toggle("open");
    }

    // Current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // =================== TESTIMONY SCRIPT ===================
    const shareBtn = document.getElementById("shareTestimonyBtn");
    const modal = document.getElementById("testimonyModal");
    const closeModalBtn = document.getElementById("closeModal");
    const form = document.getElementById("testimonyForm");
    const testimonyList = document.getElementById("testimonyList");

    shareBtn.addEventListener("click", () => { modal.style.display = "block"; });
    closeModalBtn.addEventListener("click", () => { modal.style.display = "none"; });
    window.addEventListener("click", (e) => { if(e.target === modal) modal.style.display = "none"; });

    // Load saved testimonies
    document.addEventListener("DOMContentLoaded", () => {
      const saved = JSON.parse(localStorage.getItem("testimonies")) || [];
      saved.forEach(t => addTestimonyToList(t.name, t.email, t.anonymous, t.message));
    });

    // Form submission
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const anonymous = document.getElementById("anonymous").checked;
      const message = document.getElementById("message").value.trim();
      if(!message){ alert("Please write your testimony before submitting."); return; }
      const displayName = anonymous || !name ? "Anonymous" : name;

      // Save in localStorage
      const saved = JSON.parse(localStorage.getItem("testimonies")) || [];
      saved.push({name: displayName, email: anonymous ? "" : email, anonymous, message});
      localStorage.setItem("testimonies", JSON.stringify(saved));

      // Add to page
      addTestimonyToList(displayName, anonymous ? "" : email, anonymous, message);

      form.reset();
      modal.style.display = "none";
    });

    function addTestimonyToList(name, email, anonymous, message){
      const newTestimony = document.createElement("article");
      newTestimony.classList.add("ann-item");
      newTestimony.innerHTML = `
        <div class="ann-thumb"></div>
        <div>
          <strong>${name}</strong>
          <p class="meta" style="margin-top:6px;">${message}</p>
          <div class="meta">${anonymous ? "" : email}</div>
        </div>
      `;
      testimonyList.prepend(newTestimony);
    }

    function submitTestimony() {
  const nameInput = document.getElementById('userName').value.trim();
  const emailInput = document.getElementById('userEmail').value.trim();
  const textInput = document.getElementById('userTestimony').value.trim();
  const anonymous = document.getElementById('anonymous').checked;

  if (!textInput) {
    alert('Testimony cannot be empty!');
    return;
  }

  const testimonies = JSON.parse(localStorage.getItem('testimonies')) || [];

  const newTestimony = {
    name: anonymous ? 'Anonymous' : nameInput || 'Anonymous',
    email: emailInput || '',
    text: textInput,
    timestamp: new Date().toISOString()
  };

  testimonies.push(newTestimony);
  localStorage.setItem('testimonies', JSON.stringify(testimonies));

  alert('Testimony submitted successfully!');
  document.getElementById('userName').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('userTestimony').value = '';
  document.getElementById('anonymous').checked = false;
}


function loadUserTestimonies() {
  const testimonyContainer = document.getElementById('testimonyContainer'); // make sure you have this div
  const testimonies = JSON.parse(localStorage.getItem('testimonies')) || [];

  if (testimonies.length === 0) {
    testimonyContainer.innerHTML = '<p>No testimonies submitted yet.</p>';
    return;
  }

  testimonyContainer.innerHTML = ''; // clear old list

  testimonies.forEach(t => {
    const name = t.name ? t.name : 'Anonymous';
    const text = t.text ? t.text : '';
    
    const div = document.createElement('div');
    div.className = 'testimony-item';
    div.innerHTML = `
      <p><strong>${name}</strong></p>
      <p>${text}</p>
      <hr>
    `;
    testimonyContainer.appendChild(div);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadUserTestimonies);

function loadTestimonies() {
  const testimonies = JSON.parse(localStorage.getItem('testimonies')) || [];

  const recentContainer = document.getElementById('recentTestimonyList');
  const allContainer = document.getElementById('testimonyContainer');

  // Clear old content
  recentContainer.innerHTML = '';
  allContainer.innerHTML = '';

  if (testimonies.length === 0) {
    recentContainer.innerHTML = '<p>No testimonies submitted yet.</p>';
    allContainer.innerHTML = '<p>No testimonies submitted yet.</p>';
    return;
  }

  // Display recent 3 testimonies
  const recent = testimonies.slice(-3).reverse();
  recent.forEach(t => {
    const name = t.name ? t.name : 'Anonymous';
    const text = t.text ? t.text : '';
    const div = document.createElement('div');
    div.className = 'testimony-item';
    div.innerHTML = `<p><strong>${name}</strong></p><p>${text}</p><hr>`;
    recentContainer.appendChild(div);
  });

  // Display all testimonies
  testimonies.slice().reverse().forEach(t => {
    const name = t.name ? t.name : 'Anonymous';
    const text = t.text ? t.text : '';
    const div = document.createElement('div');
    div.className = 'testimony-item';
    div.innerHTML = `<p><strong>${name}</strong></p><p>${text}</p><hr>`;
    allContainer.appendChild(div);
  });
}

// Auto-refresh whenever the page loads
document.addEventListener('DOMContentLoaded', loadTestimonies);
