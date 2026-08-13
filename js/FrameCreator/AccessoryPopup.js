// Zubehör-Empfehlung
// Die Frage stand frueher im Produkt-Popup (ProduktExamples.html).
// Sie wird jetzt erst hier gestellt, nachdem der Rahmen im Warenkorb gelandet ist.
// Das vorgemerkte Zubehör kommt aus localStorage("pendingAccessories"),
// gesetzt beim Klick auf "Zum Creator" in popupExamples.js.

const accOverlay = document.getElementById("popupOverlayAcc");
const accList = document.getElementById("outAccList");
const accYes = document.getElementById("iAccYes");
const accNo = document.getElementById("iAccNo");
const accClose = document.getElementById("iCloseAccPopup");

function getPendingAccessories() {
  const raw = localStorage.getItem("pendingAccessories");
  if (!raw) return null;

  try {
    const items = JSON.parse(raw);
    return Array.isArray(items) && items.length > 0 ? items : null;
  } catch (e) {
    console.warn("pendingAccessories konnte nicht gelesen werden:", e);
    return null;
  }
}

// Zubehör in den Warenkorb uebernehmen (frueher updateAccessoryBasedOnCondition)
function applyAccessory(item) {
  const taccessoriesRaw = localStorage.getItem("accessories");
  const taccessories = taccessoriesRaw ? JSON.parse(taccessoriesRaw) : {};

  const unitPrice = (window.accessoryPrices && window.accessoryPrices[item.name])
    ? (window.accessoryPrices[item.name][item.dimension] || 0)
    : 0;

  const accessory = taccessories[item.id] || {
    name: item.name,
    quantity: 0,
    dimension: item.dimension,
    totalPrice: 0
  };

  accessory.name = item.name;
  accessory.dimension = item.dimension;
  accessory.quantity += item.count;
  accessory.totalPrice = unitPrice * accessory.quantity;

  taccessories[item.id] = accessory;
  localStorage.setItem("accessories", JSON.stringify(taccessories));
}

function formatAccessoryLine(item) {
  const unitPrice = (window.accessoryPrices && window.accessoryPrices[item.name])
    ? (window.accessoryPrices[item.name][item.dimension] || 0)
    : 0;
  const lineTotal = unitPrice * (item.count || 0);
  return item.label + " – " + lineTotal + " €";
}

// Wird von InputFC.js aufgerufen, sobald der Rahmen gespeichert wurde
function showAccessoryRecommendation() {
  const items = getPendingAccessories();
  if (!items) return; // kein Produktbeispiel gewaehlt -> keine Empfehlung

  accList.innerHTML = "";
  items.forEach(item => {
    const line = document.createElement("h3");
    line.textContent = formatAccessoryLine(item);
    accList.appendChild(line);
  });

  accOverlay.style.display = "block";
}

function closeAccessoryPopup() {
  accOverlay.style.display = "none";
  localStorage.removeItem("pendingAccessories");
  window.location.href = "Warenkorb.html";
}

accYes.addEventListener("click", () => {
  const items = getPendingAccessories();
  if (items) {
    items.forEach(item => applyAccessory(item));
  }
  closeAccessoryPopup();
});

accNo.addEventListener("click", closeAccessoryPopup);
accClose.addEventListener("click", closeAccessoryPopup);
