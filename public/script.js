// =======================================================
// LAVEGIOUS DEEP-LINK VIRAL ENGINE V6 (DYNAMIC REDIRECT)
// =======================================================
function initLavegiousDeepLinkSystem() {
    // 1. Auto-Open & Scroll Logic for Shared Links
    const urlParams = new URLSearchParams(window.location.search);
    const sharedProductId = urlParams.get('pid');
    
    if (sharedProductId) {
        const findProductInterval = setInterval(() => {
            const allCards = document.querySelectorAll('div, section, article, [data-id]');
            let targetCard = null;
            
            allCards.forEach(card => {
                if (card.getAttribute('data-id') === sharedProductId || (card.id === sharedProductId)) {
                    targetCard = card;
                }
            });

            if (targetCard) {
                clearInterval(findProductInterval);
                setTimeout(() => {
                    // Smooth scroll to target outfit
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight flash effect
                    targetCard.style.outline = '3px solid #7C3AED';
                    targetCard.style.borderRadius = '16px';
                    setTimeout(() => targetCard.style.outline = 'none', 4000);
                    
                    // AUTOMATIC ACTION: Click the card or its view button to auto-open details view!
                    const triggerClick = targetCard.querySelector('a, button, img') || targetCard;
                    if (triggerClick) {
                        triggerClick.click();
                    }
                }, 800);
            }
        }, 500);
        setTimeout(() => clearInterval(findProductInterval), 10000);
    }

    // 2. Strict Button Injector & Smart Parameter Link Generator
    setInterval(() => {
        const structuralButtons = document.querySelectorAll('button, a');
        
        structuralButtons.forEach(el => {
            if (el.offsetWidth === 0 && el.offsetHeight === 0 || el.hasAttribute('data-lavegious-locked')) return;
            
            const txt = el.textContent ? el.textContent.toUpperCase() : '';
            
            if (txt.includes('BUY NOW') || txt.includes('OUTFIT MATRIX') || txt.includes('FLIPKART')) {
                el.setAttribute('data-lavegious-locked', 'true');
                
                // Find Product ID by climbing up the tree node
                let currentParent = el.parentElement;
                let foundId = '';
                while (currentParent && currentParent !== document.body) {
                    if (currentParent.hasAttribute('data-id')) {
                        foundId = currentParent.getAttribute('data-id');
                        break;
                    }
                    if (currentParent.id && currentParent.id.length > 4) {
                        foundId = currentParent.id;
                        break;
                    }
                    currentParent = currentParent.parentElement;
                }

                // Create isolated row flex layout just for the button structure
                const microRow = document.createElement('div');
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
                
                // Build pristine Share Node
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
                
                // Dynamic Link Custom Generation logic on Click
                shareBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Build deep-link explicitly targeting /shop with query parameters
                    let dynamicShareUrl = `${window.location.origin}/shop`;
                    if (foundId) {
                        dynamicShareUrl += `?pid=${foundId}`;
                    } else {
                        // Fallback safely to current URL parameters if extraction fails
                        dynamicShareUrl = window.location.href;
                    }
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Streetwear',
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
    document.addEventListener('DOMContentLoaded', initLavegiousDeepLinkSystem);
} else {
    initLavegiousDeepLinkSystem();
}
