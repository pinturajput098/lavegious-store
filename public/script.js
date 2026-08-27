document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('mainProductContainer');
    const searchInput = document.getElementById('lavegiousSearchInput');
    const chips = document.querySelectorAll('.chip');

    let products = [];
    let currentCategory = 'All Drops';
    let searchQuery = '';

    // Backend API ya local JSON file se real products fetch karne ka function
    async function fetchRealProducts() {
        try {
            let res = await fetch('/api/products');
            if (!res.ok) {
                res = await fetch('/products.json');
            }
            products = await res.json();
        } catch (err) {
            console.error("Real products fetch nahi ho paaye:", err);
            products = [];
        }
        renderProducts();
    }

    function renderProducts() {
        if (!gridContainer) return;

        const q = searchQuery.toLowerCase();

        // Category + Title + Full Description multi-field search filter
        let filtered = products.filter(item => {
            const itemCategory = item.category || '';
            const categoryMatch = currentCategory === 'All Drops' || 
                itemCategory.toLowerCase() === currentCategory.toLowerCase();
            
            const titleMatch = item.title ? item.title.toLowerCase().includes(q) : false;
            const descMatch = item.description ? item.description.toLowerCase().includes(q) : false;
            const catMatch = itemCategory.toLowerCase().includes(q);
            const tagMatch = item.tag ? item.tag.toLowerCase().includes(q) : false;

            const searchMatch = !q || titleMatch || descMatch || catMatch || tagMatch;

            return categoryMatch && searchMatch;
        });

        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6B7280;">
                    <p style="font-size: 16px; font-weight: 700;">Koi real product nahi mila!</p>
                    <p style="font-size: 13px; margin-top: 6px;">Search term ya category badal kar dekho.</p>
                </div>`;
            return;
        }

        gridContainer.innerHTML = filtered.map(product => `
            <div class="product-card">
                <div class="card-img-wrap">
                    ${product.tag ? `<span class="card-badge">${product.tag}</span>` : ''}
                    <img src="${product.image || product.img_url || 'https://via.placeholder.com/300'}" alt="${product.title}">
                </div>
                <div class="card-details">
                    <h3 class="card-title">${product.title}</h3>
                    ${product.description ? `<p style="font-size: 12px; color: #6B7280; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.description}</p>` : ''}
                    <div class="card-price-row">
                        <span class="card-price">₹${product.price}</span>
                        <span class="card-tag">${product.category || 'Drop'}</span>
                    </div>
                    <a href="${product.link || product.affiliate_link || '#'}" target="_blank" rel="noopener noreferrer" class="buy-btn">
                        <span>⚡ Grab Drop</span>
                    </a>
                </div>
            </div>
        `).join('');
    }

    // Live search (Title + Description dono match honge)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderProducts();
        });
    }

    // Category chips selection
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.textContent.trim();
            renderProducts();
        });
    });

    fetchRealProducts();
});
