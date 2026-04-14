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

async function getAQI(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    } catch { return "--"; }
}

async function getWeather(city) {
    homeSection.innerHTML = "<p>Loading weather...</p>";
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        renderWeather(current, forecast);
    } catch (err) {
        homeSection.innerHTML = "<p>Error fetching weather.</p>";
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

async function renderWeather(current, forecast) {
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
    const aqi = await getAQI(current.coord.lat, current.coord.lon);

    // Grouping logic for 5-day forecast
    const dailyData = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
    });

    const dayKeys = Object.keys(dailyData);
    const fiveDayList = dayKeys.slice(1, 6); // Skip today

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${weatherIcons[currentWeather] || "🌡️"} ${current.weather[0].description}</p>
    </div>

    <div class="aqi-card"><h3>AQI: ${aqi}</h3></div>
    <div class="prevention-card"><h3>Advice: ${currentWeather === 'Rain' ? 'Take Umbrella' : 'Stay Safe'}</h3></div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">
            <div class="swipe-slide">
                <h3>Hourly</h3>
                <div class="hourly-cards">
                    ${forecast.list.slice(0, 6).map(h => `
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
                    ${dailyData[dayKeys[1]] ? dailyData[dayKeys[1]].slice(0, 4).map(t => `
                        <p>${t.dt_txt.split(" ")[1].slice(0,5)} - ${t.main.temp.toFixed(1)}°C</p>
                    `).join("") : "No Data"}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>5-Day Forecast</h3>
                <div class="forecast-cards" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">
                    ${fiveDayList.map(day => {
                        const temp = dailyData[day][0].main.temp.toFixed(1);
                        const icon = weatherIcons[dailyData[day][0].weather[0].main] || "🌡️";
                        const name = new Date(day).toLocaleDateString("en-US", {weekday: "short"});
                        return `
                            <div class="forecast-card" style="min-width: 80px; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">
                                <p><b>${name}</b></p>
                                <p style="font-size: 1.5rem;">${icon}</p>
                                <p>${temp}°C</p>
                            </div>
                        `;
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
    
    initSwipe();
}

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
    slider.addEventListener("touchend", e => handleSwipe(startX - e.changedTouches[0].clientX));
    slider.addEventListener("mousedown", e => { startX = e.clientX; isDragging = true; });
    window.addEventListener("mouseup", e => {
        if (isDragging) { handleSwipe(startX - e.clientX); isDragging = false; }
    });

    function handleSwipe(diff) {
        if (diff > 50 && currentSlideIndex < 2) currentSlideIndex++;
        else if (diff < -50 && currentSlideIndex > 0) currentSlideIndex--;
        window.goToSlide(currentSlideIndex);
    }
}

searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if(city) getWeather(city);
});

window.addEventListener("load", () => {
    getWeather("Delhi");
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => getWeatherByLocation(p.coords.latitude, p.coords.longitude));
    }
});