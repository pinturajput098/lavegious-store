// =======================================================
// LAVEGIOUS STABLE UI ENGINE V5 (STRICT TARGET MATRIX)
// =======================================================
function initLavegiousSafeShare() {
    // 1. Deep Link Direct Parameter Routing
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

    // 2. Strict Target Injector (ONLY scans real clickable buttons, completely ignores layout divs)
    setInterval(() => {
        // STRICT RULE: Only target interactive native buttons or anchor links
        const realButtons = document.querySelectorAll('button, a');
        
        realButtons.forEach(el => {
            // Skip hidden elements or already wrapped items safely
            if (el.offsetWidth === 0 && el.offsetHeight === 0 || el.hasAttribute('data-lavegious-locked')) return;
            
            const txt = el.textContent ? el.textContent.toUpperCase() : '';
            
            // Explicitly match your purple button variations only
            if (txt.includes('BUY NOW') || txt.includes('OUTFIT MATRIX') || txt.includes('FLIPKART')) {
                
                // Set absolute injection freeze lock attribute
                el.setAttribute('data-lavegious-locked', 'true');
                
                // Create an isolated micro-row container that takes layout parameters of the button itself
                const microRow = document.createElement('div');
                microRow.className = 'lavegious-micro-action-row';
                microRow.style.display = 'flex';
                microRow.style.alignItems = 'center';
                microRow.style.gap = '8px';
                microRow.style.width = '100%';
                microRow.style.boxSizing = 'border-box';
                
                // Steal margins naturally to preserve mobile spacing grid perfectly
                microRow.style.marginTop = window.getComputedStyle(el).marginTop || '12px';
                microRow.style.marginBottom = window.getComputedStyle(el).marginBottom || '12px';
                
                // Insert micro row into the DOM node tree structure safely
                el.parentNode.insertBefore(microRow, el);
                
                // Clear inline vertical offset shifts from original target
                el.style.marginTop = '0px';
                el.style.marginBottom = '0px';
                el.style.flexGrow = '1';
                
                // Move original purple button inside the clean new mini container row
                microRow.appendChild(el);
                
                // Construct the Premium Aesthetic Share Node
                const shareBtn = document.createElement('button');
                shareBtn.className = 'lavegious-share-ui-trigger';
                shareBtn.innerHTML = '🔗 Share';
                
                // Safe standalone premium style injection 
                shareBtn.style.padding = '0 16px';
                shareBtn.style.backgroundColor = '#1F2937'; // Slate dark gray tone
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
                
                // Mirror the exact mobile height of your buy button dynamically
                shareBtn.style.height = window.getComputedStyle(el).height || '46px';
                
                // Direct current URL forwarding system execution mapping
                shareBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentUrl = window.location.href;
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Streetwear',
                            text: 'Bhai, ye outfit dekh ekdam mast h! 🔥',
                            url: currentUrl
                        }).catch(() => {});
                    } else {
                        navigator.clipboard.writeText(currentUrl);
                        alert('Link copy ho gaya hai!');
                    }
                };
                
                // Put share button inside micro-row right next to the buy button
                microRow.appendChild(shareBtn);
            }
        });
    }, 1000);
}

// Runtime Trigger Engine Nodes
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLavegiousSafeShare);
} else {
    initLavegiousSafeShare();
}
