document.addEventListener("DOMContentLoaded", function() {
  loadFromLocalStorage(); // Local Storage prüfen und ggf. initialisieren

});

function loadFromLocalStorage() {    //Wenn accessories noch nicht vorhanden im localstorage hier erzeugen
  let savedData = JSON.parse(localStorage.getItem("accessories")) || {};

  // Falls noch keine Daten existieren, initialisieren
  if (Object.keys(savedData).length === 0) {
    console.log("Local Storage leer, initialisiere mit Standardwerten...");
    accessories.forEach((accessory) => {
      savedData[accessory.id] = { 
        name: accessory.name, 
        quantity: 0, 
        dimension: 20, 
        totalPrice: 0 
      };
    });
    localStorage.setItem("accessories", JSON.stringify(savedData));
  }

  // Daten ins UI laden
  accessories.forEach((accessory) => {
    if (savedData[accessory.id]) {
      document.getElementById(accessory.quantityId).value = savedData[accessory.id].quantity;
      document.getElementById(accessory.dropdownId).value = savedData[accessory.id].dimension;
      document.getElementById(accessory.outputId).textContent = `${savedData[accessory.id].totalPrice} €`;
    }
  });
}   

// Direkt-Mapping: Produkt-Button → Creator-Konfig-ID
const directButtons = [
  { showButtonId: 'iShowPopup1', configId: 'iToCreator1' },
  { showButtonId: 'iShowPopup2', configId: 'iToCreator2' },
  { showButtonId: 'iShowPopup3', configId: 'iToCreator3' },
  { showButtonId: 'iShowPopup4', configId: 'iToCreator4' },
];

const buttonStates = {};
let width;
let hight;
let deepth;
let material;
let middleH;
let middleV;
let perspective;

//Konfiguration Produktbeispiele  //siehe funktion productexamples
const productConfigurations = [
  { ids: ["iToCreator1"], parameters: [120, 110, 50, 50, 50, 20, 20, 1, 1 , 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, "true"]},
  { ids: ["iToCreator2"], parameters: [80, 180, 90, 40, 90, 30, 30, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 , 0, 10, 5, "true"] },
  { ids: ["iToCreator3"], parameters: [200,50, 150,100,25,25,25,     1, 1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,"false"] },
  { ids: ["iToCreator4"], parameters: [40,30,120,20,15,60,20,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,0,1,5,5,"false"] }
];

//Accesoires-Empfehlung je Produkt
//Wird nicht mehr hier abgefragt, sondern im Creator nach "Zum Warenkorb hinzufügen"
//label = Anzeigetext im Popup, id/count/dimension = was ins localStorage geschrieben wird
const productAccessories = {
  //Produkte 1
  iToCreator1: [
    { id: "1", name: "Tischbefestigung", label: "4 x Tischbefestigung", count: 4, dimension: 20 },
    { id: "3", name: "Filzfüße", label: "4 x Filzfüße", count: 4, dimension: 20 }
  ],
  //Produkte 2
  iToCreator2: [
    { id: "1", name: "Tischbefestigung", label: "4 x Tischbefestigung", count: 4, dimension: 30 },
    { id: "3", name: "Filzfüße", label: "4 x Filzfüße", count: 4, dimension: 30 }
  ],
  //Produkte 3
  iToCreator3: [
    { id: "3", name: "Filzfüße", label: "4 x Filzfüße", count: 4, dimension: 30 },
    { id: "4", name: "Kleiderbügel", label: "4 x Kleiderbügel", count: 4, dimension: 40 },
    { id: "5", name: "Kleiderhaken", label: "4 x Kleiderhaken", count: 4, dimension: 40 }
  ],
  //Produkte 4
  iToCreator4: [
    { id: "1", name: "Tischbefestigung", label: "4 x Tischbefestigung", count: 4, dimension: 20 },
    { id: "3", name: "Filzfüße", label: "4 x Filzfüße", count: 4, dimension: 20 }
  ]
};

function getData(){
width = localStorage.getItem("iWidth");
hight = localStorage.getItem("iHight");
deepth = localStorage.getItem("iDeepth");
material = localStorage.getItem("iMaterial")
middleH = localStorage.getItem("iMiddleH");
middleV = localStorage.getItem("iMiddleV");
perspective = localStorage.getItem("iPerspective");

// Lade den gespeicherten Zustand aus localStorage und weise ihn direkt buttonStates zu
const savedStates = JSON.parse(localStorage.getItem("buttonStates")) || {}; 
Object.assign(buttonStates, savedStates);
}

function setData(){

  // Speichere das aktualisierte buttonStates-Objekt in localStorage
  localStorage.setItem("buttonStates", JSON.stringify(buttonStates));

//Inputwerte aktualisieren
localStorage.setItem("iWidth", width);
localStorage.setItem("iHight", hight);
localStorage.setItem("iDeepth", deepth);
localStorage.setItem("iMaterial", material);
localStorage.setItem("iMiddleH", middleH);
localStorage.setItem("iMiddleV", middleV);
localStorage.setItem("iPerspective", perspective);
localStorage.setItem("iOversetLeRi", oversetLiRe);
localStorage.setItem("iOversetFoBa", oversetFoBa);
}

