

/* ===============================
   DEFAULT SERVICE LIST
================================= */
const defaultServices = [
  { day: 1, time: "05:00", title: "Command The Week — Monday 5:00 AM" },
  { day: 1, time: "16:30", title: "Bible Study — Monday 4:30 PM" },
  { day: 3, time: "16:30", title: "Manna Water — Wednesday 4:30 PM" },
  { day: 5, time: "16:30", title: "Deliverance Service — Friday 4:30 PM" },
  { day: 0, time: "06:30", title: "Sunday Deliverance Service — 6:30 AM" }
];

/* Load admin-modified services OR fallback */
function getServices() {
  return JSON.parse(localStorage.getItem("serviceList")) || defaultServices;
}

/* Save service list for admin editing */
function saveServices(list) {
  localStorage.setItem("serviceList", JSON.stringify(list));
}

/* ===============================
   GET NEXT UPCOMING SERVICE
================================= */
function getNextService() {
  const now = new Date();
  const services = getServices();
  let closest = null;

  services.forEach(service => {
    const [h, m] = service.time.split(":").map(Number);

    const d = new Date();
    d.setDate(now.getDate() + ((service.day - now.getDay() + 7) % 7));
    d.setHours(h, m, 0, 0);

    if (d <= now) d.setDate(d.getDate() + 7);
    if (!closest || d < closest.date) closest = { ...service, date: d };
  });

  return closest;
}

/* ===============================
      COUNTDOWN SYSTEM
================================= */
function startCountdown() {
  const next = getNextService();

  const titleEl = document.getElementById("service-title");
  const countdownEl = document.getElementById("countdown");

  titleEl.textContent = next.title;

  function update() {
    const now = new Date().getTime();
    const diff = next.date - now;

    if (diff <= 0) {
      countdownEl.textContent = "Service is LIVE NOW!";
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    countdownEl.textContent = `Starts in ${days}d ${hours}h ${minutes}m`;
  }

  update();
  setInterval(update, 60000);
}

/* ===============================
      POPUP ALERT BOX
================================= */
function showPopup(text) {
  const box = document.createElement("div");
  box.textContent = text;

  // Styles
  Object.assign(box.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#111",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    zIndex: "9999",
    fontSize: "14px",
  });

  document.body.appendChild(box);
  setTimeout(() => box.remove(), 6000);
}

/* ===============================
      NOTIFICATION PERMISSION
================================= */
function requestPermission() {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}

/* ===============================
      SEND PUSH NOTIFICATION
================================= */
function sendPush(text) {
  if (Notification.permission === "granted") {
    new Notification("Church Reminder", { body: text });
  }
}

/* ===============================
      SOUND ALERT
================================= */
function playAlertSound() {
  const sound = document.getElementById("alertSound");
  sound.play().catch(() => {});
}

/* ===============================
     HOURLY REMINDER
================================= */
function activateHourlyReminder(nextService) {
  setInterval(() => {
    const now = new Date();
    if (now.getMinutes() === 0) {
      showPopup(`Reminder: ${nextService.title}`);
      sendPush(`Reminder: ${nextService.title}`);
    }
  }, 60000);
}

/* ===============================
   DAILY 7AM REMINDER
================================= */
function activateDailyReminder(nextService) {
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 7 && now.getMinutes() === 0) {
      showPopup(`Daily Reminder: ${nextService.title}`);
      sendPush(`Daily Reminder: ${nextService.title}`);
    }
  }, 60000);
}

/* ===============================
   SERVICE WARNING SOUND (15 mins before)
================================= */
function activateSoundAlert(nextService) {
  setInterval(() => {
    const now = new Date().getTime();
    const diff = nextService.date - now;

    if (diff <= 900000 && diff > 840000) {  
      playAlertSound();
      showPopup(`Service starts in 15 minutes: ${nextService.title}`);
      sendPush(`Service starts in 15 minutes!`);
    }
  }, 60000);
}

/* ===============================
   USER BUTTON → ACTIVATE ALL
================================= */
document.getElementById("notifyBtn").addEventListener("click", () => {
  const next = getNextService();

  showPopup("⏰ All reminders activated!");
  requestPermission();

  activateHourlyReminder(next);
  activateDailyReminder(next);
  activateSoundAlert(next);
});

/* START COUNTDOWN */
startCountdown();

