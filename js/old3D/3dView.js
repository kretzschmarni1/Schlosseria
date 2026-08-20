//Werte aus LocalStorage holen oder Standardwerte setzen
let tWidth = parseFloat(localStorage.getItem("iWidth")) || 100;
let tLength = parseFloat(localStorage.getItem("iDeepth")) || 100;
let tHeight = parseFloat(localStorage.getItem("iHight")) || 100;
let tMiddleH = parseFloat(localStorage.getItem("iMiddleH")) || 50;
let tMiddleV = parseFloat(localStorage.getItem("iMiddleV")) || 50;
let thick = parseFloat(localStorage.getItem("iMaterial")) || 15;
let tButtonStates = JSON.parse(localStorage.getItem("buttonStates")) || {};
let tOversetLeRi  = parseFloat(localStorage.getItem("iOversetLeRi")) || 0;
let tOversetFoBa  = parseFloat(localStorage.getItem("iOversetFoBa")) || 0;
let lineNo = {};


//Funktion zum Speichern in LocalStorage
function saveButtonStates() { localStorage.setItem("buttonStates", JSON.stringify(tButtonStates));}

//Linien-Dicke
let Thickness = thick / 10;

// Variablen für Linien-Schlüssel (dynamisch inkl. Extra-Ebenen)
const BASE_LINE_KEYS = [
    "iBackBottom", "iBackRight", "iBackTop", "iBackLeft",
    "iLeftBottom", "iRightBottom", "iRightTop", "iLeftTop",
    "iFrontBottom", "iFrontRight", "iFrontTop", "iFrontLeft"
];
const VERTICAL_MIDDLE_KEYS = [
    "iTopMiddle", "iFrontMiddleLenght", "iBackMiddleLenght", "iBottomMiddle"
];
let lineKeys = BASE_LINE_KEYS.slice();
let coordinates = {};

function levelStrutKeys(id) {
  return {
    back: "iLvl" + id + "Back",
    front: "iLvl" + id + "Front",
    left: "iLvl" + id + "Left",
    right: "iLvl" + id + "Right",
    mid: "iLvl" + id + "Mid"
  };
}

function loadShelfLevels() {
  try {
    var parsed = JSON.parse(localStorage.getItem("shelfLevels") || "null");
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}

  var legacyVisible = localStorage.getItem("middleLevelVisible") === "true";
  var legacyWood = localStorage.getItem("iAddBoardMiddle") === "true";
  var legacyKeys = [
    "iFrontMiddleCross", "iBackMiddleCross",
    "iLeftMiddleCross", "iRightMiddleCross", "iMiddleMiddle"
  ];
  var hasLegacyStruts = legacyKeys.some(function (k) { return !!tButtonStates[k]; });
  if (legacyVisible || legacyWood || hasLegacyStruts) {
    var lvl = {
      id: 1,
      height: parseFloat(localStorage.getItem("iMiddleH")) || 50,
      wood: legacyWood
    };
    var map = {
      iFrontMiddleCross: "iLvl1Front",
      iBackMiddleCross: "iLvl1Back",
      iLeftMiddleCross: "iLvl1Left",
      iRightMiddleCross: "iLvl1Right",
      iMiddleMiddle: "iLvl1Mid"
    };
    Object.keys(map).forEach(function (oldKey) {
      if (tButtonStates[oldKey]) tButtonStates[map[oldKey]] = true;
      delete tButtonStates[oldKey];
    });
    localStorage.setItem("shelfLevels", JSON.stringify([lvl]));
    localStorage.setItem("buttonStates", JSON.stringify(tButtonStates));
    return [lvl];
  }
  return [];
}

var shelfLevels = loadShelfLevels();
var boards = {
  top: localStorage.getItem("iAddBoard") === "true",
  bottom: localStorage.getItem("iAddBoardBottom") === "true"
};
var addedBoard = boards.top;

