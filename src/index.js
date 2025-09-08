if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("src/service_worker.js")
      .then(register => console.log("Service Worker registered:",register))
      .catch(err => console.log("Service Worker registration failed:", err));
  });
}
