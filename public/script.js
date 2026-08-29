document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('mainProductContainer');
    const searchInput = document.getElementById('lavegiousSearchInput');
    const chips = document.querySelectorAll('.chip');

    let products = [];
    let currentCategory = 'All Drops';
    let searchQuery = '';

    // Multiple Image Key Extractor
    function extractImageUrl(p) {
        if (!p) return 'https://via.placeholder.com/300?text=No+Image';
        if (typeof p.image === 'string' && p.image.trim()) return p.image;
        if (typeof p.imageUrl === 'string' && p.imageUrl.trim()) return p.imageUrl;
        if (typeof p.img_url === 'string' && p.img_url.trim()) return p.img_url;
        if (typeof p.img === 'string' && p.img.trim()) return p.img;
        if (typeof p.photo === 'string' && p.photo.trim()) return p.photo;
        if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
        if (Array.isArray(p.image) && p.image.length > 0) return p.image[0];
        return 'https://via.placeholder.com/300?text=Lavegious+Drop';
    }

    // Smart Category Matching (e.g., Lower/Pants -> Trousers, Tees -> T-Shirts)
    function matchCategory(product, targetCategory) {
        if (targetCategory === 'All Drops') return true;

        const cat = (product.category || '').toLowerCase();
        const title = (product.title || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const tag = (product.tag || '').toLowerCase(); // Use product.tag for badging
        const combined = `${cat} ${title} ${desc} ${tag}`;

        const target = targetCategory.toLowerCase();

        if (target === 'trousers') {
            return combined.includes('trouser') || combined.includes('pant') || combined.includes('lower') || combined.includes('cargo') || combined.includes('track');
        }
        if (target === 'jeans') {
            return combined.includes('jean') || combined.includes('denim');
        }
        if (target === 't-shirts') {
            return combined.includes('t-shirt') || combined.includes('tshirt') || combined.includes('tee') || combined.includes('oversized tee');
        }
        if (target === 'shirts') {
            return combined.includes('shirt') && !combined.includes('t-shirt') && !combined.includes('tshirt');
        }
        if (target === 'shoes') {
            return combined.includes('shoe') || combined.includes('sneaker') || combined.includes('footwear');
        }
        if (target === 'hoodies') {
            return combined.includes('hoodie') || combined.includes('sweatshirt') || combined.includes('jumper');
        }

        return combined.includes(target);
    }

    async function fetchRealProducts() {
        try {
            let res = await fetch('/api/products');
            if (!res.ok) {
                res = await fetch('/products.json');
            }
            products = await res.json();
        } catch (err) {
            console.error("Products load fail hue:", err);
            products = [];
        }
        renderProducts();
    }

    function renderProducts() {
        if (!gridContainer) return;

        const q = searchQuery.toLowerCase();

        let filtered = products.filter(item => {
            const categoryMatch = matchCategory(item, currentCategory);
            
            const titleMatch = item.title ? item.title.toLowerCase().includes(q) : false;
            const descMatch = item.description ? item.description.toLowerCase().includes(q) : false;
            const catMatch = item.category ? item.category.toLowerCase().includes(q) : false;
            const tagMatch = item.tag ? item.tag.toLowerCase().includes(q) : false; // Search by badge tag as well

            const searchMatch = !q || titleMatch || descMatch || catMatch || tagMatch;

            return categoryMatch && searchMatch;
        });

        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6B7280;">
                    <p style="font-size: 16px; font-weight: 700;">No items found in this section!</p>
                    <p style="font-size: 13px; margin-top: 6px;">Try selecting "All Drops" or searching another keyword.</p>
                </div>`;
            return;
        }

        gridContainer.innerHTML = filtered.map(product => {
            const imgUrl = extractImageUrl(product);
            const title = product.title || 'Streetwear Fit';
            const price = product.price || 0;
            const category = product.category || 'Drop';
            const badgeTag = product.tag || ''; // Use product.tag for the badge
            const link = product.link || product.affiliate_link || '#';
            const description = product.description || '';

            return `
                <div class="product-card">
                    <div class="card-img-wrap">
                        ${badgeTag ? `<span class="card-badge">${badgeTag}</span>` : ''}
                        <img src="${imgUrl}" 
                             alt="${title}" 
                             referrerpolicy="no-referrer" 
                             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';">
                    </div>
                    <div class="card-details">
                        <h3 class="card-title">${title}</h3>
                        ${description ? `<p style="font-size: 12px; color: #6B7280; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${description}</p>` : ''}
                        <div class="card-price-row">
                            <span class="card-price">₹${price}</span>
                            <span class="card-tag">${category}</span>
                        </div>
                        <a href="${link}" target="_blank" rel="noopener noreferrer" class="buy-btn">
                            <span>⚡ Grab Drop</span>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderProducts();
        });
    }

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
