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

// Upgraded Schema supporting explicit categories and featured flags
const Product = mongoose.model('Product', new mongoose.Schema({
  images: [String],
  title: String,
  description: String,
  price: String,
  link: String,
  category: { type: String, default: 'Shirt' },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}));

// App routing maps
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'public', 'shop.html')));

app.get('/api/products', async (req, res) => {
  try { 
    const products = await Product.find().sort({ createdAt: -1 }); 
    res.json(products); 
  } catch (err) { 
    res.json([]); 
  }
});

app.post('/api/admin/verify', (req, res) => {
  if ((req.body.password || '').trim() === 'Yts@12345') res.json({ success: true });
  else res.status(401).json({ success: false });
});

app.post('/api/products', async (req, res) => {
  if ((req.headers['x-admin-password'] || '').trim() !== 'Yts@12345') return res.status(401).json({ success: false });
  try {
    // If this product is set as featured hero, clear other flags first
    if (req.body.isFeatured === true) {
      await Product.updateMany({}, { isFeatured: false });
    }
    await new Product(req.body).save(); 
    res.json({ success: true }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Explicit route to change featured status easily from management panel
app.put('/api/products/:id/feature', async (req, res) => {
  if ((req.headers['x-admin-password'] || '').trim() !== 'Yts@12345') return res.status(401).json({ success: false });
  try {
    await Product.updateMany({}, { isFeatured: false });
    await Product.findByIdAndUpdate(req.params.id, { isFeatured: true });
    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.delete('/api/products/:id', async (req, res) => {
  if ((req.headers['x-admin-password'] || '').trim() !== 'Yts@12345') return res.status(401).json({ success: false });
  try { 
    await Product.findByIdAndDelete(req.params.id); 
    res.json({ success: true }); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Live Engine Running`));
