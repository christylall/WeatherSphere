const API_KEY = "da287b27ab2c62083846949656a915d4";


const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

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

/* GET WEATHER */
async function getWeather(city){
    homeSection.innerHTML = "<p>Loading...</p>";

    try{
        const current = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`).then(r=>r.json());
        const forecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`).then(r=>r.json());

        renderWeather(current, forecast);
    }catch{
        homeSection.innerHTML = "<p>Error loading weather</p>";
    }
}

/* RENDER */
async function renderWeather(current, forecast){
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;

    const icon = weatherIcons[currentWeather] || "🌡️";

    /* HOURLY */
    const hourly = forecast.list.slice(0,8);

    /* DAILY */
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
    <h2>${current.name}</h2>
    <h1>${currentTemp.toFixed(1)}°C</h1>
    <p>${icon} ${current.weather[0].description}</p>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">

            <!-- HOURLY -->
            <div class="swipe-slide">
                <h3>Today</h3>
                ${hourly.map(h=>{
                    const t = h.dt_txt.split(" ")[1].slice(0,5);
                    return `<p>${t} ${weatherIcons[h.weather[0].main]} ${h.main.temp.toFixed(1)}°C</p>`;
                }).join("")}
            </div>

            <!-- TOMORROW -->
            <div class="swipe-slide">
                <h3>Tomorrow</h3>
                ${daily[tomorrow].map(t=>{
                    const time = t.dt_txt.split(" ")[1].slice(0,5);
                    return `<p>${time} ${weatherIcons[t.weather[0].main]} ${t.main.temp.toFixed(1)}°C</p>`;
                }).join("")}
            </div>

            <!-- 5 DAY -->
            <div class="swipe-slide">
                <h3>5 Days</h3>
                ${fiveDays.map(day=>{
                    const avg = (daily[day].reduce((s,d)=>s+d.main.temp,0)/daily[day].length).toFixed(1);
                    const name = new Date(day).toLocaleDateString("en-US",{weekday:"short"});
                    return `<p>${name} ${avg}°C</p>`;
                }).join("")}
            </div>

        </div>
    </div>
    `;

    initSwipe();
}

/* 🔥 PRO SLIDER */
function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;

    let startX = 0;
    let isDragging = false;
    let index = 0;

    function setX(x){
        slider.style.transform = `translateX(${x}px)`;
    }

    function start(x){
        isDragging = true;
        startX = x;
        slider.style.transition = "none";
    }

    function move(x){
        if(!isDragging) return;
        const diff = x - startX;
        setX(-index*slider.offsetWidth + diff);
    }

    function end(x){
        if(!isDragging) return;
        isDragging = false;

        const diff = x - startX;

        if(diff < -80 && index < 2) index++;
        if(diff > 80 && index > 0) index--;

        slider.style.transition = "0.4s";
        setX(-index*slider.offsetWidth);
    }

    /* TOUCH */
    slider.addEventListener("touchstart",e=>start(e.touches[0].clientX));
    slider.addEventListener("touchmove",e=>move(e.touches[0].clientX));
    slider.addEventListener("touchend",e=>end(e.changedTouches[0].clientX));

    /* MOUSE */
    slider.addEventListener("mousedown",e=>start(e.clientX));
    window.addEventListener("mousemove",e=>move(e.clientX));
    window.addEventListener("mouseup",e=>end(e.clientX));
}

/* SEARCH */
searchBtn.onclick = ()=>{
    if(searchInput.value) getWeather(searchInput.value);
};

/* AUTO LOAD */
window.onload = ()=>{
    getWeather("Delhi");
};