const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

let index = 0;
let currentTemp = 0;
let currentWeather = "";
let currentHumidity = 0;

const icons = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Snow: "❄️",
  Thunderstorm: "⛈️"
};

/* ---------------- THEME ---------------- */
themeToggle.onclick = () => {
  document.body.classList.toggle("dark-mode");
};

/* ---------------- EVENTS ---------------- */
searchBtn.onclick = () => getWeather(searchInput.value);

document.querySelectorAll(".location-btn").forEach(b => {
  b.onclick = () => getWeather(b.dataset.location);
});

/* ---------------- FETCH WEATHER ---------------- */
async function getWeather(city) {
  if (!city) return;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();

    const fore = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const fdata = await fore.json();

    render(data, fdata);

  } catch (err) {
    homeSection.innerHTML = "<p>Weather load failed ❌</p>";
  }
}

/* ---------------- RENDER ---------------- */
function render(current, forecast) {

  currentTemp = current.main.temp;
  currentWeather = current.weather[0].main;
  currentHumidity = current.main.humidity;

  const hourly = forecast.list.slice(0, 8);

  const tomorrow = forecast.list.find(item =>
    item.dt_txt.includes("12:00:00")
  );

  const fiveDays = getFiveDays(forecast);

  homeSection.innerHTML = `
    <div class="current-weather">
      <h2>${current.name}</h2>
      <h1>${currentTemp}°C</h1>
      <p>${icons[currentWeather] || "🌡️"} ${currentWeather}</p>
    </div>

    <div class="swipe-container">
      <div class="swipe-slider" id="slider">

        <div class="swipe-slide">
          <h3>Hourly</h3>
          ${hourly.map(h =>
            `<p>${h.dt_txt.slice(11,16)} - ${h.main.temp}°C</p>`
          ).join("")}
        </div>

        <div class="swipe-slide">
          <h3>Tomorrow</h3>
          <p>${tomorrow ? tomorrow.main.temp + "°C" : "No data"}</p>
        </div>

        <div class="swipe-slide">
          <h3>5 Days</h3>
          ${fiveDays.map(d =>
            `<p>${d.dt_txt.split(" ")[0]} - ${d.main.temp}°C</p>`
          ).join("")}
        </div>

      </div>
    </div>
  `;

  index = 0;
  updateDots();
  initSwipe();

  renderSmartCards();
}

/* ---------------- 5 DAY GROUP ---------------- */
function getFiveDays(forecast) {
  const map = {};

  forecast.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!map[date]) map[date] = item;
  });

  return Object.values(map).slice(0, 5);
}

/* ---------------- SWIPE ---------------- */
function initSwipe() {
  const slider = document.getElementById("slider");
  if (!slider) return;

  let startX = 0;

  slider.ontouchstart = e => startX = e.touches[0].clientX;
  slider.ontouchend = e => move(startX - e.changedTouches[0].clientX);

  slider.onmousedown = e => startX = e.clientX;
  slider.onmouseup = e => move(startX - e.clientX);
}

function move(diff) {
  if (diff > 50 && index < 2) index++;
  if (diff < -50 && index > 0) index--;

  updateSlider();
}

function goSlide(i) {
  index = i;
  updateSlider();
}

function updateSlider() {
  const slider = document.getElementById("slider");
  if (slider) {
    slider.style.transform = `translateX(-${index * 100}%)`;
  }
  updateDots();
}

function updateDots() {
  document.querySelectorAll(".dot").forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });
}

/* ---------------- SMART CARDS ---------------- */
function renderSmartCards() {

  let dress = "";
  let crop = "";
  let disease = "";
  let remedy = "";
  let aqi = "";

  if (currentTemp > 30) dress = "Light cotton clothes ☀️";
  else if (currentTemp < 15) dress = "Warm jacket 🧥";
  else dress = "Normal clothes 👕";

  if (currentTemp > 30) crop = "Rice, sugarcane 🌾";
  else crop = "Wheat, mustard 🌱";

  if (currentHumidity > 80) disease = "Cold/flu risk 🤒";
  else disease = "Low health risk 👍";

  remedy = currentWeather === "Rain"
    ? "Avoid rain, take vitamin C 🍋"
    : "Stay hydrated 💧";

  aqi = currentHumidity > 70 ? "Moderate AQI 😷" : "Good AQI 😊";

  document.getElementById("smartCards").innerHTML = `
    <div class="card">👕 Dress: ${dress}</div>
    <div class="card">🌾 Crop: ${crop}</div>
    <div class="card">🤒 Health: ${disease}</div>
    <div class="card">💧 Remedy: ${remedy}</div>
    <div class="card">🌫️ AQI: ${aqi}</div>
  `;
}

/* ---------------- SIMPLE AI ---------------- */
function askAI() {
  const q = document.getElementById("aiInput").value.toLowerCase();
  const out = document.getElementById("aiOutput");

  if (q.includes("temp")) out.innerText = currentTemp + "°C";
  else if (q.includes("weather")) out.innerText = currentWeather;
  else if (q.includes("humidity")) out.innerText = currentHumidity + "%";
  else out.innerText = "Ask: temp, weather, humidity";
}