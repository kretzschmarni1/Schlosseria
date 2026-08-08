function toggleMenu() {
    var menu = document.getElementById("iDropdownMenu");
    menu.classList.toggle("show");

  }
  
  // Schließt das Menü, wenn außerhalb geklickt wird
  document.addEventListener("click", function(event) {
    var menu = document.getElementById("iDropdownMenu");
    var button = document.querySelector(".cMenu-icon");
  
    if (!menu.contains(event.target) && !button.contains(event.target)) {
      menu.classList.remove("show");
    }
  });






//Seite auf 500px scalieren wenn kleiner
document.addEventListener("DOMContentLoaded", function () {

if (window.innerWidth < 500) {
    document.body.style.zoom = window.innerWidth / 500;   
}

if (!localStorage.getItem("creatorUnlocked")) {
    document.querySelectorAll('#menu a, #iDropdownMenu a').forEach(function(link) {
      var text = link.textContent.trim();
      if (text === 'Creator' || text === 'Accessoires') {
        link.style.display = 'none';
      }
    });
  }

  // Warenkorb-Badge
  var cartImg = document.querySelector('.cWare');
  var cartLink = cartImg ? cartImg.parentElement : null;
  if (cartLink) {
    cartLink.style.position = 'relative';
    cartLink.style.overflow = 'visible';
    cartLink.style.display = 'inline-block';
    var badge = document.createElement('span');
    badge.className = 'cCartBadge';
    cartLink.appendChild(badge);

    function updateBadge() {
      var configs = JSON.parse(localStorage.getItem('configurations')) || [];
      if (configs.length > 0) {
        badge.textContent = configs.length;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }

    updateBadge();
    window.addEventListener('storage', updateBadge);
    setInterval(updateBadge, 2000);
  }
});