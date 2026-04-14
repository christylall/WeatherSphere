m/* --- ⚙️ CONFIG & STATE --- */
const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;
let currentSlideIndex = 0; // 🎠 Slider track karne ke liye

/* 📍 QUICK CITY BUTTONS */
document.querySelectorAll(".location-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        getWeather(btn.dataset.location);
    });
});

/* 🎭 WEATHER ICONS */
const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️",
    Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️", Smoke: "💨"
};

/* 🍃 AQI FETCH */
async function getAQI(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    } catch { return "--"; }
}

/* 📡 MAIN WEATHER FETCH */
async function getWeather(city) {
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
        homeSection.innerHTML = "<p style='text-align:center;'>📡 Connection Error! Check Internet 🌐</p>";
    }
}

async function getWeatherByLocation(lat, lon) {
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        renderWeather(current, forecast);
    } catch (err) {
        homeSection.innerHTML = "<p>📍 Location fetch failed!</p>";
    }
}

/* 🎨 UI RENDERING (Purana Logic + Zyada Emojis) */
async function renderWeather(current, forecast) {
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
    currentSlideIndex = 0; 

    const icon = weatherIcons[currentWeather] || "🌡️";
    const aqi = await getAQI(current.coord.lat, current.coord.lon);
    const sunriseTime = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const sunsetTime = new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const hourly = forecast.list.slice(0, 8);
    const daily = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = [];
        daily[date].push(item);
    });

    const days = Object.keys(daily);
    const tomorrow = days[1];
    const fiveDays = days.slice(1, 6);

    // 🩺 Health Advice logic (Wahi purana)
    let advice = "Stay hydrated 💧";
    if (currentWeather === "Rain") advice = "Carry umbrella ☔ Stay dry!";
    if (currentWeather === "Clear") advice = "Wear sunglasses 😎 Sun is bright!";
    if (currentWeather === "Clouds") advice = "Perfect for a walk ☁️ Chill vibes!";
    if (aqi >= 4) advice = "Pollution high! Wear a mask 😷";

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name}, ${current.sys.country}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description.toUpperCase()} ${icon}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px; font-size:0.9rem; background:rgba(0,0,0,0.1); padding:10px; border-radius:10px;">
            <p>🌡️ Feels: ${current.main.feels_like.toFixed(1)}°C</p>
            <p>💧 Hum: ${current.main.humidity}%</p>
            <p>🌬️ Wind: ${current.wind.speed}m/s</p>
            <p>🌅 Rise: ${sunriseTime}</p>
            <p>🌇 Set: ${sunsetTime}</p>
            <p>☁️ Clouds: ${current.clouds.all}%</p>
        </div>
    </div>

    <div class="aqi-card"><h3>🍃 Air Quality: ${aqi} (AQI)</h3></div>
    <div class="prevention-card"><h3>🩺 Health Advice: ${advice}</h3></div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">
            <div class="swipe-slide">
                <h3>🕒 Hourly Forecast 🚀</h3>
                <div class="hourly-cards" style="display:flex; gap:10px; overflow-x:auto; padding:5px;">
                    ${hourly.map(h => `<div class="hour-card"><p><b>${h.dt_txt.split(" ")[1].slice(0,5)}</b></p><p style="font-size:1.5rem">${weatherIcons[h.weather[0].main] || "🌡️"}</p><p>${h.main.temp.toFixed(1)}°C</p></div>`).join("")}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>📅 Tomorrow's Timeline 🗓️</h3>
                <div class="tomorrow-box" style="background:rgba(255,255,255,0.1); padding:15px; border-radius:15px;">
                    ${daily[tomorrow] ? daily[tomorrow].slice(0,6).map(t => `<p>⏰ ${t.dt_txt.split(" ")[1].slice(0,5)} ➡️ 🌡️ <b>${t.main.temp.toFixed(1)}°C</b> ${weatherIcons[t.weather[0].main]}</p>`).join("") : "🚫 No Data"}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>🗓️ 5-Day Climate Outlook 🌍</h3>
                <div class="forecast-cards" style="display:flex; gap:10px; overflow-x:auto; padding:5px;">
                    ${fiveDays.map(day => {
                        const info = daily[day][0];
                        const avgTemp = (daily[day].reduce((s,d)=>s+d.main.temp,0)/daily[day].length).toFixed(1);
                        return `<div class="forecast-card"><p><b>${new Date(day).toLocaleDateString("en-US",{weekday:"short"})}</b></p><p style="font-size:1.5rem">${weatherIcons[info.weather[0].main]}</p><p>${avgTemp}°C</p></div>`;
                    }).join("")}
                </div>
            </div>
        </div>
        <div class="slider-dots" style="text-align:center; margin-top:10px;">
            <span class="dot active" onclick="goToSlide(0)"></span>
            <span class="dot" onclick="goToSlide(1)"></span>
            <span class="dot" onclick="goToSlide(2)"></span>
        </div>
    </div>
    `;

    runAnimation(currentWeather);
    initSwipe();
}

/* 🎠 SLIDER LOGIC (LAPTOP MOUSE + MOBILE TOUCH) */
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

    // Laptop Mouse Sliding 🖱️
    slider.onmousedown = (e) => { startX = e.clientX; isDragging = true; slider.style.cursor = "grabbing"; };
    window.onmouseup = (e) => {
        if (!isDragging) return;
        let diff = startX - e.clientX;
        if(Math.abs(diff) > 50) {
            if (diff > 0 && currentSlideIndex < 2) currentSlideIndex++;
            else if (diff < 0 && currentSlideIndex > 0) currentSlideIndex--;
        }
        window.goToSlide(currentSlideIndex);
        isDragging = false;
        slider.style.cursor = "grab";
    };

    // Mobile Touch Sliding 📱
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

/* 🤖 AI RULE-BASED LOGIC (Wahi Purana logic, zyada emojis ke saath) */
function fillQuestion(q){ aiInput.value = q; askAI(); }
function askAI(){
    if(!currentWeather) { aiOutput.innerHTML = "🕵️ Please search for a city first! 🔍"; return; }
    const q = aiInput.value.toLowerCase();
    let ans = "🤖 Ask me about outfits 👗, crops 🌾, or health 🏥!";

    if(q.includes("temperature")) ans = `🌡️ Current temperature is ${currentTemp.toFixed(1)}°C. It feels like ${currentWeather}!`;
    else if(q.includes("wear") || q.includes("clothes")){
        if(currentWeather==="Rain") ans="👗 It's raining! Wear waterproof shoes and carry a stylish umbrella ☔";
        else if(currentTemp>32) ans="☀️ Weather is hot! Wear light cotton clothes and don't forget sunblock 🧴";
        else if(currentTemp<15) ans="🧥 Weather is chilly! Wear a warm jacket and stay cozy.";
        else ans="👕 Comfortable casual clothes are perfect for today!";
    }
    else if(q.includes("crop") || q.includes("farmer")){
        if(currentWeather==="Rain") ans="🌾 Rainy weather is a blessing for Rice and Sugarcane! 🎋";
        else if(currentTemp>30) ans="🌽 Warm weather is great for Maize and Cotton crops! 🚜";
        else ans="🌾 Wheat and Mustard grow beautifully in this cool climate! 🚜";
    }
    else if(q.includes("disease") || q.includes("health")){
        if(currentWeather==="Rain") ans="🦟 Mosquitoes alert! Protect yourself from Dengue/Malaria. 🏥";
        else if(currentTemp>35) ans="☀️ High heat! Risk of dehydration and heatstroke. Drink water! 💧";
        else ans="🤒 Seasonal flu might occur. Eat healthy and stay strong! 🍎";
    }
    aiOutput.innerHTML = `<b>AI Assistant:</b> ${ans}`;
}

/* 🌈 ANIMATIONS & INITIALIZATION */
function runAnimation(type) {
    const box = document.getElementById("weatherAnimation");
    if(!box) return;
    box.innerHTML = "";
    if(type==="Rain" || type==="Drizzle"){
        for(let i=0;i<100;i++){
            const drop = document.createElement("div");
            drop.className="rain-drop";
            drop.style.left = Math.random()*100+"%";
            drop.style.animationDuration = (0.5+Math.random())+"s";
            box.appendChild(drop);
        }
    }
}

searchBtn.addEventListener("click", () => { if(searchInput.value) getWeather(searchInput.value); });
themeToggle.addEventListener("click", () => document.body.classList.toggle("dark-mode"));

window.addEventListener("load", () => {
    getWeather("Delhi");
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => getWeatherByLocation(p.coords.latitude, p.coords.longitude));
    }
});