//UP COMING PROGRAM

 // Set the next program date
  function getNextProgramDate() {
    const now = new Date();
    const today = new Date();
    today.setHours(16, 30, 0, 0); // 4:30 PM today
    const day = now.getDay(); // Sunday = 0

    // Only Monday-Thursday allowed
    if(day === 0 || day === 5 || day === 6 || today < now) {
      const diffDays = (1 + 7 - day) % 7; // next Monday
      today.setDate(today.getDate() + diffDays);
    }
    return today;
  }

  const countdownEl = document.getElementById('program-countdown');
  let programTime = getNextProgramDate();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = programTime - now;

    if(distance <= 0) {
      countdownEl.textContent = "Program is Live!";
      alert("The God of the Eleventh Hour Program is starting now!");
      clearInterval(countdownInterval);
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000*60*60));
    const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
    const seconds = Math.floor((distance % (1000*60)) / 1000);

    countdownEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
  }

  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  // Reminder Button
  const reminderBtn = document.getElementById('reminderBtn');
  reminderBtn.addEventListener('click', () => {
    if(!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    Notification.requestPermission().then(permission => {
      if(permission === "granted") {
        alert("Reminder enabled! You will get a notification 1 hour before the program.");
        const checkReminder = setInterval(() => {
          const now = new Date().getTime();
          const distance = programTime - now;
          if(distance <= 60*60*1000) { // 1 hour
            new Notification("Reminder: The God of the Eleventh Hour Program starts in 1 hour!");
            clearInterval(checkReminder);
          }
        }, 10000); // check every 10 seconds
      }
    });
  });

  function loadAnnouncementsIndex() {
  const annList = document.getElementById("annListIndex");
  const anns = JSON.parse(localStorage.getItem("announcements")) || [];
  annList.innerHTML = '';
  if (anns.length === 0) {
    annList.innerHTML = "<p>No announcements yet.</p>";
    return;
  }
  anns.forEach(a => {
    const div = document.createElement("article");
    div.classList.add("ann-item");
    div.innerHTML = `
      <div class="ann-thumb">Image</div>
      <div>
        <strong>${a.title}</strong>
        <div class="meta">${a.date || ''}</div>
        <p class="meta">${a.text}</p>
      </div>
    `;
    annList.appendChild(div);
  });
}

// Initial load
function loadAnnouncements() {
  const annList = document.getElementById("annListIndex");
  annList.innerHTML = `<p>Loading announcements...</p>`;

  // Listen for real-time updates from Firebase
  onSnapshot(collection(db, "announcements"), snapshot => {
    annList.innerHTML = "";

    if (snapshot.empty) {
      annList.innerHTML = "<p>No announcements yet.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const a = doc.data();
      annList.innerHTML += `
        <article class="ann-item">
          <div class="ann-thumb">
            ${a.image 
              ? `<img src="${a.image}" style="width:80px;height:70px;border-radius:8px;object-fit:cover;">`
              : `Image`
            }
          </div>
          <div>
            <strong>${a.title}</strong>
            <div class="meta">${a.date || ""}</div>
            <p class="meta">${a.text}</p>
          </div>
        </article>
      `;
    });
  });
}

loadAnnouncements();

function loadProgramIndex() {
  const prog = JSON.parse(localStorage.getItem("upcomingProgram"));
  if (!prog) {
    document.getElementById("progScheduleText").textContent = "No program set.";
    document.getElementById("progDescText").textContent = "";
    return;
  }
  document.getElementById("progScheduleText").textContent = prog.schedule + " • " + prog.title;
  document.getElementById("progDescText").textContent = prog.description;
}

// Refresh automatically if admin updates
window.addEventListener('storage', (event) => {
  if (event.key === 'programUpdate') {
    loadProgramIndex();
    alert("Upcoming program has been updated!");
  }
});

loadProgramIndex();

