// PAPER MOON STUDIO

const defaultProducts = [
  {
    id: 'sheet',
    name: 'Cute Sticker Sheet',
    description: 'Pastel mini stickers for everyday decorating.',
    price: 3000,
    stock: 12,
    art: '🌸⭐'
  },
  {
    id: 'pack',
    name: 'Mini Sticker Pack',
    description: 'A small pack of cute designs for your favourite things.',
    price: 2500,
    stock: 8,
    art: '💌🧸'
  }
];

const saved = localStorage.getItem('pms_products');
let products = saved ? JSON.parse(saved) : defaultProducts;

let cart = [];

let customBase = Number(
  localStorage.getItem('pms_customBase') ?? 3000
);

let fees = JSON.parse(
  localStorage.getItem('pms_fees') ||
  '{"small":1000,"medium":1500,"large":2000}'
);

const money = n =>
  Number(n).toLocaleString('en-US') + ' Ks';

const saveInventory = () =>
  localStorage.setItem(
    'pms_products',
    JSON.stringify(products)
  );


// PRODUCTS
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = products.map(p => {
    const sold = p.stock <= 0;

    return `
      <article class="product-card ${sold ? 'sold-out' : ''}">
        <div class="product-art">
          ${p.art || '✨'}
        </div>
        <div class="stock-badge ${sold ? 'out' : ''}">
          ${sold ? 'Sold out' : `${p.stock} in stock`}
        </div>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description || '')}</p>
        <div class="product-bottom">
          <strong>${money(p.price)}</strong>
          <button
            ${sold ? 'disabled' : ''}
            onclick="addItem('${p.id}')">
            ${sold ? 'Sold out' : 'Add to basket'}
          </button>
        </div>
      </article>
    `;
  }).join('');

  renderAdminProducts();
}


function escapeHtml(s) {
  return String(s).replace(
    /[&<>'"]/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c])
  );
}


// CUSTOM STICKER
function customPrice() {
  const sizeElement = document.getElementById('size');
  if (!sizeElement) return customBase;

  return customBase +
    Number(fees[sizeElement.value] || 0);
}


function updateTotal() {
  const qtyElement = document.getElementById('qty');
  const totalElement = document.getElementById('total');

  if (!qtyElement || !totalElement) return;

  const q = Math.max(
    1,
    Number(qtyElement.value) || 1
  );

  totalElement.textContent =
    money(customPrice() * q);
}


// PHOTO PREVIEW
const photoInput = document.getElementById('photo');

if (photoInput) {
  photoInput.addEventListener('change', e => {
    const f = e.target.files[0];
    const preview = document.getElementById('preview');

    if (f && preview) {
      preview.src = URL.createObjectURL(f);
      preview.hidden = false;
    }
  });
}


// SIZE + QUANTITY
const sizeInput = document.getElementById('size');

if (sizeInput) {
  sizeInput.addEventListener('change', updateTotal);
}


const qtyInput = document.getElementById('qty');

if (qtyInput) {
  qtyInput.addEventListener('input', updateTotal);
}


// ADD NORMAL PRODUCT
function addItem(id) {
  const p = products.find(x => x.id === id);

  if (!p || p.stock <= 0) return;

  const x = cart.find(x => x.productId === id);

  if (x) {
    if (x.qty >= p.stock) {
      return alert(`Sorry, only ${p.stock} ${p.name} available.`);
    }
    x.qty++;
  } else {
    cart.push({
      productId: id,
      name: p.name,
      price: p.price,
      qty: 1,
      stock: p.stock
    });
  }

  renderCart();
  location.hash = 'order';
}


// ADD CUSTOM STICKER
function addCustom() {
  const photo = document.getElementById('photo');

  if (!photo || !photo.files[0]) {
    return alert('Please upload a photo first.');
  }

  const size = document.getElementById('size').value;

  const q = Math.max(
    1,
    Number(document.getElementById('qty').value) || 1
  );

  cart.push({
    name: `Custom Sticker (${size})`,
    price: customPrice(),
    qty: q,
    custom: true,
    photoName: photo.files[0].name
  });

  renderCart();
  location.hash = 'order';
}


// CHANGE QUANTITY
function changeQty(i, d) {
  const x = cart[i];

  if (!x) return;

  if (x.custom) {
    x.qty = Math.max(1, x.qty + d);
  } else {
    x.qty = Math.min(
      products.find(p => p.id === x.productId)?.stock ?? x.stock,
      Math.max(1, x.qty + d)
    );
  }

  renderCart();
}


// REMOVE
function removeItem(i) {
  cart.splice(i, 1);
  renderCart();
}


// CART
function renderCart() {
  const el = document.getElementById('cart');
  const count = document.getElementById('cartCount');

  if (!el || !count) return;

  count.textContent = cart.reduce((s, x) => s + x.qty, 0);

  if (!cart.length) {
    el.innerHTML = '<p>Your basket is empty. Choose something from In Stock above ✨</p>';
    return;
  }

  let total = 0;

  el.innerHTML = cart.map((x, i) => {
    total += x.price * x.qty;

    return `
      <div class="cart-row">
        <div>
          <strong>${escapeHtml(x.name)}</strong>
          ${x.photoName ? `<small>📷 ${escapeHtml(x.photoName)}</small>` : ''}
          <div class="qty-controls">
            <button type="button" onclick="changeQty(${i},-1)">−</button>
            <span>${x.qty}</span>
            <button type="button" onclick="changeQty(${i},1)">+</button>
            <button type="button" class="remove" onclick="removeItem(${i})">Remove</button>
          </div>
        </div>
        <strong>${money(x.price * x.qty)}</strong>
      </div>
    `;
  }).join('') +

  `
    <div class="cart-row cart-total">
      <strong>Total</strong>
      <strong>${money(total)}</strong>
    </div>
  `;
}


// SUBMIT ORDER
async function submitOrder(e) {
  if (e) e.preventDefault();

  if (!cart.length) {
    return alert('Please add a product first.');
  }

  const orderId = Date.now();
  const customerName = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const payment = document.getElementById('payment').value;

  const items = cart.map(x => `${x.name} x ${x.qty} - ${money(x.price * x.qty)}`).join('\n');
  const total = cart.reduce((sum, x) => sum + x.price * x.qty, 0);

  const photoElement = document.getElementById('photo');
  const photo = photoElement?.files[0];

  let photoData = '';
  let photoName = '';
  let photoType = '';

  if (photo) {
    photoName = photo.name;
    photoType = photo.type;
    photoData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(photo);
    });
  }

  const order = {
    orderId: orderId,
    customerName: customerName,
    phone: phone,
    address: address,
    items: items,
    total: money(total),
    payment: payment,
    photoData: photoData,
    photoName: photoName,
    photoType: photoType
  };

  try {
    await fetch(
      'https://script.google.com/macros/s/AKfycbxIhcm0UGUsaIlfwnk_KiwpBgITg-XKwqd960RQteXuiIsWsJodGDEqCKt-Mcr0qK4M/exec',
      {
        method: 'POST',
        body: JSON.stringify(order)
      }
    );

    alert('Order sent successfully! 🌙');

    cart = [];
    renderCart();

    const form = document.querySelector('form');
    if (form) {
      form.reset();
    }

    const preview = document.getElementById('preview');
    if (preview) {
      preview.hidden = true;
    }

  } catch (error) {
    console.error(error);
    alert('Could not send order.');
  }
}


