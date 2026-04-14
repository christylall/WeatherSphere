const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;
let currentSlideIndex = 0;

const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️",
    Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️"
};

/* --- QUICK CITY BUTTONS --- */
document.querySelectorAll(".location-btn").forEach(btn => {
    btn.addEventListener("click", () => getWeather(btn.dataset.location));
});

/* --- AQI FETCH --- */
async function getAQI(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    } catch { return "--"; }
}

/* --- GET WEATHER --- */
async function getWeather(city) {
    homeSection.innerHTML = "<p class='loading-text'>Fetching Weather Data...</p>";
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        renderWeather(current, forecast);
    } catch (err) {
        homeSection.innerHTML = "<p>City not found. Try again!</p>";
    }
}

async function getWeatherByLocation(lat, lon) {
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        renderWeather(current, forecast);
    } catch (err) { console.error(err); }
}

/* --- RENDER EVERYTHING --- */
async function renderWeather(current, forecast) {
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
    const aqi = await getAQI(current.coord.lat, current.coord.lon);
    currentSlideIndex = 0;

    const dailyData = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
    });

    const dayKeys = Object.keys(dailyData);
    const fiveDayList = dayKeys.slice(1, 6);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${weatherIcons[currentWeather] || "🌡️"} ${current.weather[0].description}</p>
    </div>

    <div class="aqi-card"><h3>Air Quality: ${aqi}</h3></div>
    <div class="prevention-card"><h3>Health Advice: ${currentWeather === 'Rain' ? 'Carry Umbrella' : 'Stay Hydrated'}</h3></div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">
            <div class="swipe-slide">
                <h3>Hourly Forecast</h3>
                <div class="hourly-cards">
                    ${forecast.list.slice(0, 8).map(h => `
                        <div class="hour-card">
                            <p>${h.dt_txt.split(" ")[1].slice(0,5)}</p>
                            <p>${weatherIcons[h.weather[0].main] || "🌡️"}</p>
                            <p>${h.main.temp.toFixed(1)}°C</p>
                        </div>
                    `).join("")}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>Tomorrow</h3>
                <div class="tomorrow-box">
                    ${dailyData[dayKeys[1]] ? dailyData[dayKeys[1]].slice(0, 5).map(t => `
                        <p>${t.dt_txt.split(" ")[1].slice(0,5)} - ${t.main.temp.toFixed(1)}°C</p>
                    `).join("") : "No data"}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>5-Day Forecast</h3>
                <div class="forecast-cards">
                    ${fiveDayList.map(day => {
                        const info = dailyData[day][0];
                        return `<div class="forecast-card">
                            <p><b>${new Date(day).toLocaleDateString("en-US", {weekday: "short"})}</b></p>
                            <p style="font-size:1.5rem">${weatherIcons[info.weather[0].main] || "🌡️"}</p>
                            <p>${info.main.temp.toFixed(1)}°C</p>
                        </div>`;
                    }).join("")}
                </div>
            </div>
        </div>
        <div class="slider-dots">
            <span class="dot active" onclick="goToSlide(0)"></span>
            <span class="dot" onclick="goToSlide(1)"></span>
            <span class="dot" onclick="goToSlide(2)"></span>
        </div>
    </div>`;
    
    runAnimation(currentWeather);
    initSwipe();
}

/* --- SWIPE & DOTS LOGIC --- */
window.goToSlide = function(index) {
    const slider = document.getElementById("slider");
    if (!slider) return;
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
};

function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;
    let startX = 0, isDragging = false;
    slider.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    slider.addEventListener("touchend", e => {
        let diff = startX - e.changedTouches[0].clientX;
        if(Math.abs(diff) > 50) {
            if (diff > 0 && currentSlideIndex < 2) currentSlideIndex++;
            else if (diff < 0 && currentSlideIndex > 0) currentSlideIndex--;
            window.goToSlide(currentSlideIndex);
        }
    });
    slider.addEventListener("mousedown", e => { startX = e.clientX; isDragging = true; slider.style.cursor = "grabbing"; });
    window.addEventListener("mouseup", e => {
        if (!isDragging) return;
        let diff = startX - e.clientX;
        if(Math.abs(diff) > 50) {
            if (diff > 0 && currentSlideIndex < 2) currentSlideIndex++;
            else if (diff < 0 && currentSlideIndex > 0) currentSlideIndex--;
        }
        window.goToSlide(currentSlideIndex);
        isDragging = false;
        slider.style.cursor = "grab";
    });
}

/* --- AI LOGIC (FIXED) --- */
window.fillQuestion = function(q) {
    aiInput.value = q;
    window.askAI();
};

window.askAI = function() {
    if(!currentWeather) { aiOutput.innerText = "Please search for a city first."; return; }
    const q = aiInput.value.toLowerCase();
    let ans = "Ask about temperature, wear, crop, or disease.";
    if(q.includes("temperature")) ans = `Current temp is ${currentTemp.toFixed(1)}°C.`;
    else if(q.includes("wear")) ans = currentWeather === "Rain" ? "Wear a raincoat ☔" : "Wear comfortable clothes.";
    else if(q.includes("crop")) ans = "Rice is good for rain, Wheat for winter.";
    else if(q.includes("disease")) ans = "Risk of flu or seasonal infections.";
    aiOutput.innerText = ans;
};

/* --- THEME & INITIAL LOAD --- */
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

searchBtn.addEventListener("click", () => {
    if(searchInput.value.trim()) getWeather(searchInput.value.trim());
});

function runAnimation(type) {
    const box = document.getElementById("weatherAnimation");
    if(!box) return;
    box.innerHTML = "";
    if(type === "Clear") box.innerHTML = "<div class='sun'></div>";
}

window.addEventListener("load", () => {
    getWeather("Delhi");
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => getWeatherByLocation(p.coords.latitude, p.coords.longitude));
    }
});