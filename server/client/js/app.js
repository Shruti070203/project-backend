const API_BASE = 'http://localhost:3001';
let currentPage = 1;
let currentCategory = '';
let currentSearchQuery = '';
let totalProducts = 0;
const ITEMS_PER_PAGE = 12;

function showToast(title, message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed; top:5rem; right:2rem; z-index:9999; display:flex; flex-direction:column; gap:0.75rem;';
    document.body.appendChild(container);
  }

  const bg = type === 'success' 
    ? 'linear-gradient(135deg, #28a745, #20c997)' 
    : 'linear-gradient(135deg, #dc3545, #e83e8c)';
  const icon = type === 'success' ? '🛒' : '❌';

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${bg};
    color: white;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    cursor: pointer;
    white-space: nowrap;
    width: max-content;
    height: auto;
  `;
  toast.textContent = `${icon} ${title}${message ? ' - ' + message : ''}`;

  container.appendChild(toast);
  toast.addEventListener('click', () => toast.remove());
  setTimeout(() => toast.remove(), 3000);
}

function removeToast(toast) {
  toast.classList.add('hide');
  setTimeout(() => toast.remove(), 300);
}

function showLoading(element) {
  element.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `;
}

function showError(element, message) {
  element.innerHTML = `<div class="error">${message}</div>`;
}

function formatPrice(price) {
  return `₹${price.toFixed(2)}`;
}

function formatRating(rating) {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  return `<span class="product-rating">${stars} ${rating}</span>`;
}

// async function fetchProducts(params = {}) {
//   const queryString = new URLSearchParams(params).toString();
//   const response = await fetch(`${API_BASE}/products?${queryString}`);
//   if (!response.ok) throw new Error('Failed to fetch products');
//   return response.json();
// }
async function fetchProducts(params ={}) {
  try {
    const axiosRes = await axios.get(`${API_BASE}/products`, {params});
    console.log("axiosRes: ", axiosRes);
    return axiosRes.data; 
  }
  catch (err) {
    console.log("Error: ", err);
  }
};

// async function fetchProduct(id) {
//   const response = await fetch(`${API_BASE}/products/${id}`);
//   if (!response.ok) throw new Error('Failed to fetch product');
//   return response.json();
// }
async function fetchProduct(id) {
  try{
    const axiosRes = await axios.get(`${API_BASE}/products/${id}`);
    console.log("axiosRes: ", axiosRes);
    return axiosRes.data;
  } catch (err) {
    console.log("error fetching product: ", err);
  }
}

// async function createProduct(product) {
//   const response = await fetch(`${API_BASE}/products`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(product)
//   });
//   if (!response.ok) throw new Error('Failed to create product');
//   return response.json();
// }

async function createProduct(product) {
  try{
    const axiosRes = await axios.post(`${API_BASE}/products`, product);
    console.log("axiosRes: ", axiosRes);
    return axiosRes.data;
  } catch (err) {
    console.log("error creating product: ", err);
  }
}

// async function updateProduct(id, product) {
//   const response = await fetch(`${API_BASE}/products/${id}`, {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(product)
//   });
//   if (!response.ok) throw new Error('Failed to update product');
//   return response.json();
// }

async function updateProduct(id, product) {
  try {
    const axiosRes = await axios.patch(`${API_BASE}/products/${id}`, product);
    console.log("axiosRes: ", axiosRes);
    return axiosRes.data;
  } catch (err) {
    console.log("error updating product: ", err);
  }
}

// async function deleteProduct(id) {
//   const response = await fetch(`${API_BASE}/products/${id}`, {
//     method: 'DELETE'
//   });
//   if (!response.ok) throw new Error('Failed to delete product');
//   return response.json();
// }

async function deleteProduct(id) {
  try{
    const axiosRes = await axios.delete(`${API_BASE}/products/${id}`);
    console.log("axiosRes: ", axiosRes);
    return axiosRes.data;
  } catch (err) {
    console.log("error deleting product: ", err);
  }
}

// async function fetchCategories() {
//   const response = await fetch(`${API_BASE}/categories`);
//   if (!response.ok) throw new Error('Failed to fetch categories');
//   return response.json();
// }

