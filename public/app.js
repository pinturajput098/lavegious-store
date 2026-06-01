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
  }, 3000);
}

function compressImageAsync(file, maxWidth = 600, quality = 0.5) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  base64ImagesArray = [];
  previewContainer.innerHTML = '';
  if(files.length > 0) {
    uploadStatus.innerText = `Processing ${files.length} Photo(s)...`;
    previewContainer.classList.remove('hidden');
    try {
      for(let file of files) {
        const compressedBase64 = await compressImageAsync(file);
        base64ImagesArray.push(compressedBase64);
        const img = document.createElement('img');
        img.src = compressedBase64;
        img.className = "w-12 h-12 object-cover border-2 border-black rounded-lg shadow-sm";
        previewContainer.appendChild(img);
      }
      uploadStatus.innerText = `${files.length} Photo(s) Compressed & Ready!`;
    } catch (err) {
      showToast('Image processing failed.', 'error');
    }
  }
});

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    loadedGlobalProducts = await res.json();
    productGrid.innerHTML = '';
    adminManagementList.innerHTML = '';
    
    loadedGlobalProducts.forEach((p) => {
      const hasImages = p.images && p.images.length > 0;
      const displayImg = hasImages ? p.images[0] : (p.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600');
      
      productGrid.innerHTML += `
        <div onclick="openProductPage('${p._id}')" class="neo-3d-card flex flex-col justify-between overflow-hidden cursor-pointer">
          <div class="aspect-[3/4] w-full bg-[#E8EFEA] overflow-hidden relative border-b-4 border-black">
            <img src="${displayImg}" class="w-full h-full object-cover object-center" loading="lazy">
            <div class="absolute top-4 left-4 bg-[#141414] text-[#FBBF24] font-extrabold text-[9px] tracking-widest px-3 py-1.5 rounded-sm border border-black">LIVE LOOK</div>
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

      adminManagementList.innerHTML += `
        <div class="flex items-center justify-between p-3 bg-neutral-50 border-2 border-black rounded-xl">
          <div class="flex items-center gap-3">
            <img src="${displayImg}" class="w-10 h-10 object-cover border border-black rounded-md">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-tight text-black line-clamp-1">${p.title}</h4>
              <p class="text-[10px] font-bold text-neutral-400">${p.price}</p>
            </div>
          </div>
          <button onclick="deleteProduct('${p._id}', event)" class="px-3 py-1.5 bg-red-100 border border-red-300 text-red-600 rounded-lg text-[10px] font-bold uppercase hover:bg-red-200 transition-colors">Wipe / Delete</button>
        </div>
      `;
    });
  } catch (err) {
    showToast('Catalog sync pipeline failed.', 'error');
  }
}

window.openProductPage = function(id) {
  const targetItem = loadedGlobalProducts.find(item => item._id === id);
  if(!targetItem) return;
  detailSlider.innerHTML = '';
  const imagesToShow = targetItem.images && targetItem.images.length > 0 ? targetItem.images : [targetItem.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600'];
  imagesToShow.forEach(imgData => {
    detailSlider.innerHTML += `<img src="${imgData}" class="w-full h-full object-cover flex-shrink-0 snap-start snap-always">`;
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

function handleAuthFailure() {
  localStorage.removeItem('adminToken');
  adminPasswordSaved = '';
  adminPanel.classList.add('hidden');
}

window.deleteProduct = async function(id, event) {
  event.stopPropagation();
  if(!confirm("Are you sure you want to delete this product?")) return;
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': adminPasswordSaved }
    });
    if (res.ok) {
      showToast('Product successfully deleted.');
      loadProducts();
    } else if (res.status === 401) {
      handleAuthFailure();
      showToast('Session expired. Unauthorized.', 'error');
    } else {
      showToast('Failed to delete item.', 'error');
    }
  } catch(e) {
    showToast('Network error during deletion.', 'error');
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
  const pass = adminPass.value;
  if(!pass) return;
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });
    if (res.ok) {
      localStorage.setItem('adminToken', pass);
      adminPasswordSaved = pass;
      adminPanel.classList.remove('hidden');
      adminModal.classList.add('hidden');
      adminPass.value = '';
      showToast('Handshake Authenticated.');
      loadProducts();
    } else {
      showToast('Wrong password! Access denied.', 'error');
    }
  } catch (err) {
    showToast('Validation handshake pipeline broken.', 'error');
  }
});

logoutBtn.addEventListener('click', () => {
  handleAuthFailure();
  showToast('Console Deactivated.');
});

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = productForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerText;
  submitBtn.innerText = "PUBLISHING LIVE... PLEASE WAIT";
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.6";

  const productData = {
    images: base64ImagesArray,
    title: document.getElementById('pTitle').value,
    description: document.getElementById('pDesc').value,
    price: document.getElementById('pPrice').value,
    link: document.getElementById('pLink').value
  };

  try {
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
      await loadProducts();
      showToast('Asset published live to matrix console stream.');
    } else if (res.status === 401) {
      handleAuthFailure();
      showToast('Publishing rejected: Unauthorized password block.', 'error');
    } else {
      showToast('Publishing failed server side error.', 'error');
    }
  } catch (err) {
    showToast('Payload submission failed. Connection timeout.', 'error');
  } finally {
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
  }
});

loadProducts();
