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
    // 1. Fetch current weather
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    const { name, coord, main, weather, wind, timezone } = data;
    const temp = parseFloat(main.temp.toFixed(1));
    const desc = (weather[0]?.description || "").toLowerCase();
    const humidity = main.humidity;
    const windSpeed = wind.speed;
    const { lat, lon } = coord;

    // 2. Fetch AQI
    const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const aqiData = await aqiRes.json();
    const aqiIndex = aqiData.list[0].main.aqi;
    const aqiLabel = ["🟢 Good","🟡 Fair","🟠 Moderate","🔴 Poor","⚫ Very Poor"][aqiIndex-1] || "Unknown";

    // 3. Fetch UV Index
    const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const uvData = await uvRes.json();
    const uv = uvData.value;
    const uvLabel = uv < 3 ? "🟢 Low" : uv < 6 ? "🟡 Moderate" : uv < 8 ? "🟠 High" : uv < 11 ? "🔴 Very High" : "⚫ Extreme";

    // 4. Determine background class
    document.body.className = "";
    if (desc.includes("clear"))       document.body.classList.add("clear");
    else if (desc.includes("cloud"))  document.body.classList.add("clouds");
    else if (desc.includes("rain"))   document.body.classList.add("rain");
    else if (desc.includes("snow"))   document.body.classList.add("snow");
    else if (desc.includes("thunderstorm")) document.body.classList.add("thunderstorm");
    else                               document.body.classList.add("default");

    // 5. Outfit suggestion
    const outfitMsg = temp > 30
      ? "🥵 Wear light cotton clothes & stay hydrated!"
      : temp >= 20
      ? "🌤 Comfortable casuals are perfect."
      : temp >= 10
      ? "🧥 Wear a jacket or hoodie."
      : "❄ Bundle up! It’s very cold.";

    // 6. Local time (12-hour format)
    const localDate = new Date(Date.now() + timezone * 1000);
    function formatTo12Hour(date) {
      let hours = date.getUTCHours();
      let minutes = date.getUTCMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutes} ${ampm}`;
    }
    const localTimeStr = formatTo12Hour(localDate);

    // 7. Display card
    resultBox.innerHTML = `
      <div class="weather-card">
        <div class="weather-header">
          <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${desc}" class="weather-icon" />
          <div class="weather-summary">
            <h2>${name}</h2>
            <p class="weather-temp"><strong>${temp}°C</strong> – ${desc}</p>
            <p>⏰ ${localTimeStr}</p>
          </div>
        </div>
        <div class="weather-details">
          <p><strong>Humidity:</strong> ${humidity}%</p>
          <p><strong>Wind:</strong> ${windSpeed} m/s</p>
          <p><strong>AQI:</strong> ${aqiLabel}</p>
          <p><strong>UV Index:</strong> ${uvLabel}</p>
          <p class="outfit"><strong>Outfit:</strong> ${outfitMsg}</p>
        </div>
      </div>
    `;
  } catch (err) {
    resultBox.innerHTML = err.message.includes("City not found")
      ? "❌ City not found. Please check spelling!"
      : `⚠ Error: ${err.message}`;
  }
}

// Enter key + Voice recognition
document.getElementById("cityInput")
  .addEventListener("keyup", e => { if (e.key === "Enter") getWeather(); });

function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.onresult = e => {
    document.getElementById("cityInput").value = e.results[0][0].transcript;
    getWeather();
  };
  recognition.onerror = e => alert("🎤 Voice error: " + e.error);
  recognition.start();
}