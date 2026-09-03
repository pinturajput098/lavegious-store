require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // For web scraping in /api/extract
const cheerio = require('cheerio'); // For web scraping in /api/extract

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for image base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null }, // For discounts
    images: [{ type: String }], // Array of image URLs (can be base64 or external URLs)
    description: { type: String },
    link: { type: String, required: true }, // Affiliate link
    tag: { type: String, default: null }, // e.g., "Oversized", "Trending"
    supplier: { type: String, default: 'QIKINK' }, // New field
    supplierSku: { type: String, default: null }, // New field
    isFeatured: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword === process.env.ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
    }
};

// --- API Routes ---

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ timestamp: -1 }); // Sort by newest first
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});

// POST a new product (Admin Protected)
app.post('/api/products', adminAuth, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: 'Failed to add product', details: err.message });
    }
});

// PUT update an existing product (Admin Protected)
app.put('/api/products/:id', adminAuth, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update product', details: err.message });
    }
});

// DELETE a product (Admin Protected)
app.delete('/api/products/:id', adminAuth, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product', details: err.message });
    }
});

// PUT set a product as featured (Admin Protected)
app.put('/api/products/:id/feature', adminAuth, async (req, res) => {
    try {
        // Unfeature all other products first
        await Product.updateMany({}, { isFeatured: false });

        const featuredProduct = await Product.findByIdAndUpdate(req.params.id, { isFeatured: true }, { new: true });
        if (!featuredProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(featuredProduct);
    } catch (err) {
        res.status(500).json({ error: 'Failed to set product as featured', details: err.message });
    }
});

// POST create an order (Existing logic, ensure compatibility)
app.post('/api/order/create', async (req, res) => {
    // This is a placeholder. In a real app, you'd save to an 'Order' collection,
    // handle payment gateway integration, send notifications, etc.
    console.log('Received order:', req.body);
    try {
        // Simulate order processing
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        res.status(200).json({ message: 'Order placed successfully', orderId: orderId, receivedDetails: req.body });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process order', details: error.message });
    }
});

// POST /api/extract - AI Auto-Drop Link Extractor (Admin Protected)
app.post('/api/extract', adminAuth, async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required for extraction.' });
    }

    try {
        const pythonScriptPath = path.join(__dirname, 'auto_drop.py');
        // Execute the Python script as a child process
        const { spawn } = require('child_process');
        const pythonProcess = spawn('python', [pythonScriptPath, url, '--affiliate_url', url]);

        let scriptOutput = '';
        let scriptError = '';

        pythonProcess.stdout.on('data', (data) => {
            scriptOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            scriptError += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error('Python script stderr:', scriptError);
                return res.status(500).json({ error: 'Failed to extract product details using Python script.', details: scriptError });
            }

            // The Python script updates products.json and prints the new product data to stdout
            // We need to parse this output to return the extracted data to the frontend.
            // Assuming the python script prints the final JSON object of the new product.
            // For this implementation, we'll just return a success message, as the python script's primary job is to update products.json.
            // If the python script were to return the JSON directly, we'd parse `scriptOutput`.
            
            // For now, let's simulate extraction by directly calling the Gemini logic here
            // or by parsing the output if auto_drop.py was modified to print the extracted JSON.
            // Since auto_drop.py is designed to *update a file and commit*, not return JSON directly for the frontend,
            // I will implement a basic scraping logic here for /api/extract to provide immediate feedback to the admin panel.
            // This avoids modifying auto_drop.py's core behavior for this specific API endpoint.

            // Re-implementing a simple scraper for /api/extract to provide immediate feedback
            axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }})
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || $('h1').first().text();
                    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || $('.product-description').text();
                    const price = $('meta[property="og:price:amount"]').attr('content') || $('[itemprop="price"]').attr('content') || $('.price-display').text().replace(/[^0-9.]/g, '');
                    const imageUrl = $('meta[property="og:image"]').attr('content') || $('[itemprop="image"]').attr('src') || $('img.product-main-image').attr('src');
                    
                    // Basic category inference (can be improved)
                    let category = 'General';
                    if (title.toLowerCase().includes('t-shirt') || title.toLowerCase().includes('tee')) category = 'T-Shirts';
                    else if (title.toLowerCase().includes('hoodie') || title.toLowerCase().includes('sweatshirt')) category = 'Hoodies';
                    else if (title.toLowerCase().includes('shirt')) category = 'Shirts';
                    else if (title.toLowerCase().includes('jean') || title.toLowerCase().includes('denim')) category = 'Jeans';
                    else if (title.toLowerCase().includes('trouser') || title.toLowerCase().includes('pant')) category = 'Trousers';
                    else if (title.toLowerCase().includes('shoe') || title.toLowerCase().includes('sneaker')) category = 'Shoes';
                    else if (title.toLowerCase().includes('accessory') || title.toLowerCase().includes('bag') || title.toLowerCase().includes('cap')) category = 'Accessories';

                    res.json({
                        title: title ? title.trim() : '',
                        price: price ? parseFloat(price).toFixed(0) : '',
                        description: description ? description.trim() : '',
                        images: imageUrl ? [imageUrl] : [],
                        category: category,
                        tag: null // Cannot reliably extract tag with simple scraper
                    });
                })
                .catch(scrapeError => {
                    console.error('Error during direct scraping for /api/extract:', scrapeError.message);
                    res.status(500).json({ error: 'Failed to scrape product details directly.', details: scrapeError.message });
                });
        });

    } catch (error) {
        console.error('Error spawning python script:', error);
        res.status(500).json({ error: 'Server error during extraction process.', details: error.message });
    }
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
