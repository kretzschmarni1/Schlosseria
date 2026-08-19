(function () {
  if (typeof THREE === "undefined" || typeof scene === "undefined" || typeof camera === "undefined") {
    return;
  }

  var LAYOUT_KEY = "roomLayout";
  var DEFAULT_BG = 'url("images/backrounds/backround3D_1.png") center/cover no-repeat';
  var furnitureGroup = new THREE.Group();
  furnitureGroup.name = "roomFurniture";
  scene.add(furnitureGroup);

  var groundY = -((typeof tHeight === "number" ? tHeight : 100) / 2);
  var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -groundY);
  var selected = null;
  var dragging = false;
  var dragOffset = new THREE.Vector3();
  var pointer = new THREE.Vector2();
  var localRay = new THREE.Raycaster();
  var hitPoint = new THREE.Vector3();

  function loadLayout() {
    try {
      return JSON.parse(localStorage.getItem(LAYOUT_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveLayout(partial) {
    var layout = loadLayout();
    Object.keys(partial).forEach(function (k) {
      layout[k] = partial[k];
    });
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }

  function applyBackground(dataUrl) {
    var body = document.getElementById("i3DBody") || document.querySelector(".c3DBody");
    if (!body) return;
    if (dataUrl) {
      body.style.background = 'url("' + dataUrl + '") center/cover no-repeat';
    } else {
      body.style.background = DEFAULT_BG;
    }
  }

  function compressImage(file, maxWidth, quality, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxWidth / img.width);
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        done(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = function () { done(null); };
      img.src = reader.result;
    };
    reader.onerror = function () { done(null); };
    reader.readAsDataURL(file);
  }

  function setSelected(mesh) {
    if (selected && selected.material) {
      selected.material.emissive.setHex(0x000000);
    }
    selected = mesh || null;
    if (selected && selected.material && selected.material.emissive) {
      selected.material.emissive.setHex(0x335577);
    }
  }

  function clearFurniture() {
    while (furnitureGroup.children.length) {
      var child = furnitureGroup.children[0];
      furnitureGroup.remove(child);
      child.traverse(function (node) {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach(function (m) {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (node.material.map) node.material.map.dispose();
            node.material.dispose();
          }
        }
      });
    }
    selected = null;
    saveLayout({ items: [] });
    var hint = document.getElementById("iRoomHint");
    if (hint) hint.textContent = "Möbel antippen und ziehen zum Positionieren";
  }

  function persistPositions() {
    var items = furnitureGroup.children.map(function (mesh) {
      return {
        id: mesh.userData.id,
        configIdx: mesh.userData.configIdx,
        copyIdx: mesh.userData.copyIdx,
        x: mesh.position.x,
        z: mesh.position.z
      };
    });
    saveLayout({ items: items });
  }

  function createFurnitureMesh(config, configIdx, copyIdx, pos) {
    var w = Math.max(20, parseFloat(config.width) || 80);
    var d = Math.max(20, parseFloat(config.deepth) || 40);
    var h = Math.max(20, parseFloat(config.hight) || 60);
    var geo = new THREE.BoxGeometry(w, h, d);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xc8b59a,
      metalness: 0.15,
      roughness: 0.7
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      pos && typeof pos.x === "number" ? pos.x : (configIdx * 40 + copyIdx * 20) - 60,
      groundY + h / 2,
      pos && typeof pos.z === "number" ? pos.z : configIdx * 30
    );
    mesh.userData = {
      isRoomFurniture: true,
      id: "cfg-" + configIdx + "-" + copyIdx,
      configIdx: configIdx,
      copyIdx: copyIdx,
      height: h
    };
    furnitureGroup.add(mesh);

    if (config.thumbnail) {
      var loader = new THREE.TextureLoader();
      loader.load(config.thumbnail, function (tex) {
        tex.minFilter = THREE.LinearFilter;
        var front = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.92, h * 0.92),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        front.position.set(0, 0, d / 2 + 0.2);
        front.userData.isRoomFurniture = true;
        front.userData.parentFurniture = mesh;
        mesh.add(front);
      }, undefined, function () {});
    }

    return mesh;
  }

  function placeCartFurniture() {
    var configs = [];
    try {
      configs = JSON.parse(localStorage.getItem("configurations") || "[]") || [];
    } catch (e) {
      configs = [];
    }
    if (!configs.length) {
      alert("Keine Möbel im Warenkorb.");
      return;
    }

    var layout = loadLayout();
    var savedItems = Array.isArray(layout.items) ? layout.items : [];
    var savedMap = {};
    savedItems.forEach(function (it) {
      savedMap[it.id] = it;
    });

    clearFurniture();
    configs.forEach(function (config, configIdx) {
      var qty = Math.max(1, parseInt(config.quantity, 10) || 1);
      for (var copyIdx = 0; copyIdx < qty; copyIdx++) {
        var id = "cfg-" + configIdx + "-" + copyIdx;
        createFurnitureMesh(config, configIdx, copyIdx, savedMap[id] || null);
      }
    });
    persistPositions();
    var hint = document.getElementById("iRoomHint");
    if (hint) hint.textContent = furnitureGroup.children.length + " Möbel platziert – antippen und ziehen";
  }

  function restoreSavedFurniture() {
    var layout = loadLayout();
    if (!Array.isArray(layout.items) || !layout.items.length) return;
    var configs = [];
    try {
      configs = JSON.parse(localStorage.getItem("configurations") || "[]") || [];
    } catch (e) {
      configs = [];
    }
    layout.items.forEach(function (it) {
      var config = configs[it.configIdx];
      if (!config) return;
      createFurnitureMesh(config, it.configIdx, it.copyIdx, it);
    });
  }

  function updatePointer(event) {
    var rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function findFurnitureHit() {
    localRay.setFromCamera(pointer, camera);
    var hits = localRay.intersectObjects(furnitureGroup.children, true);
    if (!hits.length) return null;
    var obj = hits[0].object;
    while (obj && !obj.userData.isRoomFurniture) obj = obj.parent;
    if (!obj) return null;
    return obj.userData.parentFurniture || obj;
  }

  function onPointerDown(event) {
    if (!container.contains(event.target) || event.target.closest(".cRoomToolbar") || event.target.closest(".cClose3D")) {
      return;
    }
    updatePointer(event);
    var hit = findFurnitureHit();
    if (!hit) {
      setSelected(null);
      return;
    }
    setSelected(hit);
    dragging = true;
    controls.enabled = false;
    localRay.setFromCamera(pointer, camera);
    if (localRay.ray.intersectPlane(groundPlane, hitPoint)) {
      dragOffset.copy(hit.position).sub(hitPoint);
      dragOffset.y = 0;
    }
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!dragging || !selected) return;
    updatePointer(event);
    localRay.setFromCamera(pointer, camera);
    if (localRay.ray.intersectPlane(groundPlane, hitPoint)) {
      selected.position.x = hitPoint.x + dragOffset.x;
      selected.position.z = hitPoint.z + dragOffset.z;
      selected.position.y = groundY + (selected.userData.height || 40) / 2;
    }
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    controls.enabled = true;
    persistPositions();
  }

  function initUI() {
    var upload = document.getElementById("iRoomBgUpload");
    var resetBg = document.getElementById("iRoomBgReset");
    var placeBtn = document.getElementById("iRoomPlaceFurniture");
    var clearBtn = document.getElementById("iRoomClearFurniture");

    if (upload) {
      upload.addEventListener("change", function () {
        var file = upload.files && upload.files[0];
        if (!file) return;
        compressImage(file, 1600, 0.82, function (dataUrl) {
          if (!dataUrl) {
            alert("Bild konnte nicht geladen werden.");
            return;
          }
          try {
            saveLayout({ background: dataUrl });
            applyBackground(dataUrl);
          } catch (err) {
            alert("Bild ist zu groß für den Speicher. Bitte ein kleineres Bild wählen.");
          }
          upload.value = "";
        });
      });
    }

    if (resetBg) {
      resetBg.addEventListener("click", function () {
        saveLayout({ background: null });
        applyBackground(null);
      });
    }

    if (placeBtn) placeBtn.addEventListener("click", placeCartFurniture);
    if (clearBtn) clearBtn.addEventListener("click", clearFurniture);

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    var layout = loadLayout();
    applyBackground(layout.background || null);
    restoreSavedFurniture();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
  } else {
    initUI();
  }
})();
