document.addEventListener("DOMContentLoaded", function() {

  // Preisberechnung
  function calculatePrice(quantity, dimension, accessoryName) {
    return (quantity * (accessoryPrices[accessoryName][dimension] || 0));
  }

  // Preis-Update Funktion
  function updatePriceDisplay(accessory) {
    const quantity = parseInt(document.getElementById(accessory.quantityId).value) || 0;
    const dimension = parseInt(document.getElementById(accessory.dropdownId).value) || 20;
    const totalPrice = calculatePrice(quantity, dimension, accessory.name);

    document.getElementById(accessory.outputId).textContent = `${totalPrice} €`;
    saveToLocalStorage(accessory.id, { name: accessory.name, quantity, dimension, totalPrice });
  }

  // Speicherung in Local Storage
  function saveToLocalStorage(accessoryId, data) {
    let savedData = JSON.parse(localStorage.getItem("accessories")) || {};
    savedData[accessoryId] = data;
    localStorage.setItem("accessories", JSON.stringify(savedData));
  }

  // Laden aus Local Storage
  function loadFromLocalStorage() {
    const savedData = JSON.parse(localStorage.getItem("accessories")) || {};
    accessories.forEach((accessory) => {
      if (savedData[accessory.id]) {
        document.getElementById(accessory.quantityId).value = savedData[accessory.id].quantity;
        document.getElementById(accessory.dropdownId).value = savedData[accessory.id].dimension;
        document.getElementById(accessory.outputId).textContent = `${savedData[accessory.id].totalPrice} €`;
      }
    });
  }

  // Event Listener für Add-Buttons
  accessories.forEach((accessory) => {
    document.getElementById(`iFixAdd${accessory.id}`)?.addEventListener("click", () => updatePriceDisplay(accessory));
  });

  // Daten aus Local Storage laden
  loadFromLocalStorage();
});
