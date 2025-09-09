



if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("src/service_worker.js")
      .then(register => console.log("Service Worker registered:",register))
      .catch(err => console.log("Service Worker registration failed:", err));
  });
}

const toggleBtn = document.getElementById("tempToggle");
  const toggleCircle = document.getElementById("toggleCircle");
  const tempLabel = document.getElementById("tempLabel");

  let isCelsius = true;

  toggleBtn.addEventListener("click", () => {
    isCelsius = !isCelsius;

    if (isCelsius) {
      toggleCircle.classList.remove("translate-x-6");
      toggleBtn.classList.remove("bg-orange-500");
      toggleBtn.classList.add("bg-teal-500");
      tempLabel.textContent = "°C";
    } else {
      toggleCircle.classList.add("translate-x-6");
      toggleBtn.classList.remove("bg-teal-500");
      toggleBtn.classList.add("bg-orange-500");
      tempLabel.textContent = "°F";
    }
  });

  const dayBtn = document.getElementById("dayBtn");
  const nightBtn = document.getElementById("nightBtn");

  let isDay = true;

  function setDayMode() {
    dayBtn.classList.remove("bg-gray-300", "text-gray-600");
    dayBtn.classList.add("bg-teal-500", "text-white");

    nightBtn.classList.remove("bg-teal-500", "text-white");
    nightBtn.classList.add("bg-gray-300", "text-gray-600");

    isDay = true;
  }

  function setNightMode() {
    nightBtn.classList.remove("bg-gray-300", "text-gray-600");
    nightBtn.classList.add("bg-teal-500", "text-white");

    dayBtn.classList.remove("bg-teal-500", "text-white");
    dayBtn.classList.add("bg-gray-300", "text-gray-600");

    isDay = false;
  }

  dayBtn.addEventListener("click", setDayMode);
  nightBtn.addEventListener("click", setNightMode);

  // default mode
  setDayMode();

  // JS for Sidebar Toggle ->
  
    const sidebar = document.getElementById("sidebar");
    const openSidebar = document.getElementById("openSidebar");
    const closeSidebar = document.getElementById("closeSidebar");

    openSidebar.addEventListener("click", () => {
      sidebar.classList.remove("-translate-x-full");
    });

    closeSidebar.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
    });
   
  document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const openSidebar = document.getElementById("openSidebar");
    const closeSidebar = document.getElementById("closeSidebar");

    if (openSidebar) {
      openSidebar.addEventListener("click", () => {
        sidebar.classList.remove("-translate-x-full");
      });
    }

    if (closeSidebar) {
      closeSidebar.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
      });
    }
  });
  