// Produktbeispiele bzw konfiguration vorbestimmen
function PreConfigDesign(tHight, tWidth, tDeepth, tmiddleH, tmiddleV, tPerspective, tMaterial ,tFrontTop, tFrontBottom , tLeftTop, tRightTop, tTopMiddle, tBackTop, tBackBottom, tFrontRight, tBackRight, tFrontLeft, tBackLeft, tRightBottom, tLeftBottom, tFrontMiddleCross, tFrontMiddleLength, tBackMiddleCross, tBackMiddleLength, tRightMiddleCross, tLeftMiddleCross, tOversetLiRe, tOversetFoBa, tAddBoard ) {
  // Strebenzustände komplett neu setzen (keine Reste aus dem Creator)
  Object.keys(buttonStates).forEach(function (key) {
    delete buttonStates[key];
  });

  buttonStates["iFrontTop"] = tFrontTop;
  buttonStates["iFrontBottom"] = tFrontBottom;
  buttonStates["iLeftTop"] = tLeftTop;
  buttonStates["iRightTop"] = tRightTop;
  buttonStates["iTopMiddle"] = tTopMiddle;
  buttonStates["iBackTop"] = tBackTop;
  buttonStates["iBackBottom"] = tBackBottom;
  buttonStates["iFrontRight"] = tFrontRight;
  buttonStates["iBackRight"] = tBackRight;
  buttonStates["iFrontLeft"] = tFrontLeft;
  buttonStates["iBackLeft"] = tBackLeft; 
  buttonStates["iRightBottom"] = tRightBottom;
  buttonStates["iLeftBottom"] = tLeftBottom;
  buttonStates["iFrontMiddleCross"] = tFrontMiddleCross;
  buttonStates["iFrontMiddleLenght"] = tFrontMiddleLength;
  buttonStates["iBackMiddleCross"] = tBackMiddleCross;
  buttonStates["iBackMiddleLenght"] = tBackMiddleLength;
  buttonStates["iRightMiddleCross"] = tRightMiddleCross;
  buttonStates["iLeftMiddleCross"] = tLeftMiddleCross;

  // Dimensionen setzen
  hight = tHight;
  width = tWidth;
  deepth = tDeepth;
  middleH = tmiddleH;
  middleV = tmiddleV;
  perspective= tPerspective;
  material = tMaterial;
  materialScaled = (Math.ceil(tMaterial / 5) * 5) / 10; // in cm und in 5 Schritten wandeln;
  
  oversetLiRe = tOversetLiRe;
  oversetFoBa = tOversetFoBa;
  addedBoard = tAddBoard;

setData();
localStorage.setItem("iAddBoard", addedBoard ? "true" : "false");
syncProductShelfLevels();
}

// Gespeicherte Werte laden
window.onload = function () {
  getData();
};

// Extra-Ebenen aus Produkt-Mittelstreben für den neuen Creator ableiten
function syncProductShelfLevels() {
  var midKeys = [
    "iFrontMiddleCross", "iBackMiddleCross",
    "iLeftMiddleCross", "iRightMiddleCross", "iMiddleMiddle"
  ];
  var hasMid = midKeys.some(function (k) { return !!buttonStates[k]; });

  if (!hasMid) {
    localStorage.setItem("shelfLevels", "[]");
    localStorage.setItem("middleLevelVisible", "false");
    localStorage.setItem("iAddBoardMiddle", "false");
    return;
  }

  var height = parseFloat(middleH) || 50;
  localStorage.setItem("shelfLevels", JSON.stringify([{
    id: 1,
    height: height,
    wood: false
  }]));
  localStorage.setItem("middleLevelVisible", "true");
  localStorage.setItem("iAddBoardMiddle", "false");

  var map = {
    iFrontMiddleCross: "iLvl1Front",
    iBackMiddleCross: "iLvl1Back",
    iLeftMiddleCross: "iLvl1Left",
    iRightMiddleCross: "iLvl1Right",
    iMiddleMiddle: "iLvl1Mid"
  };
  Object.keys(map).forEach(function (oldKey) {
    if (buttonStates[oldKey]) buttonStates[map[oldKey]] = true;
    delete buttonStates[oldKey];
  });
  localStorage.setItem("buttonStates", JSON.stringify(buttonStates));
}

function resetCreatorState() {
  Object.keys(buttonStates).forEach(function (key) {
    delete buttonStates[key];
  });

  localStorage.setItem("buttonStates", "{}");
  localStorage.setItem("shelfLevels", "[]");
  localStorage.setItem("iAddBoard", "false");
  localStorage.setItem("iAddBoardMiddle", "false");
  localStorage.setItem("middleLevelVisible", "false");
  localStorage.setItem("iWidth", "100");
  localStorage.setItem("iHight", "100");
  localStorage.setItem("iDeepth", "100");
  localStorage.setItem("iMaterial", "15");
  localStorage.setItem("iMiddleH", "50");
  localStorage.setItem("iMiddleV", "50");
  localStorage.setItem("iOversetLeRi", "0");
  localStorage.setItem("iOversetFoBa", "0");
  localStorage.removeItem("editingConfigIndex");
}

function navigateToCreator(configId) {
  resetCreatorState();
  localStorage.setItem("creatorUnlocked", "true");

  const config = productConfigurations.find(c => c.ids.includes(configId));
  if (config) {
    PreConfigDesign(...config.parameters);
  }

  const recommendation = productAccessories[configId];
  if (recommendation) {
    localStorage.setItem("pendingAccessories", JSON.stringify(recommendation));
  } else {
    localStorage.removeItem("pendingAccessories");
  }

  window.location.href = 'Creator.html';
}

function initializeDirectButtons() {
  directButtons.forEach(({ showButtonId, configId }) => {
    const btn = document.getElementById(showButtonId);
    if (btn) {
      btn.addEventListener("click", () => navigateToCreator(configId));
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeDirectButtons();
});