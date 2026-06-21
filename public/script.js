// =======================================================
// LAVEGIOUS URL-HASH CRYPTO ENGINE V10 (COMPACT STABLE)
// =======================================================
function initLavegiousDynamicHashSystem() {
    
    // Core Logic: Converts unique buy buttons urls into a stable 7-digit code
    function calculateUrlCode(url) {
        if (!url) return '1540329';
        let clean = url.trim();
        let hash = 0;
        for (let i = 0; i < clean.length; i++) {
            hash = clean.charCodeAt(i) + ((hash << 5) - hash);
        }
        return String(Math.abs(hash) % 9000000 + 1000000);
    }

    // 1. Link Redirect Resolver Engine
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPid = urlParams.get('pid');

    if (sharedPid && /^\d{7}$/.test(sharedPid)) {
        const resolver = setInterval(() => {
            const allElements = document.querySelectorAll('button, a');
            let targetActionBtn = null;

            allElements.forEach(btn => {
                const innerTxt = btn.textContent ? btn.textContent.toUpperCase() : '';
                if (innerTxt.includes('BUY NOW') || innerTxt.includes('OUTFIT MATRIX') || innerTxt.includes('FLIPKART')) {
                    let extractedUrl = btn.getAttribute('href') || '';
                    if (calculateUrlCode(extractedUrl) === sharedPid) {
                        targetActionBtn = btn;
                    }
                }
            });

            if (targetActionBtn) {
                clearInterval(resolver);
                setTimeout(() => {
                    const outerCardNode = targetActionBtn.closest('div, section, article') || targetActionBtn;
                    outerCardNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Trigger dynamic interface view click automation safely
                    const structuralClickNode = outerCardNode.querySelector('img, h1, h2, h3') || targetActionBtn;
                    if (structuralClickNode) {
                        structuralClickNode.click();
                    }
                }, 800);
            }
        }, 500);
        setTimeout(() => clearInterval(resolver), 10000);
    }

    // 2. Main Interface Button Injection Row Matrix
    setInterval(() => {
        const structuralButtons = document.querySelectorAll('button, a');
        
        structuralButtons.forEach(el => {
            if (el.offsetWidth === 0 && el.offsetHeight === 0 || el.hasAttribute('data-lavegious-locked')) return;
            
            const txt = el.textContent ? el.textContent.toUpperCase() : '';
            
            if (txt.includes('BUY NOW') || txt.includes('OUTFIT MATRIX') || txt.includes('FLIPKART')) {
                el.setAttribute('data-lavegious-locked', 'true');
                
                let targetHref = el.getAttribute('href') || '';
                const continuousNumericId = calculateUrlCode(targetHref);

                // Build isolated clean horizontal flex row matching your native css layouts
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
                
                // Construct Premium Action Trigger
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
                    
                    const absoluteRedirectUrl = `${window.location.origin}/shop?pid=${continuousNumericId}`;
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Hype Drops',
                            text: 'Bhai, ye outfit check kar LAVEGIOUS par! 🔥',
                            url: absoluteRedirectUrl
                        }).catch(() => {});
                    } else {
                        navigator.clipboard.writeText(absoluteRedirectUrl);
                        alert('Product Number Link copy ho gaya h! WhatsApp par bhejo.');
                    }
                };
                
                microRow.appendChild(shareBtn);
            }
        });
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLavegiousDynamicHashSystem);
} else {
    initLavegiousDynamicHashSystem();
}
