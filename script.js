const API_KEY = "da287b27ab2c62083846949656a915d4";

document.addEventListener("DOMContentLoaded", () => {

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

let currentWeather = "";
let currentTemp = 0;

/* ---------------- LOCATION BUTTONS ---------------- */
document.querySelectorAll(".location-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        getWeather(btn.dataset.location);
    });
});

/* ---------------- ICONS ---------------- */
const weatherIcons = {
    Clear:"☀️", Clouds:"☁️", Rain:"🌧️",
    Snow:"❄️", Thunderstorm:"⚡",
    Mist:"🌫️", Haze:"🌫️", Drizzle:"🌦️"
};

/* ---------------- AQI ---------------- */
async function getAQI(lat, lon){
    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    }catch{
        return null;
    }
}

/* ---------------- WEATHER ---------------- */
async function getWeather(city){
    homeSection.innerHTML = "<p>Loading...</p>";

    try{
        const current = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        ).then(r=>r.json());

        if(current.cod !== 200){
            homeSection.innerHTML = "<p>City not found ❌</p>";
            return;
        }

        const forecast = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        ).then(r=>r.json());

        renderWeather(current, forecast);

    }catch{
        homeSection.innerHTML = "<p>Error ❌</p>";
    }
}

/* ---------------- RENDER ---------------- */
async function renderWeather(current, forecast){

    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;

    const icon = weatherIcons[currentWeather] || "🌡️";
    const aqi = await getAQI(current.coord.lat, current.coord.lon);

    let advice = "Stay hydrated 💧";
    if(currentWeather==="Rain") advice="Carry umbrella ☔";
    if(currentTemp>35) advice="Avoid heat 🥵";
    if(aqi && aqi>=4) advice="Poor air quality 😷";

    const hourly = forecast.list.slice(0,8);

    const daily = {};
    forecast.list.forEach(i=>{
        const d = i.dt_txt.split(" ")[0];
        if(!daily[d]) daily[d]=[];
        daily[d].push(i);
    });

    const days = Object.keys(daily);
    const tomorrow = days[1];
    const fiveDays = days.slice(1,6);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>
    </div>

    <div class="aqi-card">
        <h3>AQI</h3>
        <p>${aqi ?? "--"}</p>
    </div>

    <div class="prevention-card">
        <h3>Advice</h3>
        <p>${advice}</p>
    </div>

    <!-- SWIPE + DOTS -->
    <div class="swipe-wrapper">
        <div class="swipe-slider" id="slider">

            <div class="swipe-slide">
                <h3>Today</h3>
                ${hourly.map(h=>{
                    const t = h.dt_txt.split(" ")[1].slice(0,5);
                    return `<div class="forecast-card">${t}<br>${weatherIcons[h.weather[0].main]} ${h.main.temp.toFixed(1)}°C</div>`;
                }).join("")}
            </div>

            <div class="swipe-slide">
                <h3>Tomorrow</h3>
                ${daily[tomorrow].map(t=>{
                    const time = t.dt_txt.split(" ")[1].slice(0,5);
                    return `<div class="forecast-card">${time}<br>${weatherIcons[t.weather[0].main]} ${t.main.temp.toFixed(1)}°C</div>`;
                }).join("")}
            </div>

            <div class="swipe-slide">
                <h3>5 Days</h3>
                ${fiveDays.map(day=>{
                    const avg = (daily[day].reduce((s,d)=>s+d.main.temp,0)/daily[day].length).toFixed(1);
                    const name = new Date(day).toLocaleDateString("en-US",{weekday:"short"});
                    return `<div class="forecast-card">${name}<br>${avg}°C</div>`;
                }).join("")}
            </div>

        </div>

        <!-- DOTS -->
        <div class="dots">
            <span onclick="goSlide(0)"></span>
            <span onclick="goSlide(1)"></span>
            <span onclick="goSlide(2)"></span>
        </div>
    </div>
    `;

    runAnimation(currentWeather);
    initSwipe();
}

/* ---------------- ANIMATION ---------------- */
function runAnimation(type){
    const box = document.getElementById("weatherAnimation");
    if(!box) return;

    box.innerHTML = "";

    for(let i=0;i<5;i++){
        const c = document.createElement("div");
        c.className="cloud";
        c.style.top=(10+i*10)+"%";
        box.appendChild(c);
    }

    if(type==="Rain" || type==="Drizzle"){
        for(let i=0;i<60;i++){
            const r=document.createElement("div");
            r.className="rain-drop";
            r.style.left=Math.random()*100+"%";
            box.appendChild(r);
        }
    }

    if(type==="Clear"){
        const sun=document.createElement("div");
        sun.className="sun";
        box.appendChild(sun);
    }
}

/* ---------------- SWIPE + LAPTOP SUPPORT ---------------- */
let index = 0;

function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;

    let startX = 0;

    function update(){
        slider.style.transform = `translateX(-${index*100}%)`;
    }

    slider.onmousedown = e => startX = e.clientX;

    window.onmouseup = e=>{
        let diff = e.clientX - startX;

        if(diff < -50 && index < 2) index++;
        if(diff > 50 && index > 0) index--;

        update();
    };

    slider.ontouchstart = e => startX = e.touches[0].clientX;

    slider.ontouchend = e=>{
        let diff = e.changedTouches[0].clientX - startX;

        if(diff < -50 && index < 2) index++;
        if(diff > 50 && index > 0) index--;

        update();
    };

    window.goSlide = (i)=>{
        index = i;
        update();
    };
}

/* ---------------- SEARCH ---------------- */
searchBtn.onclick = ()=>{
    if(searchInput.value) getWeather(searchInput.value);
};

/* ---------------- THEME ---------------- */
themeToggle.onclick = ()=>{
    document.body.classList.toggle("dark-mode");
};

/* ---------------- AI FIX ---------------- */
window.fillQuestion = function(q){
    document.getElementById("aiInput").value = q;
    askAI();
};

window.askAI = function(){
    const input = document.getElementById("aiInput").value.toLowerCase();
    const output = document.getElementById("aiOutput");

    if(input.includes("temperature"))
        output.innerText = `${currentTemp.toFixed(1)}°C`;

    else if(input.includes("wear"))
        output.innerText = currentTemp>32 ? "Light clothes ☀️" : "Normal clothes 🙂";

    else
        output.innerText = "Ask proper weather question 😄";
};

/* ---------------- DEFAULT LOAD ---------------- */
getWeather("Delhi");

});