async function fetchCategories() {
  try{
    const axiosRes = await axios.get(`${API_BASE}/categories`);
    console.log("axiosRes: ", axiosRes);
    return axiosRes.data;
  } catch (err) {
    console.log("error fetching product: ", err);
  }
}

// async function fetchProductsWithPagination(page = 1, category = '', search = '') {
//   let url = `${API_BASE}/products?page=${page}&limit=${ITEMS_PER_PAGE}`;
  
//   if (category && category !== '') {
//     url += `&category=${encodeURIComponent(category)}`;
//   }
  
//   if (search && search !== '') {
//     url += `&search=${encodeURIComponent(search)}`;
//   }
  
//   const response = await fetch(url);
//   if (!response.ok) throw new Error('Failed to fetch products');
//   const data = await response.json();
//   totalProducts = data.total;
//   return data;
// }

async function fetchProductsWithPagination(page = 1, category = '', search = '') {
  try {
    const params = { page, limit: ITEMS_PER_PAGE };
    if (category) params.category = category;
    if (search) params.search = search;

    const axiosRes = await axios.get(`${API_BASE}/products`, { params });
    console.log("axiosRes: ", axiosRes); 
    totalProducts = axiosRes.data.total;
    return axiosRes.data;
  } catch (err) {
    console.log("Error fetching products with pagination: ", err);
  }
}

// async function fetchProductsByCategory(category, page = 1, limit = 18) {
//   const response = await fetch(`${API_BASE}/categories/${category.toLowerCase()}/products?page=${page}&limit=${limit}`);
//   if (!response.ok) throw new Error('Failed to fetch products by category');
//   return response.json();
// }

