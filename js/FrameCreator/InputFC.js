
//____________________VARIABLEN_______________________
let configurations = [];
let currentIndex = 0
let outputText = "";

// Das Output-Element auswählen --> für Popup
const outDim = document.getElementById("outDim");
const outTotalWare = document.getElementById("outTotalWare");
const outTotalWood = document.getElementById("outTotalWood");
const outDeliv = document.getElementById("outDeliv");
const outTotalDel = document.getElementById("outTotalDel");

//HooverButton
const buttonStates = {};

//Eingabe Maße
let width;
let hight;
let deepth;
let middleH;
let middleV;
let oversetLiRe;
let oversetFoBa;
let woodWidth;
let woodDeepth;
let material;

//Input Value
const widthInput = document.getElementById("iWidth");
const hightInput = document.getElementById("iHight");
const deepthInput = document.getElementById("iDeepth");
const MaterialInput = document.getElementById("iMaterial");
const MiddleInput = document.getElementById("iMiddleH");
const MiddleLengthInput = document.getElementById("iMiddleV");
const OversetLiReInput = document.getElementById("iOversetLeRi");
const OversetFoBaInput = document.getElementById("iOversetFoBa");

//InOutput (anzeige aktuelle Werte)
const materialOutput = document.getElementById("iMaterialOutput");
const hightOutput = document.getElementById("iHightOutput");
const widthOutput = document.getElementById("iWidthOutput");
const deepthOutput = document.getElementById("iDeepthOutput");
const middleVOutput = document.getElementById("iMiddleVOutput");
const middleHOutput = document.getElementById("iMiddleHOutput");
const OversetLeRiOutput = document.getElementById("iOversetLeRiOutput");
const OversetFoBaOutput = document.getElementById("iOversetFoBaOutput");

const add = document.getElementById("iAdd");

//Show
let takenWidth;
let takenHight;
let takenDeepth;

//Preis
let Total = 0;
let TotalFrame = 0;
let TotalWood = 0;

//KONSTANTEN
const PricePerMeter = 15; //Preis pro Meter bei einem 20mm Quadratrohr
const PricePerPeace = 20; //Für ABschnitt zusammenschweißen usw.
const PriceDelivery = 35; // Versand etc.
const PriceWood = 150; //Price pro Quadratmeter

//______________________TEST_________________________

//Eingabe Slider --> führt Input aus
MaterialInput.addEventListener("input", getData);
hightInput.addEventListener("input", getData);
widthInput.addEventListener("input", getData);
deepthInput.addEventListener("input", getData);
MiddleInput.addEventListener("input", getData);
MiddleLengthInput.addEventListener("input", getData);
OversetLiReInput.addEventListener("input", getData);
OversetFoBaInput.addEventListener("input", getData);

//Werte übernehmen und limitieren
function updateInput(id, input, min, max) {
  let value = parseInt(input.value);
  value = Math.max(min, Math.min(value, max)); // Begrenze auf min/max
  localStorage.setItem(id, value);
  return value;
  };
  
//Werte von Inputfeld übernehmen Limitieren und in localStorage  speichern
function getData() {
  oversetLiRe =updateInput("iOversetLeRi",OversetLiReInput, 0, 50);
  oversetFoBa =updateInput("iOversetFoBa",OversetFoBaInput, 0, 50);
  
width = updateInput("iWidth", widthInput, 5, 200);
hight = updateInput("iHight", hightInput, 5, 200);
deepth =  updateInput("iDeepth", deepthInput, 5, 200);
let limitMiddleH = hight; 
let limitMiddleV = width;
middleH = updateInput("iMiddleH",MiddleInput, 5, limitMiddleH - 5);
middleV = updateInput("iMiddleV",MiddleLengthInput, 5, limitMiddleV - 5);
material = updateInput("iMaterial", MaterialInput, 15, 50);

ActInput();  

}

function setData(){
  //Inputwerte aktualisieren
  widthInput.value = localStorage.getItem("iWidth") ?? 150;
  localStorage.setItem("iWidth", width);
  
  hightInput.value = localStorage.getItem("iHight") ?? 100;
  localStorage.setItem("iHight", hight);
  
  deepthInput.value = localStorage.getItem("iDeepth") ?? 100;
  localStorage.setItem("iDeepth", deepth);
  
  MaterialInput.value = localStorage.getItem("iMaterial") ?? 30;
  localStorage.setItem("iMaterial", material);
  
  MiddleInput.value = localStorage.getItem("iMiddleH") ?? 80;
  localStorage.setItem("iMiddleH", middleH);
  
  MiddleLengthInput.value = localStorage.getItem("iMiddleV") ?? 65;
  localStorage.setItem("iMiddleV", middleV);
  
  OversetLiReInput.value= localStorage.getItem("iOversetLeRi") ?? 0;
  localStorage.setItem("iOversetLeRi", oversetLiRe);

  OversetFoBaInput.value= localStorage.getItem("iOversetFoBa") ?? 0;
  localStorage.setItem("iOversetFoBa", oversetFoBa);
  }

