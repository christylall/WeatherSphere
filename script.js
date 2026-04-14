/* --- CONFIG & STATE --- */
const API_KEY = "da287b27ab2c62083846949656a915d4";
let currentWeather = "";
let currentTemp = 0;
let currentSlideIndex = 0;

const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️",
    Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️"
};

/* --- API CALLS --- */
async function getAQI(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    } catch { return "--"; }
}

async function getWeather(city) {
    const homeSection = document.getElementById("homeSection");
    homeSection.innerHTML = "<p style='text-align:center;'>Fetching weather data...</p>";
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

/* --- UI RENDERING --- */
function renderWeather(current, forecast) {
    const homeSection = document.getElementById("homeSection");
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
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

    <div class="aqi-card"><h3>AQI Index: Loading...</h3></div>
    <div class="prevention-card"><h3>Health Advice: ${currentWeather === 'Rain' ? 'Take an umbrella' : 'Stay Safe'}</h3></div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">
            <div class="swipe-slide">
                <h3>Hourly</h3>
                <div class="hourly-cards" style="display:flex; gap:10px; overflow-x:auto;">
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
                    ${dailyData[dayKeys[1]] ? dailyData[dayKeys[1]].slice(0, 4).map(t => `
                        <p>${t.dt_txt.split(" ")[1].slice(0,5)} - ${t.main.temp.toFixed(1)}°C</p>
                    `).join("") : "No Data"}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>5-Day Forecast</h3>
                <div class="forecast-cards" style="display:flex; gap:10px; overflow-x:auto;">
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

    // Update AQI separately
    getAQI(current.coord.lat, current.coord.lon).then(aqi => {
        const aqiDiv = document.querySelector(".aqi-card h3");
        if(aqiDiv) aqiDiv.innerText = "Air Quality: " + aqi;
    });

    initSwipe();
}

/* --- AI & INTERACTIVE FUNCTIONS --- */
window.fillQuestion = function(q) {
    document.getElementById("aiInput").value = q;
    window.askAI();
};

window.askAI = function() {
    const aiOutput = document.getElementById("aiOutput");
    const aiInput = document.getElementById("aiInput");
    
    if(!currentWeather) { 
        aiOutput.innerText = "Please search for a city first."; 
        return; 
    }
    
    const q = aiInput.value.toLowerCase();
    let ans = "I can tell you about clothing, crops, or health risk.";
    
    if(q.includes("temperature")) ans = `The current temperature is ${currentTemp.toFixed(1)}°C.`;
    else if(q.includes("wear")) ans = (currentTemp > 30) ? "Wear light cotton clothes." : "Comfortable casuals are fine.";
    else if(q.includes("crop")) ans = "Rice or Maize would grow well in this climate.";
    else if(q.includes("disease")) ans = "Ensure you drink clean water and avoid dehydration.";
    
    aiOutput.innerText = ans;
};

/* --- SLIDER LOGIC --- */
window.goToSlide = function(index) {
    const slider = document.getElementById("slider");
    if (!slider) return;
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
};

function initSwipe() {
    const slider = document.getElementById("slider");
    if(!slider) return;
    let startX = 0, isDragging = false;

    slider.onmousedown = (e) => { startX = e.clientX; isDragging = true; };
    window.onmouseup = (e) => {
        if (!isDragging) return;
        let diff = startX - e.clientX;
        if(Math.abs(diff) > 50) {
            if (diff > 0 && currentSlideIndex < 2) currentSlideIndex++;
            else if (diff < 0 && currentSlideIndex > 0) currentSlideIndex--;
        }
        window.goToSlide(currentSlideIndex);
        isDragging = false;
    };
    
    slider.ontouchstart = (e) => { startX = e.touches[0].clientX; };
    slider.ontouchend = (e) => {
        let diff = startX - e.changedTouches[0].clientX;
        if(Math.abs(diff) > 50) {
            if (diff > 0 && currentSlideIndex < 2) currentSlideIndex++;
            else if (diff < 0 && currentSlideIndex > 0) currentSlideIndex--;
            window.goToSlide(currentSlideIndex);
        }
    };
}

/* --- INITIALIZATION --- */
document.addEventListener("DOMContentLoaded", () => {
    // Theme
    document.getElementById("themeToggle").onclick = () => {
        document.body.classList.toggle("dark-mode");
    };

    // Search
    document.getElementById("searchBtn").onclick = () => {
        const val = document.getElementById("searchInput").value;
        if(val) getWeather(val);
    };

    // Quick Buttons
    document.querySelectorAll(".location-btn").forEach(btn => {
        btn.onclick = () => getWeather(btn.dataset.location);
    });

    // Default load
    getWeather("Delhi");
});