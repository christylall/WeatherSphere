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

/* AQI */
async function getAQI(lat,lon){
    try{
        const data=await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(r=>r.json());
        return data.list[0].main.aqi;
    }catch{return "--";}
}

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
async function renderWeather(current,forecast){

    currentWeather=current.weather[0].main;
    currentTemp=current.main.temp;

    const icon=weatherIcons[currentWeather]||"🌡️";
    const aqi=await getAQI(current.coord.lat,current.coord.lon);

    let aqiText="Good 😊",aqiColor="#2ecc71";
    if(aqi==2){aqiText="Fair 🙂";aqiColor="#f1c40f";}
    if(aqi==3){aqiText="Moderate 😐";aqiColor="#e67e22";}
    if(aqi>=4){aqiText="Poor 😷";aqiColor="#e74c3c";}

    const sunrise=new Date(current.sys.sunrise*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    const sunset=new Date(current.sys.sunset*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});

    const hourly=forecast.list.slice(0,8);

    homeSection.innerHTML=`
    <div class="current-weather">
        <h2>📍 ${current.name}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>

        <div class="extra-info">
            <p>🤒 Feels ${current.main.feels_like.toFixed(1)}°C</p>
            <p>💧 ${current.main.humidity}%</p>
            <p>💨 ${current.wind.speed} m/s</p>
            <p>🌅 ${sunrise}</p>
            <p>🌇 ${sunset}</p>
        </div>
    </div>

    <div class="aqi-card" style="background:${aqiColor}">
        🌫️ AQI ${aqi} • ${aqiText}
    </div>

    <div class="swipe-container">
        <div class="swipe-slider" id="slider">

            <div class="swipe-slide">
                <h3>⏰ Hourly</h3>
                ${hourly.map(h=>`
                    <p>${h.dt_txt.slice(11,16)} → ${h.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

            <div class="swipe-slide">
                <h3>🌅 Tomorrow</h3>
                ${forecast.list.slice(8,16).map(t=>`
                    <p>${t.dt_txt.slice(11,16)} → ${t.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

            <div class="swipe-slide">
                <h3>📅 5 Days</h3>
                ${forecast.list.filter((_,i)=>i%8===0).map(d=>`
                    <p>${d.dt_txt.slice(0,10)} → ${d.main.temp.toFixed(0)}°C</p>
                `).join("")}
            </div>

        </div>
    </div>
    `;

    /* BACKGROUND CHANGE */
    document.body.classList.remove("clear-bg","rain-bg","cloud-bg","snow-bg");

    if(currentWeather==="Clear") document.body.classList.add("clear-bg");
    else if(currentWeather==="Rain") document.body.classList.add("rain-bg");
    else if(currentWeather==="Clouds") document.body.classList.add("cloud-bg");
    else if(currentWeather==="Snow") document.body.classList.add("snow-bg");

    runAnimation(currentWeather);
    initSwipe();
}

/* 🔥 ADVANCED ANIMATION */
function runAnimation(type){
    const box = document.getElementById("weatherAnimation");
    box.innerHTML = "";

    /* CLOUDS */
    for(let i=0;i<8;i++){
        const cloud=document.createElement("div");
        cloud.className="cloud";
        cloud.style.top=Math.random()*80+"%";
        cloud.style.animationDuration=(20+Math.random()*30)+"s";
        box.appendChild(cloud);
    }

    /* RAIN */
    if(type==="Rain"||type==="Drizzle"){
        for(let i=0;i<150;i++){
            const r=document.createElement("div");
            r.className="rain-drop";
            r.style.left=Math.random()*100+"%";
            r.style.animationDuration=(0.5+Math.random())+"s";
            box.appendChild(r);
        }
    }

    /* SNOW */
    if(type==="Snow"){
        for(let i=0;i<80;i++){
            const s=document.createElement("div");
            s.className="snowflake";
            s.innerText="❄️";
            s.style.left=Math.random()*100+"%";
            s.style.animationDuration=(3+Math.random()*5)+"s";
            box.appendChild(s);
        }
    }

    /* SUN */
    if(type==="Clear"){
        const sun=document.createElement("div");
        sun.className="sun";
        const rays=document.createElement("div");
        rays.className="sun-rays";
        box.appendChild(sun);
        box.appendChild(rays);
    }

    /* PARTICLES */
    for(let i=0;i<40;i++){
        const p=document.createElement("div");
        p.className="particle";
        p.style.left=Math.random()*100+"%";
        p.style.animationDuration=(5+Math.random()*10)+"s";
        box.appendChild(p);
    }
}

/* SLIDER */
function initSwipe(){
    const slider=document.getElementById("slider");
    let startX=0,index=0;

    slider.onmousedown=e=>startX=e.clientX;
    slider.onmouseup=e=>{
        let diff=startX-e.clientX;
        if(diff>50&&index<2) index++;
        if(diff<-50&&index>0) index--;
        slider.style.transform=`translateX(-${index*100}%)`;
    };

    slider.ontouchstart=e=>startX=e.touches[0].clientX;
    slider.ontouchend=e=>{
        let diff=startX-e.changedTouches[0].clientX;
        if(diff>50&&index<2) index++;
        if(diff<-50&&index>0) index--;
        slider.style.transform=`translateX(-${index*100}%)`;
    };
}

/* SEARCH */
searchBtn.onclick=()=>getWeather(searchInput.value);
searchInput.onkeypress=e=>{if(e.key==="Enter") searchBtn.click();};

/* DARK MODE */
themeToggle.onclick=()=>document.body.classList.toggle("dark-mode");

/* AUTO */
window.onload=()=>{
    getWeather("Delhi");
};

/* AI */
function askAI(){
    const q=aiInput.value.toLowerCase();

    if(!currentWeather){
        aiOutput.innerText="⏳ Search weather first!";
        return;
    }

    if(q.includes("temp"))
        aiOutput.innerText=`🌡️ ${currentTemp}°C — ${currentTemp>35?"🔥 Extreme heat":"🌿 Pleasant"}`;

    else if(q.includes("wear"))
        aiOutput.innerText=currentTemp>32
        ?"👕 Light cotton + sunglasses 😎"
        :"🧥 Light jacket recommended";

    else if(q.includes("crop"))
        aiOutput.innerText=currentWeather==="Rain"
        ?"🌾 Rice & Sugarcane"
        :"🌱 Wheat & Maize";

    else if(q.includes("disease"))
        aiOutput.innerText=currentWeather==="Rain"
        ?"🦟 Dengue risk"
        :"😷 Cold/flu chances";

    else
        aiOutput.innerText="Try: temp 🌡️, wear 👗, crop 🌾, disease 🦟";
}