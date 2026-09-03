const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000; // Assuming a port, can be configured via .env

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---
// These are inferred from public/script.js and public/admin.html
// In a real application, these would interact with a database or products.json
// Assuming products.json exists or will be created by auto_drop.py
// If products.json doesn't exist, this line might cause an error. 
// For a robust solution, consider lazy loading or error handling for products.json.
let products = [];
try {
  products = require('./products.json');
} catch (error) {
  console.warn('products.json not found or malformed. Starting with empty product list.');
}

app.get('/api/products', (req, res) => {
  res.json(products); // Serve products from the assumed products.json
});

app.post('/api/order/create', (req, res) => {
  // Placeholder for order creation logic
  console.log('Order received:', req.body);
  res.status(200).json({ message: 'Order placed successfully', orderId: 'ORD' + Date.now() });
});

app.post('/api/extract', (req, res) => {
  // Placeholder for AI extraction, actual logic is in auto_drop.py
  console.log('Extraction request received for URL:', req.body.url);
  // In a real scenario, you might call auto_drop.py or a similar service here
  res.status(501).json({ error: 'AI extraction not implemented on server.js, handled by auto_drop.py' });
});

// Admin API routes (simplified placeholders)
app.post('/api/products', (req, res) => {
  // Add product logic
  res.status(201).json({ message: 'Product added (placeholder)' });
});
app.put('/api/products/:id', (req, res) => {
  // Update product logic
  res.status(200).json({ message: 'Product updated (placeholder)' });
});
app.put('/api/products/:id/feature', (req, res) => {
  // Feature product logic
  res.status(200).json({ message: 'Product featured (placeholder)' });
});
app.delete('/api/products/:id', (req, res) => {
  // Delete product logic
  res.status(200).json({ message: 'Product deleted (placeholder)' });
});

// --- SPA Fallback Route ---
// Replaced the wildcard route app.get('*', ...) or app.use('*', ...) 
// with the provided app.use middleware, fixing the syntax and adding a common SPA condition.
// This ensures path-to-regexp issues are avoided and client-side routing works.
app.use((req, res, next) => {
  // Serve index.html for all non-static, non-API HTML requests.
  // This acts as a SPA fallback for client-side routing.
  // The 'req.accepts("html")' check ensures it only applies to browser navigation,
  // preventing interference with direct asset requests or API calls.
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // If it's not an HTML request (e.g., for an image, CSS, JS, or an API that wasn't matched),
    // pass control to the next middleware (e.g., a 404 handler or other server-side routes).
    next();
  }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
