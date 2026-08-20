(function () {
  if (typeof THREE === "undefined" || typeof scene === "undefined" || typeof camera === "undefined") {
    return;
  }

  var LAYOUT_KEY = "roomLayout";
  var DEFAULT_BG = 'url("images/backrounds/backround3D_1.png") center/cover no-repeat';
  var SCALE = 0.7;
  var furnitureGroup = new THREE.Group();
  furnitureGroup.name = "roomFurniture";
  scene.add(furnitureGroup);

  var groundY;
  (function computeGroundY() {
    var h0 = typeof tHeight === "number" ? tHeight : 100;
    var sc = SCALE;
    var base = typeof shiftY === "number" ? shiftY : 0;
    groundY = base - (h0 / 2) * sc;
  })();
  var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -groundY);
  var selected = null;
  var dragging = false;
  var rotating = false;
  var rotateMode = false;
  var rotateStartAngle = 0;
  var rotateStartRotY = 0;
  var pointer = new THREE.Vector2();
  var localRay = new THREE.Raycaster();
  var hitPoint = new THREE.Vector3();
  var steelMat = new THREE.MeshStandardMaterial({
    color: 0x404040,
    metalness: 0.35,
    roughness: 0.55
  });
  var woodTexture = null;
  try {
    woodTexture = new THREE.TextureLoader().load("images/Holz3.png");
  } catch (e) {}
  var woodMat = new THREE.MeshStandardMaterial({
    map: woodTexture || null,
    color: woodTexture ? 0xffffff : 0xc8b59a,
    roughness: 0.8,
    metalness: 0.2,
    side: THREE.DoubleSide
  });

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

  function setSelected(group) {
    if (selected) {
      selected.traverse(function (node) {
        if (node.isMesh && node.material && node.material.emissive) {
          node.material.emissive.setHex(0x000000);
        }
      });
    }
    selected = group || null;
    if (selected) {
      selected.traverse(function (node) {
        if (node.isMesh && node.material && node.material.emissive) {
          node.material.emissive.setHex(0x223344);
        }
      });
    }
  }

  function clearFurniture() {
    while (furnitureGroup.children.length) {
      var child = furnitureGroup.children[0];
      furnitureGroup.remove(child);
      child.traverse(function (node) {
        if (node.geometry) node.geometry.dispose();
        if (node.material && node.material !== steelMat && node.material !== woodMat) {
          if (Array.isArray(node.material)) {
            node.material.forEach(function (m) {
              if (m.map && m.map !== woodTexture) m.map.dispose();
              if (m !== steelMat && m !== woodMat) m.dispose();
            });
          } else {
            if (node.material.map && node.material.map !== woodTexture) node.material.map.dispose();
            node.material.dispose();
          }
        }
      });
    }
    selected = null;
    saveLayout({ items: [] });
  }

  function persistPositions() {
    var items = furnitureGroup.children.map(function (mesh) {
      return {
        id: mesh.userData.id,
        configIdx: mesh.userData.configIdx,
        copyIdx: mesh.userData.copyIdx,
        x: mesh.position.x,
        z: mesh.position.z,
        rotY: mesh.rotation.y
      };
    });
    saveLayout({ items: items });
  }

  function addPipe(group, thick, x1, y1, z1, x2, y2, z2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dz = z2 - z1;
    var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 0.01) return;
    var lengthVal = len + thick;
    var geo = new THREE.BoxGeometry(thick, thick, lengthVal);
    var pipe = new THREE.Mesh(geo, steelMat.clone());
    var direction = new THREE.Vector3(dx, dy, dz).normalize();
    var quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    pipe.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    pipe.setRotationFromQuaternion(quaternion);
    pipe.userData.isRoomFurniture = true;
    group.add(pipe);
  }

  function buildFurnitureModel(config) {
    var state = config.creatorState || {};
    var w = Math.max(10, parseFloat(config.width) || parseFloat(state.iWidth) || 80);
    var h = Math.max(10, parseFloat(config.hight) || parseFloat(state.iHight) || 60);
    var d = Math.max(10, parseFloat(config.deepth) || parseFloat(state.iDeepth) || 40);
    var thickMm = parseFloat(state.iMaterial) || parseFloat(config.dicke) || 15;
    var thick = thickMm / 10;
    var midV = parseFloat(state.iMiddleV) || w / 2;
    var bs = state.buttonStates || {};
    var levels = Array.isArray(state.shelfLevels) ? state.shelfLevels : [];
    var boardTop = !!state.iAddBoard;
    var boardBottom = !!state.iAddBoardBottom;
    var oLR = parseFloat(state.iOversetLeRi) || 0;
    var oFB = parseFloat(state.iOversetFoBa) || 0;
    var onlyTop = boardTop && !boardBottom && !levels.some(function (l) { return !!l.wood; });

    var root = new THREE.Group();
    var model = new THREE.Group();

    var segs = [
      { key: "iBackBottom", a: [0, 0, 0], b: [w, 0, 0] },
      { key: "iBackRight", a: [w, 0, 0], b: [w, h, 0] },
      { key: "iBackTop", a: [w, h, 0], b: [0, h, 0] },
      { key: "iBackLeft", a: [0, h, 0], b: [0, 0, 0] },
      { key: "iLeftBottom", a: [0, 0, 0], b: [0, 0, d] },
      { key: "iRightBottom", a: [w, 0, 0], b: [w, 0, d] },
      { key: "iRightTop", a: [w, h, 0], b: [w, h, d] },
      { key: "iLeftTop", a: [0, h, 0], b: [0, h, d] },
      { key: "iFrontBottom", a: [0, 0, d], b: [w, 0, d] },
      { key: "iFrontRight", a: [w, 0, d], b: [w, h, d] },
      { key: "iFrontTop", a: [w, h, d], b: [0, h, d] },
      { key: "iFrontLeft", a: [0, h, d], b: [0, 0, d] },
      { key: "iTopMiddle", a: [midV, h, 0], b: [midV, h, d] },
      { key: "iFrontMiddleLenght", a: [midV, 0, d], b: [midV, h, d] },
      { key: "iBackMiddleLenght", a: [midV, 0, 0], b: [midV, h, 0] },
      { key: "iBottomMiddle", a: [midV, 0, 0], b: [midV, 0, d] }
    ];

    levels.forEach(function (lvl) {
      var y = parseFloat(lvl.height) || h / 2;
      var id = lvl.id;
      segs.push(
        { key: "iLvl" + id + "Back", a: [0, y, 0], b: [w, y, 0] },
        { key: "iLvl" + id + "Front", a: [0, y, d], b: [w, y, d] },
        { key: "iLvl" + id + "Left", a: [0, y, 0], b: [0, y, d] },
        { key: "iLvl" + id + "Right", a: [w, y, 0], b: [w, y, d] },
        { key: "iLvl" + id + "Mid", a: [midV, y, 0], b: [midV, y, d] }
      );
    });

    var anyActive = false;
    segs.forEach(function (seg) {
      if (!bs[seg.key]) return;
      anyActive = true;
      addPipe(
        model,
        thick,
        seg.a[0] - w / 2, seg.a[1] - h / 2, seg.a[2] - d / 2,
        seg.b[0] - w / 2, seg.b[1] - h / 2, seg.b[2] - d / 2
      );
    });

    // Fallback: simple frame outline if no strut data
    if (!anyActive) {
      [
        [[0, 0, 0], [w, 0, 0]], [[w, 0, 0], [w, h, 0]], [[w, h, 0], [0, h, 0]], [[0, h, 0], [0, 0, 0]],
        [[0, 0, d], [w, 0, d]], [[w, 0, d], [w, h, d]], [[w, h, d], [0, h, d]], [[0, h, d], [0, 0, d]],
        [[0, 0, 0], [0, 0, d]], [[w, 0, 0], [w, 0, d]], [[0, h, 0], [0, h, d]], [[w, h, 0], [w, h, d]]
      ].forEach(function (pair) {
        addPipe(
          model,
          thick,
          pair[0][0] - w / 2, pair[0][1] - h / 2, pair[0][2] - d / 2,
          pair[1][0] - w / 2, pair[1][1] - h / 2, pair[1][2] - d / 2
        );
      });
    }

    var woodThickness = 5;
    var ww = w + thick + (onlyTop ? oLR : 0);
    var wd = d + thick + (onlyTop ? oFB : 0);
    var woodGeo = new THREE.BoxGeometry(ww, woodThickness, wd);

    function addWoodAt(railCenterY, visible) {
      if (!visible) return;
      var plate = new THREE.Mesh(woodGeo, woodMat.clone());
      plate.position.set(0, railCenterY + thick / 2 + woodThickness / 2, 0);
      plate.userData.isRoomFurniture = true;
      model.add(plate);
    }

    addWoodAt(h / 2, boardTop);
    levels.forEach(function (lvl) {
      addWoodAt((parseFloat(lvl.height) || 0) - h / 2, !!lvl.wood);
    });
    addWoodAt(-h / 2, boardBottom);

    model.scale.set(SCALE, SCALE, SCALE);
    model.position.set(0, 0, 0);
    root.add(model);
    root.updateMatrixWorld(true);
    // Geometrie so verschieben, dass der innere Bounding-Box-Mittelpunkt im Ursprung liegt
    var bounds = new THREE.Box3().setFromObject(model);
    var center = bounds.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;
    bounds.setFromObject(model);
    var size = bounds.getSize(new THREE.Vector3());
    root.userData.height = size.y;
    root.userData.halfHeight = size.y / 2;
    root.userData.modelHeight = h;
    return root;
  }

  function furnitureGroundY(root) {
    var half = (root && root.userData && typeof root.userData.halfHeight === "number")
      ? root.userData.halfHeight
      : 0;
    return groundY + half;
  }

  function createFurnitureMesh(config, configIdx, copyIdx, pos) {
    var root = buildFurnitureModel(config);
    root.position.set(
      pos && typeof pos.x === "number" ? pos.x : (configIdx * 50 + copyIdx * 25) - 70,
      furnitureGroundY(root),
      pos && typeof pos.z === "number" ? pos.z : configIdx * 35
    );
    if (pos && typeof pos.rotY === "number") {
      root.rotation.y = pos.rotY;
    }
    root.rotation.x = 0;
    root.rotation.z = 0;
    root.scale.set(1, 1, 1);
    root.userData.isRoomFurniture = true;
    root.userData.id = "cfg-" + configIdx + "-" + copyIdx;
    root.userData.configIdx = configIdx;
    root.userData.copyIdx = copyIdx;
    root.traverse(function (node) {
      if (node.isMesh) node.userData.isRoomFurniture = true;
    });
    furnitureGroup.add(root);
    return root;
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
    while (obj && obj.parent && obj.parent !== furnitureGroup) {
      obj = obj.parent;
    }
    return obj && obj.parent === furnitureGroup ? obj : null;
  }

  function syncRotateBtn() {
    var btn = document.getElementById("iRoomRotateMode");
    if (!btn) return;
    btn.classList.toggle("is-active", !!rotateMode);
    btn.setAttribute("aria-pressed", rotateMode ? "true" : "false");
  }

  var savedControlsState = null;
  var cameraLocked = false;
  var frozenCamPos = null;
  var frozenTarget = null;
  var nativeControlsUpdate = null;
  var dragOffset = new THREE.Vector3();
  var lockedRotX = 0;
  var lockedRotZ = 0;
  var lockedScale = new THREE.Vector3(1, 1, 1);

  function lockCamera() {
    if (typeof controls === "undefined" || !controls || typeof camera === "undefined" || cameraLocked) return;
    cameraLocked = true;
    savedControlsState = {
      enabled: controls.enabled,
      enablePan: controls.enablePan,
      enableRotate: controls.enableRotate,
      enableZoom: controls.enableZoom,
      enableDamping: controls.enableDamping
    };
    frozenCamPos = camera.position.clone();
    frozenTarget = controls.target.clone();
    controls.enabled = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enableDamping = false;
    if (!nativeControlsUpdate) {
      nativeControlsUpdate = controls.update.bind(controls);
    }
    controls.update = function () {
      camera.position.copy(frozenCamPos);
      controls.target.copy(frozenTarget);
      camera.lookAt(controls.target);
      return false;
    };
    controls.update();
  }

  function unlockCamera() {
    if (!cameraLocked) return;
    cameraLocked = false;
    if (typeof camera !== "undefined" && typeof controls !== "undefined" && frozenCamPos && frozenTarget) {
      camera.position.copy(frozenCamPos);
      controls.target.copy(frozenTarget);
      camera.lookAt(controls.target);
    }
    frozenCamPos = null;
    frozenTarget = null;
    if (typeof controls !== "undefined" && controls) {
      if (nativeControlsUpdate) {
        controls.update = nativeControlsUpdate;
      }
      if (savedControlsState) {
        controls.enabled = savedControlsState.enabled;
        controls.enablePan = savedControlsState.enablePan;
        controls.enableRotate = savedControlsState.enableRotate;
        controls.enableZoom = savedControlsState.enableZoom;
        controls.enableDamping = savedControlsState.enableDamping;
        savedControlsState = null;
      }
      controls.update();
    }
  }

  function preserveRigidBody(obj) {
    // CAD: beim Verschieben keine Rotation/Skalierung, nur Translation
    obj.rotation.x = lockedRotX;
    obj.rotation.z = lockedRotZ;
    obj.scale.copy(lockedScale);
    obj.position.y = furnitureGroundY(obj);
  }

  function isUiTarget(event) {
    return !!(event.target.closest && (event.target.closest(".cRoomToolbar") || event.target.closest(".cClose3D")));
  }

  function groundHitFromEvent(event) {
    updatePointer(event);
    localRay.setFromCamera(pointer, camera);
    return localRay.ray.intersectPlane(groundPlane, hitPoint) ? hitPoint : null;
  }

  function angleAroundCenter(obj, point) {
    // Pivot = Objektursprung = innerer Bauteilmittelpunkt
    return Math.atan2(point.x - obj.position.x, point.z - obj.position.z);
  }

  function beginFurnitureInteract(event, clientX, clientY) {
    updatePointer(event);
    var hit = findFurnitureHit();
    if (!hit) {
      setSelected(null);
      return false;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    setSelected(hit);
    lockedRotX = hit.rotation.x;
    lockedRotZ = hit.rotation.z;
    lockedScale.copy(hit.scale);
    rotating = !!(rotateMode || event.shiftKey);
    dragging = !rotating;
    lockCamera();

    var gp = groundHitFromEvent(event);
    if (rotating) {
      if (gp) {
        rotateStartAngle = angleAroundCenter(hit, gp);
        rotateStartRotY = hit.rotation.y;
      }
    } else if (gp) {
      // Versatz Finger → Mittelpunkt, reine Translation auf dem Boden
      dragOffset.set(hit.position.x - gp.x, 0, hit.position.z - gp.z);
    }
    return true;
  }

  function onPointerDown(event) {
    if (isUiTarget(event)) return;
    if (event.pointerType === "touch") return;
    beginFurnitureInteract(event, event.clientX, event.clientY);
  }

  function onTouchStart(event) {
    if (isUiTarget(event)) return;
    if (!event.touches || !event.touches.length) return;
    var t = event.touches[0];
    beginFurnitureInteract({
      clientX: t.clientX,
      clientY: t.clientY,
      shiftKey: event.shiftKey,
      preventDefault: function () { event.preventDefault(); },
      stopImmediatePropagation: function () { event.stopImmediatePropagation(); }
    }, t.clientX, t.clientY);
  }

  function onPointerMove(event) {
    if (!selected || (!dragging && !rotating)) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    var gp = groundHitFromEvent(event);
    if (!gp) return;

    if (rotating) {
      // Nur Yaw um den inneren Mittelpunkt – kein Orbit um äußeren Punkt
      selected.rotation.y = rotateStartRotY + (angleAroundCenter(selected, gp) - rotateStartAngle);
      selected.rotation.x = lockedRotX;
      selected.rotation.z = lockedRotZ;
      selected.scale.copy(lockedScale);
      selected.position.y = furnitureGroundY(selected);
      return;
    }

    // CAD-Verschieben: nur Position XZ, Rotation und Scale unverändert
    selected.position.x = gp.x + dragOffset.x;
    selected.position.z = gp.z + dragOffset.z;
    preserveRigidBody(selected);
  }

  function onTouchMove(event) {
    if (!selected || (!dragging && !rotating)) return;
    if (!event.touches || !event.touches.length) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var t = event.touches[0];
    onPointerMove({
      clientX: t.clientX,
      clientY: t.clientY,
      preventDefault: function () {},
      stopImmediatePropagation: function () {}
    });
  }

  function onPointerUp() {
    if (!dragging && !rotating) return;
    dragging = false;
    rotating = false;
    unlockCamera();
    persistPositions();
  }

  function initUI() {
    var upload = document.getElementById("iRoomBgUpload");
    var uploadBtn = document.getElementById("iRoomBgUploadBtn");
    var resetBg = document.getElementById("iRoomBgReset");
    var placeBtn = document.getElementById("iRoomPlaceFurniture");
    var clearBtn = document.getElementById("iRoomClearFurniture");
    var rotateBtn = document.getElementById("iRoomRotateMode");

    if (uploadBtn && upload) {
      uploadBtn.addEventListener("click", function () {
        upload.click();
      });
    }

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
    if (rotateBtn) {
      rotateBtn.addEventListener("click", function () {
        rotateMode = !rotateMode;
        syncRotateBtn();
      });
      syncRotateBtn();
    }

    var canvas = (typeof renderer !== "undefined" && renderer.domElement) ? renderer.domElement : container;
    // Capture-Phase: vor OrbitControls, damit die Kamera beim Möbel-Drag nicht mitwandert
    canvas.addEventListener("pointerdown", onPointerDown, true);
    canvas.addEventListener("touchstart", onTouchStart, { capture: true, passive: false });
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerUp, true);
    window.addEventListener("touchend", onPointerUp, true);
    window.addEventListener("touchcancel", onPointerUp, true);

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
