// admin_programs.js
import { 
  collection, addDoc, getDocs, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { 
  ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Wait until firebase.js loads and sets window.db
function waitForDb() {
  return new Promise(resolve => {
    const check = () => {
      if (window.db && window.storage) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
}

async function uploadImage(file) {
  if (!file) return "";

  const storageRef = ref(window.storage, "programs/" + Date.now() + "_" + file.name);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

async function saveProgram(title, text, date, imageFile) {
  const imageURL = await uploadImage(imageFile);

  await addDoc(collection(window.db, "upcoming_programs"), {
    title,
    text,
    date,
    image: imageURL,
    timestamp: Date.now(),
  });

  alert("Program saved successfully!");
  loadPrograms(); // Refresh list
}

async function loadPrograms() {
  const programsContainer = document.getElementById("programsList");
  programsContainer.innerHTML = "<p>Loading...</p>";

  const querySnapshot = await getDocs(collection(window.db, "upcoming_programs"));
  programsContainer.innerHTML = "";

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const item = document.createElement("div");
    item.className = "programItem";
    item.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.text}</p>
      <p><strong>Date:</strong> ${data.date}</p>
      ${data.image ? `<img src="${data.image}" width="200">` : ""}
      <button data-id="${id}" class="deleteProgram">Delete</button>
      <hr>
    `;

    programsContainer.appendChild(item);
  });

  // Delete event listener
  document.querySelectorAll(".deleteProgram").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(window.db, "upcoming_programs", btn.dataset.id));
      alert("Program deleted.");
      loadPrograms();
    });
  });
}

// Start after Firebase is fully ready
await waitForDb();

// Form handling
document.getElementById("saveProgramBtn").addEventListener("click", async () => {
  const title = document.getElementById("programTitle").value.trim();
  const text = document.getElementById("programText").value.trim();
  const date = document.getElementById("programDate").value.trim();
  const file = document.getElementById("programImage").files[0];

  if (!title || !text || !date) {
    alert("Please fill out all fields.");
    return;
  }

  await saveProgram(title, text, date, file);
});

// Load on page open
loadPrograms();
