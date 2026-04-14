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

/* QUICK CITY BUTTONS */
document.querySelectorAll(".location-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        getWeather(btn.dataset.location);
    });
});

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

/* AQI */
async function getAQI(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    } catch {
        return "--";
    }
}

/* CITY WEATHER */
async function getWeather(city) {
    homeSection.innerHTML = "<p>Loading weather...</p>";
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        if (current.cod !== 200) {
            homeSection.innerHTML = "<p>City not found</p>";
            return;
        }

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        renderWeather(current, forecast);
    } catch (err) {
        console.error("Weather API Error:", err);
        homeSection.innerHTML = "<p>Weather API Error</p>";
    }
}

/* LOCATION WEATHER */
async function getWeatherByLocation(lat, lon) {
    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();
        renderWeather(current, forecast);
    } catch (err) {
        console.error("Location weather fetch failed:", err);
    }
}

/* RENDER WEATHER */
async function renderWeather(current, forecast) {
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;

    const icon = weatherIcons[currentWeather] || "🌡️";
    const lat = current.coord.lat;
    const lon = current.coord.lon;
    const aqi = await getAQI(lat, lon);

    const sunriseTime = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const sunsetTime = new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const hourly = forecast.list.slice(0, 8);

    // Grouping for 5-Day Forecast
    const daily = {};
    forecast.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = [];
        daily[date].push(item);
    });

    const days = Object.keys(daily);
    const tomorrow = days[1] || days[0];
    const fiveDays = days.slice(1, 6);

    let advice = "Stay hydrated";
    if (currentWeather === "Rain") advice = "Carry umbrella ☔";
    if (currentWeather === "Clear") advice = "Wear sunglasses 😎";
    if (currentWeather === "Clouds") advice = "Light jacket recommended";
    if (aqi >= 4) advice = "Avoid outdoor activities";

    currentSlideIndex = 0;

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>${current.name}, ${current.sys.country}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>
        <p>Feels Like ${current.main.feels_like.toFixed(1)}°C | Humidity ${current.main.humidity}%</p>
        <p>🌄Sunrise ${sunriseTime} | 🌇Sunset ${sunsetTime}</p>
    </div>

    <div class="aqi-card">
        <h3>Air Quality Index: ${aqi}</h3>
    </div>

    <div class="prevention-card">
        <h3>Health Advice</h3>
        <p>${advice}</p>
    </div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">
            <div class="swipe-slide">
                <h3>Hourly Forecast</h3>
                <div class="hourly-cards">
                    ${hourly.map(h => {
                        const time = h.dt_txt.split(" ")[1].slice(0,5);
                        return `<div class="hour-card"><p>${time}</p><p>${weatherIcons[h.weather[0].main] || "🌡️"}</p><p>${h.main.temp.toFixed(1)}°C</p></div>`;
                    }).join("")}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>Tomorrow</h3>
                <div class="tomorrow-box">
                    ${daily[tomorrow].map(t => {
                        const time = t.dt_txt.split(" ")[1].slice(0,5);
                        return `<p>${time} ${weatherIcons[t.weather[0].main] || "🌡️"} ${t.main.temp.toFixed(1)}°C</p>`;
                    }).join("")}
                </div>
            </div>
            <div class="swipe-slide">
                <h3>5 Day Forecast</h3>
                <div class="forecast-cards">
                    ${fiveDays.map(day => {
                        const dayData = daily[day];
                        const avg = (dayData.reduce((s,d)=>s+d.main.temp,0)/dayData.length).toFixed(1);
                        const main = dayData[0].weather[0].main;
                        const name = new Date(day).toLocaleDateString("en-US",{weekday:"short"});
                        return `<div class="forecast-card"><p>${name}</p><p>${weatherIcons[main] || "🌡️"}</p><p>${avg}°C</p></div>`;
                    }).join("")}
                </div>
            </div>
        </div>
        <div class="slider-dots" id="sliderDots">
            <span class="dot active" onclick="goToSlide(0)"></span>
            <span class="dot" onclick="goToSlide(1)"></span>
            <span class="dot" onclick="goToSlide(2)"></span>
        </div>
    </div>`;

    runAnimation(currentWeather);
    initSwipe();
}

/* WEATHER ANIMATION */
function runAnimation(type) {
    const box = document.getElementById("weatherAnimation");
    if(!box) return;
    box.innerHTML = "";
    for(let i=0;i<6;i++){
        const cloud = document.createElement("div");
        cloud.className = "cloud";
        cloud.style.top = (10+i*10)+"%";
        cloud.style.animationDuration = (20+Math.random()*20)+"s";
        box.appendChild(cloud);
    }
    if(type==="Rain" || type==="Drizzle"){
        for(let i=0;i<120;i++){
            const drop = document.createElement("div");
            drop.className="rain-drop";
            drop.style.left = Math.random()*100+"%";
            drop.style.animationDuration = (0.5+Math.random())+"s";
            box.appendChild(drop);
        }
    }
    if(type==="Clear"){
        const sun = document.createElement("div");
        sun.className="sun";
        const rays = document.createElement("div");
        rays.className="sun-rays";
        box.appendChild(sun);
        box.appendChild(rays);
    }
}

/* SWIPE LOGIC */
window.updateDots = function() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlideIndex));
}

window.goToSlide = function(index) {
    const slider = document.getElementById("slider");
    if (!slider) return;
    currentSlideIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    window.updateDots();
};

function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;

    let startX = 0;
    let isDragging = false;

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
        if (diff > 50 && currentSlideIndex < 2) currentSlideIndex++;
        else if (diff < -50 && currentSlideIndex > 0) currentSlideIndex--;
        window.goToSlide(currentSlideIndex);
    }
    window.updateDots();
}

/* SEARCH & THEME */
searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if(city) getWeather(city);
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

window.addEventListener("load", () => {
    getWeather("Delhi");
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            pos => getWeatherByLocation(pos.coords.latitude, pos.coords.longitude)
        );
    }
});

/* AI LOGIC */
window.fillQuestion = function(q) { aiInput.value = q; askAI(); };

window.askAI = function() {
    if(!currentWeather) { aiOutput.innerText = "Weather data loading..."; return; }
    const q = aiInput.value.toLowerCase();
    let ans = "Ask about temperature, wear, crop or disease.";
    if(q.includes("temperature")) ans = `Current temperature is ${currentTemp.toFixed(1)}°C`;
    else if(q.includes("wear")){
        if(currentWeather==="Rain") ans="Carry an umbrella ☔";
        else if(currentTemp>32) ans="Wear cotton clothes ☀️";
        else if(currentTemp<15) ans="Wear a jacket 🧥";
        else ans="Comfortable casual clothes are suitable.";
    }
    else if(q.includes("crop")) ans = "Rice for rain, Wheat for winter.";
    else if(q.includes("disease")) ans = "Mosquito risk in rain, hydration risk in heat.";
    aiOutput.innerText = ans;
};