// Kobler til backend API
const API = "/api/notes";

// Når siden lastes
window.onload = getNotes;


// 🔹 Hent alle notater
async function getNotes() {
  const res = await fetch(API);
  const data = await res.json();

  renderNotes(data);
}


// 🔹 Legg til notat
async function addNote() {
  const input = document.getElementById("noteInput");

  if (input.value === "") return;

  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: input.value })
  });

  input.value = "";

  getNotes();
}


// 🔹 Vis notater
function renderNotes(notes) {
  const list = document.getElementById("noteList");

  list.innerHTML = "";

  notes.forEach(note => {
    const li = document.createElement("li");

    li.textContent = note.text;

    const btn = document.createElement("button");
    btn.textContent = "Slett";

    btn.onclick = () => deleteNote(note.id);

    li.appendChild(btn);

    list.appendChild(li);
  });
}


// 🔹 Slett notat
async function deleteNote(id) {
  await fetch(API + "/" + id, {
    method: "DELETE"
  });

  getNotes();
}