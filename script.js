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
    const temp = data.main.temp.toFixed(1);
    const desc = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    resultBox.innerHTML = `
      <h2>${name}</h2>
      <img src="${iconUrl}" alt="${desc}" />
      <p><strong>${temp}°C</strong> – ${desc}</p>
      <p>💧 Humidity: ${humidity}%</p>
      <p>🍃 Wind Speed: ${windSpeed} m/s</p>
    `;
  } catch (err) {
    resultBox.innerHTML = `❌ ${err.message}`;
  }
}

// Trigger with Enter key
document.getElementById("cityInput")
        .addEventListener("keyup", function(e) {
          if (e.key === "Enter") getWeather();
        });