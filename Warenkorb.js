
// Accessory data 
var outExtra1 = document.getElementById("outExtra1");

// Lade die Zubehör-Daten aus dem Local Storage
const savedData = JSON.parse(localStorage.getItem("accessories")) || {};

// Anzeige-Elemente
const OutTotal = document.getElementById("iTotoal");
const clearButton = document.getElementById("iClearButton");

function getShippingMode() {
  return localStorage.getItem("shippingMode") === "abholung" ? "abholung" : "versand";
}

function setShippingMode(mode) {
  localStorage.setItem("shippingMode", mode === "abholung" ? "abholung" : "versand");
}

function isForcedPickup() {
  return getDeliveryInfo() === "Nur Abholung";
}

function isPickupSelected() {
  return isForcedPickup() || getShippingMode() === "abholung";
}

function isConfigForcedPickup(config) {
  if (!config) return false;
  if (config.delivery === "Nur Abholung") return true;
  var w = parseFloat(config.width) || 0;
  var d = parseFloat(config.deepth) || 0;
  var h = parseFloat(config.hight) || 0;
  return w > 150 || d > 150 || h > 150;
}

function getEffectiveShippingCost(config) {
  if (isPickupSelected()) return 0;
  if (isConfigForcedPickup(config)) return 0;
  var stored = parseFloat(config.versand) || 0;
  return stored > 0 ? stored : 120;
}

