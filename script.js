const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;

/* LOCATION BUTTONS */
document.querySelectorAll(".location-btn").forEach(btn => {
    btn.addEventListener("click", () => getWeather(btn.dataset.location));
});

/* ICONS */
const weatherIcons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Snow: "❄️",
    Thunderstorm: "⚡",
    Mist: "🌫️",
    Haze: "🌫️",
    Drizzle: "🌦️"
};

/* AQI */
async function getAQI(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await res.json();
        return data?.list?.[0]?.main?.aqi ?? "--";
    } catch {
        return "--";
    }
}

/* WEATHER */
async function getWeather(city) {
    if (!city) return;

    homeSection.innerHTML = "🔍 Loading...";

    try {
        const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const current = await currentRes.json();

        if (current.cod !== 200) {
            homeSection.innerHTML = "❌ City not found";
            return;
        }

        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        const forecast = await forecastRes.json();

        renderWeather(current, forecast);

    } catch (err) {
        console.log(err);
        homeSection.innerHTML = "⚠️ Error fetching data";
    }
}

/* RENDER */
async function renderWeather(current, forecast) {

    currentWeather = current.weather?.[0]?.main || "Clear";
    currentTemp = current.main.temp;

    const icon = weatherIcons[currentWeather] || "🌡️";
    const aqi = await getAQI(current.coord.lat, current.coord.lon);

    let aqiText = "Good 😊", aqiColor = "#2ecc71";
    if (aqi == 2) { aqiText = "Fair 🙂"; aqiColor = "#f1c40f"; }
    if (aqi == 3) { aqiText = "Moderate 😐"; aqiColor = "#e67e22"; }
    if (aqi >= 4) { aqiText = "Poor 😷"; aqiColor = "#e74c3c"; }

    const sunrise = new Date(current.sys.sunrise * 1000)
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const sunset = new Date(current.sys.sunset * 1000)
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    /* HOURLY */
    const hourly = forecast.list.slice(0, 8);

    /* TOMORROW */
    const tomorrow = forecast.list.slice(8, 16);

    /* 5 DAYS (safe grouping) */
    const dailyMap = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyMap[date]) dailyMap[date] = item;
    });
    const fiveDays = Object.values(dailyMap);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>

        <div class="extra-info">
            <p>🤒 Feels ${current.main.feels_like.toFixed(1)}°C</p>
            <p>💧 ${current.main.humidity}%</p>
            <p>💨 ${current.wind.speed} m/s</p>
            <p>🌅 ${sunrise}</p>
            <p>🌇 ${sunset}</p>
        </div>
    </div>

    <div class="aqi-card" style="background:${aqiColor}">
        🌫️ AQI ${aqi} • ${aqiText}
    </div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">

            <div class="swipe-slide">
                <h3>⏰ Hourly</h3>
                ${hourly.map(h => `
                    <p>${h.dt_txt.slice(11,16)} → ${h.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

            <div class="swipe-slide">
                <h3>🌅 Tomorrow</h3>
                ${tomorrow.map(t => `
                    <p>${t.dt_txt.slice(11,16)} → ${t.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

            <div class="swipe-slide">
                <h3>📅 5 Days</h3>
                ${fiveDays.map(d => `
                    <p>${d.dt_txt.slice(0,10)} → ${d.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

        </div>
    </div>
    `;

    runAnimation(currentWeather);

    // IMPORTANT FIX: re-init after DOM render
    setTimeout(initSwipe, 100);
}

/* ANIMATION */
function runAnimation(type) {
    const box = document.getElementById("weatherAnimation");
    box.innerHTML = "";

    for (let i = 0; i < 6; i++) {
        const c = document.createElement("div");
        c.className = "cloud";
        c.style.top = Math.random() * 80 + "%";
        box.appendChild(c);
    }

    if (type === "Rain") {
        for (let i = 0; i < 60; i++) {
            const r = document.createElement("div");
            r.className = "rain-drop";
            r.style.left = Math.random() * 100 + "%";
            box.appendChild(r);
        }
    }

    if (type === "Snow") {
        for (let i = 0; i < 40; i++) {
            const s = document.createElement("div");
            s.className = "snowflake";
            s.innerText = "❄️";
            s.style.left = Math.random() * 100 + "%";
            box.appendChild(s);
        }
    }

    if (type === "Clear") {
        const sun = document.createElement("div");
        sun.className = "sun";
        box.appendChild(sun);
    }
}

/* SWIPE FIX (IMPORTANT IMPROVEMENT) */
function initSwipe() {
    const slider = document.getElementById("slider");
    if (!slider) return;

    let startX = 0;
    let index = 0;

    slider.ontouchstart = e => startX = e.touches[0].clientX;

    slider.ontouchend = e => {
        let diff = startX - e.changedTouches[0].clientX;

        if (diff > 50 && index < 2) index++;
        if (diff < -50 && index > 0) index--;

        slider.style.transform = `translateX(-${index * 100}%)`;
    };

    slider.onmousedown = e => startX = e.clientX;

    slider.onmouseup = e => {
        let diff = startX - e.clientX;

        if (diff > 50 && index < 2) index++;
        if (diff < -50 && index > 0) index--;

        slider.style.transform = `translateX(-${index * 100}%)`;
    };
}

/* SEARCH */
searchBtn.onclick = () => {
    const city = searchInput.value.trim();
    if (city) getWeather(city);
};

/* THEME */
themeToggle.onclick = () => {
    document.body.classList.toggle("dark-mode");
};

/* DEFAULT */
window.onload = () => {
    getWeather("Delhi");
};

/* AI (UPGRADED) */
function askAI() {
    const q = aiInput.value.toLowerCase().trim();

    if (!q) {
        aiOutput.innerText = "❌ Please ask something";
        return;
    }

    if (q.includes("temp")) {
        aiOutput.innerText = `🌡️ ${currentTemp}°C`;
    }
    else if (q.includes("weather")) {
        aiOutput.innerText = `🌤️ ${currentWeather}`;
    }
    else if (q.includes("aqi")) {
        aiOutput.innerText = "🌫️ AQI shown in weather card above";
    }
    else {
        aiOutput.innerText = "Try: temp / weather / aqi";
    }
}