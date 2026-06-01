const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

mongoose.set('bufferCommands', false);

// Global In-Memory Store for instant local validation if DB is offline
let hasCustomProducts = false;
let localProducts = [
  {
    _id: "dummy1",
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600"],
    title: "Cyber Lime Kinetic Parka",
    description: "Acid green structured silhouette with experimental industrial modular stitching panels. Perfect for high energy drop transitions.",
    price: "₹3,499",
    link: "https://flipkart.com"
  },
  {
    _id: "dummy2",
    images: ["https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600", "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=600"],
    title: "Solar Flare Canary Blazer",
    description: "High-contrast vivid yellow tailored drape cut meticulously styled for editorial premium looks.",
    price: "₹4,200",
    link: "https://flipkart.com"
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lavegious', {
  serverSelectionTimeoutMS: 2000
})
.then(() => console.log('MongoDB Connected to Cloud Matrix'))
.catch(() => console.log('Database Offline: Running in Auto-Sandbox Mode'));

const productSchema = new mongoose.Schema({
  images: [String],
  title: String,
  description: String,
  price: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

const isAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  // Allow fallback password for local testing
  if (password === process.env.ADMIN_PASSWORD || password === 'MeraSuperStrongPassword123' || password === '') {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// GET Route
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

// VERIFY Route
app.post('/api/admin/verify', (req, res) => {
  res.json({ success: true });
});

// POST Route (Handles local memory switch to clear dummies instantly)
app.post('/api/products', isAdmin, async (req, res) => {
  try {
    const productData = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...req.body
    };

    if (!hasCustomProducts) {
      localProducts = []; // Wipe out dummy items instantly on first add
      hasCustomProducts = true;
    }
    localProducts.unshift(productData);

    if (mongoose.connection.readyState === 1) {
      const newProduct = new Product(req.body);
      await newProduct.save();
    }
    res.json({ success: true, product: productData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Route
app.delete('/api/products/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  localProducts = localProducts.filter(p => p._id !== id);
  
  if (mongoose.connection.readyState === 1) {
    await Product.findByIdAndDelete(id);
  }
  res.json({ success: true, message: "Product purged successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lavegious Sandbox ready on port ${PORT}`));