function getButtons(){
   
    // Lade den gespeicherten Zustand aus localStorage und weise ihn direkt buttonStates zu
      const savedStates = JSON.parse(localStorage.getItem("buttonStates")) || {}; // Hole die gespeicherten Daten oder setze auf {} als Fallback
    // Kopiere die gespeicherten Zustände in das bereits vorhandene buttonStates-Objekt
      Object.assign(buttonStates, savedStates);
    } 

function setButtons(){
  // Speichere das aktualisierte buttonStates-Objekt in localStorage
    localStorage.setItem("buttonStates", JSON.stringify(buttonStates));

}

//Ein/Ausgabe aktualisieren
function ActInput(){ //Ein-Ausgänge aktualisieren

  width =  localStorage.getItem("iWidth") || 100;
  hight =  localStorage.getItem("iHight") || 100;
  deepth =  localStorage.getItem("iDeepth") || 100;
  material =  localStorage.getItem("iMaterial") || 30;
  middleV =  localStorage.getItem("iMiddleV") || 50;
  middleH =  localStorage.getItem("iMiddleH") || 50;
  oversetLiRe =  localStorage.getItem("iOversetLeRi") || 0;
  oversetFoBa =  localStorage.getItem("iOversetFoBa") || 0;

  widthInput.value = width;
  hightInput.value = hight;
  deepthInput.value = deepth;
  MaterialInput.value = material;
  MiddleLengthInput.value = middleV;
  MiddleInput.value = middleH;
  OversetLiReInput.value = oversetLiRe;
  OversetFoBaInput.value = oversetFoBa;

  materialOutput.value = material; 
  hightOutput.value = hight;
  widthOutput.value = width;
  deepthOutput.value = deepth;
  middleVOutput.value = middleV;
  middleHOutput.value = middleH;
  OversetLeRiOutput.value = oversetLiRe;
  OversetFoBaOutput.value = oversetFoBa;

}

// Funktion zur Berechnung der Gesamtwerte
function calculateTotal(dimension, keys) {
  const tbuttonStates = JSON.parse(localStorage.getItem("buttonStates")) || {};
  let total = 0;
  for (const key of keys || []) {
    if (tbuttonStates[key]) {
      total += parseInt(dimension, 10);
    }
  }
  return parseInt(total, 10); // garantiert Ganzzahl
}

//Rückgabewert gleich 0 wenn die entsprechenden streben nicht angewählt sind
function setValueToZero(ButtonList, dimension) {
  let tButtonStates = JSON.parse(localStorage.getItem("buttonStates")) || {};
  for (let button of ButtonList) {
    if (tButtonStates[button]) {
      return dimension; // Gibt den Wert von dimension zurück, wenn ein Taster gedrückt ist
    }
  }
  return 0; // Gibt 0 zurück, wenn keiner der Taster gedrückt ist
}

//______________________AUSFÜHREN_____________________
//Seite neu laden
window.onload = function() {
  getButtons();
  setData();
  getData();
  };

//____________________________POPUP_FENSTER______________________________________

const PopUp = document.getElementById('iShowPopup');
let fulllength; 
let delivery;
let countEdge;
let element; 

