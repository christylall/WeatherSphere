const API_KEY = "da287b27ab2c62083846949656a915d4";
const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

let index = 0;
let currentTemp = 0;
let currentWeather = "";

const icons = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Snow: "❄️",
  Thunderstorm: "⛈️",
  Drizzle: "🌦️"
};

// SEARCH EVENTS
searchBtn.onclick = () => {
  const city = searchInput.value.trim();
  if (city) getWeather(city);
};

document.querySelectorAll(".location-btn").forEach(b => {
  b.onclick = () => getWeather(b.dataset.location);
});

// GET WEATHER
async function getWeather(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();

    if (data.cod !== 200) {
      homeSection.innerHTML = `<p>City not found</p>`;
      return;
    }

    const fore = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const fdata = await fore.json();

    render(data, fdata);

  } catch (err) {
    homeSection.innerHTML = `<p>Error fetching data</p>`;
  }
}

// RENDER UI
function render(current, forecast) {

  currentTemp = current.main.temp;
  currentWeather = current.weather[0].main;

  const hourly = forecast.list ? forecast.list.slice(0, 8) : [];

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
          ${hourly.map(h => `<p>${h.dt_txt.slice(11,16)} - ${h.main.temp}°C</p>`).join("")}
        </div>

        <div class="swipe-slide">
          <h3>Tomorrow</h3>
          <p>Forecast loading soon...</p>
        </div>

        <div class="swipe-slide">
          <h3>5 Days</h3>
          <p>Forecast loading soon...</p>
        </div>

      </div>
    </div>
  `;

  index = 0;
  updateDots();
  setTimeout(initSwipe, 100);
}

// SWIPE
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

// AI CHAT
function askAI() {
  const input = document.getElementById("aiInput");
  const output = document.getElementById("aiOutput");

  const q = input.value.toLowerCase().trim();

  if (!q) {
    output.innerText = "Ask something first";
    return;
  }

  if (q.includes("temp") || q.includes("temperature")) {
    output.innerText = `${currentTemp}°C`;
  } 
  else if (q.includes("weather")) {
    output.innerText = currentWeather;
  } 
  else {
    output.innerText = "Ask: temp or weather only";
  }

  input.value = "";
}