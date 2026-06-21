// =======================================================
// LAVEGIOUS CLEAN UI CORE ENGINE V4 (ISOLATED WRAPPER)
// =======================================================
function initLavegiousIsolatedShare() {
    // 1. URL Deep Link Check Matrix
    const urlParams = new URLSearchParams(window.location.search);
    const sharedProductId = urlParams.get('pid');
    if (sharedProductId) {
        const findProductInterval = setInterval(() => {
            const allCards = document.querySelectorAll('div, section, article');
            let targetCard = null;
            allCards.forEach(card => {
                if (card.getAttribute('data-id') === sharedProductId || (card.innerHTML && card.innerHTML.includes(sharedProductId))) {
                    targetCard = card;
                }
            });
            if (targetCard) {
                clearInterval(findProductInterval);
                setTimeout(() => {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetCard.style.outline = '3px solid #7C3AED';
                    targetCard.style.borderRadius = '16px';
                    setTimeout(() => targetCard.style.outline = 'none', 4000);
                }, 800);
            }
        }, 500);
        setTimeout(() => clearInterval(findProductInterval), 10000);
    }

    // 2. Isolated Injection Engine (Leaves Parent Styles Completely Untouched)
    setInterval(() => {
        const buyButtons = document.querySelectorAll('button, a, div');
        buyButtons.forEach(el => {
            if (el.offsetWidth === 0 && el.offsetHeight === 0) return; // Skip invisible nodes
            
            const txt = el.textContent ? el.textContent.toUpperCase() : '';
            
            // Targeted matching for your exact premium buttons
            if ((txt.includes('BUY NOW') || txt.includes('OUTFIT MATRIX') || txt.includes('FLIPKART')) && !el.hasAttribute('data-lavegious-wrapped')) {
                
                // Mark element to completely secure it from infinite loops
                el.setAttribute('data-lavegious-wrapped', 'true');
                
                // Create a completely local, micro flex container just for these two buttons
                const rowWrapper = document.createElement('div');
                rowWrapper.className = 'lavegious-isolated-btn-row';
                rowWrapper.style.display = 'flex';
                rowWrapper.style.alignItems = 'center';
                rowWrapper.style.gap = '12px';
                rowWrapper.style.width = '100%';
                rowWrapper.style.boxSizing = 'border-box';
                
                // Carry over the original button's vertical spacing natively
                rowWrapper.style.marginTop = window.getComputedStyle(el).marginTop || '16px';
                rowWrapper.style.marginBottom = window.getComputedStyle(el).marginBottom || '16px';
                
                // Insert the wrapper row directly into the DOM right before the button
                el.parentNode.insertBefore(rowWrapper, el);
                
                // Clean internal button margins to fit the row smoothly
                el.style.marginTop = '0px';
                el.style.marginBottom = '0px';
                el.style.flexGrow = '1';
                
                // Safely migrate the buy button inside our micro row
                rowWrapper.appendChild(el);
                
                // Construct the absolute premium Share Action Button
                const shareBtn = document.createElement('button');
                shareBtn.className = 'lavegious-action-share-btn';
                shareBtn.innerHTML = '🔗 Share';
                
                // Custom inline styles tailored to keep the UI clean
                shareBtn.style.padding = '0 20px';
                shareBtn.style.backgroundColor = '#1F2937'; // Elegant slate gray matching premium mode
                shareBtn.style.color = '#FFFFFF';
                shareBtn.style.border = '1px solid rgba(255,255,255,0.15)';
                shareBtn.style.borderRadius = '12px'; // Matching original border arcs
                shareBtn.style.cursor = 'pointer';
                shareBtn.style.fontWeight = '600';
                shareBtn.style.fontSize = '14px';
                shareBtn.style.whiteSpace = 'nowrap';
                shareBtn.style.boxSizing = 'border-box';
                shareBtn.style.display = 'inline-flex';
                shareBtn.style.alignItems = 'center';
                shareBtn.style.justifyContent = 'center';
                
                // Make its height dynamically identical to your purple buttons
                shareBtn.style.height = window.getComputedStyle(el).height || '48px';
                
                // Execution logic
                shareBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentUrl = window.location.href;
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Hype Drops',
                            text: 'Bhai, ye outfit check kar LAVEGIOUS par! 🔥',
                            url: currentUrl
                        }).catch(() => {});
                    } else {
                        navigator.clipboard.writeText(currentUrl);
                        alert('Link copy ho gaya hai! WhatsApp par share karo.');
                    }
                };
                
                // Append share button right next to the buy button inside the wrapper row
                rowWrapper.appendChild(shareBtn);
            }
        });
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLavegiousIsolatedShare);
} else {
    initLavegiousIsolatedShare();
}
