const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

let index = 0;
let currentTemp = 0;
let currentWeather = "";

searchBtn.onclick = () => getWeather(searchInput.value);

document.querySelectorAll(".location-btn").forEach(b => {
    b.onclick = () => getWeather(b.dataset.location);
});

const icons = { Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️" };

async function getWeather(city) {
    if (!city) return;
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await res.json();

    const fore = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const fdata = await fore.json();

    if (data.cod === 200) {
        currentWeather = data.weather[0].main;
        currentTemp = Math.round(data.main.temp);
        updateAnimation(currentWeather);
        render(data, fdata);
    }
}

function updateAnimation(weather) {
    const bg = document.getElementById("weatherAnimation");
    bg.innerHTML = "";
    if (weather === "Clear") {
        bg.innerHTML = '<div class="sun"></div>';
    } else if (weather === "Rain") {
        for (let i = 0; i < 40; i++) {
            let drop = document.createElement("div");
            drop.className = "rain-drop";
            drop.style.left = Math.random() * 100 + "vw";
            drop.style.animationDelay = Math.random() * 2 + "s";
            bg.appendChild(drop);
        }
    } else if (weather === "Snow") {
        for (let i = 0; i < 40; i++) {
            let flake = document.createElement("div");
            flake.className = "snowflake";
            flake.innerHTML = "❄";
            flake.style.left = Math.random() * 100 + "vw";
            flake.style.animationDuration = (Math.random() * 2 + 2) + "s";
            bg.appendChild(flake);
        }
    } else {
        for (let i = 0; i < 5; i++) {
            let cloud = document.createElement("div");
            cloud.className = "cloud";
            cloud.style.top = Math.random() * 50 + "%";
            cloud.style.animationDelay = Math.random() * 10 + "s";
            bg.appendChild(cloud);
        }
    }
}

function render(current, forecast) {
    const hourly = forecast.list.slice(0, 5);
    homeSection.innerHTML = `
        <div class="current-weather">
            <h2>${current.name}</h2>
            <h1>${currentTemp}°C</h1>
            <p>${icons[currentWeather] || "🌡️"} ${currentWeather}</p>
        </div>
        <div class="swipe-container">
            <div class="swipe-slider" id="slider">
                <div class="swipe-slide"><h3>Hourly</h3>${hourly.map(h => `<p>${h.dt_txt.slice(11, 16)} - ${Math.round(h.main.temp)}°C</p>`).join("")}</div>
                <div class="swipe-slide"><h3>Tomorrow</h3><p>${forecast.list[8].dt_txt.split(" ")[0]}: ${Math.round(forecast.list[8].main.temp)}°C</p></div>
                <div class="swipe-slide"><h3>Details</h3><p>Humidity: ${current.main.humidity}%</p><p>Wind: ${current.wind.speed} m/s</p></div>
            </div>
        </div>
    `;
    index = 0;
    updateDots();
    initSwipe();
}

function askAI() {
    const q = document.getElementById("aiInput").value.toLowerCase();
    const out = document.getElementById("aiOutput");
    if (!currentWeather) { out.innerText = "Please search a city first."; return; }

    if (q.includes("temp")) out.innerText = `Abhi temperature ${currentTemp}°C hai.`;
    else if (q.includes("rain") || q.includes("baarish")) out.innerText = currentWeather === "Rain" ? "Haan, baarish ho rahi hai." : "Nahi, abhi baarish nahi hai.";
    else if (q.includes("wear")) out.innerText = currentTemp < 15 ? "Cold hai, jacket pehno." : "Garmi hai, cotton pehno.";
    else out.innerText = "Try asking about temperature or rain!";
}

function initSwipe() {
    const slider = document.getElementById("slider");
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

function goSlide(i) { index = i; updateSlider(); }

function updateSlider() {
    document.getElementById("slider").style.transform = `translateX(-${index * 100}%)`;
    updateDots();
}

function updateDots() {
    document.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === index));
}