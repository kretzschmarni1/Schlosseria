// Zubehörpreise zentral definieren
window.accessoryPrices = {
  "Tischbefestigung": { 15: 4, 20: 5, 25: 6, 30: 7 },
  "Decken/Wandbefestigung": { 15: 5, 20: 6, 25: 7, 30: 8 },
  "Filzfüße": { 15: 6, 20: 7, 25: 8, 30: 9 },
  "Kleiderbügel": { 40: 20 },
  "Kleiderhaken": { 40: 10 },
  "Sockel": { 40: 10 }
};

// Globale Konfigurationen und Variablen
const START_WERT_COUNT = 0;
const START_WERT_DIMENSION = 20;

// Zubehör-Daten global speichern
window.accessories = [
  { id: "1", name: "Tischbefestigung", quantityId: "iFix1", dropdownId: "myDropdown1", outputId: "iPrice1" },
  { id: "2", name: "Decken/Wandbefestigung", quantityId: "iFix2", dropdownId: "myDropdown2", outputId: "iPrice2" },
  { id: "3", name: "Filzfüße", quantityId: "iFix3", dropdownId: "myDropdown3", outputId: "iPrice3" },
  { id: "4", name: "Kleiderbügel", quantityId: "iFix4", dropdownId: "myDropdown4", outputId: "iPrice4" },
  { id: "5", name: "Kleiderhaken", quantityId: "iFix5", dropdownId: "myDropdown5", outputId: "iPrice5" },
  { id: "6", name: "Sockel", quantityId: "iFix6", dropdownId: "myDropdown6", outputId: "iPrice6" }
];
  