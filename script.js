const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;
let index = 0;

/* BUTTONS */
document.querySelectorAll(".location-btn").forEach(btn => {
    btn.onclick = () => getWeather(btn.dataset.location);
});

/* ICONS */
const weatherIcons = {
    Clear:"☀️",
    Clouds:"☁️",
    Rain:"🌧️",
    Snow:"❄️",
    Thunderstorm:"⚡",
    Mist:"🌫️",
    Haze:"🌫️",
    Drizzle:"🌦️"
};

/* SEARCH */
searchBtn.onclick = () => {
    if(searchInput.value.trim()) {
        getWeather(searchInput.value.trim());
    }
};

/* WEATHER FETCH */
async function getWeather(city){
    homeSection.innerHTML = "Loading...";

    try {
        const current = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        ).then(r=>r.json());

        const forecast = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        ).then(r=>r.json());

        if(!current || current.cod !== 200){
            homeSection.innerHTML = "City not found ❌";
            return;
        }

        renderWeather(current, forecast);

    } catch {
        homeSection.innerHTML = "Error ⚠️";
    }
}

/* AQI */
async function getAQI(lat, lon){
    try{
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await res.json();
        return data.list[0].main.aqi;
    } catch {
        return "--";
    }
}

/* RENDER */
async function renderWeather(current, forecast){

    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;

    const icon = weatherIcons[currentWeather] || "🌡️";

    const aqi = await getAQI(current.coord.lat, current.coord.lon);

    let aqiText = "Good 😊", aqiColor = "#2ecc71";
    if(aqi == 2){ aqiText="Fair 🙂"; aqiColor="#f1c40f"; }
    if(aqi == 3){ aqiText="Moderate 😐"; aqiColor="#e67e22"; }
    if(aqi >= 4){ aqiText="Poor 😷"; aqiColor="#e74c3c"; }

    /* EXTRA INFO */
    const sunrise = new Date(current.sys.sunrise*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    const sunset = new Date(current.sys.sunset*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});

    const hourly = forecast.list.slice(0,8);

    const daily = {};
    forecast.list.forEach(i=>{
        const d = i.dt_txt.split(" ")[0];
        if(!daily[d]) daily[d]=[];
        daily[d].push(i);
    });

    const days = Object.keys(daily);

    homeSection.innerHTML = `
    
    <div class="current-weather">
        <h2>📍 ${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>

        <div class="extra-info">
            <p>💧 ${current.main.humidity}%</p>
            <p>💨 ${current.wind.speed} m/s</p>
            <p>🌅 ${sunrise}</p>
            <p>🌇 ${sunset}</p>
        </div>
    </div>

    <!-- AQI CARD (RESTORED) -->
    <div class="aqi-card" style="background:${aqiColor}">
        🌫️ AQI ${aqi} - ${aqiText}
    </div>

    <!-- SWIPE -->
    <div class="swipe-container">
        <div class="swipe-slider" id="slider">

            <div class="swipe-slide">
                <h3>Hourly ⏰</h3>
                ${hourly.map(h=>`
                    <p>${h.dt_txt.slice(11,16)} → ${h.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

            <div class="swipe-slide">
                <h3>Tomorrow 🌅</h3>
                ${daily[days[1]]?.map(t=>`
                    <p>${t.dt_txt.slice(11,16)} → ${t.main.temp.toFixed(0)}°C</p>
                `).join("") || "No data"}
            </div>

            <div class="swipe-slide">
                <h3>5 Days 📅</h3>
                ${days.slice(0,5).map(d=>`
                    <p>${d} → ${daily[d][0].main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

        </div>
    </div>
    `;

    index = 0;
    initSwipe();
    runAnimation(currentWeather);
}

/* SWIPE FIX (STABLE) */
function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;

    let startX = 0;

    function move(diff){
        if(diff > 50 && index < 2) index++;
        if(diff < -50 && index > 0) index--;

        slider.style.transform = `translateX(-${index*100}%)`;
    }

    slider.ontouchstart = e => startX = e.touches[0].clientX;
    slider.ontouchend = e => move(startX - e.changedTouches[0].clientX);

    slider.onmousedown = e => startX = e.clientX;
    slider.onmouseup = e => move(startX - e.clientX);
}

/* AI FIX */
function fillQuestion(q){
    aiInput.value = q;
    askAI();
}

function askAI(){

    if(!currentTemp){
        aiOutput.innerText = "⚠️ पहले weather search करो";
        return;
    }

    const q = aiInput.value.toLowerCase();

    if(q.includes("temp")){
        aiOutput.innerText = `${currentTemp}°C`;
    }
    else if(q.includes("wear")){
        aiOutput.innerText = currentTemp > 30 ? "Light clothes ☀️" : "Jacket 🧥";
    }
    else if(q.includes("crop")){
        aiOutput.innerText = currentWeather === "Rain" ? "Rice 🌾" : "Wheat 🌾";
    }
    else if(q.includes("disease")){
        aiOutput.innerText = currentWeather === "Rain" ? "Mosquito risk 🦟" : "Low risk 🙂";
    }
    else{
        aiOutput.innerText = "Try: temp / wear / crop / disease";
    }
}

/* THEME */
themeToggle.onclick = ()=>{
    document.body.classList.toggle("dark-mode");
};

/* ANIMATION RESTORED */
function runAnimation(type){
    const box = document.getElementById("weatherAnimation");
    if(!box) return;

    box.innerHTML = "";

    for(let i=0;i<5;i++){
        const c = document.createElement("div");
        c.className = "cloud";
        c.style.top = (10+i*15)+"%";
        box.appendChild(c);
    }

    if(type === "Rain"){
        for(let i=0;i<60;i++){
            const r = document.createElement("div");
            r.className = "rain-drop";
            r.style.left = Math.random()*100+"%";
            box.appendChild(r);
        }
    }

    if(type === "Snow"){
        for(let i=0;i<40;i++){
            const s = document.createElement("div");
            s.className = "snowflake";
            s.innerText = "❄️";
            s.style.left = Math.random()*100+"%";
            box.appendChild(s);
        }
    }

    if(type === "Clear"){
        const sun = document.createElement("div");
        sun.className = "sun";
        box.appendChild(sun);
    }
}

/* DEFAULT */
window.onload = ()=>getWeather("Delhi");