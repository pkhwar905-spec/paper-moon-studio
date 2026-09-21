async function submitOrder(e){
  e.preventDefault();

  if(!cart.length){
    return alert('Please add a product first.');
  }

  const order = {
    orderId: Date.now(),
    customerName: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    items: cart.map(x =>
      `${x.name} x ${x.qty} - ${money(x.price * x.qty)}`
    ).join('\n'),
    total: money(cart.reduce((sum,x) =>
      sum + x.price * x.qty, 0
    )),
    payment: document.getElementById('payment').value
  };

  try {
    await fetch(
      'https://script.google.com/macros/s/AKfycbxIhcm0UGUsaIlfwnk_KiwpBgITg-XKwqd960RQteXuiIsWsJodGDEqCKt-Mcr0qK4M/exec',
      {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(order)
      }
    );

    alert('Order sent successfully! 🌙');

    cart = [];
    renderCart();

    document.querySelector('form').reset();

    const preview = document.getElementById('preview');
    if(preview) preview.hidden = true;

  } catch(error) {
    console.error(error);
    alert('Could not send order.');
  }
}