PopUp.addEventListener('click', () => {
 takenWidth = setValueToZero(["iFrontTop", "iFrontBottom", "iFrontMiddleCross", "iBackTop", "iBackBottom", "iBackMiddleCross"], width);
 takenHight = setValueToZero(["iFrontLeft", "iFrontRight", "iFrontMiddleLength", "iBackLeft", "iBackRight", "iBackMiddleLength"], hight);
 takenDeepth = setValueToZero(["iLeftBottom", "iLeftTop", "iLeftMiddleCross", "iRightBottom", "iRightTop", "iRightMiddleCross", "iTopMiddle", "iBottomMiddle", "iMiddleMiddle"], deepth);

 //Lieferung 
if (takenDeepth > 150 || takenWidth > 150 || takenHight > 150 ) {
  delivery = "Nur Abholung";
} else {
  delivery = "Versand möglich";
};

//Preis berechnen

//Anzahl der Schwisspunkte = Anzahl wie viele Streben
function countTrueValues(obj) {
  return Object.values(obj).filter(value => value === true).length;
}

const trueCount = countTrueValues(JSON.parse(localStorage.getItem("buttonStates")) || {});


// Berechnung der Gesamtwerte für Länge, Höhe und Tiefe
let FullWidth = calculateTotal(takenWidth, ["iFrontTop", "iFrontBottom", "iFrontMiddleCross", "iBackTop", "iBackBottom", "iBackMiddleCross"]);
let FullHeight = calculateTotal(takenHight, ["iFrontLeft", "iFrontRight", "iFrontMiddleLength", "iBackLeft", "iBackRight", "iBackMiddleLength"]);
let FullDepth = calculateTotal(takenDeepth, ["iLeftBottom", "iLeftTop", "iLeftMiddleCross", "iRightBottom", "iRightTop", "iRightMiddleCross", "iTopMiddle", "iBottomMiddle", "iMiddleMiddle"]);
let Fulllength = ((FullWidth) + (FullHeight) + (FullDepth)/100) * (material/20); //Für 20mm Quadratrohr kalkuliert
if (Fulllength > 0) { PricePauschal = PriceDelivery;} else {PricePauschal = 0;};

TotalFrame = Math.round(Fulllength/100 * PricePerMeter + trueCount * PricePerPeace);

 console.log(Fulllength/100 * PricePerMeter);
 console.log(trueCount * PricePerPeace);

//Berechnung Holzplatte
if (addedBoard) {
  woodWidth = (parseInt(width) + parseInt(oversetLiRe*2));
  woodDeepth = (parseInt(deepth) + parseInt(oversetFoBa*2));
  TotalWood = (woodWidth * woodDeepth) / 10000 * PriceWood;
} else {
  TotalWood = 0;
}

TotalWood = Math.round(TotalWood);

Total = TotalWood + TotalFrame;

//_________________AUSGABEWERTE____________________
// Den Wert der Variable in das Output-Element einfügen
outDim.textContent = takenWidth + "X" + takenDeepth + "X" + takenHight ;
outTotalWare.textContent = TotalFrame + "€" ;
outTotalWood.textContent = TotalWood + "€"
outDeliv.textContent = delivery ;
outTotalDel.textContent = PricePauschal + "€";

// Live-Preisanzeige aktualisieren
var lf = document.getElementById("liveFrame");
var lw = document.getElementById("liveWood");
var ls = document.getElementById("liveShipping");
var ld = document.getElementById("liveDelivery");
if (lf) lf.textContent = TotalFrame;
if (lw) lw.textContent = TotalWood;
if (ls) ls.textContent = PricePauschal;
if (ld) ld.textContent = delivery;
});
for (const id in buttonStates) {
  if (buttonStates.hasOwnProperty(id)) {
    const status = buttonStates[id];
  }
};

//_________________________________FORMULAR_SENDEN____________________________________
//save Object
add.addEventListener('click', () => {
  for (const id in buttonStates) {
    if (buttonStates.hasOwnProperty(id)) {
      const status = buttonStates[id];
      outputText += ` ID: ${id}, vorhanden: ${status}`;
    }
  };

  // Thumbnail vom 3D-Canvas erstellen (verkleinert fuer localStorage)
  // Hilfslinien temporaer ausblenden
  const savedOpacities = [];
  if (typeof cubeGroup !== "undefined") {
    cubeGroup.children.forEach((line, i) => {
      savedOpacities[i] = line.material.opacity;
      if (!line.isActive) line.material.opacity = 0;
    });
  }
  renderer.render(scene, camera);
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 200;
  thumbCanvas.height = 200;
  const thumbCtx = thumbCanvas.getContext("2d");
  thumbCtx.drawImage(renderer.domElement, 0, 0, 200, 200);
  const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.7);
  // Hilfslinien wiederherstellen
  if (typeof cubeGroup !== "undefined") {
    cubeGroup.children.forEach((line, i) => {
      line.material.opacity = savedOpacities[i];
    });
    renderer.render(scene, camera);
  }

  const currentConfig = {
      Streben: outputText,
      dicke: material,
      width: takenWidth,
      deepth: takenDeepth,
      hight: takenHight,
      totalWood: TotalWood,
      totalFrame: TotalFrame,
      total: Total,
      versand: PricePauschal,
      widthWood: woodWidth,
      deepthWood: woodDeepth,
      thumbnail: thumbnail
      };

if (takenWidth > 0 || takenDeepth > 0 || takenHight > 0) {
  
  // Save  current configuration to the array
  configurations[currentIndex] = currentConfig;

  // Increment the index for the next configuration
  currentIndex++;

localStorage.setItem('configurations', JSON.stringify(configurations));

  // Nach empfohlenem Zubehör fragen, sonst direkt zum Warenkorb
  if (typeof showAccessoryRecommendation === "function" && localStorage.getItem("pendingAccessories")) {
    showAccessoryRecommendation();
  } else {
    window.location.href = "Warenkorb.html";
  }

} else {
  alert("Bitte wählen sie eine Strebe aus!");  
}
});
//_________________________________________________________________________________---

// Beim Laden der Seite --> Konfigurationen wiederherstellen
window.addEventListener('load', () => {
  // Laden der gespeicherten Konfigurationen aus dem Local Storage
  const storedConfigurations = localStorage.getItem('configurations');
  ActInput();

  // Überprüfen, ob gespeicherte Konfigurationen vorhanden sind
  if (storedConfigurations) {
    configurations = JSON.parse(storedConfigurations);
    currentIndex = configurations.length; // Setzen Sie den Index auf die nächste verfügbare Position
  }

});
