function rebuildFrameDefinition() {
  lineKeys = BASE_LINE_KEYS.slice();
  coordinates = {
    0:  [0, 0, 0, tWidth, 0, 0],
    1:  [tWidth, 0, 0, tWidth, tHeight, 0],
    2:  [tWidth, tHeight, 0, 0, tHeight, 0],
    3:  [0, tHeight, 0, 0, 0, 0],
    4:  [0, 0, 0, 0, 0, tLength],
    5:  [tWidth, 0, 0, tWidth, 0, tLength],
    6:  [tWidth, tHeight, 0, tWidth, tHeight, tLength],
    7:  [0, tHeight, 0, 0, tHeight, tLength],
    8:  [0, 0, tLength, tWidth, 0, tLength],
    9:  [tWidth, 0, tLength, tWidth, tHeight, tLength],
    10: [tWidth, tHeight, tLength, 0, tHeight, tLength],
    11: [0, tHeight, tLength, 0, 0, tLength]
  };

  var idx = 12;
  lineKeys.push(
    VERTICAL_MIDDLE_KEYS[0],
    VERTICAL_MIDDLE_KEYS[1],
    VERTICAL_MIDDLE_KEYS[2],
    VERTICAL_MIDDLE_KEYS[3]
  );
  coordinates[idx++] = [tMiddleV, tHeight, 0, tMiddleV, tHeight, tLength];
  coordinates[idx++] = [tMiddleV, 0, tLength, tMiddleV, tHeight, tLength];
  coordinates[idx++] = [tMiddleV, 0, 0, tMiddleV, tHeight, 0];
  coordinates[idx++] = [tMiddleV, 0, 0, tMiddleV, 0, tLength];

  var sorted = shelfLevels.slice().sort(function (a, b) { return a.height - b.height; });
  sorted.forEach(function (lvl) {
    var y = lvl.height;
    var keys = levelStrutKeys(lvl.id);
    lineKeys.push(keys.back, keys.front, keys.left, keys.right, keys.mid);
    coordinates[idx++] = [0, y, 0, tWidth, y, 0];
    coordinates[idx++] = [0, y, tLength, tWidth, y, tLength];
    coordinates[idx++] = [0, y, 0, 0, y, tLength];
    coordinates[idx++] = [tWidth, y, 0, tWidth, y, tLength];
    coordinates[idx++] = [tMiddleV, y, 0, tMiddleV, y, tLength];
  });
}

rebuildFrameDefinition();

  //Tischplatte / Ebenen
// (boards/shelfLevels bereits geladen)




//Farben und style
const colorActive = 0x404040;
const colorInactive = 0x404040;
const colorHover = 0x404040;
let opacityInactive = 0.0;

const isActive = false;
const isActive1 = false;

// --- Three.js Setup ---
const scene = new THREE.Scene();




const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 400); //wenn Hilfslinie ausgeblendet opacity = 0
camera.position.set(0, 0, 200);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true // Transparenz für den Hintergrund aktivieren
});

scene.background = null; // Hintergrund auf transparent setzen
renderer.setClearColor(new THREE.Color(0xf4f4f4), 0.0); //Backround mit 0.0 komplett auf Transparent gesetzt

const container = document.getElementById("canvas-container-3d");
container.appendChild(renderer.domElement);

function updateRendererSize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

window.addEventListener("resize", updateRendererSize);
updateRendererSize();

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x404040, 3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// --- Raycaster and Mouse Handling ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null;

// --- Scene Object Group ---
//einzelne Gruppen bilden sonst funktioniert toggeln der Linien nicht mehr weil sich alles verschiebt

//Metallgestell
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);
cubeGroup.scale.set(0.7, 0.7, 0.7);

//Holzplatte
const woodGroup = new THREE.Group();
scene.add(woodGroup);
woodGroup.scale.set(0.7, 0.7, 0.7);

scene.add(cubeGroup);
scene.add(woodGroup);

//Möbel nach unten schieben (sonst schwebt Möbel im Raumm)
let shiftY = - (200 - tHeight + thick) / 4;
cubeGroup.position.y = shiftY;
woodGroup.position.y = shiftY;



// --- Create Square Pipes ---
function createSquarePipe(x1, y1, z1, x2, y2, z2, isActive, index) {
    const lengthVal = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2) + Thickness;
    
    const pipeMaterial = new THREE.MeshStandardMaterial({
        color: isActive ? colorActive : colorInactive,
        opacity: isActive ? 1.0 : opacityInactive,
        transparent: !isActive,
        depthTest: true,
        depthWrite: isActive,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
    });

    const geometry = new THREE.BoxGeometry(Thickness, Thickness, lengthVal);
    const pipe = new THREE.Mesh(geometry, pipeMaterial);

    pipe.isActive = isActive;
    pipe.lineIndex = index;
    pipe.renderOrder = isActive ? 2 : 1;

    const direction = new THREE.Vector3(x2 - x1, y2 - y1, z2 - z1).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    pipe.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    pipe.setRotationFromQuaternion(quaternion);

    cubeGroup.add(pipe);
}

