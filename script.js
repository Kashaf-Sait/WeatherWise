const apiKey = "05ebaecbfa346ac7358838299cd7f93e";

// Format date to 12-hour clock
function formatTo12Hour(date) {
  let hrs = date.getUTCHours();
  let mins = date.getUTCMinutes();
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12 || 12;
  mins = mins < 10 ? '0' + mins : mins;
  return `${hrs}:${mins} ${ampm}`;
}

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const resultBox = document.getElementById("weatherResult");
  if (!city) return resultBox.innerHTML = "❗ Please enter a city name.";

  resultBox.innerHTML = "⏳ Fetching weather...";
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    const { name, coord, main, weather, wind, timezone } = data;

    // AQI
    const aqiData = await (await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`)).json();
    const aqiLabel = ["🟢 Good","🟡 Fair","🟠 Moderate","🔴 Poor","⚫ Very Poor"][aqiData.list[0].main.aqi - 1];

    // UV
    const uvData = await (await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`)).json();

    // Background class
    const desc = weather[0].description.toLowerCase();
    document.body.className = desc.includes("clear") ? "clear"
      : desc.includes("cloud") ? "clouds"
      : desc.includes("rain") ? "rain"
      : desc.includes("snow") ? "snow"
      : desc.includes("thunderstorm") ? "thunderstorm"
      : "default";

    // Outfit suggestion
    const temp = parseFloat(main.temp.toFixed(1));
    const outfit = temp > 30 ? "🥵 Wear light cotton clothes & stay hydrated!"
      : temp >= 20 ? "🌤 Comfortable casuals are perfect."
      : temp >= 10 ? "🧥 Wear a jacket or hoodie."
      : "❄ Bundle up! It’s very cold.";

    // Local time
    const localTime = formatTo12Hour(new Date(Date.now() + timezone * 1000));

    // Render cards
    resultBox.innerHTML = `
      <div class="weather-card">
        <div class="weather-header">
          <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${desc}" class="weather-icon"/>
          <div class="weather-summary">
            <h2>${name}</h2>
            <p class="weather-temp"><strong>${temp}°C</strong> – ${desc}</p>
          </div>
        </div>
      </div>
      <div class="weather-card weather-details">
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
        <p><strong>AQI:</strong> ${aqiLabel}</p>
        <p><strong>UV Index:</strong> ${uvData.value < 3 ? "🟢 Low" : uvData.value < 6 ? "🟡 Moderate" : uvData.value < 8 ? "🟠 High" : uvData.value < 11 ? "🔴 Very High" : "⚫ Extreme"}</p>
      </div>
      <div class="weather-card">
        <p><strong>Local Time:</strong> ${localTime}</p>
        <p class="outfit"><strong>Outfit:</strong> ${outfit}</p>
      </div>
    `;
  } catch (err) {
    document.getElementById("weatherResult").innerHTML =
      err.message === "City not found"
        ? "❌ City not found. Check spelling!"
        : `⚠ Error: ${err.message}`;
  }
}

// Enter key to search
document.getElementById("cityInput").addEventListener("keyup", e => {
  if (e.key === "Enter") getWeather();
});

// Voice input
function startVoice() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.onresult = e => {
    document.getElementById("cityInput").value = e.results[0][0].transcript;
    getWeather();
  };
  rec.onerror = e => alert("🎤 Voice error: " + e.error);
  rec.start();
}

// Theme toggle button (only icon)
const themeBtn = document.querySelector(".theme-toggle");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
  localStorage.setItem("weather-theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Load saved theme
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("weather-theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "🌞";
  }
});