// OWNER SETTINGS
function renderAdminProducts() {
  const el = document.getElementById('adminProducts');
  if (!el) return;

  el.innerHTML = products.map(p => `
    <div class="admin-row">
      <span>
        <strong>${escapeHtml(p.name)}</strong>
        <small>${money(p.price)} · ${p.stock} in stock</small>
      </span>
      <button type="button" onclick="editProduct('${p.id}')">Edit</button>
      <button type="button" class="remove" onclick="deleteProduct('${p.id}')">Delete</button>
    </div>
  `).join('');
}


function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const settings = document.getElementById('settings');
  const adminName = document.getElementById('adminName');
  const adminPrice = document.getElementById('adminPrice');
  const adminStock = document.getElementById('adminStock');
  const adminArt = document.getElementById('adminArt');
  const adminDesc = document.getElementById('adminDesc');

  if (!settings || !adminName || !adminPrice || !adminStock || !adminArt || !adminDesc) return;

  adminName.value = p.name;
  adminPrice.value = p.price;
  adminStock.value = p.stock;
  adminArt.value = p.art || '';
  adminDesc.value = p.description || '';

  settings.scrollIntoView({ behavior: 'smooth' });
}


function clearProductSetting() {
  ['adminName', 'adminPrice', 'adminStock', 'adminArt', 'adminDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}


function saveProductSetting() {
  const nameEl = document.getElementById('adminName');
  const priceEl = document.getElementById('adminPrice');
  const stockEl = document.getElementById('adminStock');

  if (!nameEl || !priceEl || !stockEl) return;

  const name = nameEl.value.trim();
  const price = Number(priceEl.value);
  const stock = Number(stockEl.value);

  if (!name || price < 0 || stock < 0) {
    return alert('Please enter product name, price and stock.');
  }

  const data = {
    name: name,
    price: price,
    stock: stock,
    art: document.getElementById('adminArt')?.value.trim() || '✨',
    description: document.getElementById('adminDesc')?.value.trim() || 'Cute handmade item.'
  };

  products.push({
    id: 'p_' + Date.now(),
    ...data
  });

  saveInventory();
  renderProducts();
  alert('Product saved!');
}


function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;

  products = products.filter(p => p.id !== id);
  saveInventory();
  cart = cart.filter(x => x.productId !== id);

  renderProducts();
  renderCart();
}


function saveCustomSettings() {
  const base = document.getElementById('adminCustomBase');
  const small = document.getElementById('feeSmall');
  const medium = document.getElementById('feeMedium');
  const large = document.getElementById('feeLarge');

  if (!base || !small || !medium || !large) return;

  customBase = Math.max(0, Number(base.value) || 0);

  fees = {
    small: Math.max(0, Number(small.value) || 0),
    medium: Math.max(0, Number(medium.value) || 0),
    large: Math.max(0, Number(large.value) || 0)
  };

  localStorage.setItem('pms_customBase', customBase);
  localStorage.setItem('pms_fees', JSON.stringify(fees));

  updateTotal();
  alert('Custom sticker prices saved!');
}


// LOAD SETTINGS
function loadSettings() {
  const base = document.getElementById('adminCustomBase');
  const small = document.getElementById('feeSmall');
  const medium = document.getElementById('feeMedium');
  const large = document.getElementById('feeLarge');

  if (!base || !small || !medium || !large) return;

  base.value = customBase;
  small.value = fees.small;
  medium.value = fees.medium;
  large.value = fees.large;
}


// INITIALIZATION
renderProducts();
loadSettings();
updateTotal();
renderCart();

// ATTACH FORM EVENT LISTENER
const orderForm = document.querySelector('form');
if (orderForm) {
  orderForm.addEventListener('submit', submitOrder);
}
