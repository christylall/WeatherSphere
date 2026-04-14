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

// Quick location buttons setup
document.querySelectorAll(".location-btn").forEach(btn => {
    btn.addEventListener("click", () => getWeather(btn.dataset.location));
});

async function getAQI(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    } catch { return "--"; }
}

async function getWeather(city) {
    homeSection.innerHTML = "<p class='loading-text'>Loading weather...</p>";
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        renderWeather(current, forecast);
    } catch (err) {
        homeSection.innerHTML = "<p>Error fetching weather. Please check city name.</p>";
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
    
    // Slide index reset for new search
    currentSlideIndex = 0;

    // Fixed Grouping logic
    const dailyData = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
    });

    const dayKeys = Object.keys(dailyData);
    const fiveDayList = dayKeys.slice(1, 6); // Tomorrow to next 5 days

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${weatherIcons[currentWeather] || "🌡️"} ${current.weather[0].description}</p>
    </div>

    <div class="aqi-card"><h3>AQI Index: ${aqi}</h3></div>
    <div class="prevention-card"><h3>Health Advice: ${currentWeather === 'Rain' ? 'Carry an umbrella' : 'Perfect weather to go out'}</h3></div>

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
                        <p>${t.dt_txt.split(" ")[1].slice(0,5)} - ${weatherIcons[t.weather[0].main]} ${t.main.temp.toFixed(1)}°C</p>
                    `).join("") : "Data loading..."}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>5-Day Forecast</h3>
                <div class="forecast-cards">
                    ${fiveDayList.map(day => {
                        const dayInfo = dailyData[day][0];
                        const temp = dayInfo.main.temp.toFixed(1);
                        const icon = weatherIcons[dayInfo.weather[0].main] || "🌡️";
                        const name = new Date(day).toLocaleDateString("en-US", {weekday: "short"});
                        return `
                            <div class="forecast-card">
                                <p><b>${name}</b></p>
                                <p style="font-size: 1.5rem; margin: 5px 0;">${icon}</p>
                                <p>${temp}°C</p>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        </div>
        <div class="slider-dots" id="sliderDots" style="text-align:center;">
            <span class="dot active" onclick="goToSlide(0)"></span>
            <span class="dot" onclick="goToSlide(1)"></span>
            <span class="dot" onclick="goToSlide(2)"></span>
        </div>
    </div>`;
    
    // Animation trigger
    if(window.runAnimation) runAnimation(currentWeather);
    initSwipe();
}

// Fixed Global functions for dots
window.goToSlide = function(index) {
    const slider = document.getElementById("slider");
    if (!slider) return;
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    
    // Update dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
};

function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;
    let startX = 0, isDragging = false;

    slider.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    slider.addEventListener("touchend", e => handleSwipe(startX - e.changedTouches[0].clientX));
    
    slider.addEventListener("mousedown", e => { 
        startX = e.clientX; 
        isDragging = true; 
        slider.style.cursor = "grabbing";
    });
    
    window.addEventListener("mouseup", e => {
        if (!isDragging) return;
        handleSwipe(startX - e.clientX);
        isDragging = false;
        slider.style.cursor = "grab";
    });

    function handleSwipe(diff) {
        if (Math.abs(diff) < 50) return; // Ignore small movements
        if (diff > 50 && currentSlideIndex < 2) currentSlideIndex++;
        else if (diff < -50 && currentSlideIndex > 0) currentSlideIndex--;
        window.goToSlide(currentSlideIndex);
    }
}

// Search function fix
searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if(city) getWeather(city);
});

// Weather background animation logic (from your previous code)
function runAnimation(type) {
    const box = document.getElementById("weatherAnimation");
    if(!box) return;
    box.innerHTML = "";
    // Clouds
    for(let i=0;i<6;i++){
        const cloud = document.createElement("div");
        cloud.className = "cloud";
        cloud.style.top = (10+i*10)+"%";
        cloud.style.animationDuration = (20+Math.random()*20)+"s";
        box.appendChild(cloud);
    }
    // Rain
    if(type==="Rain" || type==="Drizzle"){
        for(let i=0;i<100;i++){
            const drop = document.createElement("div");
            drop.className="rain-drop";
            drop.style.left = Math.random()*100+"%";
            drop.style.animationDuration = (0.5+Math.random())+"s";
            box.appendChild(drop);
        }
    }
    // Sun
    if(type==="Clear"){
        const sun = document.createElement("div");
        sun.className="sun";
        box.appendChild(sun);
    }
}

// Dark Mode Toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeToggle.innerText = document.body.classList.contains("dark-mode") ? "☀️ Day Theme" : "🌙 Night Theme";
});

window.addEventListener("load", () => {
    getWeather("Delhi");
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => getWeatherByLocation(p.coords.latitude, p.coords.longitude));
    }
});