// Zubehör-Empfehlung
// Die Frage stand frueher im Produkt-Popup (ProduktExamples.html).
// Sie wird jetzt erst hier gestellt, nachdem der Rahmen im Warenkorb gelandet ist.
// Das vorgemerkte Zubehör kommt aus localStorage("pendingAccessories"),
// gesetzt beim Klick auf "Zum Creator" in popupExamples.js.
// Holzplatten-Anzahl skaliert die Tischbefestigungen (4 pro Ebene).

const accOverlay = document.getElementById("popupOverlayAcc");
const accList = document.getElementById("outAccList");
const accYes = document.getElementById("iAccYes");
const accNo = document.getElementById("iAccNo");
const accClose = document.getElementById("iCloseAccPopup");

const FASTENERS_PER_WOOD_BOARD = 4;

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

function getWoodBoardCountForAccessories() {
  if (typeof countWoodBoards === "function") return countWoodBoards();
  var n = localStorage.getItem("iAddBoard") === "true" ? 1 : 0;
  try {
    var levels = JSON.parse(localStorage.getItem("shelfLevels") || "[]");
    if (Array.isArray(levels)) {
      levels.forEach(function (l) { if (l && l.wood) n++; });
    }
  } catch (e) {}
  if (n === 0 && localStorage.getItem("iAddBoardMiddle") === "true") n = 1;
  return n;
}

function nearestAccessoryDimension(materialMm) {
  var mat = parseInt(materialMm, 10) || 20;
  var options = [15, 20, 25, 30];
  var best = options[0];
  var bestDiff = Math.abs(mat - best);
  options.forEach(function (opt) {
    var diff = Math.abs(mat - opt);
    if (diff < bestDiff) {
      best = opt;
      bestDiff = diff;
    }
  });
  return best;
}

// Pending-Zubehör an aktuelle Holzplatten-Anzahl anpassen
function syncAccessoriesWithWoodBoards(items) {
  var list = Array.isArray(items) ? items.slice() : [];
  var boardCount = getWoodBoardCountForAccessories();
  var dim = nearestAccessoryDimension(localStorage.getItem("iMaterial"));

  // Bestehende Tischbefestigungen entfernen und neu setzen
  list = list.filter(function (item) {
    return item && item.name !== "Tischbefestigung";
  });

  if (boardCount > 0) {
    var count = FASTENERS_PER_WOOD_BOARD * boardCount;
    list.unshift({
      id: "1",
      name: "Tischbefestigung",
      label: count + " x Tischbefestigung (" + boardCount + " Holzplatte" + (boardCount > 1 ? "n" : "") + ")",
      count: count,
      dimension: dim
    });
  }

  return list;
}

// Zubehör in den Warenkorb uebernehmen
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
  var pending = getPendingAccessories() || [];
  var items = syncAccessoriesWithWoodBoards(pending);

  if (!items.length) {
    localStorage.removeItem("pendingAccessories");
    window.location.href = "Warenkorb.html";
    return;
  }

  localStorage.setItem("pendingAccessories", JSON.stringify(items));

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
