
// ==========================================
// LAVEGIOUS VIRAL DEEP-LINK & SHARE SYSTEM
// ==========================================
function initLavegiousShareSystem() {
    // 1. URL Check: Agar koi shared link se aaya hai (?pid=...)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedProductId = urlParams.get('pid');
    
    if (sharedProductId) {
        // Asynchronous loading ka wait karne ke liye interval check
        const findProductInterval = setInterval(() => {
            // Card search dynamically via data-id or text contains
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
                    // Visual pop highlight effect
                    targetCard.style.outline = '3px solid #7C3AED';
                    targetCard.style.borderRadius = '16px';
                    targetCard.classList.add('animate-pulse');
                    setTimeout(() => targetCard.style.outline = 'none', 4000);
                }, 800);
            }
        }, 500);
        
        // 10 second baad check band (safer resource usage)
        setTimeout(() => clearInterval(findProductInterval), 10000);
    }

    // 2. Inject Share Buttons Automatically next to BUY NOW
    setInterval(() => {
        const structuralButtons = document.querySelectorAll('button, a');
        structuralButtons.forEach(btn => {
            const text = btn.textContent.toUpperCase();
            if ((text.includes('BUY') || text.includes('NOW')) && !btn.parentElement.querySelector('.lavegious-share-node')) {
                
                // Parent se product ID nikalne ka smart bubble loop
                let currentParent = btn.parentElement;
                let foundId = '';
                while (currentParent && currentParent !== document.body) {
                    if (currentParent.hasAttribute('data-id')) {
                        foundId = currentParent.getAttribute('data-id');
                        break;
                    }
                    // Alternate pattern checkpoint
                    if (currentParent.id) {
                        foundId = currentParent.id;
                        break;
                    }
                    currentParent = currentParent.parentElement;
                }

                if (foundId) {
                    // Flex utilities integration on parent if required
                    if(btn.parentElement && !btn.parentElement.classList.contains('flex')) {
                        btn.parentElement.classList.add('items-center');
                    }
                    
                    const shareNode = document.createElement('button');
                    shareNode.className = 'lavegious-share-node ml-2 p-2.5 bg-neutral-800 text-white rounded-xl hover:bg-purple-600 active:scale-95 transition-all text-base inline-flex items-center justify-center';
                    shareNode.innerHTML = '🔗';
                    shareNode.style.border = '1px solid rgba(255,255,255,0.1)';
                    
                    shareNode.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const directShareUrl = `${window.location.origin}${window.location.pathname}?pid=${foundId}`;
                        
                        // Device Native Share (WhatsApp, Insta, System UI)
                        if (navigator.share) {
                            navigator.share({
                                title: 'LAVEGIOUS Streetwear Drop',
                                text: 'Bhai, ye outfit check kar LAVEGIOUS par! 🔥',
                                url: directShareUrl
                            }).catch(err => console.log('Share canceled'));
                        } else {
                            // Fallback copy paste for browsers
                            navigator.clipboard.writeText(directShareUrl);
                            alert('Link copy ho gaya hai! WhatsApp ya Insta par kahin bhi share karo.');
                        }
                    };
                    btn.after(shareNode);
                }
            }
        });
    }, 1000);
}

// System trigger allocation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLavegiousShareSystem);
} else {
    initLavegiousShareSystem();
}

// ==========================================
// LAVEGIOUS SHARE SYSTEM V2 (BULLETPROOF)
// ==========================================
function initLavegiousShareV2() {
    // 1. URL Parameter Redirect Logic (For shared home links)
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

    // 2. Main Injection Engine (Works on Grid & Detail Pages)
    setInterval(() => {
        const actionButtons = document.querySelectorAll('button, a');
        actionButtons.forEach(btn => {
            const text = btn.textContent.toUpperCase();
            // Matching any variant of BUY, NOW, or MATRIX buttons
            if ((text.includes('BUY') || text.includes('NOW') || text.includes('MATRIX')) && !btn.parentElement.querySelector('.lavegious-share-v2')) {
                
                // Bubble up to check for dynamic ID
                let currentParent = btn.parentElement;
                let foundId = '';
                while (currentParent && currentParent !== document.body) {
                    if (currentParent.hasAttribute('data-id')) {
                        foundId = currentParent.getAttribute('data-id');
                        break;
                    }
                    if (currentParent.id) {
                        foundId = currentParent.id;
                        break;
                    }
                    currentParent = currentParent.parentElement;
                }

                // If on details page, fallback to current browser URL directly
                let finalShareUrl = window.location.href;
                if (foundId && !window.location.pathname.includes('/product') && !window.location.pathname.includes('/s')) {
                    finalShareUrl = `${window.location.origin}${window.location.pathname}?pid=${foundId}`;
                }

                // UI Alignment Fix: Make container flex to sit together perfectly
                if (btn.parentElement) {
                    btn.parentElement.style.display = 'flex';
                    btn.parentElement.style.alignItems = 'center';
                    btn.parentElement.style.gap = '8px';
                    btn.parentElement.style.width = '100%';
                }

                // Adjust main button layout to share space
                btn.style.flexGrow = '1';

                // Create the absolute premium Share Node
                const shareNode = document.createElement('button');
                shareNode.className = 'lavegious-share-v2 p-3 bg-neutral-800 text-white rounded-xl hover:bg-purple-600 active:scale-95 transition-all text-sm font-semibold inline-flex items-center justify-center';
                shareNode.innerHTML = '🔗 Share';
                shareNode.style.border = '1px solid rgba(255,255,255,0.1)';
                shareNode.style.height = window.getComputedStyle(btn).height || '48px';
                shareNode.style.whiteSpace = 'nowrap';
                
                shareNode.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Streetwear',
                            text: 'Bhai, ye outfit dekh ekdam khtarnaak h! 🔥',
                            url: finalShareUrl
                        }).catch(err => console.log('Canceled'));
                    } else {
                        navigator.clipboard.writeText(finalShareUrl);
                        alert('Link copy ho gaya hai! WhatsApp ya Insta par share karo.');
                    }
                };
                
                btn.after(shareNode);
            }
        });
    }, 1000);
}

// Global execution nodes
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLavegiousShareV2);
} else {
    initLavegiousShareV2();
}
