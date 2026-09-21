// PAPER MOON STUDIO - INVENTORY & SHOP LOGIC

// ၁။ ဒီနေရာမှာ သင့် Sticker ပစ္စည်း စာရင်းနှင့် GitHub ထဲတင်ထားသော ပုံအမည်များကို ပြင်ပေးပါ
const defaultProducts = [
  {
    id: 'sticker-3',
    name: 'Anime Sticker Pack',
    description: 'Cute anime style stickers.',
    price: 3500,
    stock: 15,
    image: 'c1775da995a47a1b71e7487c3dc1ab7d.png' // ဒီအတိုင်း အတိအကျ ပြောင်းပေးပါ
  },
  {
    id: 'pack',
    name: 'Mini Sticker Pack',
    description: 'A small pack of cute designs for your favourite things.',
    price: 2500,
    stock: 8,
    image: 'c1775da995a47a1b71e7487c3dc1ab7d.png' // ဒီအတိုင်း အတိအကျ ပြောင်းပေးပါ
  }
];

let products = defaultProducts;
let cart = [];
let customBase = 3000;
let fees = { small: 1000, medium: 1500, large: 2000 };

const money = n => Number(n).toLocaleString('en-US') + ' Ks';

// Website ပေါ်တွင် Sticker ပစ္စည်းများနှင့် ပုံများကို ထုတ်ပြပေးသည့် Function
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  
  grid.innerHTML = products.map(p => {
    const sold = p.stock <= 0;
    return `
      <article class="product-card ${sold ? 'sold-out' : ''}">
        <div class="product-art">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%; height:180px; object-fit:cover; border-radius:8px;" onerror="this.onerror=null; this.src='https://via.placeholder.com/180?text=Sticker';">
        </div>
        <div class="stock-badge ${sold ? 'out' : ''}">${sold ? 'Sold out' : `${p.stock} in stock`}</div>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description || '')}</p>
        <div class="product-bottom">
          <strong>${money(p.price)}</strong>
          <button ${sold ? 'disabled' : ''} onclick="addItem('${p.id}')">${sold ? 'Sold out' : 'Add to basket'}</button>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[c]));
}

function customPrice() {
  return customBase + Number(fees[document.getElementById('size').value] || 0);
}

function updateTotal() {
  const q = Math.max(1, Number(document.getElementById('qty').value) || 1);
  document.getElementById('total').textContent = money(customPrice() * q);
}

// Custom Sticker Upload Preview
const photoInput = document.getElementById('photo');
if (photoInput) {
  photoInput.addEventListener('change', e => {
    const f = e.target.files[0], p = document.getElementById('preview');
    if (f) {
      p.src = URL.createObjectURL(f);
      p.hidden = false;
    }
  });
}

const sizeSelect = document.getElementById('size');
if (sizeSelect) sizeSelect.addEventListener('change', updateTotal);

const qtyInput = document.getElementById('qty');
if (qtyInput) qtyInput.addEventListener('input', updateTotal);

function addItem(id) {
  const p = products.find(x => x.id === id);
  if (!p || p.stock <= 0) return;
  const x = cart.find(x => x.productId === id);
  if (x) {
    if (x.qty >= p.stock) return alert(`Sorry, only ${p.stock} ${p.name} available.`);
    x.qty++;
  } else {
    cart.push({ productId: id, name: p.name, price: p.price, qty: 1, stock: p.stock });
  }
  renderCart();
  location.hash = 'order';
}

function addCustom() {
  const f = document.getElementById('photo').files[0];
  if (!f) return alert('Please upload a photo first.');
  const size = document.getElementById('size').value;
  const q = Math.max(1, Number(document.getElementById('qty').value) || 1);
  cart.push({ name: `Custom Sticker (${size})`, price: customPrice(), qty: q, custom: true, photoName: f.name });
  renderCart();
  location.hash = 'order';
}

function changeQty(i, d) {
  const x = cart[i];
  if (!x) return;
  if (x.custom) {
    x.qty = Math.max(1, x.qty + d);
  } else {
    x.qty = Math.min(products.find(p => p.id === x.productId)?.stock ?? x.stock, Math.max(1, x.qty + d));
  }
  renderCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  renderCart();
}

function renderCart() {
  const el = document.getElementById('cart');
  if (!el) return;
  
  document.getElementById('cartCount').textContent = cart.reduce((s, x) => s + x.qty, 0);
  
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
  }).join('') + `<div class="cart-row cart-total"><strong>Total</strong><strong>${money(total)}</strong></div>`;
}

function submitOrder(e) {
  e.preventDefault();

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

  const order = {
    orderId: orderId,
    customerName: customerName,
    phone: phone,
    address: address,
    items: items,
    total: money(total),
    payment: payment
  };

  fetch('https://script.google.com/macros/s/AKfycbxIhcm0UGUsaIlfwnk_KiwpBgITg-XKwqd960RQteXuiIsWsJodGDEqCKt-Mcr0qK4M/exec', {
    method: 'POST',
    body: JSON.stringify(order)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Order sent successfully! 🌙');
      cart = [];
      renderCart();
      document.querySelector('form').reset();
    } else {
      alert('Something went wrong.');
    }
  })
  .catch(error => {
    console.error(error);
    alert('Could not send order.');
  });
}

// Initial Load
renderProducts();
updateTotal();
renderCart();
