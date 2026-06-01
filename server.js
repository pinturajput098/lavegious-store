const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

mongoose.set('bufferCommands', false);

let hasCustomProducts = false;
let localProducts = [
  {
    _id: "dummy1",
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600"],
    title: "Cyber Lime Kinetic Parka",
    description: "Acid green structured silhouette with experimental industrial modular stitching panels.",
    price: "₹3,499",
    link: "https://flipkart.com"
  }
];

// Multi-fallback case-insensitive password engine
const checkPassword = (password) => {
  const inputPass = (password || '').trim().toLowerCase();
  
  // Master password list including your new updated password
  const allowedPasswords = ['kajal', '1234', 'piyush', 'yts@12345'];
  
  if (process.env.ADMIN_PASSWORD) {
    allowedPasswords.push(process.env.ADMIN_PASSWORD.trim().toLowerCase());
  }
  
  return allowedPasswords.includes(inputPass);
};

const isAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (checkPassword(password)) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

app.get('/api/products', (req, res) => {
  res.json(localProducts);
});

app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  if (checkPassword(password)) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Wrong Password' });
  }
});

app.post('/api/products', isAdmin, (req, res) => {
  try {
    const productData = {
      _id: Date.now().toString(),
      ...req.body
    };

    if (!hasCustomProducts) {
      localProducts = [];
      hasCustomProducts = true;
    }
    localProducts.unshift(productData);
    res.json({ success: true, product: productData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  localProducts = localProducts.filter(p => p._id !== id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lavegious Engine running on port ${PORT}`));
