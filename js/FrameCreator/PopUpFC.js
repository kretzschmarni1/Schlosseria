// Popup-Daten
const popups = [
  //!!!!  {                                  //hier kann man zusätzliches Popup machen --> ID muss eingetragen werden usw. --> wie bei erstem
  //!!!!  showButtonId: 'showPopup3',
  //!!!!  overlayId: 'popupOverlay3',
  //!!!!  closeButtonId: 'closePopup3',
  //!!!!  closeActionId: 'iDefined1',
  //!!!!  },
];

// Funktion zur Anzeige und Schließung von Popups
const togglePopup = (popup) => {
  const showButton = document.getElementById(popup.showButtonId);
  const overlay = document.getElementById(popup.overlayId);
  const closeButton = document.getElementById(popup.closeButtonId);
  const closeAction = document.getElementById(popup.closeActionId);

  showButton.addEventListener('click', () => {
    overlay.style.display = 'block';
  });

  closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  closeAction.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
};

// Popups initialisieren
popups.forEach(popup => {
  togglePopup(popup);
});