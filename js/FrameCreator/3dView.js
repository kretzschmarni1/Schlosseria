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

//Variablen für Linien-Schlüssel (werden dynamisch um Ebenen erweitert)
const BASE_LINE_KEYS = [
    "iBackBottom", "iBackRight", "iBackTop", "iBackLeft",
    "iLeftBottom", "iRightBottom", "iRightTop", "iLeftTop",
    "iFrontBottom", "iFrontRight", "iFrontTop", "iFrontLeft"
];
const VERTICAL_MIDDLE_KEYS = [
    "iTopMiddle", "iFrontMiddleLenght", "iBackMiddleLenght", "iBottomMiddle"
];
let lineKeys = BASE_LINE_KEYS.slice();

//Konfiguration der Linien-Koordinaten (wird in rebuildFrameDefinition befüllt)
let coordinates = {};

const MAX_EXTRA_LEVELS = 4;

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
  var parsed = null;
  try {
    parsed = JSON.parse(localStorage.getItem("shelfLevels") || "null");
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {}

  // Migration: alte Einzel-Mitte-Ebene (auch wenn shelfLevels = [])
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
  return Array.isArray(parsed) ? parsed : [];
}

var shelfLevels = loadShelfLevels();

function saveShelfLevels() {
  localStorage.setItem("shelfLevels", JSON.stringify(shelfLevels));
  if (shelfLevels.length > 0) {
    localStorage.setItem("iMiddleH", String(shelfLevels[0].height));
    tMiddleH = shelfLevels[0].height;
  }
  localStorage.setItem("middleLevelVisible", shelfLevels.length > 0 ? "true" : "false");
  localStorage.setItem(
    "iAddBoardMiddle",
    shelfLevels.some(function (l) { return !!l.wood; }) ? "true" : "false"
  );
}

function nextShelfId() {
  var max = 0;
  shelfLevels.forEach(function (l) { if (l.id > max) max = l.id; });
  return max + 1;
}

