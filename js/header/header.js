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
      if (link.textContent.trim() === 'Creator') {
        link.style.display = 'none';
      }
    });
  }
});