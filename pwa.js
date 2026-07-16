
function installPrompt() {
  // if the deferredEvent exists, call its prompt method to display the install dialog
  if(window.deferredPrompt) {
    window.deferredPrompt.prompt();
  }
};

