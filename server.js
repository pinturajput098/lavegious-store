const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

mongoose.set('bufferCommands', false);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lavegious')
.then(() => console.log('Connected to Database'))
.catch(err => console.log('Database Error:', err));

const productSchema = new mongoose.Schema({
  images: [String],
  title: String,
  description: String,
  price: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// Strict Password Engine
const checkPassword = (password) => {
  const inputPass = (password || '').trim().toLowerCase();
  // ONLY ALLOW NEW PASSWORD
  const allowedPasswords = ['yts@12345']; 
  if (process.env.ADMIN_PASSWORD) allowedPasswords.push(process.env.ADMIN_PASSWORD.trim().toLowerCase());
  return allowedPasswords.includes(inputPass);
};

const isAdmin = (req, res, next) => {
  if (checkPassword(req.headers['x-admin-password'])) next();
  else res.status(401).json({ success: false, message: 'Unauthorized' });
};

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/verify', (req, res) => {
  if (checkPassword(req.body.password)) res.json({ success: true });
  else res.status(401).json({ success: false, message: 'Wrong Password' });
});

app.post('/api/products', isAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', isAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running`));
