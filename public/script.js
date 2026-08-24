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

// =======================================================
// ALWAYS-ACTIVE ADMIN EDIT MODAL & BUTTON INJECTOR
// =======================================================
(function initLavegiousAdminEditUI() {
    function injectEditModal() {
        if (document.getElementById('lavegiousEditModal')) return;

        const modalDiv = document.createElement('div');
        modalDiv.id = 'lavegiousEditModal';
        modalDiv.style.cssText = `
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.65); z-index: 999999; align-items: center; justify-content: center;
            backdrop-filter: blur(5px); padding: 16px; box-sizing: border-box;
        `;

        modalDiv.innerHTML = `
            <div style="background: #FFFFFF; width: 100%; max-width: 460px; border-radius: 20px; padding: 24px; box-shadow: 0 20px 30px rgba(0,0,0,0.2); font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box;">
                <h3 style="margin-top: 0; font-size: 18px; color: #1F2937; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <span>✏️</span> Edit Product Details
                </h3>

                <input type="hidden" id="edit_productId">

                <label style="display:block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase;">Product Title</label>
                <input type="text" id="edit_productTitle" style="width:100%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 12px; font-size: 14px; box-sizing: border-box; outline: none;">

                <label style="display:block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase;">Price (₹)</label>
                <input type="text" id="edit_productPrice" style="width:100%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 12px; font-size: 14px; box-sizing: border-box; outline: none;">

                <label style="display:block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase;">Affiliate Link Destination</label>
                <input type="text" id="edit_productLink" style="width:100%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 12px; font-size: 14px; box-sizing: border-box; outline: none;" placeholder="https://fktr.in/...">

                <label style="display:block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase;">Specifications & Fit Details</label>
                <textarea id="edit_productDesc" rows="3" style="width:100%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 20px; font-size: 14px; box-sizing: border-box; outline: none; resize: vertical;"></textarea>

                <div style="display:flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" id="cancelEditModalBtn" style="padding: 10px 18px; background: #F3F4F6; color: #4B5563; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 14px;">Cancel</button>
                    <button type="button" id="saveEditModalBtn" style="padding: 10px 22px; background: #7C3AED; color: #FFFFFF; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 14px;">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        document.getElementById('cancelEditModalBtn').onclick = () => {
            modalDiv.style.display = 'none';
        };
    }

    // Window global caller
    window.openLavegiousEditModal = function(id, title, price, link, desc) {
        injectEditModal();
        document.getElementById('edit_productId').value = id || '';
        document.getElementById('edit_productTitle').value = title || '';
        document.getElementById('edit_productPrice').value = price || '';
        document.getElementById('edit_productLink').value = link || '';
        document.getElementById('edit_productDesc').value = desc || '';
        document.getElementById('lavegiousEditModal').style.display = 'flex';
    };

    // Save handler
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'saveEditModalBtn') {
            const id = document.getElementById('edit_productId').value;
            const title = document.getElementById('edit_productTitle').value;
            const price = document.getElementById('edit_productPrice').value;
            const link = document.getElementById('edit_productLink').value;
            const description = document.getElementById('edit_productDesc').value;

            fetch(`/api/products/update/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, price, description, link })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Product Updated Successfully! 🔥');
                    document.getElementById('lavegiousEditModal').style.display = 'none';
                    window.location.reload();
                } else {
                    alert('Update failed: ' + (data.error || 'Server error'));
                }
            })
            .catch(err => {
                alert('Network Error! Try again.');
                console.error(err);
            });
        }
    });

    // Auto-inject EDIT buttons right next to SET HERO / DELETE buttons
    setInterval(() => {
        injectEditModal();
        const buttons = document.querySelectorAll('button');
        
        buttons.forEach(btn => {
            const txt = btn.textContent.trim().toUpperCase();
            if ((txt === 'DELETE' || txt === 'SET HERO') && !btn.parentNode.querySelector('.lavegious-edit-btn')) {
                const editBtn = document.createElement('button');
                editBtn.className = 'lavegious-edit-btn';
                editBtn.innerHTML = 'EDIT';
                editBtn.style.cssText = `
                    background-color: #EEF2FF;
                    color: #4F46E5;
                    border: none;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 11px;
                    margin-right: 6px;
                    cursor: pointer;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                `;

                editBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    let card = btn.closest('div, li, section') || btn.parentElement;
                    let id = card.getAttribute('data-id') || card.id || '';
                    
                    let titleEl = card.querySelector('h1, h2, h3, h4, .title, strong') || card;
                    let title = titleEl ? titleEl.textContent.trim() : '';
                    
                    let price = '';
                    let match = card.textContent.match(/₹\s*(\d+)/);
                    if (match) price = match[1];

                    window.openLavegiousEditModal(id, title, price, '', '');
                };

                if (txt === 'DELETE') {
                    btn.parentNode.insertBefore(editBtn, btn);
                } else {
                    btn.parentNode.appendChild(editBtn);
                }
            }
        });
    }, 800);
})();
