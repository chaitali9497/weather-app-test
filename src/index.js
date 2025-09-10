
    

let currentTempCelsius = null; // store Celsius temp
let isCelsius = localStorage.getItem("unit") !== "F";

// Convert Celsius → Fahrenheit
function cToF(celsius) {
  return (celsius * 9/5) + 32;
}

// Update temperature display depending on unit
function updateTemperatureDisplay() {
  const tempElement = document.getElementById("temperature");
  if (currentTempCelsius === null) return;

  if (isCelsius) {
    tempElement.textContent = Math.round(currentTempCelsius);
    document.getElementById("celsius").classList.add("font-bold", "text-black");
    document.getElementById("celsius").classList.remove("text-gray-500");
    document.getElementById("fahrenheit").classList.remove("font-bold", "text-black");
    document.getElementById("fahrenheit").classList.add("text-gray-500");
  } else {
    tempElement.textContent = Math.round(cToF(currentTempCelsius));
    document.getElementById("fahrenheit").classList.add("font-bold", "text-black");
    document.getElementById("fahrenheit").classList.remove("text-gray-500");
    document.getElementById("celsius").classList.remove("font-bold", "text-black");
    document.getElementById("celsius").classList.add("text-gray-500");
  }
}

// ✅ Fetch weather by city name
async function search(city) {
  try {
    let apiKey = "5ce165099db98eb1a4172c9b8eea4597";
    let currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    let response = await fetch(currentWeatherUrl);
    if (!response.ok) throw new Error("City not found");
    let data = await response.json();

    // Update location
    document.getElementById("city-name").textContent = data.name;
    document.getElementById("country-name").textContent = data.sys.country;

    // Save Celsius temp & update display
    currentTempCelsius = data.main.temp;
    updateTemperatureDisplay();

    // Update weather description
    document.getElementById("weather-desc").textContent = data.weather[0].description;

    // Weather icon
    let iconCode = data.weather[0].icon;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Extra Weather Info
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
    let windKmh = (data.wind.speed * 3.6).toFixed(1);
    document.getElementById("wind").textContent = `Wind: ${windKmh} km/h`;

    let precipitation = 0;
    if (data.rain && data.rain["1h"]) precipitation = data.rain["1h"];
    else if (data.snow && data.snow["1h"]) precipitation = data.snow["1h"];
    document.getElementById("precipitation").textContent = `Precipitation: ${precipitation} mm`;

    // Date & Time
    let now = new Date();
    let options = { weekday: "long", day: "numeric", month: "long" };
    document.getElementById("current-date").textContent = now.toLocaleDateString(undefined, options);
    document.getElementById("current-time").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Save last city
    localStorage.setItem("lastCity", city);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// ✅ Fetch weather by GPS coordinates
async function getWeatherByCoords(lat, lon) {
  let apiKey = "5ce165099db98eb1a4172c9b8eea4597";
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    let response = await fetch(url);
    if (!response.ok) throw new Error("Unable to fetch location weather");
    let data = await response.json();

    // Reuse search logic by passing city name
    search(data.name);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// ✅ Detect current location and fetch weather
function detectLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error(err);
        let lastCity = localStorage.getItem("lastCity") || "London";
        search(lastCity);
      }
    );
  } else {
    let lastCity = localStorage.getItem("lastCity") || "London";
    search(lastCity);
  }
}

// 🔹 Search by Enter key
const input = document.querySelector('input[placeholder="Search location..."]');
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && input.value.trim() !== "") {
    search(input.value.trim());
    input.value = "";
  }
});

// 🔹 Toggle click events
document.getElementById("celsius").addEventListener("click", () => {
  isCelsius = true;
  localStorage.setItem("unit", "C");
  updateTemperatureDisplay();
});
document.getElementById("fahrenheit").addEventListener("click", () => {
  isCelsius = false;
  localStorage.setItem("unit", "F");
  updateTemperatureDisplay();
});

// 🔹 Load last search or detect location on startup
window.onload = () => {
  document.body.style.backgroundImage = "url('src/images/cloudy.jpg')";// Set your desired background image here
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";

  detectLocationWeather(); // Load weather on startup
};
document.getElementById("get-location").addEventListener("click", () => {
  detectLocationWeather();
});




if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("src/service_worker.js")
      .then(register => console.log("Service Worker registered:",register))
      .catch(err => console.log("Service Worker registration failed:", err));
  });
}

