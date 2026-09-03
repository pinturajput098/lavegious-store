const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // 'T-Shirts', 'Hoodies', 'Accessories'
  images: [{ type: String }],
  
  // POD & Dropshipping Specific Fields
  supplier: { type: String, enum: ['QIKINK', 'CJ_DROPSHIPPING', 'LOCAL'], default: 'LOCAL' },
  supplierSku: { type: String },
  sizes: { type: [String], default: ['S', 'M', 'L', 'XL', 'XXL'] },
  colors: { type: [String], default: ['Black', 'White'] },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

