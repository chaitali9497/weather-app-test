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
  // --- Current Temp ---
  if (currentTempCelsius !== null) {
    const tempElement = document.getElementById("temperature");
    tempElement.textContent = isCelsius
      ? Math.round(currentTempCelsius)
      : Math.round(cToF(currentTempCelsius));
  }

  // --- High / Low ---
  if (forecastData.daily.length > 0) {
    let today = forecastData.daily[0].day;
    let max = isCelsius ? today.maxtemp_c : cToF(today.maxtemp_c);
    let min = isCelsius ? today.mintemp_c : cToF(today.mintemp_c);
    document.getElementById("highLow").textContent = `${Math.round(max)}° / ${Math.round(min)}°`;
  }

  // --- Feels Like ---
  if (currentTempCelsius !== null) {
    let feelsLike = forecastData.daily[0]?.day?.avgtemp_c || currentTempCelsius;
    document.getElementById("feelsLike").textContent = isCelsius
      ? `${Math.round(feelsLike)}°`
      : `${Math.round(cToF(feelsLike))}°`;
  }

  // --- Forecast Cards ---
  displayDailyForecast(); // re-render cards with correct unit
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
     // Show loader
    
    let apiKey = "ea13345dcb06454a8f5154438251109";
    let url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=yes&alerts=no`;

    let response = await fetch(url);
    let data = await response.json();

    if (data.error) {
  throw new Error(data.error.message); 
}
    
   
    updateWeatherUI(data);
    updateForecast(data);
    updateWeatherDetails(data);
    updateSunTimes(data);
    updateWindDetails(data);
    updateUVIndex(data);



     let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (!history.includes(city)) {
      history.push(city); // add new city
    }
    localStorage.setItem("searchHistory", JSON.stringify(history));
    localStorage.setItem("lastCity", city); // optional, keep last search too


    
    
  } catch (error) {
    console.error(error);
    showError(error.message || "Unable to fetch weather.");
  }
  
}


// ---- FETCH WEATHER BY COORDINATES ----
async function getWeatherByCoords(lat, lon) {
  try {
    let apiKey = "ea13345dcb06454a8f5154438251109";
    let url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=yes&alerts=no`;

    let response = await fetch(url);
    let data = await response.json();
       if (data.error) {
  throw new Error(data.error.message); 
}

    updateWeatherUI(data);
    updateForecast(data);
    updateWeatherDetails(data);
    updateSunTimes(data);
    updateWindDetails(data);
    updateUVIndex(data);


    localStorage.setItem("lastCity", data.location.name);
  } catch (error) {
    console.error(error);
    showError(error.message || "Unable to fetch weather.");
  }
}

function showError(message) {
  const errorBox = document.getElementById("error-message");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorBox.classList.add("hidden");
  }, 5000);
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
    let max = isCelsius ? day.day.maxtemp_c : cToF(day.day.maxtemp_c);
    let min = isCelsius ? day.day.mintemp_c : cToF(day.day.mintemp_c);


    let card = `
      <div class="bg-opacity-30 backdrop-blur-md rounded-xl p-4 text-center w-full">
        <p class="font-semibold">${weekday}</p>
        <p class="text-sm">${monthDay}</p>
        <img src="${icon}" alt="${day.day.condition.text}" class="w-12 h-12 mx-auto">
        <p class="font-semibold text-sm">
        ${Math.round(max)}°${isCelsius ? "C" : "F"} /
      ${Math.round(min)}°${isCelsius ? "C" : "F"}
        </p>
      </div>
    `;
    forecastContainer.innerHTML += card;
  });
}


// ---- DETECT LOCATION ----
function detectLocationWeather() {
  let lastCity = localStorage.getItem("lastCity") || "London";

  if (navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // return the promise from getWeatherByCoords
          getWeatherByCoords(pos.coords.latitude, pos.coords.longitude)
            .then(resolve)
            .catch(reject);
        },
        (err) => {
          console.error("Geolocation failed:", err.message);
          // fallback to last city
          search(lastCity).then(resolve).catch(reject);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  } else {
    return search(lastCity); // return promise from search
  }
}


function getAQIText(index) {
  switch (index) {
    case 1: return "Good";
    case 2: return "Moderate";
    case 3: return "Unhealthy (Sensitive)";
    case 4: return "Unhealthy";
    case 5: return "Very Unhealthy";
    case 6: return "Hazardous";
    default: return "--";
  }
}

