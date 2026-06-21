// =======================================================
// LAVEGIOUS NUMERIC CRYPTO-ID ENGINE V9 (ULTIMATE STABLE)
// =======================================================
function initLavegiousNumericShareSystem() {
    
    // Core Function: Converts any product title into a unique 7-digit number (e.g., 9462929)
    function getProductNumericId(text) {
        if (!text) return '1000000';
        let cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        let hash = 0;
        for (let i = 0; i < cleanText.length; i++) {
            hash = cleanText.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Generates a strict, stable 7-digit positive integer
        return String(Math.abs(hash) % 9000000 + 1000000);
    }

    // 1. Numeric Link Resolver (Runs instantly when someone opens the shared link)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPid = urlParams.get('pid');
    
    // Check if the parameter is a valid 7-digit number code
    if (sharedPid && /^\d{7}$/.test(sharedPid)) {
        const resolverInterval = setInterval(() => {
            const structuralCards = document.querySelectorAll('[data-id], div, section, article');
            let matchedCard = null;
            
            for (let card of structuralCards) {
                if (card.offsetWidth === 0 && card.offsetHeight === 0) continue; // Skip hidden items
                
                // Find local heading inside this card to calculate its numeric ID
                const cardHeading = card.querySelector('h1, h2, h3, h4, .product-title, .title, p');
                if (cardHeading) {
                    let textCheck = cardHeading.textContent.toLowerCase();
                    // Ignore global layouts boilerplate words
                    if (!textCheck.includes('welcome') && !textCheck.includes('details view') && !textCheck.includes('lavegious') && textCheck.trim().length > 4) {
                        if (getProductNumericId(cardHeading.textContent) === sharedPid) {
                            matchedCard = card;
                            break;
                        }
                    }
                }
            }

            if (matchedCard) {
                clearInterval(resolverInterval);
                setTimeout(() => {
                    // Smoothly scroll down directly to the matched product card location
                    matchedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Direct Action Click: Simulate user tap to open the product page details modal
                    const actionableClickTarget = matchedCard.querySelector('a, button, img') || matchedCard;
                    if (actionableClickTarget) {
                        actionableClickTarget.click();
                    }
                }, 800);
            }
        }, 500);
        setTimeout(() => clearInterval(resolverInterval), 10000);
    }

    // 2. Strict UI Button Injector Row Matrix
    setInterval(() => {
        const interactiveButtons = document.querySelectorAll('button, a');
        
        interactiveButtons.forEach(el => {
            if (el.offsetWidth === 0 && el.offsetHeight === 0 || el.hasAttribute('data-lavegious-locked')) return;
            
            const btnText = el.textContent ? el.textContent.toUpperCase() : '';
            
            if (btnText.includes('BUY NOW') || btnText.includes('OUTFIT MATRIX') || btnText.includes('FLIPKART')) {
                el.setAttribute('data-lavegious-locked', 'true');
                
                // Local Scoping: Extract correct title near this exact button context
                let detectedTitle = 'product';
                let parentBox = el.closest('div, section, article, #productDetailPage');
                
                if (parentBox) {
                    const localHeadings = parentBox.querySelectorAll('h1, h2, h3, h4, .product-title, .title, p');
                    for (let heading of localHeadings) {
                        let textCheck = heading.textContent.toLowerCase();
                        if (!textCheck.includes('welcome') && !textCheck.includes('details view') && !textCheck.includes('lavegious') && textCheck.trim().length > 4) {
                            detectedTitle = heading.textContent;
                            break;
                        }
                    }
                }

                // Generate the secret random-looking 7-digit ID for this product name
                const generatedNumericCode = getProductNumericId(detectedTitle);

                // Create a clean horizontal row wrapper to lock styling layouts perfectly
                const microRow = document.createElement('div');
                microRow.className = 'lavegious-numeric-row';
                microRow.style.display = 'flex';
                microRow.style.alignItems = 'center';
                microRow.style.gap = '8px';
                microRow.style.width = '100%';
                microRow.style.boxSizing = 'border-box';
                microRow.style.marginTop = window.getComputedStyle(el).marginTop || '12px';
                microRow.style.marginBottom = window.getComputedStyle(el).marginBottom || '12px';
                
                el.parentNode.insertBefore(microRow, el);
                el.style.marginTop = '0px';
                el.style.marginBottom = '0px';
                el.style.flexGrow = '1';
                microRow.appendChild(el);
                
                // Build Premium Share Button Node
                const shareBtn = document.createElement('button');
                shareBtn.className = 'lavegious-numeric-share-trigger';
                shareBtn.innerHTML = '🔗 Share';
                
                // Mobile responsive secure alignment styles
                shareBtn.style.padding = '0 16px';
                shareBtn.style.backgroundColor = '#1F2937'; // Balanced slate tone
                shareBtn.style.color = '#FFFFFF';
                shareBtn.style.border = '1px solid rgba(255,255,255,0.1)';
                shareBtn.style.borderRadius = window.getComputedStyle(el).borderRadius || '12px';
                shareBtn.style.cursor = 'pointer';
                shareBtn.style.fontWeight = '600';
                shareBtn.style.fontSize = '14px';
                shareBtn.style.whiteSpace = 'nowrap';
                shareBtn.style.boxSizing = 'border-box';
                shareBtn.style.display = 'inline-flex';
                shareBtn.style.alignItems = 'center';
                shareBtn.style.justifyContent = 'center';
                shareBtn.style.height = window.getComputedStyle(el).height || '46px';
                
                shareBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Absolute dynamic numeric query parameter link creation
                    const dynamicNumericUrl = `${window.location.origin}/shop?pid=${generatedNumericCode}`;
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Hype Outfits',
                            text: 'Bhai, ye outfit check kar LAVEGIOUS par! 🔥',
                            url: dynamicNumericUrl
                        }).catch(() => {});
                    } else {
                        navigator.clipboard.writeText(dynamicNumericUrl);
                        alert('Product Number Link copy ho gaya h! WhatsApp par bhejo.');
                    }
                };
                
                microRow.appendChild(shareBtn);
            }
        });
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', UrbanNumericShareEngine);
} else {
    initLavegiousNumericShareSystem();
}
