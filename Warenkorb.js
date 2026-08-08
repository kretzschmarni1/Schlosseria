
// Accessory data 
var outExtra1 = document.getElementById("outExtra1");

// Lade die Zubehör-Daten aus dem Local Storage
const savedData = JSON.parse(localStorage.getItem("accessories")) || {};

// Anzeige-Elemente
const OutTotal = document.getElementById("iTotoal");
const clearButton = document.getElementById("iClearButton");

// Berechnung der Gesamtsumme
const calculateTotal = () => {
  let total = 0;

  // Addiere alle Konfigurationen (falls vorhanden)
  const storedConfigurations = JSON.parse(localStorage.getItem("configurations")) || [];
  storedConfigurations.forEach((config) => {
    total += parseFloat(config.total) || 0;
    total += parseFloat(config.versand) || 0;
  });

  // Addiere alle Zubehörpreise
  Object.keys(savedData).forEach((id) => {
    const accessory = savedData[id];
    total += parseFloat(accessory.totalPrice) || 0;
  });

  return total;
};

function refreshTotal() {
  if (OutTotal) {
    OutTotal.textContent = calculateTotal().toFixed(2) + " €";
  }
}

function removeAccessory(id) {
  savedData[id].quantity = 0;
  savedData[id].totalPrice = 0;
  localStorage.setItem("accessories", JSON.stringify(savedData));
  renderAccessories();
  refreshTotal();
}

function removeConfiguration(index) {
  var configs = JSON.parse(localStorage.getItem("configurations")) || [];
  configs.splice(index, 1);
  localStorage.setItem("configurations", JSON.stringify(configs));
  renderConfigurations();
  refreshTotal();
}

function renderAccessories() {
  outExtra1.innerHTML = "";
  Object.keys(savedData).forEach((id) => {
    if (savedData[id].quantity > 0) {
      var row = document.createElement("div");
      row.classList.add("cCartItem");
      row.innerHTML =
        '<div class="cCartDetails">' +
          savedData[id].quantity + " x " + savedData[id].name + " " +
          savedData[id].dimension + "mm — " + savedData[id].totalPrice + " €" +
        '</div>' +
        '<button class="cRemoveBtn" data-acc-id="' + id + '">✕</button>';
      outExtra1.appendChild(row);
    }
  });
  outExtra1.querySelectorAll(".cRemoveBtn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      removeAccessory(btn.dataset.accId);
    });
  });
}

const initializeDOM = () => {
  actAccessoires();
  renderAccessories();
  refreshTotal();
};

function renderConfigurations() {
  var existing = document.querySelector(".configurations-container");
  if (existing) existing.remove();

  var storedConfigurations = JSON.parse(localStorage.getItem("configurations")) || [];
  if (storedConfigurations.length === 0) return;

  var container = document.createElement("div");
  container.classList.add("configurations-container");

  storedConfigurations.forEach(function(config, index) {
    var item = document.createElement("div");
    item.classList.add("cCartItem");

    var thumbHTML = config.thumbnail
      ? '<img src="' + config.thumbnail + '" class="cCartThumb" alt="Möbelstück ' + (index + 1) + '">'
      : '';

    item.innerHTML =
      thumbHTML +
      '<div class="cCartDetails">' +
        '<b>Möbelstück ' + (index + 1) + ':</b><br>' +
        'B/T/H: ' + config.width + ', ' + config.deepth + ', ' + config.hight + '<br>' +
        'Preis: ' + parseFloat(config.total).toFixed(2) + ' €<br>' +
        'Versand: ' + config.versand + ' €' +
      '</div>' +
      '<button class="cRemoveBtn" data-config-idx="' + index + '">✕</button>';

    container.appendChild(item);
  });

  container.querySelectorAll(".cRemoveBtn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      removeConfiguration(parseInt(btn.dataset.configIdx));
    });
  });

  var accessoriesSection = document.querySelector(".accessories");
  if (accessoriesSection) {
    accessoriesSection.insertAdjacentElement("afterend", container);
  }
}

// Löschen der Konfigurationen
const clearConfigurations = () => {
  localStorage.removeItem("configurations");
  clearAccesoryData();
  alert("Kompletter Warenkorb wurde erfolgreich gelöscht.");
  location.reload(); // Seite neu laden
};

// Event-Listener für den Löschen-Button
if (clearButton) {
  clearButton.addEventListener("click", clearConfigurations);
}

// Formularverarbeitung (für E-Mail und Konfigurationen)
document.getElementById("emailForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const street = document.getElementById("street").value;
  const houseNumber = document.getElementById("houseNumber").value;
  const zip = document.getElementById("zip").value;
  const city = document.getElementById("city").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;
  const paymentEl = document.querySelector('input[name="payment"]:checked');
  const payment = paymentEl ? paymentEl.value : "nicht ausgewählt";
 
  const accessoriesData = Object.keys(savedData).map((id) => {
    const accessory = savedData[id];
    return `${accessory.quantity} x ${accessory.name} (Total: ${accessory.totalPrice || 0}€)`;
  }).join(", ");

  const configurationsData = JSON.stringify(
    JSON.parse(localStorage.getItem("configurations")) || []
  );

  const additionalData = `
    Name: ${name}
    Adresse: ${street} ${houseNumber}, ${zip} ${city}
    E-Mail: ${email}
    Nachricht: ${message}
    Bezahlmethode: ${payment}
    Zubehör: ${accessoriesData}
    Konfigurationen: ${configurationsData}
  `;


 

  const additionalDataField = document.createElement("input");
  additionalDataField.type = "hidden";
  additionalDataField.name = "additional_data";
  additionalDataField.value = additionalData;

  this.appendChild(additionalDataField);
  this.action = "https://formspree.io/f/xjvqzjnz"; // Zieladresse
  this.submit();

  // Warenkorb zurücksetzen
  localStorage.removeItem("configurations");
  clearAccesoryData();
});

// Initialisierung der Seite
document.addEventListener("DOMContentLoaded", () => {
  initializeDOM();
  renderConfigurations();
});

// clearAccesoryData
function clearAccesoryData() {
  Object.keys(savedData).forEach((id) => {
    const accessory = savedData[id];
    accessory.quantity = 0;
    accessory.totalPrice = 0;
  });

  localStorage.setItem("accessories", JSON.stringify(savedData));
}

// Berechne den Preis jedes Zubehörs basierend auf Name und Dimension
function calculateAccessoryTotalPrice(accessory) {
  const pricePerItem = accessoryPrices[accessory.name]?.[accessory.dimension] || 0;
  return pricePerItem * accessory.quantity;
}

// Berechne die Preise für alle Accessoires
function actAccessoires() {  
  Object.keys(savedData).forEach((id) => {
    const accessory = savedData[id];
    accessory.totalPrice = calculateAccessoryTotalPrice(accessory);
  });

  localStorage.setItem("accessories", JSON.stringify(savedData));
}
