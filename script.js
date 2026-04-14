const API_KEY = "da287b27ab2c62083846949656a915d4";
let currentWeather = "";
let currentTemp = 0;
let currentSlideIndex = 0;

const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️", Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️"
};

async function getWeather(city) {
    const homeSection = document.getElementById("homeSection");
    homeSection.innerHTML = "<p style='text-align:center;'>Fetching data...</p>";
    try {
        const cRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await cRes.json();
        const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await fRes.json();
        renderWeather(current, forecast);
    } catch (err) {
        homeSection.innerHTML = "<p style='text-align:center;'>City not found!</p>";
    }
}

function renderWeather(current, forecast) {
    const homeSection = document.getElementById("homeSection");
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
    currentSlideIndex = 0; // Reset slider position

    const dailyData = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
    });

    const dayKeys = Object.keys(dailyData).slice(1, 6);

    homeSection.innerHTML = `
        <div class="current-weather">
            <h2>${current.name}</h2>
            <h1>${currentTemp.toFixed(1)}°C</h1>
            <p>${weatherIcons[currentWeather] || "🌡️"} ${current.weather[0].description}</p>
        </div>
        <div class="aqi-card"><h4 id="aqiText">AQI: Loading...</h4></div>
        
        <div class="swipe-container">
            <div class="swipe-slider" id="slider">
                <div class="swipe-slide">
                    <h3>Hourly (Today)</h3>
                    <div class="hourly-cards">
                        ${forecast.list.slice(0, 8).map(h => `
                            <div class="hour-card">
                                <p>${h.dt_txt.split(" ")[1].slice(0,5)}</p>
                                <span>${weatherIcons[h.weather[0].main] || "🌡️"}</span>
                                <p>${h.main.temp.toFixed(1)}°C</p>
                            </div>
                        `).join("")}
                    </div>
                </div>
                <div class="swipe-slide">
                    <h3>Tomorrow's Outlook</h3>
                    <div class="tomorrow-box" style="background:rgba(255,255,255,0.1); padding:15px; border-radius:10px;">
                        ${dailyData[Object.keys(dailyData)[1]]?.slice(0, 5).map(t => `
                            <p>${t.dt_txt.split(" ")[1].slice(0,5)} — <b>${t.main.temp.toFixed(1)}°C</b></p>
                        `).join("") || "No data"}
                    </div>
                </div>
                <div class="swipe-slide">
                    <h3>5-Day Forecast</h3>
                    <div class="forecast-cards">
                        ${dayKeys.map(day => {
                            const info = dailyData[day][0];
                            return `<div class="forecast-card">
                                <p>${new Date(day).toLocaleDateString("en-US", {weekday: 'short'})}</p>
                                <p style="font-size:1.2rem">${weatherIcons[info.weather[0].main] || "🌡️"}</p>
                                <p>${info.main.temp.toFixed(0)}°C</p>
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
        </div>
    `;

    fetchAQI(current.coord.lat, current.coord.lon);
    initSwipe();
}

async function fetchAQI(lat, lon) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const data = await res.json();
    document.getElementById("aqiText").innerText = "AQI Index: " + data.list[0].main.aqi;
}

window.goToSlide = function(index) {
    const slider = document.getElementById("slider");
    if (!slider) return;
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${(index * 100) / 3}%)`; // Calculation based on 300% width
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
};

function initSwipe() {
    const slider = document.getElementById("slider");
    let startX = 0;
    
    slider.ontouchstart = (e) => { startX = e.touches[0].clientX; };
    slider.ontouchend = (e) => {
        let diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentSlideIndex < 2) currentSlideIndex++;
            else if (diff < 0 && currentSlideIndex > 0) currentSlideIndex--;
            window.goToSlide(currentSlideIndex);
        }
    };
}

// Event Listeners
document.getElementById("searchBtn").onclick = () => {
    const city = document.getElementById("searchInput").value;
    if(city) getWeather(city);
};
document.getElementById("themeToggle").onclick = () => document.body.classList.toggle("dark-mode");
document.addEventListener("DOMContentLoaded", () => getWeather("Delhi"));