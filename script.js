// WeatherWise JS: Enhanced Version with Icons, Theme Toggle & Ripple

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
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    const { name, coord, main, weather, wind, timezone } = data;
    const temp = parseFloat(main.temp.toFixed(1));
    const desc = (weather[0]?.description || "").toLowerCase();
    const humidity = main.humidity;
    const windSpeed = wind.speed;
    const { lat, lon } = coord;

    // 🟫 AQI
    const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const aqiData = await aqiRes.json();
    const aqiIndex = aqiData.list[0].main.aqi;
    const aqiLabel = ["🟢 Good", "🟡 Fair", "🟠 Moderate", "🔴 Poor", "⚫ Very Poor"][aqiIndex - 1] || "Unknown";

    // ☀ UV Index
    const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const uvData = await uvRes.json();
    const uv = uvData.value;
    const uvLabel = uv < 3 ? "🟢 Low" : uv < 6 ? "🟡 Moderate" : uv < 8 ? "🟠 High" : uv < 11 ? "🔴 Very High" : "⚫ Extreme";

    // 🎨 Background class based on weather
    document.body.className = "";
    if (desc.includes("clear")) document.body.classList.add("clear");
    else if (desc.includes("cloud")) document.body.classList.add("clouds");
    else if (desc.includes("rain")) document.body.classList.add("rain");
    else if (desc.includes("snow")) document.body.classList.add("snow");
    else if (desc.includes("thunderstorm")) document.body.classList.add("thunderstorm");
    else document.body.classList.add("default");

    // 🧥 Outfit suggestion
    const outfitMsg =
      temp > 30 ? "🥵 Wear light cotton clothes & stay hydrated!" :
      temp >= 20 ? "🌤 Comfortable casuals are perfect." :
      temp >= 10 ? "🧥 Wear a jacket or hoodie." :
      "❄ Bundle up! It’s very cold.";

    // ⏰ Format local time (12hr)
    const localDate = new Date(Date.now() + timezone * 1000);
    const localTimeStr = (() => {
      let hrs = localDate.getUTCHours();
      let min = localDate.getUTCMinutes();
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12 || 12;
      return `${hrs}:${min < 10 ? '0' + min : min} ${ampm}`;
    })();

    // 🌤 Feather icon selection
    const weatherMain = weather[0].main.toLowerCase();
    const iconMap = {
      clear: 'sun',
      clouds: 'cloud',
      rain: 'cloud-rain',
      snow: 'cloud-snow',
      thunderstorm: 'cloud-lightning'
    };
    const featherIcon = iconMap[weatherMain] || 'cloud';

    // 🧾 Inject Result
    resultBox.innerHTML = `
      <div class="weather-card">
        <div class="weather-header">
          <i data-feather="${featherIcon}" class="weather-icon"></i>
          <div class="weather-summary">
            <h2>${name}</h2>
            <p class="weather-temp"><strong>${temp}°C</strong> – ${desc}</p>
          </div>
        </div>
      </div>

      <div class="weather-card weather-details">
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
        <p><strong>AQI:</strong> ${aqiLabel}</p>
        <p><strong>UV Index:</strong> ${uvLabel}</p>
      </div>

      <div class="weather-card">
        <p><strong>Local Time:</strong> ${localTimeStr}</p>
        <p class="outfit"><strong>Outfit Suggestion:</strong> ${outfitMsg}</p>
      </div>
    `;

    // Render Feather icons
    if (window.feather) feather.replace();

  } catch (err) {
    resultBox.innerHTML = err.message.includes("City not found")
      ? "❌ City not found. Please check spelling!"
      : `⚠ Error: ${err.message}`;
  }
}

// 🎙 Voice input
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

// ⌨ Enter key trigger
document.getElementById("cityInput")
  .addEventListener("keyup", e => { if (e.key === "Enter") getWeather(); });

// 🌗 Theme toggle
document.getElementById("themeToggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const btn = document.getElementById("themeToggle");
  btn.textContent = document.body.classList.contains("dark") ? "☀" : "🌙";
});

// 💧 Button ripple click tracking
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", e => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
    btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
  });