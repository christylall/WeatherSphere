const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;

/* WEATHER ICONS */
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

/* QUICK BUTTONS */
document.querySelectorAll(".location-btn").forEach(btn => {
    btn.addEventListener("click", () => getWeather(btn.dataset.location));
});

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

/* GET WEATHER */
async function getWeather(city) {
    homeSection.innerHTML = "<p>Loading...</p>";

    try {
        const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const current = await currentRes.json();

        if (!current || current.cod !== 200) {
            homeSection.innerHTML = "<p>City not found</p>";
            return;
        }

        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        const forecast = await forecastRes.json();

        renderWeather(current, forecast);
    } catch (e) {
        console.error(e);
        homeSection.innerHTML = "<p>API Error</p>";
    }
}

/* RENDER */
async function renderWeather(current, forecast) {

    currentWeather = current.weather?.[0]?.main || "";
    currentTemp = current.main?.temp || 0;

    const icon = weatherIcons[currentWeather] || "🌡️";

    const aqi = await getAQI(current.coord.lat, current.coord.lon);

    const hourly = forecast.list.slice(0, 8);

    /* SAFE GROUPING */
    const daily = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = [];
        daily[date].push(item);
    });

    const days = Object.keys(daily);

    const tomorrow = days.length > 1 ? days[1] : days[0];
    const fiveDays = days.slice(0, 5);

    let advice = "Stay hydrated";
    if (currentWeather === "Rain") advice = "Carry umbrella ☔";
    if (currentWeather === "Clear") advice = "Wear sunglasses 😎";
    if (currentWeather === "Clouds") advice = "Light jacket recommended";
    if (aqi >= 4) advice = "Avoid outdoor activity";

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>${current.name}, ${current.sys.country}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>
        <p>Feels Like ${current.main.feels_like.toFixed(1)}°C</p>
        <p>Humidity ${current.main.humidity}%</p>
        <p>Wind ${current.wind.speed} m/s</p>
    </div>

    <div class="aqi-card">
        <h3>Air Quality</h3>
        <p>${aqi}</p>
    </div>

    <div class="prevention-card">
        <h3>Health Advice</h3>
        <p>${advice}</p>
    </div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">

            <div class="swipe-slide">
                <h3>Hourly</h3>
                <div class="hourly-cards">
                    ${hourly.map(h => `
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
                    ${(daily[tomorrow] || []).map(t => `
                        <p>${t.dt_txt.split(" ")[1].slice(0,5)} 
                        ${weatherIcons[t.weather[0].main] || "🌡️"} 
                        ${t.main.temp.toFixed(1)}°C</p>
                    `).join("")}
                </div>
            </div>

            <div class="swipe-slide">
                <h3>5 Day Forecast</h3>
                <div class="forecast-cards">
                    ${fiveDays.map(day => {
                        const avg =
                            daily[day].reduce((s, d) => s + d.main.temp, 0) /
                            daily[day].length;

                        const main = daily[day][0].weather[0].main;

                        return `
                        <div class="forecast-card">
                            <p>${day}</p>
                            <p>${weatherIcons[main]}</p>
                            <p>${avg.toFixed(1)}°C</p>
                        </div>`;
                    }).join("")}
                </div>
            </div>

        </div>
    </div>
    `;

    runAnimation(currentWeather);

    /* SAFE SWIPE INIT */
    if (!window.swipeInitialized) {
        initSwipe();
        window.swipeInitialized = true;
    }
}

/* ANIMATION */
function runAnimation(type) {
    const box = document.getElementById("weatherAnimation");
    box.innerHTML = "";

    for (let i = 0; i < 5; i++) {
        const c = document.createElement("div");
        c.className = "cloud";
        box.appendChild(c);
    }

    if (type === "Rain") {
        for (let i = 0; i < 80; i++) {
            const d = document.createElement("div");
            d.className = "rain-drop";
            box.appendChild(d);
        }
    }

    if (type === "Clear") {
        const s = document.createElement("div");
        s.className = "sun";
        box.appendChild(s);
    }
}

/* SWIPE (FIXED) */
function initSwipe() {
    const slider = document.getElementById("slider");
    if (!slider) return;

    let index = 0;
    const slides = document.querySelectorAll(".swipe-slide");

    function move() {
        slider.style.transform = `translateX(-${index * 100}%)`;
    }

    /* MOBILE */
    let startX = 0;

    slider.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", e => {
        let diff = startX - e.changedTouches[0].clientX;

        if (diff > 50 && index < slides.length - 1) index++;
        if (diff < -50 && index > 0) index--;

        move();
    });

    /* DESKTOP */
    let isDown = false;

    slider.addEventListener("mousedown", e => {
        isDown = true;
        startX = e.clientX;
    });

    window.addEventListener("mouseup", () => (isDown = false));

    window.addEventListener("mousemove", e => {
        if (!isDown) return;

        let diff = startX - e.clientX;

        if (diff > 80 && index < slides.length - 1) {
            index++;
            startX = e.clientX;
        }

        if (diff < -80 && index > 0) {
            index--;
            startX = e.clientX;
        }

        move();
    });
}

/* EVENTS */
searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) getWeather(city);
});

searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") searchBtn.click();
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

/* DEFAULT */
window.addEventListener("load", () => {
    getWeather("Delhi");
});