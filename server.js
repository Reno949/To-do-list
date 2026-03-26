// Lager server med Express
const express = require("express");

// Lar oss lese og skrive filer (database)
const fs = require("fs");

const app = express();
const PORT = 3000;

// Gjør at vi kan motta JSON fra frontend
app.use(express.json());

// Gjør public-mappen tilgjengelig i nettleser
app.use(express.static("public"));


// 🔹 Leser data fra db.json
function readData() {
  const data = fs.readFileSync("db.json");
  return JSON.parse(data);
}

// 🔹 Skriver data til db.json
function writeData(data) {
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
}


// 🔹 GET → hent alle notater
app.get("/api/notes", (req, res) => {
  res.json(readData());
});


// 🔹 POST → legg til notat
app.post("/api/notes", (req, res) => {
  const data = readData();

  const newNote = {
    id: Date.now(), // unik id
    text: req.body.text
  };

  data.push(newNote);

  writeData(data);

  res.json(newNote);
});


// 🔹 DELETE → slett notat
app.delete("/api/notes/:id", (req, res) => {
  const data = readData();

  const id = parseInt(req.params.id);

  const newData = data.filter(note => note.id !== id);

  writeData(newData);

  res.json({ message: "Slettet" });
});


// Starter server
app.listen(PORT, () => {
  console.log("Server kjører på http://localhost:" + PORT);
});