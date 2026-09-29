const tg = window.Telegram.WebApp;
tg.expand();

const products = [
  { id: 1, name: "Курзе", variant: "С говядиной", price: 450, kcal: "220 ккал / 100г", recipe: "Варить 7-8 минут в кипящей подсоленной воде" },
  { id: 2, name: "Курзе", variant: "С курицей", price: 400, kcal: "180 ккал / 100г", recipe: "Варить 6-7 минут в кипящей воде" },
  { id: 3, name: "Курзе", variant: "С творогом", price: 350, kcal: "160 ккал / 100г", recipe: "Варить 5 минут после всплытия" },
  { id: 4, name: "Манты", variant: "С говядиной", price: 500, kcal: "240 ккал / 100г", recipe: "Готовить на пару 40-45 минут" },
  { id: 5, name: "Блины", variant: "Классические", price: 300, kcal: "190 ккал / 100г", recipe: "Разогреть на сковороде или в микроволновке 2 мин" }
];

let cart = {};

function renderCatalog() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  products.forEach(p => {
    const count = cart[p.id] ? cart[p.id].count : 0;
    container.innerHTML += `
      <div class="card">
        <div class="card-title">${p.name} (${p.variant}) — ${p.price} ₽/кг</div>
        <div class="card-info">⚡ ${p.kcal}<br>👨‍🍳 ${p.recipe}</div>
        <div class="controls">
          <div class="counter">
            <button onclick="updateCart(${p.id}, -1)">-</button>
            <span>${count}</span>
            <button onclick="updateCart(${p.id}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
  });
  updateTotal();
}

function updateCart(productId, delta) {
  if (!cart[productId]) {
    const product = products.find(p => p.id === productId);
    cart[productId] = { ...product, count: 0 };
  }
  cart[productId].count += delta;
  if (cart[productId].count <= 0) delete cart[productId];
  renderCatalog();
}

function getTotalSum() {
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.count, 0);
}

function updateTotal() {
  document.getElementById("cart-total").innerText = getTotalSum();
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

function goToCheckout() {
  if (Object.keys(cart).length === 0) {
    alert("Выберите хотя бы один товар!");
    return;
  }
  showScreen("checkout-screen");
}

function toggleDeliveryFields() {
  const type = document.getElementById("delivery-type").value;
  document.getElementById("delivery-block").style.display = type === "delivery" ? "block" : "none";
  document.getElementById("pickup-block").style.display = type === "pickup" ? "block" : "none";
}

function goToConfirmation() {
  const phone = document.getElementById("phone").value.trim();
  if (!phone) {
    alert("Введите номер телефона!");
    return;
  }

  const deliveryType = document.getElementById("delivery-type").value;
  const address = document.getElementById("address").value;
  const pickupPoint = document.getElementById("pickup-point").value;
  const payment = document.getElementById("payment").value;

  let itemsHtml = Object.values(cart).map(i => `<div>• ${i.name} (${i.variant}): ${i.count} кг × ${i.price} ₽ = ${i.count * i.price} ₽</div>`).join("");
  
  document.getElementById("summary-card").innerHTML = `
    <b>Товары:</b><br>${itemsHtml}<br>
    <b>Телефон:</b> ${phone}<br>
    <b>Способ получения:</b> ${deliveryType === "delivery" ? "Доставка (" + address + ")" : "Самовывоз (" + pickupPoint + ")"}<br>
    <b>Оплата:</b> ${payment === "cash" ? "Наличными" : "Картой"}<br><br>
    <b>Итого: ${getTotalSum()} ₽</b>
  `;

  showScreen("confirm-screen");
}

function submitOrder() {
  const orderData = {
    orderId: Math.floor(1000 + Math.random() * 9000),
    cart: Object.values(cart).map(i => ({ name: i.name, variant: i.variant, count: i.count, price: i.price, total: i.count * i.price })),
    phone: document.getElementById("phone").value,
    deliveryType: document.getElementById("delivery-type").value,
    address: document.getElementById("address").value,
    pickupPoint: document.getElementById("pickup-point").value,
    payment: document.getElementById("payment").value,
    totalAmount: getTotalSum()
  };

  tg.sendData(JSON.stringify(orderData));
}

renderCatalog();
