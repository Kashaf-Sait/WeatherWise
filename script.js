function getWeather() {
  const city = document.getElementById("cityInput").value;
  const resultBox = document.getElementById("weatherResult");

  if (city === "") {
    resultBox.innerHTML = "Please enter a city name.";
    return;
  }

  resultBox.innerHTML = `Fetching weather for <strong>${city}</strong>...`;
}