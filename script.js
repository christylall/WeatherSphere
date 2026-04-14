const API_KEY = "da287b27ab2c62083846949656a915d4";

let currentWeather = "";
let currentTemp = 0;
let currentHumidity = 0;
let currentSlideIndex = 0;

const weatherIcons = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️",
    Thunderstorm: "⚡", Mist: "🌫️", Haze: "🌫️", Drizzle: "🌦️", Smoke: "💨"
};

async function getWeather(city) {
    const homeSection = document.getElementById("homeSection");

    homeSection.innerHTML = `🌍 <p style='text-align:center;'>🔍 Searching <b>${city}</b>... 📡✨</p>`;

    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();

        if (current.cod !== 200) {
            homeSection.innerHTML = "❌ City not found! Try again 🔍";
            return;
        }

        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}`);
        const aqiData = await aqiRes.json();

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();

        renderWeather(current, forecast, aqiData.list[0].main.aqi);

    } catch {
        homeSection.innerHTML = "⚠️ Network Error 🌐 Check internet!";
    }
}

function renderWeather(current, forecast, aqi) {
    const homeSection = document.getElementById("homeSection");

    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;
    currentHumidity = current.main.humidity;

    const icon = weatherIcons[currentWeather] || "🌡️";

    const dailyData = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) dailyData[date] = item;
    });

    const days = Object.keys(dailyData).slice(1, 6);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name} 🏙️</h2>
        <h1>🌡️ ${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description.toUpperCase()} ${icon}</p>
    </div>

    <div class="aqi-card">
        🌿 AQI: <b>${aqi}</b> ${aqi <= 2 ? "✅ Fresh Air 😌" : "😷 Polluted Air"}
    </div>

    <div class="slider-wrapper">
        <div class="slider" id="slider">
            
            <!-- ⏳ 24 HOURS -->
            <div class="slide">
                <h3>⏳ Next 24 Hours</h3>
                ${forecast.list.slice(0,8).map(h=>`
                    <p>🕒 ${h.dt_txt.slice(11,16)} ➝ 🌡️ ${h.main.temp.toFixed(0)}°C ${weatherIcons[h.weather[0].main] || "🌡️"}</p>
                `).join("")}
            </div>

            <!-- 🌅 TOMORROW -->
            <div class="slide">
                <h3>🌅 Tomorrow Forecast</h3>
                ${forecast.list.slice(8,16).map(t=>`
                    <p>⏰ ${t.dt_txt.slice(11,16)} ➝ 🌡️ ${t.main.temp.toFixed(0)}°C ${weatherIcons[t.weather[0].main] || "🌡️"}</p>
                `).join("")}
            </div>

            <!-- 📅 5 DAYS -->
            <div class="slide">
                <h3>📅 5-Day Forecast</h3>
                ${days.map(d=>{
                    return `<p>📆 ${d} ➝ 🌡️ ${dailyData[d].main.temp.toFixed(0)}°C ${weatherIcons[dailyData[d].weather[0].main] || "🌡️"}</p>`;
                }).join("")}
            </div>

        </div>

        <div class="dots">
            <span onclick="goToSlide(0)">⚪</span>
            <span onclick="goToSlide(1)">⚪</span>
            <span onclick="goToSlide(2)">⚪</span>
        </div>
    </div>
    `;

    setupSlider();
    setWeatherAnimation(currentWeather);
}

/* 🎠 SLIDER */
function setupSlider() {
    const slider = document.getElementById("slider");

    let startX = 0;

    slider.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", e => {
        let diff = startX - e.changedTouches[0].clientX;

        if (diff > 50 && currentSlideIndex < 2) currentSlideIndex++;
        if (diff < -50 && currentSlideIndex > 0) currentSlideIndex--;

        goToSlide(currentSlideIndex);
    });
}

window.goToSlide = function(index) {
    const slider = document.getElementById("slider");
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
};

/* 🌌 BACKGROUND ANIMATION */
function setWeatherAnimation(weather) {
    const bg = document.getElementById("weatherAnimation");

    if (weather === "Rain") bg.innerHTML = "🌧️🌧️🌧️🌧️";
    else if (weather === "Clear") bg.innerHTML = "☀️🌞☀️";
    else if (weather === "Clouds") bg.innerHTML = "☁️☁️☁️";
    else if (weather === "Snow") bg.innerHTML = "❄️❄️❄️";
    else bg.innerHTML = "🌤️✨";
}

/* 🤖 AI */
window.askAI = function() {
    const input = document.getElementById("aiInput").value.toLowerCase();
    const output = document.getElementById("aiOutput");

    if (!currentWeather) {
        output.innerText = "🔍 Search a city first!";
        return;
    }

    let ans = "";

    if (input.includes("temp")) {
        ans = `🌡️ Current temperature is ${currentTemp.toFixed(1)}°C`;
    } 
    else if (input.includes("wear")) {
        if (currentTemp > 30) ans = "👕 Wear light cotton clothes 🩳";
        else if (currentTemp < 15) ans = "🧥 Wear warm clothes 🧣";
        else ans = "🙂 Wear comfortable clothes 👖";
    } 
    else if (input.includes("crop")) {
        if (currentHumidity > 70) ans = "🌾 Best crop: Rice (high humidity)";
        else ans = "🌱 Best crop: Wheat (low humidity)";
    } 
    else {
        ans = "🤖 Ask about temperature 🌡️, clothes 👗 or crops 🌾";
    }

    output.innerHTML = ans;
};

/* 🚀 LOAD */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchBtn").onclick = () => {
        getWeather(document.getElementById("searchInput").value);
    };

    document.querySelectorAll(".location-btn").forEach(btn => {
        btn.onclick = () => getWeather(btn.dataset.location);
    });

    document.getElementById("themeToggle").onclick = () => {
        document.body.classList.toggle("dark-mode");
    };

    getWeather("Delhi");
});