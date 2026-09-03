require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lavegious';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('⚠️ MongoDB Connection Warning:', err.message));

// Schemas
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  images: [String],
  supplier: { type: String, enum: ['QIKINK', 'CJ_DROPSHIPPING', 'LOCAL'], default: 'LOCAL' },
  supplierSku: String,
  sizes: { type: [String], default: ['S', 'M', 'L', 'XL', 'XXL'] },
  colors: { type: [String], default: ['Black', 'White'] },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  size: String,
  color: String,
  customer: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
    city: String
  },
  paymentStatus: { type: String, default: 'PAID' },
  fulfillmentStatus: { type: String, default: 'PENDING' },
  supplier: String,
  supplierOrderId: String,
  logs: Array
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// --- ROUTES ---

// 1. Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Create Order & Auto-Fulfill Trigger
app.post('/api/order/create', async (req, res) => {
  try {
    const { productId, size, color, custName, custPhone, custAddress, custPincode, custCity } = req.body;

    const product = await Product.findById(productId);
    
    const newOrder = new Order({
      productId,
      size: size || 'M',
      color: color || 'Black',
      customer: {
        name: custName,
        phone: custPhone,
        address: custAddress,
        pincode: custPincode,
        city: custCity
      },
      supplier: product ? product.supplier : 'LOCAL',
      paymentStatus: 'PAID'
    });

    await newOrder.save();

    let fulfillmentLog = 'Local order recorded';
    let supplierOrderId = null;

    // Auto Fulfillment Trigger
    if (product && product.supplier === 'QIKINK') {
      try {
        const qikinkRes = await axios.post('https://api.qikink.com/v1/orders/create', {
          client_id: process.env.QIKINK_CLIENT_ID,
          client_secret: process.env.QIKINK_CLIENT_SECRET,
          sku: product.supplierSku || 'DEFAULT_SKU',
          size: size,
          quantity: 1,
          shipping_address: {
            name: custName,
            phone: custPhone,
            address: custAddress,
            pincode: custPincode,
            city: custCity
          }
        });
        fulfillmentLog = 'Order pushed to Qikink successfully';
        supplierOrderId = qikinkRes.data?.order_id || 'QIKINK_OK';
      } catch (qErr) {
        fulfillmentLog = `Qikink API Error: ${qErr.message}`;
      }
    } else if (product && product.supplier === 'CJ_DROPSHIPPING') {
      try {
        const cjRes = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder', {
          orderNumber: newOrder._id.toString(),
          shippingZip: custPincode,
          shippingAddress: custAddress,
          shippingCustomerName: custName,
          shippingPhone: custPhone,
          shippingCity: custCity,
          products: [{
            sku: product.supplierSku || 'DEFAULT_CJ_SKU',
            quantity: 1
          }]
        }, {
          headers: { 'CJ-Access-Token': process.env.CJ_API_KEY }
        });
        fulfillmentLog = 'Order pushed to CJ Dropshipping successfully';
        supplierOrderId = cjRes.data?.data?.orderId || 'CJ_OK';
      } catch (cErr) {
        fulfillmentLog = `CJ API Error: ${cErr.message}`;
      }
    }

    newOrder.fulfillmentStatus = supplierOrderId ? 'SUCCESS' : 'LOCAL_ONLY';
    newOrder.supplierOrderId = supplierOrderId;
    newOrder.logs.push(fulfillmentLog);
    await newOrder.save();

    res.json({
      success: true,
      message: 'Order created and processed successfully',
      orderId: newOrder._id,
      fulfillmentLog
    });

  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Express Safe Wildcard Catch-All Route (No path-to-regexp crashes)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Lavegious Server running on port ${PORT}`);
});
