// Enkel Express-server for Notatapp
// Kort og grei: tilbyr et lite REST-API og serverer frontend-filer fra prosjektroten.
//
// Kommentarguide (kort):
// - Hjelpefunksjoner under (readDB, writeDB) leser/lagrer hele db.json-filen.
// - Endepunkter (/api/notes, /api/todos) gjør enkle CRUD-operasjoner.
// - Denne appen er ment som et lokalt lærings-/demo-eksempel, ikke produksjon.
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, "db.json");

app.use(cors());  
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Les DB fra fil. Oppretter tom db hvis fil mangler.
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const empty = { notes: [], todos: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

// Skriv hele DB-objektet til fil
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Enkel unik id-generator (tilstrekkelig for denne demoen)
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Merk: readDB/writeDB leser/skriv hele filen synkront for enkelhet.
// Dette er greit for små demoer, men ikke anbefalt ved høy trafikk.

// --- Notater (endpoints) ---
app.get("/api/notes", (req, res) => {
  const db = readDB();
  res.json(db.notes); 
});

app.get("/api/notes/:id", (req, res) => {
  const db = readDB();
  const note = db.notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

app.post("/api/notes", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title and content are required" });
  }
  const db = readDB();
  const note = {
    id: generateId(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };
  db.notes.push(note);
  writeDB(db);
  res.status(201).json(note);
});

app.delete("/api/notes/:id", (req, res) => {
  const db = readDB();
  const index = db.notes.findIndex((n) => n.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Note not found" });
  db.notes.splice(index, 1);
  writeDB(db);
  res.json({ message: "Note deleted" });
});

// --- Todo-lister (endpoints) ---
app.get("/api/todos", (req, res) => {
  const db = readDB();
  res.json(db.todos);
});

app.get("/api/todos/:id", (req, res) => {
  const db = readDB();
  const list = db.todos.find((t) => t.id === req.params.id);
  if (!list) return res.status(404).json({ error: "Todo list not found" });
  res.json(list);
});

app.post("/api/todos", (req, res) => {
  const { title, tasks } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const db = readDB();
  const list = {
    id: generateId(),
    title,
    tasks: (tasks || []).map((t) => ({
      id: generateId(),
      text: t.text || "",
      completed: t.completed || false,
    })),
    createdAt: new Date().toISOString(),
  };
  db.todos.push(list);
  writeDB(db);
  res.status(201).json(list);
});

// Toggle ferdigstillelse på en oppgave
app.patch("/api/todos/:listId/tasks/:taskId", (req, res) => {
  const db = readDB();
  const list = db.todos.find((t) => t.id === req.params.listId);
  if (!list) return res.status(404).json({ error: "Todo list not found" });
  const task = list.tasks.find((t) => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });
  task.completed = !task.completed;
  writeDB(db);
  res.json(list);
});

app.delete("/api/todos/:id", (req, res) => {
  const db = readDB();
  const index = db.todos.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Todo list not found" });
  db.todos.splice(index, 1);
  writeDB(db);
  res.json({ message: "Todo list deleted" });
});

// Serve SPA: send index.html for ikke-/api-forespørsler
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});