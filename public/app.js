const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const closeModal = document.getElementById('closeModal');
const loginBtn = document.getElementById('loginBtn');
const adminPass = document.getElementById('adminPass');
const adminPanel = document.getElementById('adminPanel');
const logoutBtn = document.getElementById('logoutBtn');
const productForm = document.getElementById('productForm');
const productGrid = document.getElementById('productGrid');
const fileInput = document.getElementById('pImg');
const uploadStatus = document.getElementById('uploadStatus');
const previewContainer = document.getElementById('previewContainer');
const adminManagementList = document.getElementById('adminManagementList');

// Detail Page View Dom links
const mainWebsiteView = document.getElementById('mainWebsiteView');
const productDetailPage = document.getElementById('productDetailPage');
const backToGridBtn = document.getElementById('backToGridBtn');
const detailSlider = document.getElementById('detailSlider');
const detailTitle = document.getElementById('detailTitle');
const detailDesc = document.getElementById('detailDesc');
const detailPrice = document.getElementById('detailPrice');
const detailBuyBtn = document.getElementById('detailBuyBtn');

let adminPasswordSaved = localStorage.getItem('adminToken') || '';
let base64ImagesArray = [];
let loadedGlobalProducts = [];

if (adminPasswordSaved) adminPanel.classList.remove('hidden');

function showToast(message, type = 'success') {
  const toast = document.getElementById('customToast');
  const msgSpan = document.getElementById('toastMessage');
  msgSpan.innerText = message;
  toast.style.boxShadow = type === 'error' ? '4px 4px 0px 0px #EF4444' : '4px 4px 0px 0px #10B981';
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}

// Convert chosen gallery files comfortably
fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  base64ImagesArray = [];
  previewContainer.innerHTML = '';
  
  if(files.length > 0) {
    uploadStatus.innerText = `${files.length} Photo(s) Selected from Device`;
    previewContainer.classList.remove('hidden');
    
    for(let file of files) {
      const reader = new FileReader();
      reader.onload = (event) => {
        base64ImagesArray.push(event.target.result);
        const img = document.createElement('img');
        img.src = event.target.result;
        img.className = "w-12 h-12 object-cover border-2 border-black rounded-lg shadow-sm";
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  }
});

// Master Load and Dynamic Card Engine Mapping
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    loadedGlobalProducts = await res.json();
    productGrid.innerHTML = '';
    adminManagementList.innerHTML = '';
    
    loadedGlobalProducts.forEach((p, index) => {
      // Main view cards injection
      productGrid.innerHTML += `
        <div onclick="openProductPage('${p._id}')" class="neo-3d-card flex flex-col justify-between overflow-hidden cursor-pointer">
          <div class="aspect-[3/4] w-full bg-[#E8EFEA] overflow-hidden relative border-b-4 border-black">
            <img src="${p.images[0]}" class="w-full h-full object-cover object-center" loading="lazy">
            <div class="absolute top-4 left-4 bg-[#141414] text-[#FBBF24] font-extrabold text-[9px] tracking-widest px-3 py-1.5 rounded-sm border border-black">
              LIVE LOOK
            </div>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-extrabold text-lg uppercase tracking-tight text-black mb-1">${p.title}</h3>
              <p class="text-neutral-500 text-xs font-medium line-clamp-2 mb-4">${p.description}</p>
            </div>
            <div class="flex items-center justify-between pt-3 border-t-2 border-neutral-100">
              <span class="text-black font-extrabold text-base">${p.price}</span>
              <button class="neo-3d-btn bg-[#10B981] text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg">View Specs</button>
            </div>
          </div>
        </div>
      `;

      // Admin Dashboard control list deletion management tracking block
      adminManagementList.innerHTML += `
        <div class="flex items-center justify-between p-3 bg-neutral-50 border-2 border-black rounded-xl">
          <div class="flex items-center gap-3">
            <img src="${p.images[0]}" class="w-10 h-10 object-cover border border-black rounded-md">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-tight text-black line-clamp-1">${p.title}</h4>
              <p class="text-[10px] font-bold text-neutral-400">${p.price}</p>
            </div>
          </div>
          <button onclick="deleteProduct('${p._id}', event)" class="px-3 py-1.5 bg-red-100 border border-red-300 text-red-600 rounded-lg text-[10px] font-bold uppercase hover:bg-red-200 transition-colors">
            Wipe / Delete
          </button>
        </div>
      `;
    });
  } catch (err) {
    showToast('Catalog sync pipeline failed.', 'error');
  }
}

// Product Details Activation Trigger
window.openProductPage = function(id) {
  const targetItem = loadedGlobalProducts.find(item => item._id === id);
  if(!targetItem) return;

  detailSlider.innerHTML = '';
  targetItem.images.forEach(imgData => {
    detailSlider.innerHTML += `
      <img src="${imgData}" class="w-full h-full object-cover flex-shrink-0 snap-start snap-always">
    `;
  });

  detailTitle.innerText = targetItem.title;
  detailDesc.innerText = targetItem.description;
  detailPrice.innerText = targetItem.price;
  detailBuyBtn.href = targetItem.link;

  mainWebsiteView.classList.add('hidden');
  productDetailPage.classList.remove('hidden');
  window.scrollTo({ top: 0 });
};

backToGridBtn.addEventListener('click', () => {
  productDetailPage.classList.add('hidden');
  mainWebsiteView.classList.remove('hidden');
});

// Admin Product Deletion Matrix Request Action
window.deleteProduct = async function(id, event) {
  event.stopPropagation();
  if(!confirm("Are you absolute sure to purge this item from Lavegious catalog?")) return;

  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-password': adminPasswordSaved }
  });

  if (res.ok) {
    showToast('Product successfully deleted from local stream.');
    loadProducts();
  } else {
    showToast('Authentication failure during purge process.', 'error');
  }
};

adminBtn.addEventListener('click', () => {
  if (adminPanel.classList.contains('hidden')) {
    adminModal.classList.remove('hidden');
  } else {
    adminPanel.classList.add('hidden');
  }
});

closeModal.addEventListener('click', () => adminModal.classList.add('hidden'));

loginBtn.addEventListener('click', async () => {
  localStorage.setItem('adminToken', adminPass.value || 'test');
  adminPasswordSaved = adminPass.value || 'test';
  adminPanel.classList.remove('hidden');
  adminModal.classList.add('hidden');
  adminPass.value = '';
  showToast('Handshake Authenticated.');
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  adminPasswordSaved = '';
  adminPanel.classList.add('hidden');
  showToast('Console Deactivated.');
});

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const productData = {
    images: base64ImagesArray,
    title: document.getElementById('pTitle').value,
    description: document.getElementById('pDesc').value,
    price: document.getElementById('pPrice').value,
    link: document.getElementById('pLink').value
  };

  const res = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPasswordSaved
    },
    body: JSON.stringify(productData)
  });

  if (res.ok) {
    productForm.reset();
    uploadStatus.innerText = "Tap to add photos from device gallery";
    previewContainer.classList.add('hidden');
    base64ImagesArray = [];
    loadProducts();
    showToast('Asset published live to matrix console stream.');
  } else {
    showToast('Publishing failed. Session expired.', 'error');
  }
});

loadProducts();
