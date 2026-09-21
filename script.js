fetch('https://script.google.com/macros/s/AKfycbxIhcm0UGUsaIlfwnk_KiwpBgITg-XKwqd960RQteXuiIsWsJodGDEqCKt-Mcr0qK4M/exec', {
  method: 'POST',
  mode: 'no-cors',
  body: JSON.stringify(order)
})
.then(() => {
  alert('Order sent successfully! 🌙');

  cart = [];
  renderCart();

  document.querySelector('form').reset();

  document.getElementById('preview').hidden = true;
})
.catch(error => {
  console.error(error);
  alert('Could not send order.');
});
