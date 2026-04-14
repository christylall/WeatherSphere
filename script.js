/* --- ⚙️ CONFIG --- */
const API_KEY = "da287b27ab2c62083846949656a915d4";

// Global Variables
let currentWeather = "";
let currentTemp = 0;
let currentSlideIndex = 0;

const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️",
    Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️", Smoke: "💨"
};

/* --- 📡 WEATHER FETCH --- */
async function getWeather(city) {
    const homeSection = document.getElementById("homeSection");
    if(!city || !homeSection) return;
    
    homeSection.innerHTML = "<p style='text-align:center;'>🔍 Fetching Weather Magic... 📡</p>";
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        
        if (current.cod !== 200) {
            homeSection.innerHTML = "<p style='text-align:center;'>❌ City not found! Try again 🔍</p>";
            return;
        }

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        
        renderWeather(current, forecast);
    } catch (err) {
        homeSection.innerHTML = "<p style='text-align:center;'>📡 Connection Error!</p>";
    }
}

/* --- 🎨 UI RENDERING --- */
async function renderWeather(current, forecast) {
    const homeSection = document.getElementById("homeSection");
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
    currentSlideIndex = 0; 

    const icon = weatherIcons[currentWeather] || "🌡️";
    const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const daily = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = [];
        daily[date].push(item);
    });
    const days = Object.keys(daily);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description.toUpperCase()} ${icon}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; font-size:0.85rem; background:rgba(0,0,0,0.1); padding:10px; border-radius:10px;">
            <p>🌡️ Feels: ${current.main.feels_like.toFixed(1)}°C</p>
            <p>💧 Hum: ${current.main.humidity}%</p>
            <p>🌬️ Wind: ${current.wind.speed}m/s</p>
            <p>🌅 Sun: ${sunrise}</p>
            <p>🌇 Set: ${sunset}</p>
            <p>☁️ Clouds: ${current.clouds.all}%</p>
        </div>
    </div>

    <div class="swipe-container" style="overflow:hidden; width:100%; margin-top:15px;">
        <div class="swipe-slider" id="slider" style="display:flex; width:300%; transition: transform 0.4s ease; cursor:grab;">
            <div class="swipe-slide" style="width:33.33%;">
                <h3>🕒 Hourly Forecast</h3>
                <div style="display:flex; gap:10px; overflow-x:auto; padding:10px;">
                    ${forecast.list.slice(0, 8).map(h => `
                        <div style="min-width:70px; text-align:center; background:rgba(255,255,255,0.1); padding:8px; border-radius:10px;">
                            <p>${h.dt_txt.split(" ")[1].slice(0,5)}</p>
                            <p>${weatherIcons[h.weather[0].main] || "🌡️"}</p>
                            <p>${h.main.temp.toFixed(1)}°C</p>
                        </div>
                    `).join("")}
                </div>
            </div>
            <div class="swipe-slide" style="width:33.33%;">
                <h3>📅 Tomorrow</h3>
                <div style="background:rgba(255,255,255,0.1); padding:10px; border-radius:10px;">
                    ${daily[days[1]]?.slice(0,5).map(t => `<p>⏰ ${t.dt_txt.split(" ")[1].slice(0,5)} ➡️ ${t.main.temp.toFixed(1)}°C ${weatherIcons[t.weather[0].main]}</p>`).join("")}
                </div>
            </div>
            <div class="swipe-slide" style="width:33.33%;">
                <h3>🗓️ 5-Day Outlook</h3>
                <div style="display:flex; gap:8px; overflow-x:auto;">
                    ${days.slice(1, 6).map(day => `
                        <div style="min-width:80px; text-align:center; padding:10px; background:rgba(255,255,255,0.1); border-radius:10px;">
                            <p>${new Date(day).toLocaleDateString("en-US",{weekday:"short"})}</p>
                            <p>${weatherIcons[daily[day][0].weather[0].main]}</p>
                            <p>${daily[day][0].main.temp.toFixed(0)}°C</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
        <div style="text-align:center; margin-top:10px;">
            <span class="dot active" onclick="goToSlide(0)"></span>
            <span class="dot" onclick="goToSlide(1)"></span>
            <span class="dot" onclick="goToSlide(2)"></span>
        </div>
    </div>
    `;

    runAnimation(currentWeather);
    initSwipe();
}

/* --- 🎡 SLIDER LOGIC --- */
window.goToSlide = function(index) {
    const slider = document.getElementById("slider");
    if (!slider) return;
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${index * 33.333}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
};

function initSwipe(){
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

/* --- 🤖 AI INTERACTION --- */
window.fillQuestion = function(q) {
    const aiInput = document.getElementById("aiInput");
    if(aiInput) aiInput.value = q;
    window.askAI();
};

window.askAI = function() {
    const aiOutput = document.getElementById("aiOutput");
    const aiInput = document.getElementById("aiInput");
    if(!currentWeather) { aiOutput.innerText = "🕵️ Search a city first!"; return; }
    
    const q = aiInput.value.toLowerCase();
    let ans = "🤖 I can help with clothes 👗, crops 🌾, or health!";
    if(q.includes("temp")) ans = `🌡️ It's ${currentTemp.toFixed(1)}°C.`;
    else if(q.includes("wear")) ans = currentTemp > 30 ? "👕 Wear cotton clothes!" : "🧥 Wear a jacket!";
    else if(q.includes("crop")) ans = "🌾 Good for Rice or Wheat!";
    
    aiOutput.innerHTML = `<b>AI:</b> ${ans}`;
};

/* --- ✨ INITIALIZE EVERYTHING (The Fix) --- */
document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const themeToggle = document.getElementById("themeToggle");

    if(searchBtn) searchBtn.onclick = () => getWeather(searchInput.value);
    
    if(themeToggle) themeToggle.onclick = () => document.body.classList.toggle("dark-mode");

    document.querySelectorAll(".location-btn").forEach(btn => {
        btn.onclick = () => getWeather(btn.getAttribute("data-location"));
    });

    // Default load
    getWeather("Delhi");
});

function runAnimation(type) {
    const box = document.getElementById("weatherAnimation");
    if(!box) return; box.innerHTML = "";
    if(type==="Rain"){
        for(let i=0;i<50;i++){
            const d = document.createElement("div"); d.className="rain-drop";
            d.style.left = Math.random()*100+"%"; box.appendChild(d);
        }
    }
}