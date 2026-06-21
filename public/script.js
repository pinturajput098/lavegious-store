// =======================================================
// LAVEGIOUS ADVANCED SEO SLUG ENGINE V7 (PRO-VIRAL)
// =======================================================
function initLavegiousSlugShareSystem() {
    // Helper function to turn any product title into a clean URL slug
    function generateCleanSlug(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .trim()
            .replace(/\s+/g, '-');        // Replace spaces with hyphens
    }

    // 1. Incoming Deep Link Resolver (Scans slugs and auto-clicks the card)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedProductId = urlParams.get('pid');
    
    if (sharedProductId) {
        const findProductInterval = setInterval(() => {
            // Scan all possible product container cards on the shop page
            const allElements = document.querySelectorAll('[data-id], div, section, article');
            let targetCard = null;
            
            for (let el of allElements) {
                // Check if exact database ID matches
                if (el.getAttribute('data-id') === sharedProductId || el.id === sharedProductId) {
                    targetCard = el;
                    break;
                }
                
                // Fallback: Check if slugified text inside heading matches incoming pid slug
                const heading = el.querySelector('h1, h2, h3, h4, .product-title, .title, p');
                if (heading) {
                    const currentSlug = generateCleanSlug(heading.textContent);
                    if (currentSlug === sharedProductId && currentSlug.length > 3) {
                        targetCard = el;
                        break;
                    }
                }
            }

            if (targetCard) {
                clearInterval(findProductInterval);
                setTimeout(() => {
                    // Smooth scroll the viewport straight to the matched apparel
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Premium highlight burst alert
                    targetCard.style.outline = '3px solid #7C3AED';
                    targetCard.style.borderRadius = '16px';
                    setTimeout(() => targetCard.style.outline = 'none', 3500);
                    
                    // Simulate automatic user tap interaction node to auto-expand details view modal
                    const clickTarget = targetCard.querySelector('a, button, img') || targetCard;
                    if (clickTarget) {
                        clickTarget.click();
                    }
                }, 800);
            }
        }, 500);
        setTimeout(() => clearInterval(findProductInterval), 10000);
    }

    // 2. Strict Target Injection Matrix (Only bounds on real interactive buy targets)
    setInterval(() => {
        const structuralButtons = document.querySelectorAll('button, a');
        
        structuralButtons.forEach(el => {
            if (el.offsetWidth === 0 && el.offsetHeight === 0 || el.hasAttribute('data-lavegious-locked')) return;
            
            const txt = el.textContent ? el.textContent.toUpperCase() : '';
            
            if (txt.includes('BUY NOW') || txt.includes('OUTFIT MATRIX') || txt.includes('FLIPKART')) {
                el.setAttribute('data-lavegious-locked', 'true');
                
                // Extract real dynamic product text slug natively from the open detail view
                let targetSlug = 'product';
                const mainHeading = document.querySelector('h1, h2, .product-name, .product-title') || el.parentElement.querySelector('h1, h2, h3');
                
                if (mainHeading) {
                    targetSlug = generateCleanSlug(mainHeading.textContent);
                }

                // Isolate row injection styling layout parameters
                const microRow = document.createElement('div');
                microRow.className = 'lavegious-slug-action-row';
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
                
                // Build the high-end custom Share element
                const shareBtn = document.createElement('button');
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
                
                // Generate dynamic parameter deep-link on trigger fire
                shareBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const dynamicShareUrl = `${window.location.origin}/shop?pid=${targetSlug}`;
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Streetwear Drop',
                            text: 'Bhai, ye outfit check kar LAVEGIOUS par! 🔥',
                            url: dynamicShareUrl
                        }).catch(() => {});
                    } else {
                        navigator.clipboard.writeText(dynamicShareUrl);
                        alert('Product link copy ho gaya h! WhatsApp par bhejo.');
                    }
                };
                
                microRow.appendChild(shareBtn);
            }
        });
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLavegiousSlugShareSystem);
} else {
    initLavegiousSlugShareSystem();
}
