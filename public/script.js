// LAVEGIOUS GLOBAL ENGINE V3 (UNIVERSAL INJECTOR)
function injectLavegiousShareSystem() {
    setInterval(() => {
        // Target all clickable elements that look like buy buttons
        const allElements = document.querySelectorAll('button, a, div, span');
        
        allElements.forEach(el => {
            if (el.offsetWidth === 0 && el.offsetHeight === 0) return; // Skip hidden elements
            
            const txt = el.textContent ? el.textContent.toUpperCase() : '';
            
            // Strictly match your unique button texts from screenshot 16240.jpg
            if ((txt.includes('BUY NOW') || txt.includes('OUTFIT MATRIX') || txt.includes('FLIPKART')) && !el.parentElement.querySelector('.lavegious-universal-share')) {
                
                // Adjust parent styles dynamically to fit the share button seamlessly
                if (el.parentElement) {
                    el.parentElement.style.display = 'flex';
                    el.parentElement.style.alignItems = 'center';
                    el.parentElement.style.gap = '10px';
                    el.parentElement.style.width = '100%';
                }
                
                el.style.flexGrow = '1';

                // Create Premium Share Element
                const shareBtn = document.createElement('button');
                shareBtn.className = 'lavegious-universal-share';
                shareBtn.innerHTML = '🔗 Share';
                
                // Pure Inline Styling to match your premium system vibe
                shareBtn.style.padding = '12px 16px';
                shareBtn.style.backgroundColor = '#1F2937';
                shareBtn.style.color = '#FFFFFF';
                shareBtn.style.border = '1px solid rgba(255,255,255,0.15)';
                shareBtn.style.borderRadius = '12px';
                shareBtn.style.cursor = 'pointer';
                shareBtn.style.fontWeight = '600';
                shareBtn.style.fontSize = '14px';
                shareBtn.style.whiteSpace = 'nowrap';
                shareBtn.style.height = window.getComputedStyle(el).height || '48px';

                shareBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const shareUrl = window.location.href;
                    
                    if (navigator.share) {
                        navigator.share({
                            title: 'LAVEGIOUS Streetwear',
                            text: 'Bhai, ye outfit dekh ekdam khtarnaak h! 🔥',
                            url: shareUrl
                        });
                    } else {
                        navigator.clipboard.writeText(shareUrl);
                        alert('Link copy ho gaya hai!');
                    }
                };

                el.after(shareBtn);
            }
        });
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLavegiousShareSystem);
} else {
    injectLavegiousShareSystem();
}