//______________________HOLZPLATTE_____________________________

const loader = new THREE.TextureLoader();
const woodTexture = loader.load("images/Holz3.png");

// Material für die Holzplatte mit Textur
var woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8,
    metalness: 0.2,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2
});

woodGroup.renderOrder = 0;
cubeGroup.renderOrder = 1;

function updateWood(){

    woodGroup.clear();

    const woodThickness = 5;
    const onlyTopBoard = !!boards.top && !boards.bottom && !shelfLevels.some(function (l) { return !!l.wood; });
    const oversetLR = onlyTopBoard ? parseFloat(tOversetLeRi) : 0;
    const oversetFB = onlyTopBoard ? parseFloat(tOversetFoBa) : 0;
    const widthWood = Math.max(1, parseFloat(tWidth) + Thickness + oversetLR);
    const lengthWood = Math.max(1, parseFloat(tLength) + Thickness + oversetFB);
    const woodGeometry = new THREE.BoxGeometry(widthWood, woodThickness, lengthWood);

    function addPlateAtRailTop(railCenterY, visible) {
      const railTopY = railCenterY + Thickness / 2;
      const woodCenterY = railTopY + woodThickness / 2;
      const woodPlate = new THREE.Mesh(woodGeometry, woodMaterial);
      woodPlate.position.set(0, woodCenterY, 0);
      woodPlate.renderOrder = 0;
      woodPlate.visible = !!visible;
      woodGroup.add(woodPlate);
    }

    addPlateAtRailTop(tHeight / 2, boards.top);
    shelfLevels.forEach(function (lvl) {
      addPlateAtRailTop(lvl.height - tHeight / 2, !!lvl.wood);
    });
    addPlateAtRailTop(-tHeight / 2, boards.bottom);

    addedBoard = !!boards.top;
}



//____________________________________________________________
// --- Create All Lines ---
Object.keys(coordinates).forEach((index) => {
    const coord = coordinates[index];
    const i = Number(index);
    createSquarePipe(
        coord[0] - tWidth / 2, coord[1] - tHeight / 2, coord[2] - tLength / 2,
        coord[3] - tWidth / 2, coord[4] - tHeight / 2, coord[5] - tLength / 2,
        tButtonStates[lineKeys[i]] || false, i
    );
});

// --- Orbit Controls ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.minDistance = 40;
controls.maxDistance = 1500; // Weit herauszoomen möglich
controls.screenSpacePanning = true; // Verschieben ohne Perspektivwechsel
// Horizontal/vertikal verschieben = Pan (Perspektive bleibt), Drehen per Rechtsklick / 2 Finger
controls.mouseButtons = {
  LEFT: THREE.MOUSE.PAN,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.ROTATE
};
controls.touches = {
  ONE: THREE.TOUCH.PAN,
  TWO: THREE.TOUCH.DOLLY_PAN
};

// --- Mouse Move Handler ---
window.addEventListener('mousemove', (event) => {
    getMousePosition(event);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubeGroup.children);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (intersectedObject !== object) {
            if (intersectedObject) {
                intersectedObject.material.color.set(intersectedObject.isActive ? colorActive : colorInactive);
            }
            intersectedObject = object;
            intersectedObject.material.color.set(colorHover);
        }
    } else {
        if (intersectedObject) {
            intersectedObject.material.color.set(intersectedObject.isActive ? colorActive : colorInactive);
            intersectedObject = null;
        }
    }
}, false);

// --- Update Mouse Position ---
function getMousePosition(event) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

window.addEventListener('click', (event) => {
    getMousePosition(event);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubeGroup.children);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        // Nur reagieren, wenn die Linie noch nicht aktiv ist
   //     toggleLineVisibility(object.lineIndex);
    }
}, false);