async function fetchProductsByCategory(category, page = 1, limit = 18) {
  try {
    const axiosRes = await axios.get(
      `${API_BASE}/categories/${category.toLowerCase()}/products`,
      { params: { page, limit } }
    );
    console.log("axiosRes: ", axiosRes); // ✅ try block mein
    return axiosRes.data;
  } catch (err) {
    console.log("Error fetching products by category: ", err);
  }
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getProductImageUrl(product) {
  const productName = product.title.toLowerCase();
  const id = product.id || 1;

  if (productName.includes('running shoes') || productName.includes('fresh foam') || productName.includes('gel-nimbus') || productName.includes('zoomx')) {
    const imgs = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556906781-9a412961d28d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('sneakers') || productName.includes('ultraboost') || productName.includes('air max') || productName.includes('chuck taylor')) {
    const imgs = [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1584735175315-9d5df23be1c9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1520256862855-398228c41684?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1514989771522-458c9b6c035a?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('laptop') || productName.includes('macbook') || productName.includes('zenbook') || productName.includes('thinkpad') || productName.includes('xps')) {
    const imgs = [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('smartphone') || productName.includes('iphone') || productName.includes('pixel') || productName.includes('galaxy s')) {
    const imgs = [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('smartwatch') || productName.includes('watch')) {
    const imgs = [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('headphone')) {
    const imgs = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('4k tv') || productName.includes('oled') || productName.includes('qled') || productName.includes('bravia')) {
    const imgs = [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1548921441-89c8bd86ffb9?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('yoga mat')) {
    const imgs = [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('jeans') || productName.includes('bootcut') || productName.includes('straight leg')) {
    const imgs = [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('t-shirt') || productName.includes('polo') || productName.includes('classic tee')) {
    const imgs = [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('vacuum') || productName.includes('cyclone') || productName.includes('powersweep')) {
    const imgs = [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1527515637462-cff94edd787a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573508607168-5f5e47b6f41b?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('blender') || productName.includes('problend') || productName.includes('smoothiex')) {
    const imgs = [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1622480935808-f145ad36e014?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('moisturizer') || productName.includes('hydraboost') || productName.includes('daily cream')) {
    const imgs = [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('lipstick')) {
    const imgs = [
      'https://images.unsplash.com/photo-1586495777744-4e6232bf4715?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1631214524020-3c69f4f9ad20?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1599733594230-6b823276d4b5?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('non-fiction') || productName.includes('atomic habits') || productName.includes('sapiens') || productName.includes('educated')) {
    const imgs = [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('fiction') || productName.includes('silent patient') || productName.includes('last kingdom') || productName.includes('midnight library')) {
    const imgs = [
      'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('building blocks') || productName.includes('mega blocks') || productName.includes('classic bricks') || productName.includes('lego')) {
    const imgs = [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1530325553241-4f50d88ce261?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  if (productName.includes('action figure') || productName.includes('galaxy fighter') || productName.includes('hero series')) {
    const imgs = [
      'https://images.unsplash.com/photo-1608278047522-58806a6ac85b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1619760534166-8a5b7e18abb6?w=400&h=300&fit=crop',
    ];
    return imgs[id % imgs.length];
  }
  const categoryImages = {
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    'Clothing':    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    'Books':       'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400&h=300&fit=crop',
    'Sports':      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    'Home':        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    'Beauty':      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
    'Toys':        'https://images.unsplash.com/photo-1594787318286-11a14e7d3f6f?w=400&h=300&fit=crop',
  };
return categoryImages[product.category] || '';
}

function createProductCard(product) {
  const imageUrl = getProductImageUrl(product);
  const inPagesFolder = window.location.pathname.includes('/pages/');
  const editPath = inPagesFolder ? `./edit-product.html?id=${product.id}` : `./pages/edit-product.html?id=${product.id}`;

  return `
    <div class="card product-card">
      <img src="${imageUrl}" alt="${product.title}" class="product-image">
      <h3 class="product-title">${product.title}</h3>
      <p class="product-price">${formatPrice(product.price)}</p>
      ${formatRating(product.rating)}
      <p class="product-description">${product.description.substring(0, 100)}...</p>
      <div>
        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">Add to Cart</button>
        <a href="${editPath}" class="btn btn-secondary">Edit</a>
      </div>
    </div>
  `;
}

function createCategoryCard(category) {
  const icons = {
    'Electronics': '📱',
    'Clothing': '👕',
    'Books': '📚',
    'Sports': '⚽',
    'Home': '🏠',
    'Beauty': '💄',
    'Toys': '🧸'
  };

  const inPagesFolder = window.location.pathname.includes('/pages/');
  const basePath = inPagesFolder ? './categories.html' : './pages/categories.html';
  
  const isActive = currentCategory === category;
  const activeClass = isActive ? 'active-category' : '';

  return `
   <a href="${basePath}?category=${category.toLowerCase()}" class="card category-card ${activeClass}" data-category="${category}">
      <span class="category-icon">${icons[category] || '📦'}</span>
      <h3>${category}</h3>
    </a>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  const isCategoryPage = window.location.pathname.includes('categories.html');
  if (isCategoryPage) return; 
  loadFiltersFromURL(); 
  loadCategories();
  loadFeaturedProducts();
});

async function loadCategories() {
  try {
    const categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) return;
    showLoading(categoriesGrid);
    const categories = await fetchCategories();
    categoriesGrid.innerHTML = categories.map(createCategoryCard).join('');
  } catch (error) {
    console.error('Error loading categories:', error);
    const categoriesGrid = document.getElementById('categories-grid');
    if (categoriesGrid) {
      showError(categoriesGrid, 'Failed to load categories');
    }
  }
}

async function loadFeaturedProducts() {
  try {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    showLoading(productsGrid);
    
    const result = await fetchProductsWithPagination(currentPage, currentCategory, currentSearchQuery);
    
    if (result.data.length === 0) {
      productsGrid.innerHTML = '<div class="error">No products found.</div>';
    } else {
      productsGrid.innerHTML = result.data.map(createProductCard).join('');
    }
    
    renderPaginationInfo();
    renderPaginationButtons();
    setupPaginationButtons();
    attachAddToCartListeners();
  } catch (error) {
    console.error('Error loading products:', error);
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
      showError(productsGrid, 'Failed to load products');
    }
  }
}

async function loadProductsWithPagination() {
  await loadFeaturedProducts();
}

function attachAddToCartListeners() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', async (e) => {
      const productId = parseInt(e.target.dataset.productId);
      try {
        const product = await fetchProduct(productId);
        addToCart(product);
        showToast('Added to Cart!', `${product.title} added successfully.`, 'success');
      } catch (error) {
        console.error('Error fetching product:', error);
        showToast('Error', 'Failed to add product to cart.', 'error');
      }
    });
  });
}

async function searchProducts(query) {
  if (!query.trim()) {
    currentSearchQuery = '';
    currentPage = 1;
    currentCategory = '';
    loadFiltersFromURL();
    loadFeaturedProducts();
    return;
  }
  
  currentSearchQuery = query;
  currentPage = 1;
  currentCategory = '';
  
  const url = new URL(window.location);
  url.searchParams.set('search', query);
  url.searchParams.delete('category');
  url.searchParams.set('page', '1');
  window.history.pushState({}, '', url);
  
  await loadFeaturedProducts();
  
  const productsSection = document.getElementById('featured-products');
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth' });
  }
}
const headerSearchInput = document.getElementById("header-search-input");

if (headerSearchInput) {
  headerSearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchProducts(headerSearchInput.value);
    }
  });
}

function renderPaginationInfo() {
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const startRecord = totalProducts === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, totalProducts);
  
  const infoEl = document.getElementById('pagination-info');
  if (infoEl) {
    infoEl.innerHTML = `
      <span>📦 ${startRecord}–${endRecord} of <strong>${totalProducts}</strong> results</span>
      <span>📄 Page <strong>${currentPage}</strong> of <strong>${totalPages || 1}</strong></span>
    `;
  }
}

function renderPaginationButtons() {
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const pagesContainer = document.getElementById('pagination-pages');
  if (!pagesContainer) return;
  
  pagesContainer.innerHTML = '';
  
  if (totalPages <= 1) {
    const singleBtn = document.createElement('button');
    singleBtn.className = 'page-num-btn active';
    singleBtn.textContent = '1';
    pagesContainer.appendChild(singleBtn);
    return;
  }
  
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  if (endPage - startPage < 4) {
    if (startPage === 1) endPage = Math.min(totalPages, startPage + 4);
    else if (endPage === totalPages) startPage = Math.max(1, endPage - 4);
  }
  
  if (startPage > 1) {
    const firstBtn = document.createElement('button');
    firstBtn.textContent = '1';
    firstBtn.className = 'page-num-btn';
    firstBtn.addEventListener('click', () => goToPage(1));
    pagesContainer.appendChild(firstBtn);
    
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'page-ellipsis';
      ellipsis.textContent = '…';
      pagesContainer.appendChild(ellipsis);
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.className = `page-num-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.addEventListener('click', () => goToPage(i));
    pagesContainer.appendChild(pageBtn);
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'page-ellipsis';
      ellipsis.textContent = '…';
      pagesContainer.appendChild(ellipsis);
    }
    const lastBtn = document.createElement('button');
    lastBtn.textContent = totalPages;
    lastBtn.className = 'page-num-btn';
    lastBtn.addEventListener('click', () => goToPage(totalPages));
    pagesContainer.appendChild(lastBtn);
  }
  
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function goToPage(page) {
  currentPage = page;
  loadProductsWithPagination();
  const url = new URL(window.location);
  url.searchParams.set('page', currentPage);
  if (currentSearchQuery) url.searchParams.set('search', currentSearchQuery);
  else url.searchParams.delete('search');
  if (currentCategory) url.searchParams.set('category', currentCategory);
  else url.searchParams.delete('category');
  window.history.pushState({}, '', url);
  window.scrollTo({ top: 400, behavior: 'smooth' });
}

function setupPaginationButtons() {
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  
  if (prevBtn) {
    const newPrev = prevBtn.cloneNode(true);
    prevBtn.parentNode?.replaceChild(newPrev, prevBtn);
    newPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadProductsWithPagination();
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    });
  }
  
  if (nextBtn) {
    const newNext = nextBtn.cloneNode(true);
    nextBtn.parentNode?.replaceChild(newNext, nextBtn);
    newNext.addEventListener('click', () => {
      const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage++;
        loadProductsWithPagination();
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    });
  }
}

function loadFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  const searchParam = urlParams.get('search');
  const categoryParam = urlParams.get('category');
  
  if (pageParam && !isNaN(parseInt(pageParam))) {
    currentPage = parseInt(pageParam);
  }
  if (searchParam) {
    currentSearchQuery = searchParam;
    const searchInput = document.getElementById('header-search-input');
    if (searchInput) searchInput.value = searchParam;
  }
  if (categoryParam) {
    currentCategory = categoryParam;
  }
}