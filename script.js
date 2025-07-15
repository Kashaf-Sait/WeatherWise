const apiKey = "05ebaecbfa346ac7358838299cd7f93e";

/* ---------- Helpers ---------- */
function formatTo12Hour(date) {
  let hrs = date.getUTCHours();
  let mins = date.getUTCMinutes();
  const ampm = hrs >= 12 ? "PM" : "AM";
  hrs = hrs % 12 || 12;
  mins = mins < 10 ? "0" + mins : mins;
  return `${hrs}:${mins} ${ampm}`;
}

/* ---------- Main ---------- */
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const resultBox = document.getElementById("weatherResult");
  const forecastTitle = document.getElementById("forecastTitle");
  const forecastContainer = document.getElementById("forecastCards");
  const chartContainer = document.querySelector(".chart-container");
  const chartCanvas = document.getElementById("tempChart");

  if (!city) {
    resultBox.innerHTML = "❗ Please enter a city name.";
    return;
  }

  // Reset UI
  resultBox.innerHTML = "⏳ Fetching weather...";
  forecastContainer.innerHTML = "";
  forecastTitle.style.display = "none";
  chartContainer.style.display = "none";

  try {
    // --- Current Weather ---
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&units=metric&appid=${apiKey}`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    const { name, coord, main, weather, wind, timezone } = data;

    // AQI
    const aqiRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`
    );
    if (!aqiRes.ok) throw new Error("AQI fetch failed");
    const aqiData = await aqiRes.json();
    const aqiLabel =
      ["🟢 Good", "🟡 Fair", "🟠 Moderate", "🔴 Poor", "⚫ Very Poor"][
        aqiData.list[0].main.aqi - 1
      ];

    // UV (One Call API 3.0)
    let uvLabel = "—";
    try {
      const oneRes = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}`
      );
      if (oneRes.ok) {
        const oneData = await oneRes.json();
        const uvi = oneData.current.uvi ?? null;
        if (uvi !== null) {
          uvLabel =
            uvi < 3
              ? "🟢 Low"
              : uvi < 6
              ? "🟡 Moderate"
              : uvi < 8
              ? "🟠 High"
              : uvi < 11
              ? "🔴 Very High"
              : "⚫ Extreme";
        }
      }
    } catch { /* ignore */ }

    // Background
    const desc = weather[0].description.toLowerCase();
    document.body.className = desc.includes("clear")
      ? "clear"
      : desc.includes("cloud")
      ? "clouds"
      : desc.includes("rain")
      ? "rain"
      : desc.includes("snow")
      ? "snow"
      : desc.includes("thunderstorm")
      ? "thunderstorm"
      : "default";

    // Outfit & Local time
    const temp = parseFloat(main.temp.toFixed(1));
    const outfit =
      temp > 30
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
        <p><strong>UV Index:</strong> ${uvLabel}</p>
      </div>
      <div class="weather-card">
        <p><strong>Local Time:</strong> ${localTime}</p>
        <p class="outfit"><strong>Outfit:</strong> ${outfit}</p>
      </div>
    `;

    // --- Forecast + Chart ---
    const fRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&units=metric&appid=${apiKey}`
    );
    if (!fRes.ok) throw new Error("Forecast fetch failed");
    const fData = await fRes.json();

    const labels = [];
    const temps = [];

    fData.list
      .filter((i) => i.dt_txt.includes("12:00:00"))
      .slice(0, 3)
      .forEach((i) => {
        const d = new Date(i.dt * 1000);
        const day = d.toLocaleDateString("en-US", { weekday: "short" });
        const icon = i.weather[0].icon;
        const t = i.main.temp.toFixed(1);
        const desc2 = i.weather[0].description;

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

    // Reveal forecast & chart
    forecastTitle.style.display = "block";
    chartContainer.style.display = "block";

    // Destroy old chart if any
    if (window.tempChartInstance) window.tempChartInstance.destroy();
    const ctx = chartCanvas.getContext("2d");
    const dark = document.body.classList.contains("dark");

    // NEW: Bar chart config
    window.tempChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Temperature (°C)",
          data: temps,
          backgroundColor: dark
            ? "rgba(144, 202, 249, 0.6)"
            : "rgba(2, 136, 209, 0.6)",
          borderColor: dark
            ? "rgba(144, 202, 249, 1)"
            : "rgba(2, 136, 209, 1)",
          borderWidth: 1
        }]
      },
      options: {
        animation: { duration: 600, easing: "easeOutQuart" },
        maintainAspectRatio: false,
        responsive: true,
        layout: { padding: { top:10, bottom:10, left:10, right:10 } },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: dark ? "#f0f0f0" : "#333",
              font: { family: "Inter", size: 12 }
            }
          },
          y: {
            beginAtZero: false,
            grid: { color: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
            ticks: {
              color: dark ? "#f0f0f0" : "#333",
              font: { family: "Inter", size: 12 },
              callback: v => v.toFixed(1)
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: { family: "Inter", size: 14 },
              color: dark ? "#f0f0f0" : "#333"
            }
          },
          tooltip: {
            backgroundColor: dark ? "#333" : "#fff",
            titleColor:      dark ? "#90caf9" : "#0288d1",
            bodyColor:       dark ? "#f0f0f0" : "#333",
            borderColor:     dark ? "#90caf9" : "#0288d1",
            borderWidth:     1,
            titleFont:       { family: "Inter", size: 14 },
            bodyFont:        { family: "Inter", size: 12 }
          }
        }
      }
    });
  } catch (err) {
    resultBox.innerHTML =
      err.message === "City not found"
        ? "❌ City not found. Check spelling!"
        : `⚠ Error: ${err.message}`;
  }
}

/* ---------- UX bits ---------- */
document.getElementById("cityInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") getWeather();
});

function startVoice() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.onresult = (e) => {
    document.getElementById("cityInput").value = e.results[0][0].transcript;
    getWeather();
  };
  rec.onerror = (e) => alert("🎤 Voice error: " + e.error);
  rec.start();
}

const themeBtn = document.getElementById("themeBtn");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
  localStorage.setItem(
    "weather-theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("weather-theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "🌞";
  }
});

async function getLocationWeather() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude: lat, longitude: lon } }) => {
      try {
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
        );
        if (!geoRes.ok) throw new Error("Geo lookup failed");
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
    },
    () => alert("Unable to access location.")
  );
}
