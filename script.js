const apiKey = "05ebaecbfa346ac7358838299cd7f93e";

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
  const forecastTitle = document.getElementById("forecastTitle");
  const forecastContainer = document.getElementById("forecastCards");
  const chartCanvas = document.getElementById("tempChart");

  if (!city) return resultBox.innerHTML = "❗ Please enter a city name.";

  // Reset
  resultBox.innerHTML = "⏳ Fetching weather...";
  forecastContainer.innerHTML = "";
  forecastTitle.style.display = "none";
  chartCanvas.style.display = "none";

  try {
    // --- Current Weather ---
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    const { name, coord, main, weather, wind, timezone } = data;

    // AQI
    const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`);
    const aqiData = await aqiRes.json();
    const aqiLabel = ["🟢 Good","🟡 Fair","🟠 Moderate","🔴 Poor","⚫ Very Poor"][aqiData.list[0].main.aqi - 1];

    // UV
    const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`);
    const uvData = await uvRes.json();

    // Background
    const desc = weather[0].description.toLowerCase();
    document.body.className = desc.includes("clear") ? "clear"
      : desc.includes("cloud") ? "clouds"
      : desc.includes("rain") ? "rain"
      : desc.includes("snow") ? "snow"
      : desc.includes("thunderstorm") ? "thunderstorm"
      : "default";

    // Outfit & Local time
    const temp = parseFloat(main.temp.toFixed(1));
    const outfit = temp > 30
      ? "🥵 Wear light cotton clothes & stay hydrated!"
      : temp >= 20
      ? "🌤 Comfortable casuals are perfect."
      : temp >= 10
      ? "🧥 Wear a jacket or hoodie."
      : "❄ Bundle up! It’s very cold.";
    const localTime = formatTo12Hour(new Date(Date.now() + timezone * 1000));

    // Render current cards
    resultBox.innerHTML = `
      <div class="weather-card">
        <div class="weather-header">
          <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png"
               alt="${desc}" class="weather-icon"/>
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
        <p><strong>UV Index:</strong> ${
          uvData.value < 3 ? "🟢 Low"
          : uvData.value < 6 ? "🟡 Moderate"
          : uvData.value < 8 ? "🟠 High"
          : uvData.value < 11 ? "🔴 Very High"
          : "⚫ Extreme"
        }</p>
      </div>
      <div class="weather-card">
        <p><strong>Local Time:</strong> ${localTime}</p>
        <p class="outfit"><strong>Outfit:</strong> ${outfit}</p>
      </div>
    `;

    // --- Forecast + Chart ---
    const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
    const fData = await fRes.json();

    const labels = [];
    const temps = [];

    fData.list
      .filter(item => item.dt_txt.includes("12:00:00"))
      .slice(0, 3)
      .forEach(item => {
        const d = new Date(item.dt * 1000);
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = item.weather[0].icon;
        const t = item.main.temp.toFixed(1);
        const desc2 = item.weather[0].description;

        // Forecast card
        forecastContainer.innerHTML += `
          <div class="weather-card">
            <p><strong>${day}</strong></p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png"
                 alt="${desc2}" class="weather-icon"/>
            <p><strong>${t}°C</strong></p>
            <p>${desc2}</p>
          </div>
        `;

        labels.push(day);
        temps.push(t);
      });

    // Show forecast title & chart
    forecastTitle.style.display = "block";
    chartCanvas.style.display = "block";

// Render Chart.js (line chart, smooth curve)
const ctx = chartCanvas.getContext("2d");
if (window.tempChartInstance) window.tempChartInstance.destroy();

window.tempChartInstance = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "Temperature (°C)",
      data: temps,
      borderColor: chartCanvas.closest('body').classList.contains('dark') ? '#90caf9' : '#0288d1',
      backgroundColor: 'rgba(0,0,0,0)',  // transparent fill
      tension: 0.4,                       // smooth curves
      pointBackgroundColor: chartCanvas.closest('body').classList.contains('dark') ? '#fff' : '#0288d1',
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chartCanvas.closest('body').classList.contains('dark') ? '#f0f0f0' : '#333' }
      },
      y: {
        beginAtZero: false,
        grid: { color: chartCanvas.closest('body').classList.contains('dark') ? '#444' : '#ddd' },
        ticks: { color: chartCanvas.closest('body').classList.contains('dark') ? '#f0f0f0' : '#333' }
      }
    },
    plugins: {
      legend: {
        labels: { color: chartCanvas.closest('body').classList.contains('dark') ? '#f0f0f0' : '#333' }
      },
      tooltip: {
        backgroundColor: chartCanvas.closest('body').classList.contains('dark') ? '#333' : '#fff',
        titleColor: chartCanvas.closest('body').classList.contains('dark') ? '#90caf9' : '#0288d1',
        bodyColor: chartCanvas.closest('body').classList.contains('dark') ? '#f0f0f0' : '#333',
        borderColor: chartCanvas.closest('body').classList.contains('dark') ? '#90caf9' : '#0288d1',
        borderWidth: 1
      }
    }
  }
});


  } catch (err) {
    resultBox.innerHTML = err.message === "City not found"
      ? "❌ City not found. Check spelling!"
      : `⚠ Error: ${err.message}`;
  }
}

// Search on Enter
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

// Theme toggle
const themeBtn = document.querySelector(".theme-toggle");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
  localStorage.setItem("weather-theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("weather-theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "🌞";
  }
});

// Geolocation
function getLocationWeather() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
      const geoData = await geoRes.json();
      const city = geoData[0]?.name;
      if (city) {
        document.getElementById("cityInput").value = city;
        getWeather();
      } else {
        alert("Unable to detect city.");
      }
    } catch {
      alert("Error fetching location.");
    }
  }, () => alert("Unable to access location."));
}