function nextLevelHeight() {
  var h = tHeight || 100;
  var existing = shelfLevels.map(function (l) { return l.height; }).sort(function (a, b) { return a - b; });
  var points = [5].concat(existing).concat([Math.max(10, h - 5)]);
  var bestGap = 0;
  var bestMid = Math.round(h / 2);
  for (var i = 0; i < points.length - 1; i++) {
    var gap = points[i + 1] - points[i];
    if (gap > bestGap) {
      bestGap = gap;
      bestMid = Math.round((points[i] + points[i + 1]) / 2);
    }
  }
  return Math.max(5, Math.min(h - 5, bestMid));
}

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
  // Vertikale Mitten-Hilfslinien (Mitte v)
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
  let addBoard = document.getElementById("iAddBoard");
  var addedBoard = false;
  var boards = {
    top: localStorage.getItem("iAddBoard") === "true",
    bottom: localStorage.getItem("iAddBoardBottom") === "true"
  };
  addedBoard = boards.top;
  // Kompatibilität für älteren Code
  var middleLevelVisible = shelfLevels.length > 0;

  function saveBoardState() {
    addedBoard = !!boards.top;
    localStorage.setItem("iAddBoard", boards.top ? "true" : "false");
    localStorage.setItem("iAddBoardBottom", boards.bottom ? "true" : "false");
    saveShelfLevels();
  }

  function updateLevelHeightSliders() {
    var host = document.getElementById("iExtraLevelSliders");
    if (!host) return;
    host.innerHTML = "";
    var sorted = shelfLevels.slice().sort(function (a, b) { return b.height - a.height; });
    sorted.forEach(function (lvl, visualIndex) {
      var row = document.createElement("div");
      row.className = "cInputVlaue";
      row.dataset.levelId = String(lvl.id);
      var label = document.createElement("label");
      label.style.width = "100px";
      label.style.minWidth = "110px";
      label.textContent = "Ebene " + (sorted.length - visualIndex) + " h";
      label.htmlFor = "iLevelH_" + lvl.id;
      var input = document.createElement("input");
      input.type = "range";
      input.className = "cInput";
      input.min = "5";
      input.max = String(Math.max(10, (tHeight || 100) - 5));
      input.step = "1";
      input.id = "iLevelH_" + lvl.id;
      input.value = String(lvl.height);
      input.style.flex = "1";
      var output = document.createElement("output");
      output.id = "iLevelHOut_" + lvl.id;
      output.style.width = "50px";
      output.style.textAlign = "right";
      output.textContent = String(lvl.height);
      var unit = document.createElement("span");
      unit.textContent = "cm";
      input.addEventListener("input", function () {
        var maxH = Math.max(10, (parseFloat(localStorage.getItem("iHight")) || tHeight || 100) - 5);
        var val = Math.max(5, Math.min(maxH, parseInt(input.value, 10) || 5));
        input.value = String(val);
        output.textContent = String(val);
        var target = shelfLevels.find(function (l) { return l.id === lvl.id; });
        if (target) {
          target.height = val;
          saveShelfLevels();
          if (typeof resetScene === "function") resetScene();
        }
      });
      input.addEventListener("change", function () {
        updateLevelUI();
      });
      row.appendChild(label);
      row.appendChild(input);
      row.appendChild(output);
      row.appendChild(unit);
      host.appendChild(row);
    });
  }

  function setLevelFrameActive(id, active) {
    var keys = levelStrutKeys(id);
    // Rechteck-Rahmen der Ebene (ohne optionale Mitte-v-Strebe)
    ["back", "front", "left", "right"].forEach(function (k) {
      tButtonStates[keys[k]] = !!active;
    });
    // Querstrebe an Mitte v nur mitaktivieren, wenn Mitte-v schon genutzt wird
    var hasMiddleV = ["iTopMiddle", "iFrontMiddleLenght", "iBackMiddleLenght", "iBottomMiddle"].some(function (key) {
      return !!tButtonStates[key];
    });
    if (active && hasMiddleV) {
      tButtonStates[keys.mid] = true;
    } else if (!active) {
      tButtonStates[keys.mid] = false;
    }
    saveButtonStates();
  }

  function updateLevelUI() {
    const list = document.getElementById("iLevelList");
    const addLevelBtn = document.getElementById("iAddLevel");
    if (!list) return;

    const levels = [{ id: "top", label: "Oben (Rahmen)", kind: "top" }];
    const sorted = shelfLevels.slice().sort(function (a, b) { return b.height - a.height; });
    sorted.forEach(function (lvl, i) {
      levels.push({
        id: lvl.id,
        label: "Ebene " + (sorted.length - i) + " (" + lvl.height + " cm)",
        kind: "shelf",
        wood: !!lvl.wood
      });
    });
    levels.push({ id: "bottom", label: "Unten (Rahmen)", kind: "bottom" });

    list.innerHTML = "";
    levels.forEach(function (level) {
      const on = level.kind === "top"
        ? !!boards.top
        : (level.kind === "bottom" ? !!boards.bottom : !!level.wood);
      const row = document.createElement("div");
      row.className = "cLevelRow";
      var actions =
        '<div class="cLevelRowActions">' +
          '<button type="button" class="cLevelWoodBtn' + (on ? ' is-on' : '') + '" data-level="' + level.id + '" data-kind="' + level.kind + '" title="' +
            (on ? 'Holzplatte entfernen' : 'Holzplatte hinzufügen') + '">' +
            (on ? '−' : '+') +
          '</button>';
      if (level.kind === "shelf") {
        actions +=
          '<button type="button" class="cLevelRemoveBtn" data-remove="' + level.id + '" title="Ebene entfernen" aria-label="Ebene entfernen">×</button>';
      }
      actions += '</div>';
      row.innerHTML = '<span>' + level.label + '</span>' + actions;
      list.appendChild(row);
    });

    list.querySelectorAll(".cLevelWoodBtn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const kind = btn.dataset.kind;
        if (kind === "top") {
          boards.top = !boards.top;
          // Oberer Holzplatte: äußeren Top-Rahmen sicherstellen
          if (boards.top) {
            ["iFrontTop", "iBackTop", "iLeftTop", "iRightTop"].forEach(function (key) {
              tButtonStates[key] = true;
            });
            saveButtonStates();
          }
        } else if (kind === "bottom") {
          boards.bottom = !boards.bottom;
          // Untere Holzplatte: äußeren Bottom-Rahmen sicherstellen
          if (boards.bottom) {
            ["iFrontBottom", "iBackBottom", "iLeftBottom", "iRightBottom"].forEach(function (key) {
              tButtonStates[key] = true;
            });
            saveButtonStates();
          }
        } else {
          const id = parseInt(btn.dataset.level, 10);
          const target = shelfLevels.find(function (l) { return l.id === id; });
          if (target) {
            target.wood = !target.wood;
            // Holzplatte auf Ebene => Stahlrahmen dieser Ebene aktivieren
            if (target.wood) {
              setLevelFrameActive(id, true);
            }
          }
        }
        saveBoardState();
        updateLevelUI();
        if (typeof updateAllLines === "function") updateAllLines();
        else updateWood();
        if (typeof updateLivePrices === "function") updateLivePrices();
      });
    });

    list.querySelectorAll(".cLevelRemoveBtn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const id = parseInt(btn.dataset.remove, 10);
        removeShelfLevel(id);
      });
    });

    if (addLevelBtn) {
      var addRow = document.getElementById("iLevelAddRow");
      var showAdd = shelfLevels.length < MAX_EXTRA_LEVELS;
      addLevelBtn.style.display = showAdd ? "flex" : "none";
      if (addRow) addRow.style.display = showAdd ? "flex" : "none";
    }
    updateLevelHeightSliders();
  }

  function addShelfLevel() {
    if (shelfLevels.length >= MAX_EXTRA_LEVELS) return;
    var id = nextShelfId();
    shelfLevels.push({
      id: id,
      height: nextLevelHeight(),
      wood: false
    });
    var keys = levelStrutKeys(id);
    Object.keys(keys).forEach(function (k) {
      if (tButtonStates[keys[k]] === undefined) tButtonStates[keys[k]] = false;
    });
    saveBoardState();
    saveButtonStates();
    middleLevelVisible = true;
    rebuildFrameDefinition();
    updateLevelUI();
    if (typeof resetScene === "function") resetScene();
    else updateAllLines();
    if (typeof updateLivePrices === "function") updateLivePrices();
  }

  function removeShelfLevel(id) {
    var keys = levelStrutKeys(id);
    Object.keys(keys).forEach(function (k) {
      delete tButtonStates[keys[k]];
    });
    shelfLevels = shelfLevels.filter(function (l) { return l.id !== id; });
    middleLevelVisible = shelfLevels.length > 0;
    saveBoardState();
    saveButtonStates();
    rebuildFrameDefinition();
    updateLevelUI();
    if (typeof resetScene === "function") resetScene();
    if (typeof updateLivePrices === "function") updateLivePrices();
  }

  if (addBoard) {
    addBoard.addEventListener("click", function () {
      boards.top = !boards.top;
      saveBoardState();
      updateLevelUI();
      resetScene();
      if (typeof updateLivePrices === "function") updateLivePrices();
    });
  }

  const addLevelBtn = document.getElementById("iAddLevel");
  if (addLevelBtn) {
    addLevelBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      addShelfLevel();
    });
  }




