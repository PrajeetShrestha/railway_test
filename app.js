const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// Create users table if it doesn’t exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL
)`);

// Route to display all users (Read)
app.get('/', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) throw err;
    res.render('index', { users: rows });
  });
});

// Add a new user (Create)
app.post('/add', (req, res) => {
  const { name, email } = req.body;
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Edit user - Render edit form
app.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) throw err;
    res.render('index', { users: [], editUser: row });
  });
});

// Update user
app.post('/update/:id', (req, res) => {
  const { name, email } = req.body;
  const id = req.params.id;
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Delete user
app.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));