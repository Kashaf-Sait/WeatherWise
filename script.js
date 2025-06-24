// WeatherWise JS: Fetch real data from OpenWeatherMap

// 1. Your actual API key
const apiKey = "05ebaecbfa346ac7358838299cd7f93e";

// 2. Main function
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const resultBox = document.getElementById("weatherResult");

  // 3. Validate input
  if (!city) {
    resultBox.innerHTML = "❗ Please enter a city name.";
    return;
  }

  // 4. Show loading message
  resultBox.innerHTML = "⏳ Fetching weather...";

  try {
    // 5. Build the URL
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    // 6. Fetch data
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    // 7. Extract needed info
    const name = data.name;
    const temp = data.main.temp.toFixed(1);
    const desc = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // 8. Display it
    resultBox.innerHTML = `
      <h2>${name}</h2>
      <img src="${iconUrl}" alt="${desc}" />
      <p><strong>${temp}°C</strong> – ${desc}</p>
    `;
  } catch (err) {
    resultBox.innerHTML = `❌ ${err.message}`;
  }
}

// 9. (Optional) Allow pressing Enter to fetch
document.getElementById("cityInput")
        .addEventListener("keyup", function(e) {
          if (e.key === "Enter") getWeather();
        });