// PAPER MOON STUDIO - INVENTORY + SHOP

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

        <p>
          ${escapeHtml(p.description || '')}
        </p>

        <div class="product-bottom">

          <strong>
            ${money(p.price)}
          </strong>

          <button
            ${sold ? 'disabled' : ''}
            onclick="addItem('${p.id}')"
          >
            ${sold ? 'Sold out' : 'Add to basket'}
          </button>

        </div>

      </article>
    `;

  }).join('');
}

function customPrice() {

  const size =
    document.getElementById('size')?.value || 'small';

  return customBase +
    Number(fees[size] || 0);
}

function updateTotal() {

  const qtyElement =
    document.getElementById('qty');

  const totalElement =
    document.getElementById('total');

  if (!qtyElement || !totalElement) return;

  const q =
    Math.max(1, Number(qtyElement.value) || 1);

  totalElement.textContent =
    money(customPrice() * q);
}


// PHOTO PREVIEW ONLY
// This does NOT send the photo to Telegram.

const photoInput =
  document.getElementById('photo');

if (photoInput) {

  photoInput.addEventListener('change', e => {

    const file = e.target.files[0];

    const preview =
      document.getElementById('preview');

    if (file && preview) {

      preview.src =
        URL.createObjectURL(file);

      preview.hidden = false;
    }

  });

}


const sizeInput =
  document.getElementById('size');

if (sizeInput) {
  sizeInput.addEventListener(
    'change',
    updateTotal
  );
}


const qtyInput =
  document.getElementById('qty');

if (qtyInput) {
  qtyInput.addEventListener(
    'input',
    updateTotal
  );
}


// ADD NORMAL PRODUCT

function addItem(id) {

  const product =
    products.find(x => x.id === id);

  if (!product || product.stock <= 0) {
    return;
  }

  const existing =
    cart.find(x => x.productId === id);

  if (existing) {

    if (existing.qty >= product.stock) {

      return alert(
        `Sorry, only ${product.stock} ${product.name} available.`
      );

    }

    existing.qty++;

  } else {

    cart.push({
      productId: id,
      name: product.name,
      price: product.price,
      qty: 1,
      stock: product.stock
    });

  }

  renderCart();

  location.hash = 'order';
}


// ADD CUSTOM STICKER

function addCustom() {

  const photo =
    document.getElementById('photo');

  if (!photo || !photo.files[0]) {

    return alert(
      'Please upload a photo first.'
    );

  }

  const size =
    document.getElementById('size')?.value ||
    'small';

  const qty =
    Math.max(
      1,
      Number(
        document.getElementById('qty')?.value
      ) || 1
    );

  cart.push({
    name: `Custom Sticker (${size})`,
    price: customPrice(),
    qty: qty,
    custom: true,
    photoName: photo.files[0].name
  });

  renderCart();

  location.hash = 'order';
}


// CHANGE QUANTITY

function changeQty(i, d) {

  const item = cart[i];

  if (!item) return;

  if (item.custom) {

    item.qty =
      Math.max(1, item.qty + d);

  } else {

    const product =
      products.find(
        p => p.id === item.productId
      );

    const maxStock =
      product?.stock ?? item.stock;

    item.qty =
      Math.min(
        maxStock,
        Math.max(1, item.qty + d)
      );
  }

  renderCart();
}


// REMOVE ITEM

function removeItem(i) {

  cart.splice(i, 1);

  renderCart();
}


// RENDER CART

function renderCart() {

  const el =
    document.getElementById('cart');

  if (!el) return;

  const count =
    document.getElementById('cartCount');

  if (count) {

    count.textContent =
      cart.reduce(
        (sum, x) => sum + x.qty,
        0
      );

  }

  if (!cart.length) {

    el.innerHTML =
      '<p>Your basket is empty. Choose something from In Stock above ✨</p>';

    return;
  }

  let total = 0;

  el.innerHTML =
    cart.map((x, i) => {

      total += x.price * x.qty;

      return `
        <div class="cart-row">

          <div>

            <strong>
              ${escapeHtml(x.name)}
            </strong>

            ${
              x.photoName
              ? `<small>📷 ${escapeHtml(x.photoName)}</small>`
              : ''
            }

            <div class="qty-controls">

              <button
                type="button"
                onclick="changeQty(${i},-1)"
              >
                −
              </button>

              <span>
                ${x.qty}
              </span>

              <button
                type="button"
                onclick="changeQty(${i},1)"
              >
                +
              </button>

              <button
                type="button"
                class="remove"
                onclick="removeItem(${i})"
              >
                Remove
              </button>

            </div>

          </div>

          <strong>
            ${money(x.price * x.qty)}
          </strong>

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


// SEND ORDER
// PHOTO IS NOT SENT.
// ONLY ORDER INFORMATION IS SENT.

function submitOrder(e) {

  e.preventDefault();

  if (!cart.length) {

    return alert(
      'Please add a product first.'
    );

  }

  const orderId = Date.now();

  const customerName =
    document.getElementById('name')
      .value.trim();

  const phone =
    document.getElementById('phone')
      .value.trim();

  const address =
    document.getElementById('address')
      .value.trim();

  const payment =
    document.getElementById('payment')
      .value;

  const items =
    cart.map(x =>
      `${x.name} x ${x.qty} - ${money(x.price * x.qty)}`
    ).join('\n');

  const total =
    cart.reduce(
      (sum, x) =>
        sum + x.price * x.qty,
      0
    );

  const order = {

    orderId: orderId,

    customerName:
      customerName,

    phone:
      phone,

    address:
      address,

    items:
      items,

    total:
      money(total),

    payment:
      payment

  };


  fetch(
    'https://script.google.com/macros/s/AKfycbxIhcm0UGUsaIlfwnk_KiwpBgITg-XKwqd960RQteXuiIsWsJodGDEqCKt-Mcr0qK4M/exec',
    {
      method: 'POST',
      body: JSON.stringify(order)
    }
  )

  .then(response =>
    response.json()
  )

  .then(data => {

    if (data.success) {

      alert(
        'Order sent successfully! 🌙'
      );

      cart = [];

      renderCart();

      document
        .querySelector('form')
        .reset();

      const preview =
        document.getElementById('preview');

      if (preview) {
        preview.hidden = true;
      }

    } else {

      alert(
        'Something went wrong.'
      );

    }

  })

  .catch(error => {

    console.error(error);

    alert(
      'Could not send order.'
    );

  });

}


// START WEBSITE

renderProducts();

updateTotal();

renderCart();
