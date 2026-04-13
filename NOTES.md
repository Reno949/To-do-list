# NOTES — kort forklaring (på norsk)

Dette prosjektet er en liten lokal Notat-app med en veldig enkel backend.

Filer:
- `index.js` — Express-server som tilbyr REST-endepunktene `/api/notes` og `/api/todos`.
  - `readDB()` / `writeDB()` leser og skriver `db.json` synkront. Egner seg for demo/utvikling, men ikke for høy belastning.
  - Endepunktene bruker enkel validering og returnerer JSON.

- `server.js` — alternativ enkel statisk filserver (ingen avhengigheter). Kan brukes hvis du vil kjøre uten Express.

- `index.html` — frontend (vanlig DOM-manipulasjon). Viktige funksjoner:
  - `loadNotes()` / `loadTodos()` henter data fra `/api/*` og viser dem.
  - `create-note` og `create-todo` oppretter nye enheter via POST.
  - `escapeHtml()` brukes for å unngå enkel XSS når data vises.

- `styles.css` — styling og layout. Variabler i `:root` styrer farger og bevegelser.

- `db.json` — enkel JSON-database. Struktur:
  ```json
  {
    "notes": [ /* { id, title, content, createdAt } */ ],
    "todos": [ /* { id, title, tasks: [{id,text,completed}], createdAt } */ ]
  }
  ```

Hvordan kjøre (lokalt):
1. Installer avhengigheter: `npm install` (hvis ikke allerede gjort).
2. Start server med Express: `node index.js`  (eller `npm start`).
3. Åpne http://localhost:3000 i nettleseren.

Notat om kommentarer:
- JSON-filer (som `db.json` og `package.json`) kan ikke inneholde kommentarer; derfor ligger forklarende tekst her i denne `NOTES.md`.

Hvis du vil ha enda flere forklaringer i koden (linje-for-linje), si hvilken fil du vil ha komplett annotert — jeg kan legge korte forklaringer over hver funksjon uten å endre oppførsel.
