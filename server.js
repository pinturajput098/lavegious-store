const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// DEBUG: Check if variable is loaded properly on startup
console.log("--- DEBUG STARTUP ---");
console.log("Render Environment ADMIN_PASSWORD found:", process.env.ADMIN_PASSWORD ? "YES (" + process.env.ADMIN_PASSWORD.length + " chars)" : "NO");
console.log("---------------------");

mongoose.set('bufferCommands', false);

let hasCustomProducts = false;
let localProducts = [
  { _id: "dummy1", images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600"], title: "Cyber Lime Kinetic Parka", description: "Test Product", price: "₹3,499", link: "https://flipkart.com" }
];

const checkPassword = (password) => {
  const masterPass = (process.env.ADMIN_PASSWORD || 'Kajal').trim();
  const inputPass = (password || '').trim();
  console.log(`[DEBUG] Input: '${inputPass}' | Server Expects: '${masterPass}'`);
  return inputPass === masterPass;
};

const isAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (checkPassword(password)) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

app.get('/api/products', (req, res) => res.json(localProducts));

app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  if (checkPassword(password)) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Wrong Password' });
  }
});

app.post('/api/products', isAdmin, (req, res) => {
  const productData = { _id: Date.now().toString(), ...req.body };
  localProducts.unshift(productData);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