//Farben und style
const colorActive = 0x404040;
const colorInactive = 0x404040;
const colorHover = 0x00ffff;
let opacityInactive = 0.3;

//Hilfslinien ausblenden
let test = document.getElementById("iDisplayLine");
let isActive1 = false; 

test.addEventListener("click", function () {
    isActive1 = !isActive1; 
    test.innerHTML = isActive1 ? "Hilfslinien einblenden" : "Hilfslinien ausblenden";
updateAllLines();
});

// --- Three.js Setup ---
const scene = new THREE.Scene();




const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 400); //wenn Hilfslinie ausgeblendet opacity = 0
camera.position.set(150, 150, 150);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    preserveDrawingBuffer: true
});

scene.background = null; // Hintergrund auf transparent setzen
renderer.setClearColor(new THREE.Color(0xd3d3d3), 0.87);

const container = document.getElementById("canvas-container");
container.appendChild(renderer.domElement);

const canvasRadius = renderer.domElement;
canvasRadius.style.borderRadius = '16px';


function updateRendererSize() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

window.addEventListener("resize", updateRendererSize);
window.addEventListener("orientationchange", function () {
    setTimeout(updateRendererSize, 200);
});
updateRendererSize();
setTimeout(updateRendererSize, 100);

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

// --- Create Square Pipes ---
function createSquarePipe(x1, y1, z1, x2, y2, z2, isActive, index) {
    const lengthVal = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2) + Thickness;
    
    const pipeMaterial = new THREE.MeshStandardMaterial({
        color: isActive ? colorActive : colorInactive,
        opacity: isActive ? 1.0 : opacityInactive,
        transparent: !isActive,
        depthTest: true,
        depthWrite: isActive,
        // Bei Kante/Überlappung mit Holzplatte Streben vor dem Holz
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
    // Holz leicht zurück, damit bündige Streben sichtbar bleiben
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
    const widthWood = parseFloat(tWidth) + Thickness + oversetLR;
    const lengthWood = parseFloat(tLength) + Thickness + oversetFB;
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

    // Oben: auf dem Rahmen
    const frameTopCenterY = tHeight / 2;
    addPlateAtRailTop(frameTopCenterY, boards.top);

    // Extra-Ebenen
    shelfLevels.forEach(function (lvl) {
      const centerY = lvl.height - tHeight / 2;
      addPlateAtRailTop(centerY, !!lvl.wood);
    });

    // Unten: auf dem Rahmen
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
controls.minDistance = 70;  // Minimale Zoom-Distanz
controls.maxDistance = 200; // Maximale Zoom-Distanz

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

// --- Update Mouse / Touch Position ---
function getMousePosition(event) {
    const rect = container.getBoundingClientRect();
    const point = (event.changedTouches && event.changedTouches[0]) || event;
    mouse.x = ((point.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((point.clientY - rect.top) / rect.height) * 2 + 1;
}

function handleLinePick(event) {
    getMousePosition(event);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubeGroup.children, false);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object && object.lineIndex !== undefined) {
            toggleLineVisibility(object.lineIndex);
        }
    }
}

// Tap-Erkennung: kurze Touches/Klicks waehlen Streben, Swipes drehen weiter die Kamera
let pickPointerId = null;
let pickStartX = 0;
let pickStartY = 0;
let pickMoved = false;

renderer.domElement.addEventListener('pointerdown', function (event) {
    pickPointerId = event.pointerId;
    pickStartX = event.clientX;
    pickStartY = event.clientY;
    pickMoved = false;
}, { capture: true });

renderer.domElement.addEventListener('pointermove', function (event) {
    if (pickPointerId !== event.pointerId) return;
    const dx = event.clientX - pickStartX;
    const dy = event.clientY - pickStartY;
    if ((dx * dx + dy * dy) > 64) pickMoved = true; // > 8px = Drag
}, { capture: true });

renderer.domElement.addEventListener('pointerup', function (event) {
    if (pickPointerId !== event.pointerId) return;
    if (!pickMoved) handleLinePick(event);
    pickPointerId = null;
    pickMoved = false;
}, { capture: true });

renderer.domElement.addEventListener('pointercancel', function () {
    pickPointerId = null;
    pickMoved = false;
}, { capture: true });

// --- Toggle Button Funktion ---
// Wir stellen sicher, dass die Opazität auf 1 gesetzt wird, wenn die Linie aktiviert ist


function toggleLineVisibility(lineIndex) {
    tButtonStates[lineKeys[lineIndex]] = !tButtonStates[lineKeys[lineIndex]]; 

    updateAllLines(); // Aktualisiert alle Linien
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
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
    if (typeof updateLivePrices === "function") updateLivePrices();
}


window.addEventListener('load', updateAllLines);

//Aktualisiere wenn wert in Div "Inputfield" geändert wurde und speichere neuen Wert in localStoarage
document.querySelector(".cInputField").addEventListener("input", function (event) {
    // Prüfen, ob das Event von einem relevanten Element kommt
    if (event.target.matches("input, select, textarea, range")) {


        // Speichere den neuen Wert in localStorage
        // localStorage.setItem(event.target.id, event.target.value);
        // Szene neu rendern
        resetScene();
    }
});

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

    // Extra-Ebenen an Rahmenhöhe klemmen
    var maxLevelH = Math.max(10, tHeight - 5);
    var levelsClamped = false;
    shelfLevels.forEach(function (lvl) {
      var next = Math.max(5, Math.min(maxLevelH, lvl.height));
      if (next !== lvl.height) {
        lvl.height = next;
        levelsClamped = true;
      }
    });
    if (levelsClamped) saveShelfLevels();

    // Thickness aktualisieren
    Thickness = thick / 10;

    // Koordinaten / Linien-Keys neu berechnen (inkl. Extra-Ebenen)
    updateCoordinates();

    // Entferne alle Objekte aus der Szene
    cubeGroup.clear();
    woodGroup.clear();

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

    // Slider-Max an aktuelle Höhe anpassen
    var host = document.getElementById("iExtraLevelSliders");
    if (host) {
      host.querySelectorAll('input[type="range"]').forEach(function (input) {
        input.max = String(maxLevelH);
        if (parseInt(input.value, 10) > maxLevelH) {
          input.value = String(maxLevelH);
          var out = document.getElementById(input.id.replace("iLevelH_", "iLevelHOut_"));
          if (out) out.textContent = String(maxLevelH);
        }
      });
    }
    
}

