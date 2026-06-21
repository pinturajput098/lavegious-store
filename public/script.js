// =======================================================
// LAVEGIOUS IMAGE-HASH CRYPTO ENGINE V11 (100% UNIQUE)
// =======================================================
function initLavegiousImageHashSystem() {
    
    // Core Logic: Converts unique product image paths into a guaranteed stable 7-digit code
    function calculateProductCode(imgSrc) {
        if (!imgSrc) return '2849153';
        // Extract clean image filename to keep hashes clean and uniform
        let cleanStr = imgSrc.split('/').pop().split('?')[0].trim().toLowerCase();
        let hash = 0;
        for (let i = 0; i < cleanStr.length; i++) {
            hash = cleanStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        return String(Math.abs(hash) % 9000000 + 1000000);
    }

    // Helper: Finds the unique image source belonging to a specific buy button context
    function getContextImage(el) {
        let parentBox = el.closest('div, section, article, #productDetailPage') || el.parentElement;
        if (parentBox) {
            const img = parentBox.querySelector('img');
            if (img && img.getAttribute('src')) {
                return img.getAttribute('src');
            }
        }
        return '';
    }

    // 1. Unique Link Parameter Resolver Engine (Runs on Page Load)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPid = urlParams.get('pid');

    if (sharedPid && /^\d{7}$/.test(sharedPid)) {
        const resolver = setInterval(() => {
            // Scan all active display cards/blocks on the layout grid
            const allElements = document.querySelectorAll('button, a');
            let targetActionBtn = null;

            allElements.forEach(btn => {
                const innerTxt = btn.textContent ? btn.textContent.toUpperCase() : '';
                if (innerTxt.includes('BUY NOW') || innerTxt.includes('OUTFIT MATRIX') || innerTxt.includes('FLIPKART')) {
                    let imgSrc = getContextImage(btn);
                    if (imgSrc && calculateProductCode(imgSrc) === sharedPid) {
                        targetActionBtn = btn;
                    }
                }
            });

            if (targetActionBtn) {
                clearInterval(resolver);
                setTimeout(() => {
                    const outerCardNode = targetActionBtn.closest('div, section, article') || targetActionBtn;
                    outerCardNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight target product card dynamically
                    outerCardNode.style.outline = '3px solid #7C3AED';
                    outerCardNode.style.borderRadius = '16px';
                    setTimeout(() => outerCardNode.style.outline = 'none', 3000);

                    // AUTOMATIC ACTION: Open the product details popup view automatically
                    const structuralClickNode = outerCardNode.querySelector('img, h1, h2, h3, .product-title') || targetActionBtn;
                    if (structuralClickNode && structuralClickNode !== targetActionBtn) {
                        structuralClickNode.click();
                    }
                }, 800);
            }
        }, 500);
        setTimeout(() => clearInterval(resolver), 10000);
    }

    // 2. Strict Button Injector Row Matrix (Preserves Mobile UI Cleanliness)
    setInterval(() => {
        const structuralButtons = document.querySelectorAll('button, a');
        
        structuralButtons.forEach(el => {
            if (el.offsetWidth === 0 && el.offsetHeight === 0 || el.hasAttribute('data-lavegious-locked')) return;
            
            const txt = el.textContent ? el.textContent.toUpperCase() : '';
            
            if (txt.includes('BUY NOW') || txt.includes('OUTFIT MATRIX') || txt.includes('FLIPKART')) {
                el.setAttribute('data-lavegious-locked', 'true');
                
                // Get the unique image context for this specific target button
                let currentImgSrc = getContextImage(el);
                const continuousNumericId = calculateProductCode(currentImgSrc);

                // Build isolated clean horizontal flex row matching your native responsive layouts
                const microRow = document.createElement('div');
                microRow.className = 'lavegious-clean-wrapper-row';
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
                
                // Construct Premium Action Share Button Node
                const shareBtn = document.createElement('button');
                shareBtn.className = 'lavegious-premium-share-node';
                shareBtn.innerHTML = '🔗 Share';
                
                shareBtn.style.padding = '0 16px';
                shareBtn.style.backgroundColor = '#1F2937';
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
                    
                    const absoluteRedirectUrl = `${window.location.origin}/shop?pid=${continuousNumericId}`;
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Hype Drops',
                            text: 'Bhai, ye outfit check kar LAVEGIOUS par! 🔥',
                            url: absoluteRedirectUrl
                        }).catch(() => {});
                    } else {
                        navigator.clipboard.writeText(absoluteRedirectUrl);
                        alert('Product Link copy ho gaya h! WhatsApp par bhejo.');
                    }
                };
                
                microRow.appendChild(shareBtn);
            }
        });
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLavegiousImageHashSystem);
} else {
    initLavegiousImageHashSystem();
}
