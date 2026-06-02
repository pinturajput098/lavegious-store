const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

let mongoURI = process.env.MONGO_URI || "";
if (mongoURI.includes("mongodb+srv://") && mongoURI.includes("@")) {
  let parts = mongoURI.split("@");
  parts[1] = parts[1].replace(/:[0-9]+/g, "");
  mongoURI = parts.join("@");
}

mongoose.connect(mongoURI || 'mongodb://localhost:27017/lavegious')
  .then(() => console.log('Database Permanently Connected!'))
  .catch(err => console.log('Database Error:', err.message));

const Product = mongoose.model('Product', new mongoose.Schema({
  images: [String],
  title: String,
  description: String,
  price: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
}));

// Routes
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'public', 'shop.html')));

app.get('/api/products', async (req, res) => {
  try { const products = await Product.find().sort({ createdAt: -1 }); res.json(products); }
  catch (err) { res.json([]); }
});

app.post('/api/admin/verify', (req, res) => {
  if ((req.body.password || '').trim() === 'Yts@12345') res.json({ success: true });
  else res.status(401).json({ success: false });
});

app.post('/api/products', async (req, res) => {
  if ((req.headers['x-admin-password'] || '').trim() !== 'Yts@12345') return res.status(401).json({ success: false });
  try { await new Product(req.body).save(); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  if ((req.headers['x-admin-password'] || '').trim() !== 'Yts@12345') return res.status(401).json({ success: false });
  try { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Live`));
