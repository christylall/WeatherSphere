const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let index = 0;
let currentTemp = 0;
let currentWeather = "";

/* EVENTS */
searchBtn.onclick = () => getWeather(searchInput.value);

document.querySelectorAll(".location-btn").forEach(btn => {
    btn.onclick = () => getWeather(btn.dataset.location);
});

/* ICONS */
const icons = {
    Clear:"☀️",
    Clouds:"☁️",
    Rain:"🌧️",
    Snow:"❄️",
    Thunderstorm:"⚡",
    Mist:"🌫️",
    Haze:"🌫️",
    Drizzle:"🌦️"
};

/* WEATHER */
async function getWeather(city){

    if(!city) return;

    homeSection.innerHTML = "Loading...";

    try{

        const current = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        ).then(r=>r.json());

        if(!current || current.cod !== 200){
            homeSection.innerHTML = "City not found ❌";
            return;
        }

        const forecast = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        ).then(r=>r.json());

        render(current, forecast);

    }catch(err){
        homeSection.innerHTML = "Error loading data ⚠️";
    }
}

/* AQI SAFE */
async function getAQI(lat, lon){
    try{
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await res.json();
        return data?.list?.[0]?.main?.aqi ?? "--";
    }catch{
        return "--";
    }
}

/* RENDER */
async function render(current, forecast){

    currentTemp = current.main.temp;
    currentWeather = current.weather[0].main;

    const icon = icons[currentWeather] || "🌡️";

    /* HOURLY */
    const hourly = forecast.list.slice(0,8);

    /* GROUP DAYS */
    const daily = {};
    forecast.list.forEach(i=>{
        const d = i.dt_txt.split(" ")[0];
        if(!daily[d]) daily[d] = [];
        daily[d].push(i);
    });

    const days = Object.keys(daily);

    /* AQI */
    const aqi = await getAQI(current.coord.lat, current.coord.lon);

    let aqiText = "Good 😊";
    if(aqi == 2) aqiText = "Fair 🙂";
    if(aqi == 3) aqiText = "Moderate 😐";
    if(aqi >= 4) aqiText = "Poor 😷";

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>

        <div class="extra-info">
            <p>💧 ${current.main.humidity}%</p>
            <p>💨 ${current.wind.speed} m/s</p>
            <p>🌡️ ${current.main.pressure} hPa</p>
            <p>🤒 ${current.main.feels_like}°C</p>
        </div>
    </div>

    <div class="aqi-card">
        🌫️ AQI: ${aqi} (${aqiText})
    </div>

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
                ${daily[days[1]] ? daily[days[1]].map(t=>`
                    <p>${t.dt_txt.slice(11,16)} → ${t.main.temp.toFixed(0)}°C</p>
                `).join("") : "No data"}
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
    updateDots(0);
    initSwipe();
    runAnimation(currentWeather);
}

/* SWIPE FIX */
function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;

    let startX = 0;

    slider.ontouchstart = e => startX = e.touches[0].clientX;
    slider.ontouchend = e => move(startX - e.changedTouches[0].clientX);

    slider.onmousedown = e => startX = e.clientX;
    slider.onmouseup = e => move(startX - e.clientX);
}

function move(diff){
    if(diff > 60 && index < 2) index++;
    if(diff < -60 && index > 0) index--;

    document.getElementById("slider").style.transform =
        `translateX(-${index * 100}%)`;

    updateDots(index);
}

/* DOTS */
function goSlide(i){
    index = i;
    document.getElementById("slider").style.transform =
        `translateX(-${index * 100}%)`;

    updateDots(i);
}

function updateDots(i){
    document.querySelectorAll(".dot").forEach((d,idx)=>{
        d.classList.toggle("active", idx === i);
    });
}

/* AI */
function fillQuestion(q){
    aiInput.value = q;
    askAI();
}

function askAI(){
    const q = aiInput.value.toLowerCase();

    if(!currentTemp){
        aiOutput.innerText = "Search weather first ⚠️";
        return;
    }

    if(q.includes("temp")){
        aiOutput.innerText = `${currentTemp}°C`;
    }
    else if(q.includes("wear")){
        aiOutput.innerText = currentTemp > 30 ? "Light clothes ☀️" : "Jacket 🧥";
    }
    else if(q.includes("crop")){
        aiOutput.innerText = "Wheat / Rice 🌾";
    }
    else if(q.includes("disease")){
        aiOutput.innerText = currentWeather === "Rain" ? "Mosquito risk 🦟" : "Low risk 🙂";
    }
    else{
        aiOutput.innerText = "Try: temp / wear / crop / disease";
    }
}

/* THEME */
themeToggle.onclick = () => {
    document.body.classList.toggle("dark-mode");
};

/* DEFAULT LOAD */
window.onload = () => getWeather("Delhi");

/* ANIMATION */
function runAnimation(type){
    const box = document.getElementById("weatherAnimation");
    if(!box) return;

    box.innerHTML = "";

    if(type === "Clear"){
        const sun = document.createElement("div");
        sun.className = "sun";
        box.appendChild(sun);
    }

    if(type === "Rain"){
        for(let i=0;i<40;i++){
            const r = document.createElement("div");
            r.className = "rain-drop";
            r.style.left = Math.random()*100 + "%";
            box.appendChild(r);
        }
    }

    if(type === "Clouds"){
        for(let i=0;i<5;i++){
            const c = document.createElement("div");
            c.className = "cloud";
            c.style.top = (10+i*12) + "%";
            box.appendChild(c);
        }
    }
}