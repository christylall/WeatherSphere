/* --- ⚙️ CONFIG & STATE --- */
const API_KEY = "da287b27ab2c62083846949656a915d4";
let currentWeather = "";
let currentTemp = 0;
let currentSlideIndex = 0;

const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️",
    Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️", Smoke: "💨"
};

/* --- 🌐 API CALLS --- */
async function getAQI(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    } catch { return "--"; }
}

async function getWeather(city) {
    const homeSection = document.getElementById("homeSection");
    homeSection.innerHTML = "<p style='text-align:center;'>🔍 Fetching magical weather data... 📡</p>";
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        renderWeather(current, forecast);
    } catch (err) {
        homeSection.innerHTML = "<p style='text-align:center;'>❌ City not found! Try again 🔍</p>";
    }
}

/* --- 🎨 UI RENDERING --- */
function renderWeather(current, forecast) {
    const homeSection = document.getElementById("homeSection");
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
    currentSlideIndex = 0;

    // ⏰ Time Formatting for Sunrise/Sunset
    const formatTime = (ts) => new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 📅 Grouping Forecast by Day
    const dailyData = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
    });
    const dayKeys = Object.keys(dailyData);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name}, ${current.sys.country}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${weatherIcons[currentWeather] || "🌡️"} ${current.weather[0].description.toUpperCase()} ${weatherIcons[currentWeather] || ""}</p>
        
        <div class="extra-info-grid">
            <p>💧 <b>Hum:</b> ${current.main.humidity}%</p>
            <p>🌬️ <b>Wind:</b> ${current.wind.speed} m/s</p>
            <p>🌅 <b>Rise:</b> ${formatTime(current.sys.sunrise)}</p>
            <p>🌇 <b>Set:</b> ${formatTime(current.sys.sunset)}</p>
        </div>
    </div>

    <div class="aqi-card"><h3>🍃 Air Quality Index: Loading... 🔄</h3></div>
    <div class="prevention-card"><h3>🩺 Health: ${currentWeather === 'Rain' ? '☔ Take an umbrella & stay dry!' : '🌈 Stay hydrated & have a great day!'}</h3></div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">
            
            <div class="swipe-slide">
                <h3>🕒 Hourly Forecast (Next 24h)</h3>
                <div class="hourly-cards" style="display:flex; gap:10px; overflow-x:auto; padding:10px;">
                    ${forecast.list.slice(0, 8).map(h => `
                        <div class="hour-card">
                            <p><b>${h.dt_txt.split(" ")[1].slice(0,5)}</b></p>
                            <p style="font-size:1.8rem">${weatherIcons[h.weather[0].main] || "🌡️"}</p>
                            <p><b>${h.main.temp.toFixed(1)}°C</b></p>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="swipe-slide">
                <h3>📅 Tomorrow's Timeline 🗓️</h3>
                <div class="tomorrow-box" style="background:rgba(255,255,255,0.1); padding:15px; border-radius:15px;">
                    ${dailyData[dayKeys[1]] ? dailyData[dayKeys[1]].slice(0, 6).map(t => `
                        <p>⏰ ${t.dt_txt.split(" ")[1].slice(0,5)} ➡️ 🌡️ <b>${t.main.temp.toFixed(1)}°C</b> — ${weatherIcons[t.weather[0].main] || "☁️"}</p>
                    `).join("") : "🚫 No Data Available"}
                </div>
            </div>

            <div class="swipe-slide">
                <h3>🗓️ 5-Day Climate Outlook 🌍</h3>
                <div class="forecast-cards" style="display:flex; gap:12px; overflow-x:auto; padding:10px;">
                    ${dayKeys.slice(1, 6).map(day => {
                        const info = dailyData[day][0];
                        return `<div class="forecast-card">
                            <p><b>${new Date(day).toLocaleDateString("en-US", {weekday: "short"})}</b></p>
                            <p style="font-size:1.8rem">${weatherIcons[info.weather[0].main] || "🌡️"}</p>
                            <p><b>${info.main.temp.toFixed(1)}°C</b></p>
                            <p style="font-size:0.7rem">${info.weather[0].main}</p>
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

    // 🍃 AQI Update
    getAQI(current.coord.lat, current.coord.lon).then(aqi => {
        const aqiDiv = document.querySelector(".aqi-card h3");
        const aqiEmoji = aqi <= 2 ? "✅ Good 🌿" : aqi <= 3 ? "⚠️ Moderate 🟡" : "🚫 Poor 😷";
        if(aqiDiv) aqiDiv.innerText = `🍃 Air Quality: ${aqi} (${aqiEmoji})`;
    });

    initSwipe();
}

/* --- 🤖 AI ASSISTANT FUNCTIONS --- */
window.askAI = function() {
    const aiOutput = document.getElementById("aiOutput");
    const aiInput = document.getElementById("aiInput");
    if(!currentWeather) { aiOutput.innerText = "🕵️ Search for a city first!"; return; }
    
    const q = aiInput.value.toLowerCase();
    let ans = "🤖 I'm your AI! Ask about 👗 Clothes, 🌾 Crops, or 🏥 Health!";
    
    if(q.includes("temperature") || q.includes("heat")) {
        ans = `🌡️ The current temperature is ${currentTemp.toFixed(1)}°C. It feels like ${currentWeather}!`;
    }
    else if(q.includes("wear") || q.includes("clothes") || q.includes("outfit")) {
        ans = (currentTemp > 30) ? "👕 Wear light cotton clothes, sunblock 🧴 and sunglasses 🕶️!" : "🧥 It's cool! A light jacket or comfortable full sleeves would be perfect.";
        if(currentWeather === 'Rain') ans += " Also, don't forget your umbrella! ☔";
    }
    else if(q.includes("crop") || q.includes("farmer") || q.includes("grow")) {
        ans = (currentWeather === 'Rain' || currentTemp < 25) ? "🌾 This weather is great for Rice, Sugarcane or leafy veggies! 🥬" : "🌽 Ideal for Maize, Millets or heat-loving fruits like Mangoes! 🥭";
    }
    else if(q.includes("disease") || q.includes("health") || q.includes("risk")) {
        ans = (currentWeather === 'Rain') ? "🦟 Risk of Mosquito-borne diseases. Use repellent! 🧴" : "💧 Stay hydrated! High risk of heatstroke if you stay out too long. ☀️";
    }
    
    aiOutput.innerHTML = `<b>AI:</b> ${ans}`;
};

/* --- 🎠 SLIDER LOGIC --- */
window.goToSlide = function(index) {
    const slider = document.getElementById("slider");
    if (!slider) return;
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${index * 33.33}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
};

function initSwipe() {
    const slider = document.getElementById("slider");
    let startX = 0;
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