const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const aqiCard = document.getElementById("aqiCard");
const extraInfo = document.getElementById("extraInfo");

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;
let index = 0;

/* SEARCH */
searchBtn.onclick = () => getWeather(searchInput.value);

/* WEATHER */
async function getWeather(city){

    const current = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    ).then(r=>r.json());

    const forecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    ).then(r=>r.json());

    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;

    renderMain(current, forecast);
}

/* RENDER MAIN */
function renderMain(current, forecast){

    homeSection.innerHTML = `
        <div class="current-weather">
            <h2>${current.name}</h2>
            <h1>${currentTemp.toFixed(1)}°C</h1>
            <p>${current.weather[0].description}</p>
        </div>
    `;

    renderExtra(current);
    renderAQI(current);
    renderSwipe(forecast);

    runAnimation(currentWeather);
}

/* EXTRA INFO (FIXED) */
function renderExtra(current){

    const sunrise = new Date(current.sys.sunrise*1000).toLocaleTimeString();
    const sunset = new Date(current.sys.sunset*1000).toLocaleTimeString();

    extraInfo.innerHTML = `
        <p>💧 ${current.main.humidity}%</p>
        <p>💨 ${current.wind.speed} m/s</p>
        <p>🌅 ${sunrise}</p>
        <p>🌇 ${sunset}</p>
    `;
}

/* AQI FIXED */
async function renderAQI(current){

    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}`
    );
    const data = await res.json();

    const aqi = data.list[0].main.aqi;

    let text = "Good 😊";
    let color = "#2ecc71";

    if(aqi==2){text="Fair"; color="#f1c40f";}
    if(aqi==3){text="Moderate"; color="#e67e22";}
    if(aqi>=4){text="Poor"; color="#e74c3c";}

    aqiCard.innerHTML = `🌫️ AQI ${aqi} - ${text}`;
    aqiCard.style.background = color;
}

/* SWIPE (SAFE) */
function renderSwipe(forecast){

    const hourly = forecast.list.slice(0,8);

    const daily = {};
    forecast.list.forEach(i=>{
        const d = i.dt_txt.split(" ")[0];
        if(!daily[d]) daily[d]=[];
        daily[d].push(i);
    });

    const days = Object.keys(daily);

    homeSection.innerHTML += `
    <div class="swipe-container">
        <div class="swipe-slider" id="slider">

            <div class="swipe-slide">
                <h3>Hourly</h3>
                ${hourly.map(h=>`
                    <p>${h.dt_txt.slice(11,16)} → ${h.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

            <div class="swipe-slide">
                <h3>Tomorrow</h3>
                ${daily[days[1]]?.map(t=>`
                    <p>${t.dt_txt.slice(11,16)} → ${t.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

            <div class="swipe-slide">
                <h3>5 Days</h3>
                ${days.slice(0,5).map(d=>`
                    <p>${d} → ${daily[d][0].main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

        </div>
    </div>
    `;

    initSwipe();
}

/* SWIPE FIX */
function initSwipe(){

    const slider = document.getElementById("slider");
    if(!slider) return;

    let startX = 0;

    slider.ontouchstart = e=> startX = e.touches[0].clientX;
    slider.ontouchend = e=>{
        let diff = startX - e.changedTouches[0].clientX;
        move(diff, slider);
    };

    function move(diff, slider){
        if(diff>50 && index<2) index++;
        if(diff<-50 && index>0) index--;

        slider.style.transform = `translateX(-${index*100}%)`;
    }
}

/* ANIMATION (FIXED) */
function runAnimation(type){

    const box = document.getElementById("weatherAnimation");
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
            r.style.left = Math.random()*100+"%";
            box.appendChild(r);
        }
    }
}

/* THEME */
themeToggle.onclick = ()=>{
    document.body.classList.toggle("dark-mode");
};

/* DEFAULT */
window.onload = ()=>getWeather("Delhi");