function updateWeatherDetails(data) {
  document.getElementById("highLow").textContent = 
    `${data.forecast.forecastday[0].day.maxtemp_c}° / ${data.forecast.forecastday[0].day.mintemp_c}°`;

  document.getElementById("feelsLike").textContent = 
    `${data.current.feelslike_c}°`;

  document.getElementById("pressure").textContent = 
    `${data.current.pressure_mb} mb`;

  document.getElementById("humidityDetail").textContent = 
    `${data.current.humidity}%`;

  document.getElementById("visibility").textContent = 
    `${data.current.vis_km} km`;

    

  //  Air Quality (check if available)
  if (data.current.air_quality && data.current.air_quality["us-epa-index"] !== undefined) {
    let index = data.current.air_quality["us-epa-index"];
    document.getElementById("air-quality").textContent = 
      ` ${getAQIText(index)}`;
  } else {
    document.getElementById("air-quality").textContent = "--";
  }
  //  Dew Point (WeatherAPI sometimes doesn’t send it)
  if (data.current.dewpoint_c !== undefined) {
    document.getElementById("dewPoint").textContent = `${data.current.dewpoint_c}°`;
  } else {
    document.getElementById("dewPoint").textContent = "--";
  }
}



function updateSunTimes(data) {
  document.getElementById("sunrise").textContent = data.forecast.forecastday[0].astro.sunrise;
  document.getElementById("sunset").textContent = data.forecast.forecastday[0].astro.sunset;
}

function updateWindDetails(data) {
  document.getElementById("windSpeed").textContent = `${data.current.wind_kph} km/h`;
  document.getElementById("windDir").textContent = data.current.wind_dir;
  document.getElementById("windGust").textContent = `${data.current.gust_kph} km/h`;
}

function updateUVIndex(data) {
  document.getElementById("uvIndex").textContent = data.current.uv;
}




// ---- EVENT LISTENERS ----
const input = document.getElementById("search-input"); 
const submitBtn = document.getElementById("submit_btn");
const suggestions = document.getElementById("search-suggestions");
const clearBtn = document.getElementById("clearBtn");

function loadSuggestions() {
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    const suggestions = document.getElementById("search-suggestions");
    const filter = document.getElementById("search-input").value.toLowerCase();

    suggestions.innerHTML = "";

    if (history.length === 0) return suggestions.classList.add("hidden");

    // Filter the history based on input
    const filtered = history.filter(city => city.toLowerCase().startsWith(filter));

    filtered.reverse().forEach(city => {
        const li = document.createElement("li");

        // Highlight matching part
        const matchText = city.substring(0, filter.length);
        const restText = city.substring(filter.length);
        li.innerHTML = `<span class="highlight">${matchText}</span>${restText}`;

        li.classList.add("cursor-pointer", "p-2", "hover:bg-gray-200");
        li.addEventListener("click", () => {
            document.getElementById("search-input").value = city;
            search(city);
            suggestions.classList.add("hidden");
        });
        suggestions.appendChild(li);
    });

    suggestions.classList.toggle("hidden", filtered.length === 0);
}

// Hide suggestions on blur
document.getElementById("search-input").addEventListener("blur", () => {
    setTimeout(() => document.getElementById("search-suggestions").classList.add("hidden"), 150);
});

// Show suggestions on input
document.getElementById("search-input").addEventListener("input", loadSuggestions);



// Add focus listener to input
input.addEventListener("focus", () => {
    loadSuggestions(); // show dropdown when input is focused
});


submitBtn.addEventListener("click", () => {
  const query = input.value.trim();
  if (query === "") {
    showError("Please enter a city name.");
    return;
  }
  if (!/^[a-zA-Z\s]+$/.test(query)) {
    showError("Please enter a valid city name.");
    return;
  }

  search(query);       // Call your search function
  input.value = "";    // Clear input

  // Hide suggestions after search
  suggestions.classList.add("hidden");
});




  

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.classList.add("hidden");
  searchInput.focus();
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

  


document.getElementById("get-location").addEventListener("click", () => {
  detectLocationWeather();
});


// Loader
function showLoader() {
  const loader = document.getElementById("loader");
  loader.style.display = "flex"; // make it visible
  setTimeout(() => {
    loader.classList.add("show"); // fade in smoothly
  }, 2000); // small delay so transition applies
  document.getElementById("app").classList.add("hidden");
}

function hideLoader() {
  const loader = document.getElementById("loader");
  loader.classList.remove("show"); // start fade out
  setTimeout(() => {
    loader.style.display = "none"; // hide after fade out
    document.getElementById("app").classList.remove("hidden");
  }, 2000); // match transition duration
}




// ---- INITIAL LOAD ----
window.onload = () => {
  document.body.style.backgroundImage = "url('src/images/cloudy.jpg')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  showLoader(); // show loader before fetching

  detectLocationWeather()
    .then(() => {
      hideLoader(); // hide loader only after weather data updates
    })
    .catch((err) => {
      console.error("Error loading weather:", err);
      hideLoader(); // hide loader even if there’s an error
    });
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
