require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lavegious';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected (Hybrid Marketplace)'))
  .catch((err) => console.log('⚠️ Database Connection Warning:', err.message));

// --- SCHEMAS ---

// Product Schema (Includes CJ, Qikink, Own inventory tags)
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },
  category: String,
  images: [String],
  source_type: { 
    type: String, 
    enum: ['own', 'cj_dropship', 'qikink_pod'], 
    required: true,
    default: 'own' 
  },
  supplier_product_id: String, // CJ Item ID or Qikink SKU
  sizes: { type: [String], default: ['S', 'M', 'L', 'XL'] },
  colors: { type: [String], default: ['Black', 'White'] },
  designFileUrl: String, // Dedicated for Qikink POD Mockups
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

// Order Schema with Order Fulfillments
const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
    city: String,
    email: String
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    size: String,
    color: String,
    quantity: { type: Number, default: 1 },
    source_type: String,
    supplier_product_id: String
  }],
  totalAmount: Number,
  paymentStatus: { type: String, default: 'PAID' },
  fulfillments: [{
    supplier: { type: String, enum: ['own', 'cj_dropship', 'qikink_pod'] },
    supplier_order_id: String,
    tracking_number: String,
    status: { type: String, default: 'pending' },
    log: String,
    updated_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// --- ROUTES ---

// 1. Fetch All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Admin: Add Product (Hybrid Support)
app.post('/api/admin/products', async (req, res) => {
  try {
    const { title, description, price, costPrice, category, images, source_type, supplier_product_id, designFileUrl, sizes } = req.body;
    
    const newProduct = new Product({
      title,
      description,
      price,
      costPrice,
      category,
      images: images || ['https://via.placeholder.com/400'],
      source_type: source_type || 'own',
      supplier_product_id,
      designFileUrl,
      sizes: sizes || ['S', 'M', 'L', 'XL']
    });

    await newProduct.save();
    res.json({ success: true, message: 'Product added successfully', product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Order Creation & Hybrid Auto-Router Logic
app.post('/api/order/create', async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items empty' });
    }

    let calculatedTotal = 0;
    const processedItems = [];

    // Map item specifications & calculate cost
    for (const item of items) {
      const dbProduct = await Product.findById(item.productId);
      if (dbProduct) {
        calculatedTotal += dbProduct.price * (item.quantity || 1);
        processedItems.push({
          productId: dbProduct._id,
          title: dbProduct.title,
          price: dbProduct.price,
          size: item.size || 'M',
          color: item.color || 'Black',
          quantity: item.quantity || 1,
          source_type: dbProduct.source_type,
          supplier_product_id: dbProduct.supplier_product_id
        });
      }
    }

    const newOrder = new Order({
      customer,
      items: processedItems,
      totalAmount: calculatedTotal,
      paymentStatus: 'PAID',
      fulfillments: []
    });

    await newOrder.save();

    // Grouping Order Items by source_type (Hybrid Splitter)
    const groupedItems = {
      own: processedItems.filter(i => i.source_type === 'own'),
      cj_dropship: processedItems.filter(i => i.source_type === 'cj_dropship'),
      qikink_pod: processedItems.filter(i => i.source_type === 'qikink_pod')
    };

    // A. Handle Qikink Items (POD Auto-Route)
    if (groupedItems.qikink_pod.length > 0) {
      try {
        const qikinkPayload = {
          client_id: process.env.QIKINK_CLIENT_ID,
          client_secret: process.env.QIKINK_CLIENT_SECRET,
          order_number: newOrder._id.toString(),
          line_items: groupedItems.qikink_pod.map(item => ({
            sku: item.supplier_product_id,
            quantity: item.quantity,
            size: item.size
          })),
          shipping_address: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            pincode: customer.pincode,
            city: customer.city
          }
        };

        const qRes = await axios.post('https://api.qikink.com/v1/orders/create', qikinkPayload);
        newOrder.fulfillments.push({
          supplier: 'qikink_pod',
          supplier_order_id: qRes.data?.order_id || 'QIKINK_ACK',
          status: 'sent_to_supplier',
          log: 'Pushed to Qikink POD fulfillment engine'
        });
      } catch (qErr) {
        newOrder.fulfillments.push({
          supplier: 'qikink_pod',
          status: 'failed',
          log: `Qikink Error: ${qErr.message}`
        });
      }
    }

    // B. Handle CJ Dropshipping Items
    if (groupedItems.cj_dropship.length > 0) {
      try {
        const cjPayload = {
          orderNumber: newOrder._id.toString(),
          shippingZip: customer.pincode,
          shippingAddress: customer.address,
          shippingCustomerName: customer.name,
          shippingPhone: customer.phone,
          shippingCity: customer.city,
          products: groupedItems.cj_dropship.map(item => ({
            sku: item.supplier_product_id,
            quantity: item.quantity
          }))
        };

        const cjRes = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder', cjPayload, {
          headers: { 'CJ-Access-Token': process.env.CJ_API_KEY }
        });

        newOrder.fulfillments.push({
          supplier: 'cj_dropship',
          supplier_order_id: cjRes.data?.data?.orderId || 'CJ_ACK',
          status: 'sent_to_supplier',
          log: 'Pushed to CJ Dropshipping engine'
        });
      } catch (cErr) {
        newOrder.fulfillments.push({
          supplier: 'cj_dropship',
          status: 'failed',
          log: `CJ Error: ${cErr.message}`
        });
      }
    }

    // C. Handle Own Stock Items
    if (groupedItems.own.length > 0) {
      newOrder.fulfillments.push({
        supplier: 'own',
        status: 'manual_fulfillment',
        log: 'Local stock - requires physical dispatch'
      });
    }

    await newOrder.save();

    res.json({
      success: true,
      message: 'Hybrid split orders routed successfully',
      orderId: newOrder._id,
      fulfillments: newOrder.fulfillments
    });

  } catch (err) {
    console.error('Hybrid Order Routing Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Safe Wildcard Path Handler (Prevents PathError / express-v5 crash)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Lavegious Engine Live on port ${PORT}`);
});
