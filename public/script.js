const products = [
    {
        id: 1,
        title: "Relaxed Fit Denim Jeans",
        price: 405,
        category: "Denims",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500",
        tag: "Best Seller"
    },
    {
        id: 2,
        title: "Liberty Aesthetic Streetwear Shoes",
        price: 755,
        category: "Sneakers",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        tag: "Trending"
    },
    {
        id: 3,
        title: "Regular Fit Checked Casual Shirt",
        price: 359,
        category: "Shirts",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500",
        tag: "New Drop"
    },
    {
        id: 4,
        title: "We Kaika Oversized Graphic Tee",
        price: 305,
        category: "Hoodies",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
        tag: "Oversized"
    },
    {
        id: 5,
        title: "Men Striped Casual Party Shirt",
        price: 448,
        category: "Shirts",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
        tag: "Limited"
    },
    {
        id: 6,
        title: "Urban Utility Cargo Hoodie",
        price: 699,
        category: "Hoodies",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500",
        tag: "Streetwear"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('mainProductContainer');
    const searchInput = document.getElementById('lavegiousSearchInput');
    const chips = document.querySelectorAll('.chip');

    let currentCategory = 'All Drops';
    let searchQuery = '';

    function renderProducts() {
        if (!gridContainer) return;

        let filtered = products.filter(item => {
            const matchesCategory = currentCategory === 'All Drops' || item.category.toLowerCase() === currentCategory.toLowerCase();
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            gridContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6B7280; font-weight: 600;">No streetwear found matching your search.</div>`;
            return;
        }

        gridContainer.innerHTML = filtered.map(product => `
            <div class="product-card">
                <div class="card-img-wrap">
                    <span class="card-badge">${product.tag}</span>
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="card-details">
                    <h3 class="card-title">${product.title}</h3>
                    <div class="card-price-row">
                        <span class="card-price">₹${product.price}</span>
                        <span class="card-tag">${product.category}</span>
                    </div>
                    <button class="buy-btn" onclick="alert('Added ${product.title} to cart!')">
                        <span>⚡ Grab Drop</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Live Search Event
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderProducts();
        });
    }

    // Filter Chips Event
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.textContent.trim();
            renderProducts();
        });
    });

    // Initial Render
    renderProducts();
});
