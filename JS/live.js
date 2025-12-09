  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { 
    getFirestore, collection, onSnapshot, query, orderBy 
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  /* ------------------------------
       YOUTUBE CONFIG
  ------------------------------ */
  const YOUTUBE_CHANNEL_ID = "YOUR_CHANNEL_ID";
  const YOUTUBE_API_KEY = "YOUR_YT_API_KEY";

  const YT_LIVE_API = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;
  const YT_UPLOADS_API = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&order=date&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;

  /* ------------------------------
       FIREBASE CONFIG
  ------------------------------ */
  const app = initializeApp({
    apiKey: "AIzaSyDazF8P4J-E6UE8J0ERG3K-6m_p_LAWHfs",
    authDomain: "mfmc-829c0.firebaseapp.com",
    projectId: "mfmc-829c0",
    storageBucket: "mfmc-829c0.firebasestorage.app",
    messagingSenderId: "332488323280",
    appId: "1:332488323280:web:e379be4ba2a496b3a32ed5"
  });

  const db = getFirestore(app);
  const sermonsRef = collection(db, "sermons");

  const sermonsBox = document.getElementById("sermonsList");

  /* ------------------------------
        FETCH YOUTUBE CONTENT
  ------------------------------ */

  async function fetchYouTube() {
    let items = [];

    // Check if channel is LIVE
    const liveRes = await fetch(YT_LIVE_API);
    const liveData = await liveRes.json();

    if (liveData.items?.length > 0) {
      const live = liveData.items[0].snippet;
      items.push({
        type: "live",
        title: live.title,
        thumb: live.thumbnails.medium.url,
        date: "LIVE Now",
        duration: "",
        url: `https://www.youtube.com/watch?v=${liveData.items[0].id.videoId}`
      });
    }

    // Get recent uploads
    const upRes = await fetch(YT_UPLOADS_API);
    const upData = await upRes.json();

    upData.items.forEach(v => {
      items.push({
        type: "video",
        title: v.snippet.title,
        thumb: v.snippet.thumbnails.medium.url,
        date: new Date(v.snippet.publishedAt).toDateString(),
        duration: "",
        url: `https://www.youtube.com/watch?v=${v.id.videoId}`
      });
    });

    return items;
  }

  /* ------------------------------
        FETCH FIREBASE SERMONS
  ------------------------------ */
  
  function loadFirebaseSermons(callback) {
    const qSermons = query(sermonsRef, orderBy("timestamp", "desc"));
    onSnapshot(qSermons, snapshot => {
      let results = [];
      snapshot.forEach(doc => results.push(doc.data()));
      callback(results);
    });
  }

  /* ------------------------------
        RENDER EVERYTHING
  ------------------------------ */

  function render(all) {
    sermonsBox.innerHTML = "";

    all.forEach(s => {
      const card = document.createElement("a");
      card.href = s.url || "#";
      card.target = "_blank";
      card.className = "sermon-card";
      card.style.textDecoration = "none";
      card.style.color = "inherit";

      card.innerHTML = `
        <div class="sermon-thumb" 
             style="background-image:url('${s.thumb}'); background-size:cover; background-position:center;">
        </div>
        <strong>${s.title}</strong>
        <div class="meta">${s.date} • ${s.duration || ""}</div>
      `;

      sermonsBox.appendChild(card);
    });
  }

  /* ------------------------------
        LOAD EVERYTHING TOGETHER
  ------------------------------ */

  async function loadAll() {
    const yt = await fetchYouTube();

    loadFirebaseSermons(fb => {
      const combined = [...yt, ...fb];
      render(combined.slice(0, 6)); // Show top 6
    });
  }

  loadAll();