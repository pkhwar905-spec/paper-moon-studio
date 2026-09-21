// PAPER MOON STUDIO - INVENTORY + OWNER SETTINGS
const defaultProducts = [
  {id:'sheet',name:'Cute Sticker Sheet',description:'Pastel mini stickers for everyday decorating.',price:3000,stock:12,art:'🌸⭐'},
  {id:'pack',name:'Mini Sticker Pack',description:'A small pack of cute designs for your favourite things.',price:2500,stock:8,art:'💌🧸'}
];
const saved = localStorage.getItem('pms_products');
let products = saved ? JSON.parse(saved) : defaultProducts;
let cart = [];
let customBase = Number(localStorage.getItem('pms_customBase') ?? 3000);
let fees = JSON.parse(localStorage.getItem('pms_fees') || '{"small":1000,"medium":1500,"large":2000}');
let editingId = null;
const money = n => Number(n).toLocaleString('en-US') + ' Ks';
const saveInventory = () => localStorage.setItem('pms_products', JSON.stringify(products));

function renderProducts(){
 const grid=document.getElementById('productGrid');
 grid.innerHTML=products.map(p=>{const sold=p.stock<=0; return `<article class="product-card ${sold?'sold-out':''}">
 <div class="product-art">${p.art||'✨'}</div><div class="stock-badge ${sold?'out':''}">${sold?'Sold out':`${p.stock} in stock`}</div>
 <h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||'')}</p><div class="product-bottom"><strong>${money(p.price)}</strong>
 <button ${sold?'disabled':''} onclick="addItem('${p.id}')">${sold?'Sold out':'Add to basket'}</button></div></article>`}).join('');
 renderAdminProducts();
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function customPrice(){return customBase+Number(fees[document.getElementById('size').value]||0)}
function updateTotal(){const q=Math.max(1,Number(document.getElementById('qty').value)||1);document.getElementById('total').textContent=money(customPrice()*q)}

document.getElementById('photo').addEventListener('change',e=>{const f=e.target.files[0],p=document.getElementById('preview');if(f){p.src=URL.createObjectURL(f);p.hidden=false}});
document.getElementById('size').addEventListener('change',updateTotal);document.getElementById('qty').addEventListener('input',updateTotal);

function addItem(id){const p=products.find(x=>x.id===id);if(!p||p.stock<=0)return;const x=cart.find(x=>x.productId===id);if(x){if(x.qty>=p.stock)return alert(`Sorry, only ${p.stock} ${p.name} available.`);x.qty++}else cart.push({productId:id,name:p.name,price:p.price,qty:1,stock:p.stock});renderCart();location.hash='order'}
function addCustom(){const f=document.getElementById('photo').files[0];if(!f)return alert('Please upload a photo first.');const size=document.getElementById('size').value,q=Math.max(1,Number(document.getElementById('qty').value)||1);cart.push({name:`Custom Sticker (${size})`,price:customPrice(),qty:q,custom:true,photoName:f.name});renderCart();location.hash='order'}
function changeQty(i,d){const x=cart[i];if(!x)return;if(x.custom)x.qty=Math.max(1,x.qty+d);else{x.qty=Math.min(products.find(p=>p.id===x.productId)?.stock??x.stock,Math.max(1,x.qty+d))}renderCart()}
function removeItem(i){cart.splice(i,1);renderCart()}
function renderCart(){const el=document.getElementById('cart');document.getElementById('cartCount').textContent=cart.reduce((s,x)=>s+x.qty,0);if(!cart.length){el.innerHTML='<p>Your basket is empty. Choose something from In Stock above ✨</p>';return}let total=0;el.innerHTML=cart.map((x,i)=>{total+=x.price*x.qty;return `<div class="cart-row"><div><strong>${escapeHtml(x.name)}</strong>${x.photoName?`<small>📷 ${escapeHtml(x.photoName)}</small>`:''}<div class="qty-controls"><button type="button" onclick="changeQty(${i},-1)">−</button><span>${x.qty}</span><button type="button" onclick="changeQty(${i},1)">+</button><button type="button" class="remove" onclick="removeItem(${i})">Remove</button></div></div><strong>${money(x.price*x.qty)}</strong></div>`}).join('')+`<div class="cart-row cart-total"><strong>Total</strong><strong>${money(total)}</strong></div>`}
function submitOrder(e){
  e.preventDefault();

  if(!cart.length){
    return alert('Please add a product first.');
  }

  const orderId = Date.now();
  const customerName = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const payment = document.getElementById('payment').value;

  const items = cart.map(x =>
    `${x.name} x ${x.qty} - ${money(x.price * x.qty)}`
  ).join('\n');

  const total = cart.reduce((sum,x) =>
    sum + x.price * x.qty, 0
  );

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
    if(data.success){
      alert('Order sent successfully! 🌙');
      cart = [];
      renderCart();
      document.querySelector('form').reset();
    }else{
      alert('Something went wrong.');
    }
  })
  .catch(error => {
    console.error(error);
    alert('Could not send order.');
  });
}