//alle werte zurücksetzen
let clear = document.getElementById("iTrash");
clear.addEventListener('click', FuncClear);

function FuncClear() {
// Alle Werte in tButtonStates auf false setzen
Object.keys(tButtonStates).forEach(function (key) {
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
middleLevelVisible = false;
addedBoard = false;
saveBoardState();
rebuildFrameDefinition();

// Speichere die Änderungen in LocalStorage
saveButtonStates();
updateDimension();
updateLevelUI();
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

setInterval(value, 200);

function value() {

    displayed(["iFrontMiddleLenght", "iBackMiddleLenght", "iTopMiddle", "iBottomMiddle", "iMiddleMiddle"], "displayV", "flex");
    // Legacy Mitte-h bleibt versteckt; dynamische Slider steuern Extra-Ebenen
    const displayH = document.getElementById("displayH");
    if (displayH) displayH.style.display = "none";

    // Überstand nur bei genau einer Holzplatte: Oben (Rahmen)
    const onlyTopBoard = !!boards.top && !boards.bottom && !shelfLevels.some(function (l) { return !!l.wood; });
    document.querySelectorAll(".cDisplayB").forEach(el => {
        el.style.display = onlyTopBoard ? "flex" : "none";
      });
  
    //Zustand ausgeben
    if (addBoard) {
      addBoard.innerHTML = boards.top ? "Holzplatte entfernen" : "Holzplatte hinzufügen";
    }
}

//Seite neu laden
    window.addEventListener("load", function () {
        console.log("Seite komplett geladen");
        boards.top = localStorage.getItem("iAddBoard") === "true";
        boards.bottom = localStorage.getItem("iAddBoardBottom") === "true";
        try {
          var storedLevels = JSON.parse(localStorage.getItem("shelfLevels") || "[]");
          if (Array.isArray(storedLevels)) shelfLevels = storedLevels;
        } catch (e) {}
        middleLevelVisible = shelfLevels.length > 0;
        addedBoard = boards.top;
        saveBoardState();
        rebuildFrameDefinition();
        updateLevelUI();
        resetScene(); // Aktualisiert alle Linien basierend auf dem neuen Status
      });


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
    if (showElement) {
        element.style.display = show; // Element anzeigen
    } else {
        element.style.display = "none"; // Element ausblenden
    }
  }

function captureScene() {
    // Rendere aktuelle Szene
    renderer.render(scene, camera);

    // Hole Bild als DataURL (PNG)
    const dataURL = renderer.domElement.toDataURL("image/png");

    // Download-Link erzeugen
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "capture.png"; // Dateiname
    link.click();
}

document.getElementById("captureBtn").addEventListener("click", captureScene);