// Berechnung der Gesamtsumme
const calculateTotal = () => {
  let total = 0;

  // Addiere alle Konfigurationen (falls vorhanden)
  const storedConfigurations = JSON.parse(localStorage.getItem("configurations")) || [];
  storedConfigurations.forEach((config) => {
    var qty = config.quantity || 1;
    total += (parseFloat(config.total) || 0) * qty;
    total += getEffectiveShippingCost(config);
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
  refreshDeliveryInfo();
}

function getDeliveryInfo() {
  const storedConfigurations = JSON.parse(localStorage.getItem("configurations")) || [];
  const hasAccessories = Object.keys(savedData).some(function (id) {
    return (savedData[id].quantity || 0) > 0;
  });

  if (storedConfigurations.length === 0) {
    return hasAccessories ? "Versand möglich" : "—";
  }

  // Sobald ein Möbelstück Abholung braucht → gesamter Warenkorb: Abholung
  const needsPickup = storedConfigurations.some(function (config) {
    if (config.delivery === "Nur Abholung") return true;

    const w = parseFloat(config.width) || 0;
    const d = parseFloat(config.deepth) || 0;
    const h = parseFloat(config.hight) || 0;
    if (w > 150 || d > 150 || h > 150) return true;

    // Fallback für ältere Warenkorb-Einträge ohne delivery-Feld
    const versand = parseFloat(config.versand);
    if (versand === 0 && (w > 0 || d > 0 || h > 0) && (w > 150 || d > 150 || h > 150)) {
      return true;
    }

    return false;
  });

  return needsPickup ? "Nur Abholung" : "Versand möglich";
}

function refreshDeliveryInfo() {
  const el = document.getElementById("iDeliveryText");
  const sel = document.getElementById("iCartShippingMode");
  const info = getDeliveryInfo();
  const canChoose = info === "Versand möglich";

  if (sel) {
    sel.hidden = !canChoose;
    if (canChoose) sel.value = getShippingMode();
  }
  if (el) {
    if (canChoose) {
      el.style.display = "none";
    } else {
      el.style.display = "";
      el.textContent = info;
    }
  }
}

document.addEventListener("change", function (e) {
  if (e.target && e.target.id === "iCartShippingMode") {
    setShippingMode(e.target.value);
    renderConfigurations();
    refreshTotal();
  }
});

function removeAccessory(id) {
  savedData[id].quantity = 0;
  savedData[id].totalPrice = 0;
  localStorage.setItem("accessories", JSON.stringify(savedData));
  renderAccessories();
  refreshTotal();
}

function updateAccessoryQuantity(id, newQty) {
  if (newQty < 1) { removeAccessory(id); return; }
  savedData[id].quantity = newQty;
  savedData[id].totalPrice = calculateAccessoryTotalPrice(savedData[id]);
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

function updateConfigQuantity(index, newQty) {
  var configs = JSON.parse(localStorage.getItem("configurations")) || [];
  if (newQty < 1) { removeConfiguration(index); return; }
  configs[index].quantity = newQty;
  localStorage.setItem("configurations", JSON.stringify(configs));
  renderConfigurations();
  refreshTotal();
}

const accessoryThumbs = {
  "1": "images/accessoires/Befestigung1.png",
  "2": "images/accessoires/Befestigung2.png",
  "3": "images/accessoires/Filzfuesse_v2.png",
  "4": "images/accessoires/Kleiderbuegel_v3.png",
  "5": "images/accessoires/Kleiderhaken v2.png",
  "6": "images/accessoires/sockel v2.png"
};

function renderAccessories() {
  outExtra1.innerHTML = "";
  Object.keys(savedData).forEach((id) => {
    if (savedData[id].quantity > 0) {
      // Alten Namen "Tischfuss" auf "Filzfüße" migrieren
      if (savedData[id].name === "Tischfuss") {
        savedData[id].name = "Filzfüße";
        localStorage.setItem("accessories", JSON.stringify(savedData));
      }
      var row = document.createElement("div");
      row.classList.add("cCartItem");
      var pricePerItem = accessoryPrices[savedData[id].name]?.[savedData[id].dimension] || 0;
      var thumbSrc = accessoryThumbs[id] || "";
      var thumbHTML = thumbSrc
        ? '<img src="' + thumbSrc + '" class="cCartThumb" alt="' + savedData[id].name + '">'
        : "";
      row.innerHTML =
        thumbHTML +
        '<div class="cCartDetails">' +
          '<b>' + savedData[id].name + ' (' + savedData[id].dimension + 'mm)</b><br>' +
          '<span class="cCartPriceLine">Stückpreis: ' + pricePerItem.toFixed(2) + ' €</span><br>' +
          '<span class="cCartPriceLine">Gesamt: ' + parseFloat(savedData[id].totalPrice).toFixed(2) + ' €</span>' +
        '</div>' +
        '<div class="cCartQty">' +
          '<button class="cQtyBtn" data-acc-id="' + id + '" data-dir="-1">−</button>' +
          '<span class="cQtyVal">' + savedData[id].quantity + '</span>' +
          '<button class="cQtyBtn" data-acc-id="' + id + '" data-dir="1">+</button>' +
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
  outExtra1.querySelectorAll(".cQtyBtn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var id = btn.dataset.accId;
      var dir = parseInt(btn.dataset.dir);
      updateAccessoryQuantity(id, savedData[id].quantity + dir);
    });
  });
}

const initializeDOM = () => {
  actAccessoires();
  renderAccessories();
  refreshTotal();
};

function openConfigurationInCreator(index) {
  var configs = JSON.parse(localStorage.getItem("configurations")) || [];
  var config = configs[index];
  if (!config) return;

  var state = config.creatorState;
  if (!state) {
    alert("Dieses Möbelstück wurde vor der Bearbeiten-Funktion gespeichert und kann nicht erneut geladen werden. Bitte neu konfigurieren.");
    return;
  }

  localStorage.setItem("buttonStates", JSON.stringify(state.buttonStates || {}));
  localStorage.setItem("iWidth", state.iWidth);
  localStorage.setItem("iHight", state.iHight);
  localStorage.setItem("iDeepth", state.iDeepth);
  localStorage.setItem("iMaterial", state.iMaterial);
  localStorage.setItem("iMiddleH", state.iMiddleH);
  localStorage.setItem("iMiddleV", state.iMiddleV);
  localStorage.setItem("iOversetLeRi", state.iOversetLeRi);
  localStorage.setItem("iOversetFoBa", state.iOversetFoBa);
  localStorage.setItem("iAddBoard", state.iAddBoard ? "true" : "false");
  localStorage.setItem("iAddBoardMiddle", state.iAddBoardMiddle ? "true" : "false");
  localStorage.setItem("middleLevelVisible", state.middleLevelVisible ? "true" : "false");
  if (Array.isArray(state.shelfLevels)) {
    localStorage.setItem("shelfLevels", JSON.stringify(state.shelfLevels));
  } else if (state.middleLevelVisible || state.iAddBoardMiddle) {
    localStorage.setItem("shelfLevels", JSON.stringify([{
      id: 1,
      height: parseFloat(state.iMiddleH) || 50,
      wood: !!state.iAddBoardMiddle
    }]));
  } else {
    localStorage.setItem("shelfLevels", "[]");
  }
  localStorage.setItem("editingConfigIndex", String(index));
  localStorage.setItem("creatorUnlocked", "true");

  window.location.href = "Creator.html";
}

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
      ? '<img src="' + config.thumbnail + '" class="cCartThumb cCartOpenCreator" data-config-idx="' + index + '" alt="Möbelstück ' + (index + 1) + '" title="Im Creator öffnen">'
      : '';

    var qty = config.quantity || 1;
    var itemTotal = (parseFloat(config.total) * qty).toFixed(2);
    var shipCost = getEffectiveShippingCost(config);
    var shipLabel = isPickupSelected()
      ? (isForcedPickup() ? "Nur Abholung" : "Abholung")
      : (shipCost + " €");
    item.innerHTML =
      thumbHTML +
      '<div class="cCartDetails cCartOpenCreator" data-config-idx="' + index + '" title="Im Creator öffnen">' +
        '<b>Möbelstück ' + (index + 1) + ':</b><br>' +
        'B/T/H: ' + config.width + ', ' + config.deepth + ', ' + config.hight + '<br>' +
        'Einzelpreis: ' + parseFloat(config.total).toFixed(2) + ' €<br>' +
        'Gesamt: ' + itemTotal + ' €<br>' +
        'Versand: ' + shipLabel +
      '</div>' +
      '<div class="cCartQty">' +
        '<button class="cQtyBtn" data-config-idx="' + index + '" data-dir="-1">−</button>' +
        '<span class="cQtyVal">' + qty + '</span>' +
        '<button class="cQtyBtn" data-config-idx="' + index + '" data-dir="1">+</button>' +
      '</div>' +
      '<button class="cRemoveBtn" data-config-idx="' + index + '">✕</button>';

    container.appendChild(item);
  });

  container.querySelectorAll(".cRemoveBtn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      removeConfiguration(parseInt(btn.dataset.configIdx));
    });
  });
  container.querySelectorAll(".cQtyBtn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var idx = parseInt(btn.dataset.configIdx);
      var dir = parseInt(btn.dataset.dir);
      var configs = JSON.parse(localStorage.getItem("configurations")) || [];
      var currentQty = configs[idx].quantity || 1;
      updateConfigQuantity(idx, currentQty + dir);
    });
  });
  container.querySelectorAll(".cCartOpenCreator").forEach(function(el) {
    el.addEventListener("click", function() {
      openConfigurationInCreator(parseInt(el.dataset.configIdx, 10));
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
    Lieferung: ${isPickupSelected() ? (isForcedPickup() ? "Nur Abholung" : "Abholung") : "Versand möglich"}
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
