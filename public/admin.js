
// =======================================================
// DYNAMIC EDIT MODAL & UI BUTTON INJECTOR FOR ADMIN PANEL
// =======================================================
(function initAdminEditSystem() {
    // 1. Inject Edit Modal HTML into Admin DOM if not present
    if (!document.getElementById('lavegiousEditModal')) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'lavegiousEditModal';
        modalDiv.style.cssText = `
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;
            backdrop-filter: blur(4px); padding: 16px; box-sizing: border-box;
        `;
        
        modalDiv.innerHTML = `
            <div style="background: #FFFFFF; width: 100%; max-width: 480px; border-radius: 20px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); font-family: sans-serif; box-sizing: border-box;">
                <h3 style="margin-top: 0; font-size: 18px; color: #1F2937; font-weight: 700; margin-bottom: 16px;">✏️ Edit Product Details</h3>
                
                <input type="hidden" id="editProductId">
                
                <label style="display:block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px; letter-spacing: 0.5px;">PRODUCT TITLE</label>
                <input type="text" id="editTitle" style="width:100%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 12px; font-size: 14px; box-sizing: border-box; outline: none;">
                
                <label style="display:block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px; letter-spacing: 0.5px;">PRICE (₹)</label>
                <input type="text" id="editPrice" style="width:100%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 12px; font-size: 14px; box-sizing: border-box; outline: none;">
                
                <label style="display:block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px; letter-spacing: 0.5px;">AFFILIATE LINK DESTINATION</label>
                <input type="text" id="editLink" style="width:100%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 12px; font-size: 14px; box-sizing: border-box; outline: none;" placeholder="https://fktr.in/...">
                
                <label style="display:block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px; letter-spacing: 0.5px;">SPECIFICATIONS & DESCRIPTION</label>
                <textarea id="editDescription" rows="3" style="width:100%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 18px; font-size: 14px; box-sizing: border-box; outline: none; resize: vertical;"></textarea>
                
                <div style="display:flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" id="closeEditModalBtn" style="padding: 10px 18px; background: #F3F4F6; color: #4B5563; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">Cancel</button>
                    <button type="button" id="saveEditModalBtn" style="padding: 10px 22px; background: #7C3AED; color: #FFFFFF; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        document.getElementById('closeEditModalBtn').onclick = () => {
            modalDiv.style.display = 'none';
        };
    }

    // 2. Global Function to Open Modal & Fill Data
    window.openLavegiousEditModal = function(id, title, price, link, description) {
        document.getElementById('editProductId').value = id || '';
        document.getElementById('editTitle').value = title || '';
        document.getElementById('editPrice').value = price || '';
        document.getElementById('editLink').value = link || '';
        document.getElementById('editDescription').value = description || '';
        document.getElementById('lavegiousEditModal').style.display = 'flex';
    };

    // 3. Save Changes Handler
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'saveEditModalBtn') {
            const id = document.getElementById('editProductId').value;
            const title = document.getElementById('editTitle').value;
            const price = document.getElementById('editPrice').value;
            const link = document.getElementById('editLink').value;
            const description = document.getElementById('editDescription').value;

            fetch(`/api/products/update/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, price, description, link })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Product updated successfully! 🔥');
                    document.getElementById('lavegiousEditModal').style.display = 'none';
                    window.location.reload();
                } else {
                    alert('Error updating product: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(err => {
                alert('Network error while saving changes.');
                console.error(err);
            });
        }
    });

    // 4. Inject EDIT Buttons into LIVE CATALOG INDEX cards dynamically
    setInterval(() => {
        const deleteButtons = document.querySelectorAll('button');
        deleteButtons.forEach(btn => {
            if (btn.textContent.trim().toUpperCase() === 'DELETE' && !btn.hasAttribute('data-edit-injected')) {
                btn.setAttribute('data-edit-injected', 'true');

                const editBtn = document.createElement('button');
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
                `;

                // Attaching click listener to pull data from card context
                editBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    let card = btn.closest('div, li, section') || btn.parentElement;
                    let pId = card.getAttribute('data-id') || card.getAttribute('id') || '';
                    
                    let titleEl = card.querySelector('h1, h2, h3, h4, .title, strong') || card;
                    let pTitle = titleEl ? titleEl.textContent.trim() : '';
                    
                    let pPrice = '';
                    if (card.textContent.includes('₹')) {
                        let match = card.textContent.match(/₹\s*(\d+)/);
                        if (match) pPrice = match[1];
                    }

                    window.openLavegiousEditModal(pId, pTitle, pPrice, '', '');
                };

                btn.parentNode.insertBefore(editBtn, btn);
            }
        });
    }, 1000);
})();
