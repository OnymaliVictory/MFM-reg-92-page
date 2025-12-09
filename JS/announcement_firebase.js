import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function saveAnnouncement(title, text, date, imageURL) {
  await addDoc(collection(db, "announcements"), {
    title, text, date, image: imageURL || "",
    timestamp: Date.now()
  });
  alert("Announcement posted!");
}