function loadProgramIndex() {
  const prog = JSON.parse(localStorage.getItem("upcomingProgram"));
  if (!prog) {
    document.getElementById("progScheduleText").textContent = "No program set.";
    document.getElementById("progDescText").textContent = "";
    document.getElementById("program-countdown").textContent = "";
    return;
  }
  document.getElementById("progScheduleText").textContent = prog.schedule + " • " + prog.title;
  document.getElementById("progDescText").textContent = prog.description;

  // Countdown timer
  const countdownEl = document.getElementById("program-countdown");
  const targetDate = new Date(prog.date).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if(diff <= 0) {
      countdownEl.textContent = "Program is live!";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    const minutes = Math.floor((diff%(1000*60*60))/(1000*60));
    const seconds = Math.floor((diff%(1000*60))/1000);

    countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
}

// Refresh automatically if admin updates
window.addEventListener('storage', (event) => {
  if (event.key === 'programUpdate') {
    loadProgramIndex();
    alert("Upcoming program has been updated!");
  }
});

loadProgramIndex();

// Toggle menu
function toggleMenu() {
  document.querySelector('.nav').classList.toggle("open");
}

// ===== ANNOUNCEMENTS =====
function renderAnnouncementsIndex() {
  const annList = document.getElementById('annListIndex');
  const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
  if(announcements.length === 0){
    annList.innerHTML = '<p>No announcements yet.</p>';
    return;
  }
  annList.innerHTML = '';
  announcements.forEach(ann => {
    const div = document.createElement('div');
    div.className = 'announcement-item';
    div.innerHTML = `
      <strong>${ann.title}</strong>
      <p>${ann.text}</p>
      ${ann.image ? `<img src="${ann.image}" style="max-width:100%; border-radius:8px; margin-top:8px;">` : ''}
    `;
    annList.appendChild(div);
  });
}
renderAnnouncementsIndex();

// ===== UPCOMING PROGRAM =====
function renderUpcomingProgram() {
  const upcomingTitle = document.getElementById('upcomingProgramTitle');
  const upcomingDate = document.getElementById('upcomingProgramDate');
  const upcomingDesc = document.getElementById('upcomingProgramDesc');
  const upcomingActivities = document.getElementById('upcomingProgramActivities');
  const upcomingImage = document.getElementById('upcomingProgramImage');
  const countdownEl = document.getElementById('program-countdown');

  const programs = JSON.parse(localStorage.getItem('programs')) || [];
  if(programs.length === 0){
    upcomingTitle.textContent = 'No upcoming programs';
    upcomingDate.textContent = '';
    upcomingDesc.textContent = '';
    upcomingActivities.textContent = '';
    upcomingImage.style.display = 'none';
    countdownEl.textContent = '';
    return;
  }

  // Find nearest upcoming program
  const now = new Date();
  let nearest = programs[0];
  let minDiff = Math.abs(new Date(programs[0].dateTime) - now);
  programs.forEach(p=>{
    const diff = new Date(p.dateTime) - now;
    if(diff>=0 && diff < minDiff){
      nearest = p;
      minDiff = diff;
    }
  });

  upcomingTitle.textContent = nearest.title;
  upcomingDate.textContent = new Date(nearest.dateTime).toLocaleString();
  upcomingDesc.textContent = nearest.description;
  upcomingActivities.textContent = 'Activities: ' + nearest.activities;
  if(nearest.image){
    upcomingImage.src = nearest.image;
    upcomingImage.style.display = 'block';
  } else {
    upcomingImage.style.display = 'none';
  }

  // Countdown
  function updateCountdown() {
    const now = new Date();
    const eventDate = new Date(nearest.dateTime);
    const diff = eventDate - now;
    if(diff<=0){
      countdownEl.textContent = 'Program is ongoing or finished';
      clearInterval(countdownInterval);
      alert(`The program "${nearest.title}" is starting soon!`);
      return;
    }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60)) % 24);
    const m = Math.floor((diff/(1000*60)) % 60);
    const s = Math.floor((diff/1000) % 60);
    countdownEl.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown,1000);

  // Reminder button
  const reminderBtn = document.getElementById('reminderBtn');
  reminderBtn.onclick = ()=>{
    alert(`Reminder set for "${nearest.title}"!`);
  };
}
renderUpcomingProgram();

// ======= Upcoming Program Display on index.html =======

// Get upcoming program card elements
const upcomingTitle = document.getElementById('upcomingProgramTitle');
const upcomingDate = document.getElementById('upcomingProgramDate');
const upcomingDesc = document.getElementById('upcomingProgramDesc');
const upcomingActivities = document.getElementById('upcomingProgramActivities');
const programCountdown = document.getElementById('program-countdown');

// Function to load upcoming program from localStorage
async function loadUpcomingProgram() {
  const doc = await db.collection("upcomingProgram").doc("main").get();

  if (!doc.exists) {
    document.getElementById("upcomingProgramTitle").textContent = "No program available.";
    return;
  }

  const data = doc.data();

  document.getElementById("upcomingProgramTitle").textContent = data.title;
  document.getElementById("upcomingProgramDate").textContent = data.schedule;
  document.getElementById("upcomingProgramDesc").textContent = data.desc;

  startProgramCountdown(data.date);
}

function startProgramCountdown(programDate) {
  const eventTime = new Date(programDate).getTime();
  const el = document.getElementById("program-countdown");

  function tick() {
    const now = Date.now();
    const diff = eventTime - now;

    if (diff <= 0) {
      el.textContent = "The program is live!";
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);

    el.textContent = `Starts in: ${d}d ${h}h ${m}m`;
  }

  tick();
  setInterval(tick, 60000);
}

loadUpcomingProgram();

 