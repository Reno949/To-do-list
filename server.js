// Simple server with JSON "database"
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DB_PATH = path.join(__dirname, 'db.json');

// MIME types
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

// --- Helper: read DB ---
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { notes: [], todos: [] };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// --- Helper: write DB ---
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Send file ---
function sendFile(res, filePath) {
  const ext = path.extname(filePath) || '.html';
  const type = mime[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

// --- Server ---
const server = http.createServer((req, res) => {
  const safeUrl = decodeURIComponent(req.url.split('?')[0]);

  // ---------------- API ----------------
  if (safeUrl.startsWith('/api')) {
    const db = readDB();

    // GET notes
    if (req.method === 'GET' && safeUrl === '/api/notes') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(db.notes));
    }

    // POST note
    if (req.method === 'POST' && safeUrl === '/api/notes') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);

        const newNote = {
          id: Date.now().toString(),
          title: data.title,
          content: data.content,
          createdAt: new Date()
        };

        db.notes.push(newNote);
        writeDB(db);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newNote));
      });
      return;
    }

    // DELETE note
    if (req.method === 'DELETE' && safeUrl.startsWith('/api/notes/')) {
      const id = safeUrl.split('/').pop();

      db.notes = db.notes.filter(n => n.id !== id);
      writeDB(db);

      res.writeHead(204);
      return res.end();
    }

    // GET todos
    if (req.method === 'GET' && safeUrl === '/api/todos') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(db.todos));
    }

    // POST todo
    if (req.method === 'POST' && safeUrl === '/api/todos') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);

        const newTodo = {
          id: Date.now().toString(),
          title: data.title,
          tasks: (data.tasks || []).map(t => ({
            id: Date.now().toString() + Math.random(),
            text: t.text,
            completed: false
          })),
          createdAt: new Date()
        };

        db.todos.push(newTodo);
        writeDB(db);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTodo));
      });
      return;
    }

    // DELETE todo
    if (req.method === 'DELETE' && safeUrl.startsWith('/api/todos/')) {
      const id = safeUrl.split('/').pop();

      db.todos = db.todos.filter(t => t.id !== id);
      writeDB(db);

      res.writeHead(204);
      return res.end();
    }

    // TOGGLE task
    if (req.method === 'PATCH' && safeUrl.includes('/tasks/')) {
      const parts = safeUrl.split('/');
      const listId = parts[3];
      const taskId = parts[5];

      const list = db.todos.find(t => t.id === listId);
      if (list) {
        const task = list.tasks.find(t => t.id === taskId);
        if (task) task.completed = !task.completed;
      }

      writeDB(db);
      res.writeHead(200);
      return res.end();
    }

    // fallback
    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'API not found' }));
  }

  // ---------------- STATIC FILES ----------------
  let requestedPath = path.normalize(safeUrl).replace(/^\//, '');

  if (!requestedPath) {
    return sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
  }

  if (requestedPath.includes('..')) {
    res.writeHead(400);
    return res.end('Bad request');
  }

  const fullPath = path.join(PUBLIC_DIR, requestedPath);

  fs.stat(fullPath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      return sendFile(res, path.join(fullPath, 'index.html'));
    }
    sendFile(res, fullPath);
  });
});

// --- Start server ---
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
})