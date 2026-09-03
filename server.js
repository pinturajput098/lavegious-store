const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors'); // For development, consider restricting in production

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// In-memory product storage (for demonstration, in a real app this would be a database)
let products = [];
const PRODUCTS_JSON_PATH = path.join(__dirname, 'products.json');

// Load products from products.json on startup
const loadProducts = () => {
    if (fs.existsSync(PRODUCTS_JSON_PATH)) {
        try {
            const data = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8');
            products = JSON.parse(data);
            console.log(`Loaded ${products.length} products from products.json`);
        } catch (error) {
            console.error('Error loading products.json:', error);
            products = [];
        }
    } else {
        console.warn('products.json not found. Starting with an empty product list.');
    }
};
loadProducts();

// API to get all products (used by public/script.js)
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Admin API: Create a new product
app.post('/api/products', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized: Invalid admin password.' });
    }

    const newProduct = { _id: String(Date.now()), ...req.body }; // Simple ID generation
    products.unshift(newProduct); // Add to the beginning
    try {
        fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), 'utf8');
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Failed to save product.' });
    }
});

// Admin API: Update a product
app.put('/api/products/:id', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized: Invalid admin password.' });
    }

    const { id } = req.params;
    const updatedProductData = req.body;

    const productIndex = products.findIndex(p => p._id === id);
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found.' });
    }

    // Merge existing images if no new images are provided in the update payload
    if (!updatedProductData.images || updatedProductData.images.length === 0) {
        updatedProductData.images = products[productIndex].images; // Retain existing images
    }

    products[productIndex] = { ...products[productIndex], ...updatedProductData, _id: id };

    try {
        fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), 'utf8');
        res.json(products[productIndex]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product.' });
    }
});

// Admin API: Delete a product
app.delete('/api/products/:id', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized: Invalid admin password.' });
    }

    const { id } = req.params;
    const initialLength = products.length;
    products = products.filter(p => p._id !== id);

    if (products.length === initialLength) {
        return res.status(404).json({ error: 'Product not found.' });
    }

    try {
        fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), 'utf8');
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product.' });
    }
});

// Admin API: Set a product as featured
app.put('/api/products/:id/feature', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized: Invalid admin password.' });
    }

    const { id } = req.params;
    const productIndex = products.findIndex(p => p._id === id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found.' });
    }

    // Unset previous featured product and set the new one
    products.forEach(p => p.isFeatured = false);
    products[productIndex].isFeatured = true;

    try {
        fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), 'utf8');
        res.json(products[productIndex]);
    } catch (error) {
        console.error('Error setting featured product:', error);
        res.status(500).json({ error: 'Failed to set featured product.' });
    }
});

// Admin API: AI Auto-Drop Link Extractor (Placeholder for actual integration)
app.post('/api/extract', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized: Invalid admin password.' });
    }

    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required for extraction.' });
    }

    console.log(`AI Auto-Drop: Attempting to extract data from: ${url}`);

    // This is a placeholder. In a real application, you would integrate with a scraping service
    // or a more sophisticated AI model here. For now, we return mock data.
    const mockData = {
        title: "Oversized Graphic Tee - 'Cyberpunk City'",
        price: "999",
        description: "Premium heavyweight cotton oversized t-shirt with a futuristic cyberpunk city graphic print. Drop shoulder design for a relaxed fit. Perfect for streetwear enthusiasts.",
        category: "T-Shirts",
        tag: "Oversized",
        images: [
            "https://images.unsplash.com/photo-1622441814479-e302973192f1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1622441814479-e302973192f1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
    };

    // Simulate a delay for AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json(mockData);
});

// New API endpoint for creating an order
app.post('/api/order/create', async (req, res) => {
    const orderDetails = req.body;
    console.log('Received new order request:', orderDetails);

    if (!orderDetails.productId || !orderDetails.size || !orderDetails.fullName || !orderDetails.phoneNumber || !orderDetails.fullAddress || !orderDetails.pincode || !orderDetails.city) {
        return res.status(400).json({ error: 'Missing required order details.' });
    }

    // Generate a simple order ID
    const orderId = `LAV-${Date.now()}`;

    // --- Simulate Qikink API Call ---
    const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID;
    const QIKINK_CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;

    if (QIKINK_CLIENT_ID && QIKINK_CLIENT_SECRET) {
        console.log('Simulating Qikink API call...');
        // In a real scenario, you would make an actual HTTP POST request to Qikink's API here.
        // Example (pseudo-code):
        /*
        try {
            const qikinkResponse = await axios.post('https://api.qikink.com/v1/orders', {
                client_id: QIKINK_CLIENT_ID,
                client_secret: QIKINK_CLIENT_SECRET,
                order_data: {
                    product_id: orderDetails.productId,
                    size: orderDetails.size,
                    customer_name: orderDetails.fullName,
                    shipping_address: `${orderDetails.fullAddress}, ${orderDetails.city}, ${orderDetails.pincode}`,
                    // ... other necessary Qikink specific fields
                }
            });
            console.log('Qikink API response:', qikinkResponse.data);
        } catch (qikinkError) {
            console.error('Error calling Qikink API:', qikinkError.response ? qikinkError.response.data : qikinkError.message);
        }
        */
        console.log('Qikink API would be called with:', {
            clientId: QIKINK_CLIENT_ID,
            clientSecret: QIKINK_CLIENT_SECRET,
            orderData: orderDetails
        });
    } else {
        console.warn('QIKINK_CLIENT_ID or QIKINK_CLIENT_SECRET not set. Skipping Qikink API call.');
    }

    // --- Simulate CJ Dropshipping API Call ---
    const CJ_API_KEY = process.env.CJ_API_KEY;

    if (CJ_API_KEY) {
        console.log('Simulating CJ Dropshipping API call...');
        // In a real scenario, you would make an actual HTTP POST request to CJ Dropshipping's API here.
        // Example (pseudo-code):
        /*
        try {
            const cjResponse = await axios.post('https://api.cjdropshipping.com/v1/orders/create', {
                api_key: CJ_API_KEY,
                order_details: {
                    product_sku: orderDetails.productId, // Assuming productId maps to SKU
                    quantity: 1,
                    variant_name: orderDetails.size,
                    shipping_info: {
                        name: orderDetails.fullName,
                        phone: orderDetails.phoneNumber,
                        address: orderDetails.fullAddress,
                        zip: orderDetails.pincode,
                        city: orderDetails.city,
                        country: 'India' // Assuming India for Lavegious
                    }
                    // ... other necessary CJ Dropshipping specific fields
                }
            });
            console.log('CJ Dropshipping API response:', cjResponse.data);
        } catch (cjError) {
            console.error('Error calling CJ Dropshipping API:', cjError.response ? cjError.response.data : cjError.message);
        }
        */
        console.log('CJ Dropshipping API would be called with:', {
            apiKey: CJ_API_KEY,
            orderData: orderDetails
        });
    } else {
        console.warn('CJ_API_KEY not set. Skipping CJ Dropshipping API call.');
    }

    // Respond to the client
    res.status(200).json({ message: 'Order received and processing initiated.', orderId: orderId });
});

// Serve admin.html for /admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch-all for other routes to serve index.html (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`LAVEGIOUS server running on http://localhost:${PORT}`);
});