// OWNER SETTINGS
function renderAdminProducts(){const el=document.getElementById('adminProducts');if(!el)return;el.innerHTML=products.map(p=>`<div class="admin-row"><span><strong>${escapeHtml(p.name)}</strong><small>${money(p.price)} · ${p.stock} in stock</small></span><button type="button" onclick="editProduct('${p.id}')">Edit</button><button type="button" class="remove" onclick="deleteProduct('${p.id}')">Delete</button></div>`).join('')}
function editProduct(id){const p=products.find(x=>x.id===id);if(!p)return;editingId=id;document.getElementById('adminName').value=p.name;document.getElementById('adminPrice').value=p.price;document.getElementById('adminStock').value=p.stock;document.getElementById('adminArt').value=p.art||'';document.getElementById('adminDesc').value=p.description||'';document.getElementById('settings').scrollIntoView({behavior:'smooth'});}
function clearProductSetting(){editingId=null;['adminName','adminPrice','adminStock','adminArt','adminDesc'].forEach(id=>document.getElementById(id).value='')}
function saveProductSetting(){const name=document.getElementById('adminName').value.trim();const price=Number(document.getElementById('adminPrice').value);const stock=Number(document.getElementById('adminStock').value);if(!name||price<0||stock<0)return alert('Please enter product name, price and stock.');const data={name,price,stock,art:document.getElementById('adminArt').value.trim()||'✨',description:document.getElementById('adminDesc').value.trim()||'Cute handmade item.'};if(editingId){Object.assign(products.find(p=>p.id===editingId),data)}else products.push({id:'p_'+Date.now(),...data});saveInventory();clearProductSetting();renderProducts();alert('Product saved!');}
function deleteProduct(id){if(!confirm('Delete this product?'))return;products=products.filter(p=>p.id!==id);saveInventory();cart=cart.filter(x=>x.productId!==id);renderProducts();renderCart()}
function saveCustomSettings(){customBase=Math.max(0,Number(document.getElementById('adminCustomBase').value)||0);fees={small:Math.max(0,Number(document.getElementById('feeSmall').value)||0),medium:Math.max(0,Number(document.getElementById('feeMedium').value)||0),large:Math.max(0,Number(document.getElementById('feeLarge').value)||0)};localStorage.setItem('pms_customBase',customBase);localStorage.setItem('pms_fees',JSON.stringify(fees));updateTotal();alert('Custom sticker prices saved!')}
function loadSettings(){document.getElementById('adminCustomBase').value=customBase;document.getElementById('feeSmall').value=fees.small;document.getElementById('feeMedium').value=fees.medium;document.getElementById('feeLarge').value=fees.large}
renderProducts();loadSettings();updateTotal();renderCart();
