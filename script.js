const API_KEY = "da287b27ab2c62083846949656a915d4";

let currentWeather = "";
let currentTemp = 0;
let currentSlideIndex = 0;

const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️",
    Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️", Smoke: "💨"
};

async function getWeather(city) {
    const homeSection = document.getElementById("homeSection");
    if(!city || !homeSection) return;
    
    homeSection.innerHTML = "<p style='text-align:center;'>🔍 Searching for ${city}... 📡✨</p>";
    
    try {
        // 1. Current Weather Data
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        
        if (current.cod !== 200) {
            homeSection.innerHTML = "<p style='text-align:center;'>❌ City not found! 🔍</p>";
            return;
        }

        // 2. AQI Data (Har city ke liye alag)
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}`);
        const aqiData = await aqiRes.json();
        const aqi = aqiData.list[0].main.aqi;

        // 3. 5-Day Forecast Data
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        
        renderWeather(current, forecast, aqi);
    } catch (err) {
        homeSection.innerHTML = "<p style='text-align:center;'>📡 Connection Error! Check internet. 🌐</p>";
    }
}

function renderWeather(current, forecast, aqi) {
    const homeSection = document.getElementById("homeSection");
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
    currentSlideIndex = 0; 

    const icon = weatherIcons[currentWeather] || "🌡️";
    const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Forecast Logic: Group by Date
    const dailyData = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
    });

    const dates = Object.keys(dailyData);
    const tomorrow = dates[1]; 
    const fiveDays = dates.slice(1, 6);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name} 🏙️</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description.toUpperCase()} ${icon}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px; font-size:0.85rem; background:rgba(255,255,255,0.1); padding:10px; border-radius:10px;">
            <p>🌡️ Feels: ${current.main.feels_like.toFixed(1)}°C</p>
            <p>💧 Hum: ${current.main.humidity}%</p>
            <p>🌬️ Wind: ${current.wind.speed}m/s</p>
            <p>🌅 Sun: ${sunrise}</p>
            <p>🌇 Set: ${sunset}</p>
            <p>☁️ Clouds: ${current.clouds.all}%</p>
        </div>
    </div>

    <div class="aqi-card">
        <h3>🍃 Air Quality: ${aqi} | ${aqi <= 2 ? 'Fresh Air ✅' : 'Polluted 😷'}</h3>
    </div>

    <div class="swipe-container" style="overflow:hidden; width:100%; margin-top:15px;">
        <div class="swipe-slider" id="slider" style="display:flex; width:300%; transition: transform 0.4s ease; cursor:grab;">
            <div class="swipe-slide" style="width:33.33%;">
                <h3>🕒 Next 24 Hours 🚀</h3>
                <div style="display:flex; gap:10px; overflow-x:auto; padding:10px;">
                    ${forecast.list.slice(0, 8).map(h => `
                        <div style="min-width:70px; text-align:center; background:rgba(255,255,255,0.15); padding:10px; border-radius:10px;">
                            <p>${h.dt_txt.split(" ")[1].slice(0,5)}</p>
                            <p style="font-size:1.3rem">${weatherIcons[h.weather[0].main] || "🌡️"}</p>
                            <p>${h.main.temp.toFixed(0)}°C</p>
                        </div>
                    `).join("")}
                </div>
            </div>
            <div class="swipe-slide" style="width:33.33%;">
                <h3>📅 Tomorrow's Outlook 🗓️</h3>
                <div style="background:rgba(255,255,255,0.1); padding:15px; border-radius:15px;">
                    ${dailyData[tomorrow] ? dailyData[tomorrow].slice(0,5).map(t => `
                        <p>⏰ ${t.dt_txt.split(" ")[1].slice(0,5)} ➡️ <b>${t.main.temp.toFixed(1)}°C</b> ${weatherIcons[t.weather[0].main]}</p>
                    `).join("") : "Data error"}
                </div>
            </div>
            <div class="swipe-slide" style="width:33.33%;">
                <h3>🗓️ 5-Day Forecast 🌍</h3>
                <div style="display:flex; gap:10px; overflow-x:auto;">
                    ${fiveDays.map(d => {
                        const day = new Date(d).toLocaleDateString("en-US", {weekday: "short"});
                        return `<div style="min-width:80px; text-align:center; padding:10px; background:rgba(255,255,255,0.1); border-radius:10px;">
                            <p><b>${day}</b></p>
                            <p style="font-size:1.3rem">${weatherIcons[dailyData[d][0].weather[0].main]}</p>
                            <p>${dailyData[d][0].main.temp.toFixed(0)}°C</p>
                        </div>`;
                    }).join("")}
                </div>
            </div>
        </div>
        <div style="text-align:center; margin-top:10px;">
            <span class="dot active" onclick="window.goToSlide(0)"></span>
            <span class="dot" onclick="window.goToSlide(1)"></span>
            <span class="dot" onclick="window.goToSlide(2)"></span>
        </div>
    </div>
    `;
    initSwipe();
}

/* --- 🎠 SLIDER LOGIC --- */
window.goToSlide = function(idx) {
    const slider = document.getElementById("slider");
    if(!slider) return;
    currentSlideIndex = idx;
    slider.style.transform = `translateX(-${idx * 33.333}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
};

function initSwipe() {
    const slider = document.getElementById("slider");
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
}

/* --- 🤖 AI LOGIC --- */
window.fillQuestion = function(q) {
    document.getElementById("aiInput").value = q;
    window.askAI();
};

window.askAI = function() {
    const out = document.getElementById("aiOutput");
    const inp = document.getElementById("aiInput").value.toLowerCase();
    if(!currentWeather) { out.innerText = "🕵️ Search a city first!"; return; }
    let ans = "🤖 Ask about clothes 👗, crops 🌾, or health!";
    if(inp.includes("temp")) ans = `🌡️ Current temperature is ${currentTemp.toFixed(1)}°C.`;
    else if(inp.includes("wear")) ans = currentTemp > 30 ? "👕 Wear light clothes!" : "🧥 Wear a jacket!";
    out.innerHTML = `<b>AI:</b> ${ans}`;
};

/* --- 🚀 DOM LOAD --- */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchBtn").onclick = () => getWeather(document.getElementById("searchInput").value);
    document.getElementById("themeToggle").onclick = () => document.body.classList.toggle("dark-mode");
    document.querySelectorAll(".location-btn").forEach(btn => {
        btn.onclick = () => getWeather(btn.getAttribute("data-location"));
    });
    getWeather("Delhi");
});