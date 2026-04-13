const API_KEY = "YOUR_NEW_API_KEY"; // ⚠️ new key daalna

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const aiInput = document.getElementById("aiInput");
const aiOutput = document.getElementById("aiOutput");

let currentWeather = "";
let currentTemp = 0;

/* QUICK CITY */
document.querySelectorAll(".location-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
        getWeather(btn.dataset.location);
    });
});

/* WEATHER ICONS */
const weatherIcons = {
    Clear:"☀️", Clouds:"☁️", Rain:"🌧️",
    Snow:"❄️", Thunderstorm:"⚡",
    Mist:"🌫️", Haze:"🌫️", Drizzle:"🌦️"
};

/* AQI */
async function getAQI(lat, lon){
    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await res.json();
        return data.list[0].main.aqi;
    }catch{
        return "--";
    }
}

/* CITY WEATHER */
async function getWeather(city){
    homeSection.innerHTML = "<p>Loading weather... ⏳</p>";

    try{
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();

        if(current.cod !== 200){
            homeSection.innerHTML = "<p>City not found ❌</p>";
            return;
        }

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();

        renderWeather(current, forecast);

    }catch{
        homeSection.innerHTML = "<p>Error loading weather ❌</p>";
    }
}

/* LOCATION WEATHER */
async function getWeatherByLocation(lat, lon){
    try{
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const current = await currentRes.json();

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecast = await forecastRes.json();

        renderWeather(current, forecast);

    }catch{
        getWeather("Delhi"); // fallback
    }
}

/* RENDER */
async function renderWeather(current, forecast){
    currentWeather = current.weather[0].main;
    currentTemp = current.main.temp;

    const icon = weatherIcons[currentWeather] || "🌡️";
    const aqi = await getAQI(current.coord.lat, current.coord.lon);

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${current.name.includes("Belanganj") ? "Agra" : current.name}, ${current.sys.country}</h2>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${icon} ${current.weather[0].description}</p>
        <p>Humidity ${current.main.humidity}%</p>
        <p>Wind ${current.wind.speed} m/s</p>
    </div>

    <div class="aqi-card">
        <h3>Air Quality</h3>
        <p>${aqi}</p>
    </div>
    `;

    initSwipe(); // safe call
}

/* 🔥 FIXED SLIDER (Mobile + Laptop) */
function initSwipe(){
    const slider = document.getElementById("slider");
    if(!slider) return;

    let startX = 0;
    let index = 0;

    // TOUCH
    slider.addEventListener("touchstart", e=>{
        startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", e=>{
        handleSwipe(startX - e.changedTouches[0].clientX);
    });

    // MOUSE (LAPTOP FIX)
    slider.addEventListener("mousedown", e=>{
        startX = e.clientX;
    });

    slider.addEventListener("mouseup", e=>{
        handleSwipe(startX - e.clientX);
    });

    function handleSwipe(diff){
        if(diff > 50 && index < 2) index++;
        if(diff < -50 && index > 0) index--;

        slider.style.transform = `translateX(-${index * 100}%)`;
    }
}

/* SEARCH */
searchBtn.onclick = ()=>{
    const city = searchInput.value.trim();
    if(city) getWeather(city);
};

/* DARK MODE */
themeToggle.onclick = ()=>{
    document.body.classList.toggle("dark-mode");
};

/* AUTO LOCATION (FIXED FLOW) */
window.onload = ()=>{
    homeSection.innerHTML = "<p>Detecting location... 📍</p>";

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            pos=> getWeatherByLocation(pos.coords.latitude,pos.coords.longitude),
            ()=> getWeather("Delhi")
        );
    }else{
        getWeather("Delhi");
    }
};

/* AI */
function fillQuestion(q){
    aiInput.value = q;
    askAI();
}

function askAI(){
    if(!currentWeather){
        aiOutput.innerText = "Wait... loading weather ⏳";
        return;
    }

    const q = aiInput.value.toLowerCase();
    let ans = "Ask about temperature or clothes.";

    if(q.includes("temperature")){
        ans = `Temperature is ${currentTemp.toFixed(1)}°C`;
    }
    else if(q.includes("wear")){
        if(currentTemp>35) ans="Wear light cotton ☀️";
        else if(currentTemp<15) ans="Wear jacket 🧥";
        else ans="Normal clothes 🙂";
    }

    aiOutput.innerText = ans;
}

/* VOICE */
function startVoice(){
    if(!('webkitSpeechRecognition' in window)){
        alert("Voice not supported");
        return;
    }

    const rec = new webkitSpeechRecognition();
    rec.lang="en-IN";
    rec.start();

    aiOutput.innerText="Listening... 🎤";

    rec.onresult = e=>{
        aiInput.value = e.results[0][0].transcript;
        askAI();
    };
}