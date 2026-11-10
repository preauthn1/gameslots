window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  window.pwa = event
});