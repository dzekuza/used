const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const path = require('path');
const app = express();
const PORT = 3001;
const SECRET_KEY = 'a_very_secure_and_random_secret_key_1234567890';

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

let users = [];
let items = [];
let currentItemId = 1;

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Cannot find user' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(403).json({ message: 'Invalid password' });

  const accessToken = jwt.sign({ username: user.username }, SECRET_KEY);
  res.json({ accessToken });
});

// Get all items for logged-in user
app.get('/items', authenticateToken, (req, res) => {
  const userItems = items.filter(item => item.owner === req.user.username);
  res.json(userItems);
});

// Add new item
app.post('/items', authenticateToken, (req, res) => {
  const { title, images, description, features, discounts } = req.body;
  const newItem = {
    id: currentItemId++,
    owner: req.user.username,
    title,
    images,
    description,
    features,
    discounts,
    availability: []
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Update item availability
app.put('/items/:id/availability', authenticateToken, (req, res) => {
  const itemId = parseInt(req.params.id);
  const { availability } = req.body;
  const item = items.find(i => i.id === itemId && i.owner === req.user.username);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  item.availability = availability;
  res.json(item);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
