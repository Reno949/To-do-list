// Enkel statisk filserver (ingen avhengigheter)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Filtype -> Content-Type mapping
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Les og returner fil (enkelt) — feilhåndtering: send 404
// Merk: denne funksjonen leser hele filen i minnet før sending.
// Det er enkelt og tilstrekkelig for små filer, men stream ved store filer.
function sendFile(res, filePath) {
  const ext = path.extname(filePath) || '.html';
  const type = mime[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

// Håndterer innkommende forespørsler, normaliserer URL og beskytter mot path-traversal
const server = http.createServer((req, res) => {
  const safeUrl = decodeURIComponent(req.url.split('?')[0]);
  let requestedPath = path.normalize(safeUrl).replace(/^\//, '');

  // Root -> serve index.html
  if (!requestedPath || requestedPath === '') {
    return sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
  }

  // Blokker forsøk på å gå utenfor public-mappen (enkelt sikkerhetstiltak)
  if (requestedPath.includes('..')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  const fullPath = path.join(PUBLIC_DIR, requestedPath);
  fs.stat(fullPath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      const indexPath = path.join(fullPath, 'index.html');
      return sendFile(res, indexPath);
    }
    sendFile(res, fullPath);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});

