const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;

/* GLOBAL AI */
window.fillQuestion = function(q){
    aiInput.value = q;
    askAI();
};
window.askAI = askAI;

/* ICONS */
const weatherIcons={
    Clear:"☀️", Clouds:"☁️", Rain:"🌧️", Snow:"❄️",
    Thunderstorm:"⚡", Mist:"🌫️", Haze:"🌫️", Drizzle:"🌦️"
};

/* WEATHER */
async function getWeather(city){
    homeSection.innerHTML="🔍 Loading...";
    try{
        const current=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`).then(r=>r.json());
        if(current.cod!==200) return homeSection.innerHTML="❌ City not found";

        const forecast=await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`).then(r=>r.json());

        renderWeather(current,forecast);
    }catch{
        homeSection.innerHTML="⚠️ Error";
    }
}

/* RENDER */
function renderWeather(current,forecast){

    currentWeather=current.weather[0].main;
    currentTemp=current.main.temp;

    const icon=weatherIcons[currentWeather]||"🌡️";
    const hourly=forecast.list.slice(0,8);

    homeSection.innerHTML=`
    <div class="current-weather">
        <h2>📍 ${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>
    </div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">

            <div class="swipe-slide">
                <h3>⏰ Hourly</h3>
                ${hourly.map(h=>`<p>${h.dt_txt.slice(11,16)} → ${h.main.temp.toFixed(0)}°C</p>`).join("")}
            </div>

            <div class="swipe-slide">
                <h3>🌅 Tomorrow</h3>
                ${forecast.list.slice(8,16).map(t=>`<p>${t.dt_txt.slice(11,16)} → ${t.main.temp.toFixed(0)}°C</p>`).join("")}
            </div>

            <div class="swipe-slide">
                <h3>📅 5 Days</h3>
                ${forecast.list.filter((_,i)=>i%8===0).map(d=>`<p>${d.dt_txt.slice(0,10)} → ${d.main.temp.toFixed(0)}°C</p>`).join("")}
            </div>

        </div>
    </div>
    `;

    initSwipe();
}

/* 🔥 PERFECT SWIPE (MOBILE + LAPTOP) */
function initSwipe(){
    const slider = document.getElementById("slider");

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let index = 0;

    function start(e){
        isDragging = true;
        startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        slider.style.transition = "none";
    }

    function move(e){
        if(!isDragging) return;

        currentX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        let diff = currentX - startX;

        slider.style.transform = `translateX(calc(-${index * 100}% + ${diff}px))`;
    }

    function end(){
        if(!isDragging) return;

        isDragging = false;
        let diff = currentX - startX;

        if(diff < -80 && index < 2) index++;
        if(diff > 80 && index > 0) index--;

        slider.style.transition = "0.4s ease";
        slider.style.transform = `translateX(-${index * 100}%)`;
    }

    slider.addEventListener("mousedown", start);
    slider.addEventListener("mousemove", move);
    slider.addEventListener("mouseup", end);
    slider.addEventListener("mouseleave", end);

    slider.addEventListener("touchstart", start);
    slider.addEventListener("touchmove", move);
    slider.addEventListener("touchend", end);
}

/* SEARCH */
searchBtn.onclick=()=>getWeather(searchInput.value);
searchInput.onkeypress=e=>{if(e.key==="Enter") searchBtn.click();};

/* DARK MODE FIX */
themeToggle.onclick=()=>{
    document.body.classList.toggle("dark-mode");
    themeToggle.innerText = document.body.classList.contains("dark-mode")
        ? "☀️ Day Mode"
        : "🌙 Night Theme";
};

/* AUTO LOAD */
window.onload=()=>{
    getWeather("Delhi");
};

/* AI */
function askAI(){
    const q=aiInput.value.toLowerCase();

    if(q.includes("temp"))
        aiOutput.innerText=`🌡️ ${currentTemp}°C`;

    else
        aiOutput.innerText="Try: temp 🌡️";
}