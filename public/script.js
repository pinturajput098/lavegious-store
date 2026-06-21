
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
