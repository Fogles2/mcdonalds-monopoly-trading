const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./monopoly.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Stickers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    stickerCode TEXT UNIQUE,
    FOREIGN KEY(userId) REFERENCES Users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER,
    receiverId INTEGER,
    stickerCode TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(senderId) REFERENCES Users(id),
    FOREIGN KEY(receiverId) REFERENCES Users(id)
  )`);
});

// Example API endpoint for user registration
app.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  db.run(
    'INSERT INTO Users (username, password, email) VALUES (?, ?, ?)',
    [username, password, email],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});