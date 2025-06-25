// WeatherWise JS: Fetch real data from OpenWeatherMap

const apiKey = "05ebaecbfa346ac7358838299cd7f93e";

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const resultBox = document.getElementById("weatherResult");

  if (!city) {
    resultBox.innerHTML = "❗ Please enter a city name.";
    return;
  }

  resultBox.innerHTML = "⏳ Fetching weather...";

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    const name = data.name;
    const temp = parseFloat(data.main.temp.toFixed(1));
    const desc = data.weather?.[0]?.description?.toLowerCase() || "weather info unavailable";
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const { lat, lon } = data.coord;

    // ✅ Get icon
    let iconUrl = "";
    if (data.weather && data.weather[0]?.icon) {
      const iconCode = data.weather[0].icon;
      iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    } else {
      iconUrl = "https://openweathermap.org/img/wn/01d@2x.png"; // default sunny icon
    }

    // 🌫 AQI fetch
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const aqiRes = await fetch(aqiUrl);
    const aqiData = await aqiRes.json();
    const aqiIndex = aqiData.list[0].main.aqi;

    let aqiLabel = "";
    switch (aqiIndex) {
      case 1: aqiLabel = "🟢 Good"; break;
      case 2: aqiLabel = "🟡 Fair"; break;
      case 3: aqiLabel = "🟠 Moderate"; break;
      case 4: aqiLabel = "🔴 Poor"; break;
      case 5: aqiLabel = "⚫ Very Poor"; break;
      default: aqiLabel = "Unknown";
    }

    // 🎨 Background style
    document.body.className = "";
    if (desc.includes("clear")) {
      document.body.classList.add("clear");
    } else if (desc.includes("cloud")) {
      document.body.classList.add("clouds");
    } else if (desc.includes("rain")) {
      document.body.classList.add("rain");
    } else if (desc.includes("snow")) {
      document.body.classList.add("snow");
    } else if (desc.includes("thunderstorm")) {
      document.body.classList.add("thunderstorm");
    } else {
      document.body.classList.add("default");
    }

    // 👕 Outfit Suggestion
    let outfitMsg = "";
    if (temp > 30) {
      outfitMsg = "🥵 Wear light cotton clothes & stay hydrated!";
    } else if (temp >= 20) {
      outfitMsg = "🌤 Comfortable casuals are perfect.";
    } else if (temp >= 10) {
      outfitMsg = "🧥 Wear a jacket or hoodie.";
    } else {
      outfitMsg = "❄ Bundle up! It’s very cold.";
    }

    // ✅ Display in a modern card layout
    resultBox.innerHTML = `
      <div class="weather-card">
        <div class="weather-header">
          <img src="${iconUrl}" alt="${desc}" class="weather-icon" />
          <div class="weather-summary">
            <h2>${name}</h2>
            <p class="weather-temp"><strong>${temp}°C</strong></p>
          </div>
        </div>
        <div class="weather-details">
          <p><strong>Condition:</strong> ${desc}</p>
          <p><strong>Humidity:</strong> ${humidity}%</p>
          <p><strong>Wind:</strong> ${windSpeed} m/s</p>
          <p><strong>AQI:</strong> ${aqiLabel}</p>
          <p><strong>Outfit:</strong> <em>${outfitMsg}</em></p>
        </div>
      </div>
    `;
  } catch (err) {
    resultBox.innerHTML = `❌ ${err.message}`;
  }
}

// ⌨ Trigger with Enter key
document.getElementById("cityInput").addEventListener("keyup", function (e) {
  if (e.key === "Enter") getWeather();
});