
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

// DOM-Inhalte initialisieren    
const initializeDOM = () => {
  actAccessoires(); // Totalpreis jedes einzelnen Accessoires berechnen

  Object.keys(savedData).forEach((id) => { 
    if (savedData[id].quantity > 0) {
      outExtra1.innerHTML += savedData[id].quantity + " x "  + savedData[id].name + " " + savedData[id].dimension + "mm" + " Total " + savedData[id].totalPrice + "€" + "<br>";
    }
  });

  // Gesamtsumme berechnen und anzeigen
  if (OutTotal) {
    OutTotal.textContent = calculateTotal().toFixed(2) + " €";
  }
};

// Konfigurationen anzeigen
const displayConfigurations = () => {
  const storedConfigurations = JSON.parse(localStorage.getItem("configurations")) || [];
  if (storedConfigurations.length > 0) {
    const container = document.createElement("div");
    container.classList.add("configurations-container");

    storedConfigurations.forEach((config, index) => {
      const item = document.createElement("div");
      item.classList.add("cCartItem");

      const thumbHTML = config.thumbnail
        ? `<img src="${config.thumbnail}" class="cCartThumb" alt="Möbelstück ${index + 1}">`
        : '';

      item.innerHTML = `
        ${thumbHTML}
        <div class="cCartDetails">
          <b>Möbelstück ${index + 1}:</b><br>
          B/T/H: ${config.width}, ${config.deepth}, ${config.hight}<br>
          Preis: ${parseFloat(config.total).toFixed(2)} &euro;<br>
          Versand: ${config.versand} &euro;
        </div>
      `;
      container.appendChild(item);
    });

    const accessoriesSection = document.querySelector(".accessories");
    if (accessoriesSection) {
      accessoriesSection.insertAdjacentElement("afterend", container);
    }
  }
};

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
  displayConfigurations();
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
