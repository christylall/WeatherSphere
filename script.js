const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;

/* 🌍 QUICK BUTTONS */
document.querySelectorAll(".location-btn").forEach(btn=>{
    btn.onclick = ()=>getWeather(btn.dataset.location);
});

/* 🌤️ ICONS */
const weatherIcons={
    Clear:"☀️", Clouds:"☁️", Rain:"🌧️", Snow:"❄️",
    Thunderstorm:"⚡", Mist:"🌫️", Haze:"🌫️", Drizzle:"🌦️"
};

/* 🌫️ AQI */
async function getAQI(lat,lon){
    try{
        const data=await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(r=>r.json());
        return data.list[0].main.aqi;
    }catch{ return "--"; }
}

/* 🌆 WEATHER */
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

/* 📍 LOCATION */
async function getWeatherByLocation(lat,lon){
    const current=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`).then(r=>r.json());
    const forecast=await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`).then(r=>r.json());
    renderWeather(current,forecast);
}

/* 🎨 RENDER */
async function renderWeather(current,forecast){

    currentWeather=current.weather[0].main;
    currentTemp=current.main.temp;

    const icon=weatherIcons[currentWeather]||"🌡️";
    const aqi=await getAQI(current.coord.lat,current.coord.lon);

    /* AQI COLOR */
    let aqiText="Good 😊",aqiColor="#2ecc71";
    if(aqi==2){aqiText="Fair 🙂";aqiColor="#f1c40f";}
    if(aqi==3){aqiText="Moderate 😐";aqiColor="#e67e22";}
    if(aqi>=4){aqiText="Poor 😷";aqiColor="#e74c3c";}

    const hourly=forecast.list.slice(0,8);

    const daily={};
    forecast.list.forEach(item=>{
        const d=item.dt_txt.split(" ")[0];
        if(!daily[d]) daily[d]=[];
        daily[d].push(item);
    });

    const days=Object.keys(daily);
    const tomorrow=days[1];
    const fiveDays=days.slice(1,6);

    homeSection.innerHTML=`
    <div class="current-weather">
        <h2>📍 ${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>
    </div>

    <div class="aqi-card" style="background:${aqiColor}">
        🌫️ AQI: ${aqi} (${aqiText})
    </div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">

            <div class="swipe-slide">
                <h3>⏰ Hourly</h3>
                ${hourly.map(h=>`
                    <p>🕒 ${h.dt_txt.slice(11,16)} → ${h.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

            <div class="swipe-slide">
                <h3>🌅 Tomorrow</h3>
                ${daily[tomorrow]?.map(t=>`
                    <p>🕒 ${t.dt_txt.slice(11,16)} → ${t.main.temp.toFixed(0)}°C ${weatherIcons[t.weather[0].main]}</p>
                `).join("")||"No data"}
            </div>

            <div class="swipe-slide">
                <h3>📅 5 Days</h3>
                ${fiveDays.map(d=>{
                    const avg=(daily[d].reduce((s,x)=>s+x.main.temp,0)/daily[d].length).toFixed(0);
                    return `<p>📆 ${d} → ${avg}°C</p>`;
                }).join("")}
            </div>

        </div>
    </div>
    `;

    runAnimation(currentWeather);
    initSwipe();
}

/* 🌦️ ANIMATION */
function runAnimation(type){
    const box=document.getElementById("weatherAnimation");
    box.innerHTML="";

    for(let i=0;i<5;i++){
        const c=document.createElement("div");
        c.className="cloud";
        c.style.top=(10+i*10)+"%";
        box.appendChild(c);
    }

    if(type==="Rain"||type==="Drizzle"){
        for(let i=0;i<80;i++){
            const r=document.createElement("div");
            r.className="rain-drop";
            r.style.left=Math.random()*100+"%";
            box.appendChild(r);
        }
    }

    if(type==="Snow"){
        for(let i=0;i<40;i++){
            const s=document.createElement("div");
            s.className="snowflake";
            s.innerText="❄️";
            s.style.left=Math.random()*100+"%";
            box.appendChild(s);
        }
    }

    if(type==="Clear"){
        const sun=document.createElement("div");
        sun.className="sun";
        const rays=document.createElement("div");
        rays.className="sun-rays";
        box.appendChild(sun);
        box.appendChild(rays);
    }
}

/* 👉 SLIDER */
function initSwipe(){
    const slider=document.getElementById("slider");
    let startX=0,index=0;

    function move(diff){
        if(diff>50&&index<2) index++;
        if(diff<-50&&index>0) index--;
        slider.style.transform=`translateX(-${index*100}%)`;
    }

    slider.addEventListener("touchstart",e=>startX=e.touches[0].clientX);
    slider.addEventListener("touchend",e=>move(startX-e.changedTouches[0].clientX));

    slider.addEventListener("mousedown",e=>startX=e.clientX);
    slider.addEventListener("mouseup",e=>move(startX-e.clientX));
}

/* 🔍 SEARCH */
searchBtn.onclick=()=>getWeather(searchInput.value);
searchInput.onkeypress=e=>{if(e.key==="Enter") searchBtn.click();};

/* 🌙 DARK MODE */
themeToggle.onclick=()=>document.body.classList.toggle("dark-mode");

/* 📍 AUTO */
window.onload=()=>{
    getWeather("Delhi");
    navigator.geolocation?.getCurrentPosition(pos=>{
        getWeatherByLocation(pos.coords.latitude,pos.coords.longitude);
    });
};

/* 🤖 AI */
window.fillQuestion=function(q){
    aiInput.value=q;
    askAI();
}

function askAI(){
    const q=aiInput.value.toLowerCase();

    if(!currentWeather){
        aiOutput.innerText="⏳ Search weather first!";
        return;
    }

    if(q.includes("temp"))
        aiOutput.innerText=`🌡️ ${currentTemp}°C — ${currentTemp>30?"Hot ☀️":"Pleasant 🙂"}`;

    else if(q.includes("wear"))
        aiOutput.innerText=currentTemp>30?"👕 Light clothes + sunglasses 😎":"🧥 Wear jacket";

    else if(q.includes("crop"))
        aiOutput.innerText=currentWeather==="Rain"?"🌾 Rice & Sugarcane":"🌱 Wheat & Maize";

    else if(q.includes("disease"))
        aiOutput.innerText=currentWeather==="Rain"?"🦟 Dengue risk":"😷 Cold/flu";

    else
        aiOutput.innerText="Ask about temp 🌡️, wear 👗, crop 🌾, disease 🦟";
}