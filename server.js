// // server.js - API + SQLite + frontend (tudo em 1 arquivo)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.LOGS_API_KEY || 'd4b7c9f2a6e04f3bb8e0e91f7a1e62fd'; // troque aqui ou na env var

// DB (arquivo logs.db criado automaticamente)
const db = new Database(path.join(__dirname, 'logs.db'));
db.prepare(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    userId TEXT,
    command TEXT,
    timestamp INTEGER,
    serverId TEXT
  )
`).run();

const insertStmt = db.prepare('INSERT INTO logs (username, userId, command, timestamp, serverId) VALUES (?, ?, ?, ?, ?)');

app.use(cors());
app.use(bodyParser.json());

// Endpoint que recebe logs (POST) — o Roblox envia para aqui (x-api-key header obrigatório)
app.post('/api/logs', (req, res) => {
  const key = req.header('x-api-key') || '';
  if (!key || key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body || {};
  if (!body.username || !body.command) return res.status(400).json({ error: 'Invalid payload' });

  try {
    insertStmt.run(body.username, body.userId || '', body.command, body.timestamp || Math.floor(Date.now()/1000), body.server || '');
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'DB error' });
  }
});

// Endpoint de busca simples: /api/search?username=SAORI_0157
app.get('/api/search', (req, res) => {
  const q = (req.query.username || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing username' });

  const stmt = db.prepare('SELECT * FROM logs WHERE username LIKE ? ORDER BY timestamp DESC');
  const rows = stmt.all(q + '%');
  res.json({ results: rows });
});

// Página web (frontend simples) — tudo servido por este arquivo
app.get('/', (req, res) => {
  // HTML + JS embutido
  res.send(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Logs de comandos</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:20px}
        input{padding:8px;width:300px}
        button{padding:8px}
        table{border-collapse:collapse;width:100%;margin-top:16px}
        th,td{padding:8px;border:1px solid #ddd;text-align:left}
        pre{white-space:pre-wrap;margin:0}
      </style>
    </head>
    <body>
      <h1>Pesquisar logs</h1>
      <div>
        <input id="username" placeholder="Digite o nome (ex: SAORI_0157)" />
        <button id="search">Pesquisar</button>
      </div>
      <div id="results"></div>

      <script>
        document.getElementById('search').addEventListener('click', async () => {
          const username = document.getElementById('username').value.trim();
          if (!username) return alert('Digite um nome');
          const res = await fetch('/api/search?username=' + encodeURIComponent(username));
          if (!res.ok) {
            const t = await res.json().catch(()=>({error:'erro'}));
            return alert('Erro na busca: ' + (t.error||res.status));
          }
          const data = await res.json();
          const container = document.getElementById('results');
          if (!data.results || data.results.length === 0) {
            container.innerHTML = '<p>Nenhum resultado</p>';
            return;
          }
          let html = '<table><thead><tr><th>Data</th><th>Usuario</th><th>Comando</th><th>Server</th></tr></thead><tbody>';
          data.results.forEach(r => {
            const date = new Date(r.timestamp * 1000).toLocaleString('pt-BR');
            html += '<tr><td>' + date + '</td><td>' + (r.username + ' (' + r.userId + ')') + '</td><td><pre>' + escapeHtml(r.command) + '</pre></td><td>' + (r.serverId||'') + '</td></tr>';
          });
          html += '</tbody></table>';
          container.innerHTML = html;
        });

        function escapeHtml(text) {
          return (text||'').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
  console.log('API_KEY:', API_KEY === 'COLOQUE_SUA_API_KEY_AQUI' ? '[ATENÇÃO: troque API_KEY]' : '[OK]');
});
 - API + SQLite + frontend (tudo em 1 arquivo)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.LOGS_API_KEY || 'COLOQUE_SUA_API_KEY_AQUI'; // troque aqui ou na env var

// DB (arquivo logs.db criado automaticamente)
const db = new Database(path.join(__dirname, 'logs.db'));
db.prepare(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    userId TEXT,
    command TEXT,
    timestamp INTEGER,
    serverId TEXT
  )
`).run();

const insertStmt = db.prepare('INSERT INTO logs (username, userId, command, timestamp, serverId) VALUES (?, ?, ?, ?, ?)');

app.use(cors());
app.use(bodyParser.json());

// Endpoint que recebe logs (POST) — o Roblox envia para aqui (x-api-key header obrigatório)
app.post('/api/logs', (req, res) => {
  const key = req.header('x-api-key') || '';
  if (!key || key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body || {};
  if (!body.username || !body.command) return res.status(400).json({ error: 'Invalid payload' });

  try {
    insertStmt.run(body.username, body.userId || '', body.command, body.timestamp || Math.floor(Date.now()/1000), body.server || '');
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'DB error' });
  }
});

// Endpoint de busca simples: /api/search?username=SAORI_0157
app.get('/api/search', (req, res) => {
  const q = (req.query.username || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing username' });

  const stmt = db.prepare('SELECT * FROM logs WHERE username LIKE ? ORDER BY timestamp DESC');
  const rows = stmt.all(q + '%');
  res.json({ results: rows });
});

// Página web (frontend simples) — tudo servido por este arquivo
app.get('/', (req, res) => {
  // HTML + JS embutido
  res.send(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Logs de comandos</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:20px}
        input{padding:8px;width:300px}
        button{padding:8px}
        table{border-collapse:collapse;width:100%;margin-top:16px}
        th,td{padding:8px;border:1px solid #ddd;text-align:left}
        pre{white-space:pre-wrap;margin:0}
      </style>
    </head>
    <body>
      <h1>Pesquisar logs</h1>
      <div>
        <input id="username" placeholder="Digite o nome (ex: SAORI_0157)" />
        <button id="search">Pesquisar</button>
      </div>
      <div id="results"></div>

      <script>
        document.getElementById('search').addEventListener('click', async () => {
          const username = document.getElementById('username').value.trim();
          if (!username) return alert('Digite um nome');
          const res = await fetch('/api/search?username=' + encodeURIComponent(username));
          if (!res.ok) {
            const t = await res.json().catch(()=>({error:'erro'}));
            return alert('Erro na busca: ' + (t.error||res.status));
          }
          const data = await res.json();
          const container = document.getElementById('results');
          if (!data.results || data.results.length === 0) {
            container.innerHTML = '<p>Nenhum resultado</p>';
            return;
          }
          let html = '<table><thead><tr><th>Data</th><th>Usuario</th><th>Comando</th><th>Server</th></tr></thead><tbody>';
          data.results.forEach(r => {
            const date = new Date(r.timestamp * 1000).toLocaleString('pt-BR');
            html += '<tr><td>' + date + '</td><td>' + (r.username + ' (' + r.userId + ')') + '</td><td><pre>' + escapeHtml(r.command) + '</pre></td><td>' + (r.serverId||'') + '</td></tr>';
          });
          html += '</tbody></table>';
          container.innerHTML = html;
        });

        function escapeHtml(text) {
          return (text||'').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
  console.log('API_KEY:', API_KEY === 'd4b7c9f2a6e04f3bb8e0e91f7a1e62fd' ? '[ATENÇÃO: troque API_KEY]' : '[OK]');
});
