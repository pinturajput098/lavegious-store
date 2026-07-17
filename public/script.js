// =======================================================
// LAVEGIOUS AD-INTEGRATED GRID ENGINE V12.1 (ANTI-GLITCH)
// =======================================================
function initLavegiousSequentialSystem() {
    let globalProductTitles = [];

    // Core Matrix: Dynamically maps products in their strict DOM render sequence order
    function updateGridInventory() {
        let titles = [];
        const allCards = document.querySelectorAll('div, section, article');
        
        allCards.forEach(card => {
            if (card.id === 'productDetailPage' || card.closest('#productDetailPage') || card.className.includes('detail')) {
                return;
            }
            
            const hasBuyBtn = Array.from(card.querySelectorAll('button, a')).some(btn => {
                const t = btn.textContent ? btn.textContent.toUpperCase() : '';
                return t.includes('BUY NOW') || t.includes('OUTFIT MATRIX') || t.includes('FLIPKART');
            });
            
            if (hasBuyBtn) {
                const heading = card.querySelector('h1, h2, h3, h4, .product-title, .title, p');
                if (heading) {
                    const cleanTitle = heading.textContent.trim();
                    if (cleanTitle.length > 3 && !titles.includes(cleanTitle) && !cleanTitle.toUpperCase().includes('WELCOME') && !cleanTitle.toUpperCase().includes('DETAILS')) {
                        titles.push(cleanTitle);
                    }
                }
            }
        });
        
        if (titles.length > 0) {
            globalProductTitles = titles;
        }
    }

    setInterval(updateGridInventory, 1000);

    // 1. Link Parameter Sequential Redirect Resolver (?pid=2001, 2002...)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPid = urlParams.get('pid');

    if (sharedPid && /^\d{4}$/.test(sharedPid)) {
        const targetIndex = parseInt(sharedPid) - 2001;
        
        const resolverInterval = setInterval(() => {
            if (globalProductTitles.length > targetIndex && targetIndex >= 0) {
                const targetTitle = globalProductTitles[targetIndex];
                const allCards = document.querySelectorAll('div, section, article');
                let targetCard = null;
                
                for (let card of allCards) {
                    if (card.id === 'productDetailPage' || card.closest('#productDetailPage')) continue;
                    if (card.innerHTML && card.innerHTML.includes(targetTitle)) {
                        targetCard = card;
                        break;
                    }
                }

                if (targetCard) {
                    clearInterval(resolverInterval);
                    setTimeout(() => {
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetCard.style.outline = '3px solid #7C3AED';
                        targetCard.style.borderRadius = '16px';
                        setTimeout(() => targetCard.style.outline = 'none', 3000);
                        
                        const clicker = targetCard.querySelector('img, a, button, h1, h2, h3, .product-title') || targetCard;
                        if (clicker) clicker.click();
                    }, 800);
                }
            }
        }, 500);
        setTimeout(() => clearInterval(resolverInterval), 10000);
    }

    // 2. Strict Layout Element Interceptor Button Injector Row Matrix
    setInterval(() => {
        const structuralButtons = document.querySelectorAll('button, a');
        
        structuralButtons.forEach(el => {
            if (el.offsetWidth === 0 && el.offsetHeight === 0 || el.hasAttribute('data-lavegious-locked')) return;
            
            const txt = el.textContent ? el.textContent.toUpperCase() : '';
            
            if (txt.includes('BUY NOW') || txt.includes('OUTFIT MATRIX') || txt.includes('FLIPKART')) {
                el.setAttribute('data-lavegious-locked', 'true');
                
                let localTitle = '';
                let parentBox = el.closest('div, section, article, #productDetailPage');
                if (parentBox) {
                    const localHeadings = parentBox.querySelectorAll('h1, h2, h3, h4, .product-title, .title, p');
                    for (let heading of localHeadings) {
                        let textCheck = heading.textContent.toLowerCase();
                        if (!textCheck.includes('welcome') && !textCheck.includes('details view') && !textCheck.includes('lavegious') && textCheck.trim().length > 4) {
                            localTitle = heading.textContent.trim();
                            break;
                        }
                    }
                }

                let assignedId = '2001';
                if (localTitle && globalProductTitles.includes(localTitle)) {
                    assignedId = String(2001 + globalProductTitles.indexOf(localTitle));
                } else if (globalProductTitles.length > 0) {
                    assignedId = String(2001 + globalProductTitles.length - 1);
                }

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
                
                shareBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let finalId = assignedId;
                    if (localTitle && globalProductTitles.includes(localTitle)) {
                        finalId = String(2001 + globalProductTitles.indexOf(localTitle));
                    }
                    
                    const absoluteRedirectUrl = `${window.location.origin}/shop?pid=${finalId}`;
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Streetwear',
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

    // =======================================================
    // MONETAG NATIVE BACKGROUND ADS INJECTOR (SAFE ENGINE)
    // =======================================================
    try {
        (function(s){
            s.dataset.zone = '10910514';
            s.src = 'https://n6wxm.com/vignette.min.js';
        })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')));
    } catch (e) {
        console.log("Ad engine loaded safely in background execution layout thread.");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLavegiousSequentialSystem);
} else {
    initLavegiousSequentialSystem();
}
