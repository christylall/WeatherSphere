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

/* SEARCH CLICK */
searchBtn.onclick = () => {
    if(searchInput.value.trim()) {
        getWeather(searchInput.value.trim());
    }
};

/* ENTER KEY SUPPORT */
searchInput.addEventListener("keypress", e => {
    if(e.key === "Enter") searchBtn.click();
});

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
        homeSection.innerHTML = "Error fetching data ⚠️";
    }
}

/* RENDER */
function renderWeather(current, forecast){

    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;

    const icon = weatherIcons[currentWeather] || "🌡️";

    const hourly = forecast.list.slice(0,8);

    const daily = {};
    forecast.list.forEach(i=>{
        const d = i.dt_txt.split(" ")[0];
        if(!daily[d]) daily[d] = [];
        daily[d].push(i);
    });

    const days = Object.keys(daily);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>
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
    updateDots(0);
    initSwipe();
    runAnimation(currentWeather);
}

/* SWIPE FIX */
function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;

    let startX = 0;

    const move = (diff)=>{
        if(diff > 50 && index < 2) index++;
        if(diff < -50 && index > 0) index--;

        slider.style.transform = `translateX(-${index*100}%)`;
        updateDots(index);
    };

    slider.ontouchstart = e => startX = e.touches[0].clientX;
    slider.ontouchend = e => move(startX - e.changedTouches[0].clientX);

    slider.onmousedown = e => startX = e.clientX;
    slider.onmouseup = e => move(startX - e.clientX);
}

/* DOTS FIX */
function goSlide(i){
    index = i;
    document.getElementById("slider").style.transform =
        `translateX(-${index*100}%)`;
    updateDots(i);
}

function updateDots(i){
    document.querySelectorAll(".dot").forEach((d,idx)=>{
        d.classList.toggle("active", idx === i);
    });
}

/* AI FIX (MAIN ISSUE WAS HERE) */
function fillQuestion(q){
    aiInput.value = q;
    askAI();
}

function askAI(){

    const q = aiInput.value.toLowerCase();

    if(!currentWeather){
        aiOutput.innerText = "⚠️ Pehle weather search karo";
        return;
    }

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

/* THEME FIX */
themeToggle.onclick = ()=>{
    document.body.classList.toggle("dark-mode");
};

/* DEFAULT LOAD */
window.onload = ()=>getWeather("Delhi");

/* ANIMATION SAFE */
function runAnimation(type){
    const box = document.getElementById("weatherAnimation");
    if(!box) return;

    box.innerHTML = "";

    if(type === "Clear"){
        const sun = document.createElement("div");
        sun.className = "sun";
        box.appendChild(sun);
    }
}