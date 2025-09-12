let currentTempCelsius = null; // store Celsius temp
let isCelsius = localStorage.getItem("unit") !== "F";

// Store forecast and timezone
let forecastData = { daily: [], hourly: [], timezone: "UTC" };

function cToF(celsius) {
  return (celsius * 9 / 5) + 32;
}

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

// ---- GLOBAL CLOCK FUNCTION ----
function startCityClock(timezone) {
  function updateClock() {
    let cityTime = new Date().toLocaleString("en-US", { timeZone: timezone });
    let dateObj = new Date(cityTime);

    let options = { weekday: "long", day: "numeric", month: "long" };
    document.getElementById("current-date").textContent =
      dateObj.toLocaleDateString("en-GB", options);

    document.getElementById("current-time").textContent =
      dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  updateClock();
  clearInterval(window.cityClockTimer);
  window.cityClockTimer = setInterval(updateClock, 60000);
}

// ---- FETCH WEATHER BY CITY NAME ----
async function search(city) {
  try {
    let apiKey = "ea13345dcb06454a8f5154438251109";
    let url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=no&alerts=no`;

    let response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    let data = await response.json();

    updateWeatherUI(data);
    updateForecast(data);

    localStorage.setItem("lastCity", city);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// ---- FETCH WEATHER BY COORDINATES ----
async function getWeatherByCoords(lat, lon) {
  try {
    let apiKey = "ea13345dcb06454a8f5154438251109";
    let url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;

    let response = await fetch(url);
    if (!response.ok) throw new Error("Unable to fetch location weather");
    let data = await response.json();

    updateWeatherUI(data);
    updateForecast(data);

    localStorage.setItem("lastCity", data.location.name);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// ---- UPDATE WEATHER UI ----
function updateWeatherUI(data) {
  document.getElementById("city-name").textContent = data.location.name;
  document.getElementById("country-name").textContent = data.location.country;

  currentTempCelsius = data.current.temp_c;
  updateTemperatureDisplay();

  document.getElementById("weather-desc").textContent = data.current.condition.text;
  document.getElementById("weather-icon").src = "https:" + data.current.condition.icon;

  document.getElementById("humidity").textContent = `Humidity: ${data.current.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${data.current.wind_kph} km/h`;
  document.getElementById("precipitation").textContent =
    `Precipitation: ${data.current.precip_mm} mm`;

  startCityClock(data.location.tz_id);
}

// ---- FORECAST ----
function updateForecast(data) {
  forecastData.daily = data.forecast.forecastday;
  forecastData.hourly = data.forecast.forecastday[0].hour;
  forecastData.timezone = data.location.tz_id; // Store timezone for hourly formatting

  displayDailyForecast();
 ;
}

function displayDailyForecast() {
  let forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  forecastData.daily.slice(1, 8).forEach((day) => {
    let date = new Date(day.date);
    let weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    let monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    let icon = "https:" + day.day.condition.icon;

    let card = `
      <div class="bg-opacity-30 backdrop-blur-md rounded-xl p-4 text-center w-full">
        <p class="font-semibold">${weekday}</p>
        <p class="text-sm">${monthDay}</p>
        <img src="${icon}" alt="${day.day.condition.text}" class="w-12 h-12 mx-auto">
        <p class="font-semibold">${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</p>
      </div>
    `;
    forecastContainer.innerHTML += card;
  });
}






// ---- DETECT LOCATION ----
function detectLocationWeather() {
  let lastCity = localStorage.getItem("lastCity") || "London";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error("Geolocation failed:", err.message);
        search(lastCity); // fallback
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    search(lastCity);
  }
}

// ---- EVENT LISTENERS ----
const input = document.querySelector('input[placeholder="Search location..."]');
const submitBtn = document.getElementById("submit_btn");

submitBtn.addEventListener("click", () => {
  if (input.value.trim() !== "") {
    search(input.value.trim());
    input.value = "";
  }
});

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

document.getElementById("dailyBtn").addEventListener("click", () => {
 displayDailyForecast();
  
});

document.getElementById("get-location").addEventListener("click", () => {
  detectLocationWeather();
});


// ---- INITIAL LOAD ----
window.onload = () => {
  document.body.style.backgroundImage = "url('src/images/cloudy.jpg')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  detectLocationWeather();
};

// ---- SERVICE WORKER ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("src/service_worker.js")
      .then(register => console.log("Service Worker registered:", register))
      .catch(err => console.log("Service Worker registration failed:", err));
  });
}