// --- Toggle Button Funktion ---
// Wir stellen sicher, dass die Opazität auf 1 gesetzt wird, wenn die Linie aktiviert ist


function toggleLineVisibility(lineIndex) {
    tButtonStates[lineKeys[lineIndex]] = !tButtonStates[lineKeys[lineIndex]]; 

    updateAllLines(); // Aktualisiert alle Linien
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    if (!window.__lockRoomCamera) controls.update();
    renderer.render(scene, camera);
}

animate();

// Beim Laden der Seite --> Konfigurationen wiederherstellen
window.addEventListener('load', () => {
    cubeGroup.children.forEach((line, index) => {
        if (lineKeys[index]) {  // Falls der Index gültig ist
            const isActive = tButtonStates[lineKeys[index]] || false;
            line.material.color.set(isActive ? colorActive : colorInactive);
            line.material.opacity = isActive ? 1.0 : opacityInactive
            line.isActive = isActive;
        }
    });
});

function updateAllLines() {
    cubeGroup.children.forEach((line, index) => {
        const isActive = tButtonStates[lineKeys[index]] || false;

        line.isActive = isActive;
        line.material.color.set(isActive ? colorActive : colorInactive);
        line.material.opacity = isActive ? 1.0 : (isActive1 ? 0.0 : opacityInactive);
        line.material.transparent = !isActive || isActive1;
        line.material.depthTest = true;
        line.material.depthWrite = !!isActive;
        line.material.polygonOffset = true;
        line.material.polygonOffsetFactor = -2;
        line.material.polygonOffsetUnits = -2;
        line.renderOrder = isActive ? 2 : 1;
    });
    saveButtonStates();
    updateWood();
}


window.addEventListener('load', updateAllLines);

//Aktualisiere wenn wert in Div "Inputfield" geändert wurde und speichere neuen Wert in localStoarage
var inputFieldEl = document.querySelector(".cInputField");
if (inputFieldEl) {
document.querySelector(".cInputField").addEventListener("input", function (event) {
    // Prüfen, ob das Event von einem relevanten Element kommt
    if (event.target.matches("input, select, textarea, range")) {


        // Speichere den neuen Wert in localStorage
        // localStorage.setItem(event.target.id, event.target.value);
        // Szene neu rendern
        resetScene();
    }
});
}

//____________UPDATING___________________

function resetScene() {

    // Neue Werte aus LocalStorage holen
    tWidth = parseFloat(localStorage.getItem("iWidth")) || 100;
    tLength = parseFloat(localStorage.getItem("iDeepth")) || 100;
    tHeight = parseFloat(localStorage.getItem("iHight")) || 100;
    tMiddleH = parseFloat(localStorage.getItem("iMiddleH")) || 50;
    tMiddleV = parseFloat(localStorage.getItem("iMiddleV")) || 50;
    thick = parseFloat(localStorage.getItem("iMaterial")) || 15;
    tOversetLeRi = parseFloat(localStorage.getItem("iOversetLeRi")) || 0;
    tOversetFoBa = parseFloat(localStorage.getItem("iOversetFoBa")) || 0;
    boards.top = localStorage.getItem("iAddBoard") === "true";
    boards.bottom = localStorage.getItem("iAddBoardBottom") === "true";
    try {
      var storedLevels = JSON.parse(localStorage.getItem("shelfLevels") || "[]");
      if (Array.isArray(storedLevels)) shelfLevels = storedLevels;
    } catch (e) {}

    // Thickness aktualisieren
    Thickness = thick / 10;

        // Koordinaten neu berechnen
    updateCoordinates();

    // Entferne alle Objekte aus der Szene
    cubeGroup.clear();
    woodGroup.clear();

    // Koordinaten neu berechnen
    Object.keys(coordinates).forEach((index) => {
        const coord = coordinates[index];
        const i = Number(index);
        createSquarePipe(
            coord[0] - tWidth / 2, coord[1] - tHeight / 2, coord[2] - tLength / 2,
            coord[3] - tWidth / 2, coord[4] - tHeight / 2, coord[5] - tLength / 2,
            tButtonStates[lineKeys[i]] || false, i
        );
    });

    // Renderer aktualisieren
    updateRendererSize();
    updateAllLines();
    
}

