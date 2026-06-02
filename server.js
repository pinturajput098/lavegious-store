const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Database Connection
const mongoURI = process.env.MONGO_URI || "";

if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => console.log('Database Permanently Connected!'))
    .catch(err => console.error('Database Connection Error:', err));
} else {
  console.error('CRITICAL: MONGO_URI not found in environment variables!');
}

const Product = mongoose.model('Product', new mongoose.Schema({
  images: [String],
  title: String,
  description: String,
  price: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
}));

const checkPassword = (password) => {
  return (password || '').trim() === 'Yts@12345';
};

// API
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json([]); }
});

app.post('/api/admin/verify', (req, res) => {
  if (checkPassword(req.body.password)) res.json({ success: true });
  else res.status(401).json({ success: false });
});

app.post('/api/products', (req, res) => {
  if (!checkPassword(req.headers['x-admin-password'])) return res.status(401).json({ success: false });
  new Product(req.body).save()
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/api/products/:id', (req, res) => {
  if (!checkPassword(req.headers['x-admin-password'])) return res.status(401).json({ success: false });
  Product.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ error: err.message }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live`));
