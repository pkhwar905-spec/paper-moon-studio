const products = [
  {
    name: "Cute Sticker Sheet",
    price: 3000,
    stock: 10,
    description: "Cute aesthetic sticker sheet"
  },
  {
    name: "Mini Sticker Pack",
    price: 2500,
    stock: 10,
    description: "Small cute sticker pack"
  },
  {
    name: "Custom Sticker",
    price: 4000,
    stock: 10,
    description: "Turn your photo into a sticker"
  }
];

let cart = [];

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxIhcm0UGUsaIlfwnk_KiwpBgITg-XKwqd960RQteXuiIsWsJodGDEqCKt-Mcr0qK4M/exec";

function money(value) {
  return Number(value).toLocaleString() + " Ks";
}

function renderProducts() {
  const grid = document.getElementById("productGrid");

  if (!grid) return;

  grid.innerHTML = "";

  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <strong>${money(product.price)}</strong>
      <p>Stock: ${product.stock}</p>
      <button class="btn" onclick="addProduct(${index})">
        Add to Basket
      </button>
    `;

    grid.appendChild(card);
  });
}

function addProduct(index) {
  const product = products[index];

  if (product.stock <= 0) {
    alert("This product is sold out.");
    return;
  }

  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      qty: 1
    });
  }

  renderCart();
}

function addCustom() {
  const photo = document.getElementById("photo");
  const size = document.getElementById("size");
  const qty = document.getElementById("qty");

  if (!photo || !photo.files.length) {
    alert("Please upload a photo first.");
    return;
  }

  const sizePrices = {
    small: 1000,
    medium: 1500,
    large: 2000
  };

  const basePrice = 3000;
  const extra = sizePrices[size.value] || 1000;
  const quantity = Number(qty.value) || 1;

  const price = basePrice + extra;

  cart.push({
    name: `Custom Sticker (${size.value})`,
    price: price,
    qty: quantity
  });

  renderCart();

  alert("Custom sticker added to basket! 🌙");
}

function renderCart() {
  const cartBox = document.getElementById("cart");
  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.textContent = cart.reduce(
      (sum, item) => sum + item.qty,
      0
    );
  }

  if (!cartBox) return;

  if (cart.length === 0) {
    cartBox.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let total = 0;

  cartBox.innerHTML = "";

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const div = document.createElement("div");

    div.innerHTML = `
      <p>
        <strong>${item.name}</strong><br>
        Quantity: ${item.qty}<br>
        ${money(itemTotal)}
        <button onclick="removeItem(${index})">Remove</button>
      </p>
    `;

    cartBox.appendChild(div);
  });

  const totalElement = document.createElement("h3");
  totalElement.textContent = "Total: " + money(total);

  cartBox.appendChild(totalElement);
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

async function submitOrder(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Please add a product first.");
    return;
  }

  const customerName =
    document.getElementById("name").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const address =
    document.getElementById("address").value.trim();

  const payment =
    document.getElementById("payment").value;

  const items = cart
    .map(item =>
      `${item.name} x ${item.qty} - ${money(item.price * item.qty)}`
    )
    .join("\n");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const order = {
    orderId: Date.now(),
    customerName: customerName,
    phone: phone,
    address: address,
    items: items,
    total: money(total),
    payment: payment
  };

  try {
    await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(order)
    });

    alert("Order sent successfully! 🌙");

    cart = [];
    renderCart();

    const form = document.querySelector("form");

    if (form) {
      form.reset();
    }

    const preview = document.getElementById("preview");

    if (preview) {
      preview.hidden = true;
    }

  } catch (error) {
    console.error(error);
    alert("Could not send order.");
  }
}

const photoInput = document.getElementById("photo");

if (photoInput) {
  photoInput.addEventListener("change", function () {
    const preview = document.getElementById("preview");

    if (!preview || !this.files.length) {
      return;
    }

    preview.src = URL.createObjectURL(this.files[0]);
    preview.hidden = false;
  });
}

renderProducts();
renderCart();