//alle werte zurücksetzen
let clear = document.getElementById("iTrash");
if (clear) clear.addEventListener('click', FuncClear);

function FuncClear() {
// Alle Werte in tButtonStates auf false setzen
lineKeys.forEach((key) => {
tButtonStates[key] = false;
});

//Defaultwerte setzen
tWidth = 100;
tHeight = 100;
tLength = 100;
tMiddleH = 50;
tMiddleV = 50;
thick = 20;
tOversetLeRi = 0;
tOversetFoBa = 0;
boards.top = false;
boards.bottom = false;
shelfLevels = [];
addedBoard = false;

// Speichere die Änderungen in LocalStorage
saveButtonStates();
updateDimension();
updateAllLines();
resetScene();
};

function updateDimension(){
    hight = tHeight;
    width = tWidth;
    deepth = tLength;
    middleH = tMiddleH;
    middleV = tMiddleV;
    Thickness = thick / 10; // in cm und in 5 Schritten wandeln;
    oversetLiRe = tOversetLeRi;
    oversetFoBa = tOversetFoBa;

    localStorage.setItem("iHight", hight);
    localStorage.setItem("iWidth", width);
    localStorage.setItem("iDeepth", deepth);
    localStorage.setItem("iMaterial", thick);
    localStorage.setItem("iMiddleH", middleH);
    localStorage.setItem("iMiddleV", middleV);
    localStorage.setItem("iOversetLeRi", oversetLiRe);
    localStorage.setItem("iOversetFoBa", oversetFoBa);

    widthInput.value = width;
    hightInput.value = hight;
    deepthInput.value = deepth;
    MaterialInput.value = thick; 
    MiddleInput.value =  middleH;
    MiddleLengthInput.value = middleV
    OversetLiReInput.value= oversetLiRe;
    OversetFoBaInput.value= oversetFoBa;

    materialOutput.value = thick; 
    hightOutput.value = hight;
    widthOutput.value = width;
    deepthOutput.value = deepth;
    middleVOutput.value = middleV;
    middleHOutput.value = middleH;
    OversetLeRiOutput.value = oversetLiRe;
    OversetFoBaOutput.value = oversetFoBa;
}

function updateCoordinates() {
    rebuildFrameDefinition();
}

//Sichtbarkeit der Eingabefelder
//Funktion ein ausblenden

//Sichtbarkeit der Eingabefelder (nur relevant, wenn Creator-Inputs vorhanden)
function value() {
    if (!document.getElementById("displayV") && !document.getElementById("displayH")) return;

    displayed(["iFrontMiddleLenght", "iBackMiddleLenght", "iTopMiddle", "iBottomMiddle", "iMiddleMiddle"], "displayV", "flex");
    displayed(["iFrontMiddleCross", "iBackMiddleCross", "iRightMiddleCross", "iLeftMiddleCross"], "displayH", "flex");

    document.querySelectorAll(".cDisplayB").forEach(el => {
        el.style.display = addedBoard ? "flex" : "none";
      });
}

if (document.getElementById("displayV") || document.getElementById("displayH")) {
  setInterval(value, 200);
}

//Seite neu laden
window.onload = function() {
  boards.top = localStorage.getItem("iAddBoard") === "true";
  boards.bottom = localStorage.getItem("iAddBoardBottom") === "true";
  addedBoard = boards.top;
  try {
    var storedLevels = JSON.parse(localStorage.getItem("shelfLevels") || "[]");
    if (Array.isArray(storedLevels)) shelfLevels = storedLevels;
  } catch (e) {}
  rebuildFrameDefinition();
  if (typeof resetScene === "function") resetScene();
};


//Ein/Ausblenden
function displayed(ButtonList, id, show) {
    // Hole das Element anhand der ID
    let element = document.getElementById(id);
  
    // Prüfen, ob einer der Buttons aktiv ist (true)
    let showElement = false;
    for (let button of ButtonList) {
        if (tButtonStates[button]) {
            showElement = true;
            break; // Wenn einer wahr ist, abbrechen und das Element anzeigen
        }
    }
  
    // Blende das Element ein oder aus
    if (!element) return;
    if (showElement) {
        element.style.display = show; // Element anzeigen
    } else {
        element.style.display = "none"; // Element ausblenden
    }
  }

































