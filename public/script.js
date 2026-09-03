document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('mainProductContainer');
    const searchInput = document.getElementById('lavegiousSearchInput');
    const chips = document.querySelectorAll('.chip');

    // Modal elements
    const checkoutModal = document.getElementById('checkoutModal');
    const modalCloseBtn = checkoutModal.querySelector('.modal-close-btn');
    const modalProductImg = document.getElementById('modalProductImg');
    const modalProductTitle = document.getElementById('modalProductTitle');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalProductId = document.getElementById('modalProductId');
    const checkoutForm = document.getElementById('checkoutForm');
    const sizeSelect = document.getElementById('sizeSelect');
    const fullNameInput = document.getElementById('fullName');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const fullAddressInput = document.getElementById('fullAddress');
    const pincodeInput = document.getElementById('pincode');
    const cityInput = document.getElementById('city');

    // Auth Modal elements
    const authModal = document.getElementById('authModal');
    const loginSignupBtn = document.getElementById('loginSignupBtn');
    const authCloseBtn = document.querySelector('.auth-close-btn');
    const authForm = document.getElementById('authForm');
    const authInput = document.getElementById('authInput');

    // Carousel elements
    const carouselTrack = document.getElementById('bannerCarouselTrack');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const carouselDotsContainer = document.getElementById('carouselDots');
    let currentIndex = 0;
    const itemWidth = carouselItems[0] ? carouselItems[0].clientWidth : 0; // Ensure items exist
    let autoSlideInterval;

    let products = [];
    let currentCategory = 'All Drops';
    let searchQuery = '';
    let selectedSizeForModal = ''; // To store selected size from product card

    // Multiple Image Key Extractor
    function extractImageUrl(p) {
        if (!p) return 'https://via.placeholder.com/300?text=No+Image';
        if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
        if (typeof p.image === 'string' && p.image.trim()) return p.image;
        if (typeof p.imageUrl === 'string' && p.imageUrl.trim()) return p.imageUrl;
        if (typeof p.img_url === 'string' && p.img_url.trim()) return p.img_url;
        if (typeof p.img === 'string' && p.img.trim()) return p.img;
        if (typeof p.photo === 'string' && p.photo.trim()) return p.photo;
        return 'https://via.placeholder.com/300?text=Lavegious+Drop';
    }

    // Smart Category Matching (e.g., Lower/Pants -> Trousers, Tees -> T-Shirts)
    function matchCategory(product, targetCategory) {
        if (targetCategory === 'All Drops') return true;

        const cat = (product.category || '').toLowerCase();
        const title = (product.title || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const tag = (product.tag || '').toLowerCase();
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
        if (target === 'oversized') {
            return combined.includes('oversized') || combined.includes('loose fit');
        }
        if (target === 'accessories') {
            return combined.includes('accessory') || combined.includes('bag') || combined.includes('cap') || combined.includes('jewelry');
        }

        return combined.includes(target);
    }

    async function fetchRealProducts() {
        try {
            const res = await fetch('/api/products'); 
            if (!res.ok) {
                console.error('Failed to fetch products from /api/products');
                products = [];
            } else {
                products = await res.json();
            }
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
            const tagMatch = item.tag ? item.tag.toLowerCase().includes(q) : false;

            const searchMatch = !q || titleMatch || descMatch || catMatch || tagMatch;

            return categoryMatch && searchMatch;
        });

        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6B7280;">
                    <p style="font-size: 16px; font-weight: 700;">No items found in this section!</p>
                    <p style="font-size: 13px; margin-top: 6px;">Try selecting \"All Drops\" or searching another keyword.</p>
                </div>`;
            return;
        }

        gridContainer.innerHTML = filtered.map(product => {
            const imgUrl = extractImageUrl(product);
            const title = product.title || 'Streetwear Fit';
            const price = product.price || 0;
            const originalPrice = product.originalPrice || null;
            const category = product.category || 'Drop';
            const badgeTag = product.tag || '';

            let discountBadge = '';
            let displayPrice = `₹${price.toFixed(0)}`;
            let originalPriceHtml = '';

            if (originalPrice && originalPrice > price) {
                const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
                discountBadge = `<span class="discount-badge">${discount}% OFF</span>`;
                originalPriceHtml = `<span class="original-price">₹${originalPrice.toFixed(0)}</span>`;
            }

            return `
                <div class="product-card" data-product-id="${product._id}">
                    <div class="card-img-wrap">
                        ${discountBadge}
                        ${badgeTag ? `<span class="card-badge">${badgeTag}</span>` : ''}
                        <img src="${imgUrl}" 
                             alt="${title}" 
                             referrerpolicy="no-referrer" 
                             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';">
                    </div>
                    <div class="card-details">
                        <h3 class="card-title">${title}</h3>
                        <div class="card-price-row">
                            <span class="card-price">${displayPrice}</span>
                            ${originalPriceHtml}
                        </div>
                        <div class="size-selection" data-product-id="${product._id}">
                            <button class="size-btn" data-size="S">S</button>
                            <button class="size-btn" data-size="M">M</button>
                            <button class="size-btn" data-size="L">L</button>
                            <button class="size-btn" data-size="XL">XL</button>
                            <button class="size-btn" data-size="XXL">XXL</button>
                        </div>
                        <button class="buy-btn" data-product-id="${product._id}">
                            <span>⚡ Buy Now</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to newly rendered 'Buy Now' buttons
        document.querySelectorAll('.buy-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.closest('.buy-btn').dataset.productId;
                openModal(productId);
            });
        });

        // Add event listeners for size buttons
        document.querySelectorAll('.size-selection').forEach(sizeSelectionDiv => {
            sizeSelectionDiv.querySelectorAll('.size-btn').forEach(sizeBtn => {
                sizeBtn.addEventListener('click', (event) => {
                    // Remove 'selected' from all buttons in this product's size selection
                    sizeSelectionDiv.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
                    // Add 'selected' to the clicked button
                    event.target.classList.add('selected');
                    selectedSizeForModal = event.target.dataset.size; // Store selected size
                });
            });
        });
    }

    // Modal Functions
    function openModal(productId) {
        const product = products.find(p => p._id === productId);
        if (!product) {
            alert('Product not found!');
            return;
        }

        modalProductImg.src = extractImageUrl(product);
        modalProductTitle.textContent = product.title;
        modalProductPrice.textContent = `₹${product.price}`;
        modalProductId.value = product._id;

        // Pre-select size if one was chosen on the product card
        if (selectedSizeForModal) {
            sizeSelect.value = selectedSizeForModal;
        } else {
            sizeSelect.value = ''; // Reset if no size was pre-selected
        }

        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    function closeModal() {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        checkoutForm.reset(); // Clear form fields
        selectedSizeForModal = ''; // Clear selected size
        // Also clear selected state on product cards
        document.querySelectorAll('.size-btn.selected').forEach(btn => btn.classList.remove('selected'));
    }

    // Modal Event Listeners
    modalCloseBtn.addEventListener('click', closeModal);
    checkoutModal.addEventListener('click', (event) => {
        if (event.target === checkoutModal) {
            closeModal();
        }
    });

    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const orderDetails = {
            productId: modalProductId.value,
            size: sizeSelect.value,
            fullName: fullNameInput.value,
            phoneNumber: phoneNumberInput.value,
            fullAddress: fullAddressInput.value,
            pincode: pincodeInput.value,
            city: cityInput.value,
            // Add product details for backend processing
            productTitle: modalProductTitle.textContent,
            productPrice: parseFloat(modalProductPrice.textContent.replace('₹', '')),
            productImage: modalProductImg.src
        };

        if (!orderDetails.size) {
            alert('Please select a size.');
            return;
        }

        try {
            const response = await fetch('/api/order/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderDetails)
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Order placed successfully! Order ID: ${result.orderId}`);
                closeModal();
            } else {
                const errorData = await response.json();
                alert(`Failed to place order: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred while placing your order. Please try again.');
        }
    });

    // Existing search and filter logic
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

    // --- Authentication Modal Logic ---
    loginSignupBtn.addEventListener('click', () => {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    authCloseBtn.addEventListener('click', () => {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
        authForm.reset();
    });

    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            authForm.reset();
        }
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = authInput.value.trim();
        if (input) {
            alert(`Authentication attempt for: ${input}. (Backend not implemented for this yet)`);
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            authForm.reset();
        } else {
            alert('Please enter your mobile number or email.');
        }
    });

    // --- Banner Carousel Logic ---
    function updateCarousel() {
        if (!carouselTrack || carouselItems.length === 0) return;
        carouselTrack.style.transform = `translateX(${-currentIndex * carouselItems[0].clientWidth}px)`;
        updateDots();
    }

    function updateDots() {
        if (!carouselDotsContainer || carouselItems.length === 0) return;
        carouselDotsContainer.innerHTML = '';
        carouselItems.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === currentIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
                resetAutoSlide();
            });
            carouselDotsContainer.appendChild(dot);
        });
    }

    function nextSlide() {
        if (!carouselItems.length) return;
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarousel();
    }

    function prevSlide() {
        if (!carouselItems.length) return;
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        updateCarousel();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (carouselItems.length > 0) {
        prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
        nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
        window.addEventListener('resize', updateCarousel); // Adjust on resize
        updateCarousel(); // Initial render
        startAutoSlide(); // Start auto-sliding
    }

    fetchRealProducts();
});
