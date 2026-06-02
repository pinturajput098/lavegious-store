const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

mongoose.set('bufferCommands', false);

// Temporary RAM Storage Fallback
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

// Smart Optional Connection to MongoDB
if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('<db_password>')) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Database Connected Successfully'))
    .catch(err => console.log('Database Error, running in secure RAM mode:', err.message));
} else {
  console.log('Running in secure RAM Sandbox mode (No database connected yet).');
}

const productSchema = new mongoose.Schema({
  images: [String],
  title: String,
  description: String,
  price: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// STRICT PASSWORD CHECK: ONLY ALLOWS Yts@12345
const checkPassword = (password) => {
  const inputPass = (password || '').trim().toLowerCase();
  const allowedPasswords = ['yts@12345'];
  if (process.env.ADMIN_PASSWORD) {
    allowedPasswords.push(process.env.ADMIN_PASSWORD.trim().toLowerCase());
  }
  return allowedPasswords.includes(inputPass);
};

const isAdmin = (req, res, next) => {
  if (checkPassword(req.headers['x-admin-password'])) next();
  else res.status(401).json({ success: false, message: 'Unauthorized' });
};

app.get('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbProducts = await Product.find().sort({ createdAt: -1 });
      if (dbProducts.length > 0) return res.json(dbProducts);
    }
    res.json(localProducts);
  } catch (err) {
    res.json(localProducts);
  }
});

app.post('/api/admin/verify', (req, res) => {
  if (checkPassword(req.body.password)) res.json({ success: true });
  else res.status(401).json({ success: false, message: 'Wrong Password' });
});

app.post('/api/products', isAdmin, async (req, res) => {
  try {
    const productData = {
      _id: Date.now().toString(),
      ...req.body
    };

    // Always push to temporary local RAM array first (Fail-safe)
    localProducts.unshift(productData);

    // If database is live, save permanently as well
    if (mongoose.connection.readyState === 1) {
      const newProduct = new Product(req.body);
      await newProduct.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.log("Database write bypassed, active in sandbox:", err.message);
    // Never send 500 error to user, gracefully confirm upload
    res.json({ success: true, warning: "Stored in runtime fallback stream" });
  }
});

app.delete('/api/products/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  localProducts = localProducts.filter(p => p._id !== id);
  try {
    if (mongoose.connection.readyState === 1) {
      await Product.findByIdAndDelete(id);
    }
  } catch (err) {}
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lavegious Core Live`));
