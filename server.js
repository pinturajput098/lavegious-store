const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// AUTO-CORRECT ENGINE: Automatically fixes the ':8750' typo from your Render settings
let mongoURI = process.env.MONGO_URI || "";
if (mongoURI.includes("mongodb+srv://") && mongoURI.includes("@")) {
  let parts = mongoURI.split("@");
  parts[1] = parts[1].replace(/:[0-9]+/g, ""); // Strips out any illegal ports like :8750 dynamically
  mongoURI = parts.join("@");
}

mongoose.set('bufferCommands', false);
mongoose.connect(mongoURI || 'mongodb://localhost:27017/lavegious')
  .then(() => console.log('Database Permanently Connected and Secured!'))
  .catch(err => console.log('Database Error Fallback:', err.message));

const Product = mongoose.model('Product', new mongoose.Schema({
  images: [String],
  title: String,
  description: String,
  price: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
}));

// Serve Admin Dashboard Page on a clean hidden route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// APIs
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.json([]); }
});

app.post('/api/admin/verify', (req, res) => {
  if ((req.body.password || '').trim() === 'Yts@12345') res.json({ success: true });
  else res.status(401).json({ success: false });
});

app.post('/api/products', async (req, res) => {
  if ((req.headers['x-admin-password'] || '').trim() !== 'Yts@12345') return res.status(401).json({ success: false });
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  if ((req.headers['x-admin-password'] || '').trim() !== 'Yts@12345') return res.status(401).json({ success: false });
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lavegious Engine Matrix Online`));
