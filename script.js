const API_KEY = "da287b27ab2c62083846949656a915d4";
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
    Clear:"☀️", Clouds:"☁️", Rain:"🌧️", Snow:"❄️",
    Thunderstorm:"⚡", Mist:"🌫️", Haze:"🌫️", Drizzle:"🌦️"
};

/* WEATHER FETCH */
async function getWeather(city){
    homeSection.innerHTML = "<p>Loading weather... ⏳</p>";

    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();

        if(data.cod !== 200){
            homeSection.innerHTML = "<p>City not found ❌</p>";
            return;
        }

        renderWeather(data);
    }catch{
        homeSection.innerHTML = "<p>Error loading weather</p>";
    }
}

/* LOCATION WEATHER */
async function getWeatherByLocation(lat,lon){
    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        renderWeather(data);
    }catch{
        homeSection.innerHTML = "<p>Location error ❌</p>";
    }
}

/* RENDER */
function renderWeather(data){
    currentWeather = data.weather[0].main;
    currentTemp = data.main.temp;

    homeSection.innerHTML = `
    <div class="current-weather">
        <h2>📍 ${data.name}, ${data.sys.country}</h2>
        <p style="font-size:13px;opacity:0.8;">Live location</p>
        <h1>${currentTemp.toFixed(1)}°C</h1>
        <p>${weatherIcons[currentWeather] || "🌡️"} ${data.weather[0].description}</p>
        <p>Humidity ${data.main.humidity}%</p>
        <p>Wind ${data.wind.speed} m/s</p>
    </div>
    `;
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

/* AUTO LOCATION */
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
function askAI(){
    if(!currentWeather){
        aiOutput.innerText = "Wait... loading weather ⏳";
        return;
    }

    const q = aiInput.value.toLowerCase();
    let ans = "Ask about temperature, clothes or health.";

    if(q.includes("temperature")){
        ans = `Temperature is ${currentTemp.toFixed(1)}°C`;
    }
    else if(q.includes("wear")){
        if(currentTemp>35) ans="Wear light cotton ☀️";
        else if(currentTemp<15) ans="Wear jacket 🧥";
        else ans="Normal clothes 🙂";
    }
    else if(q.includes("disease")){
        if(currentWeather==="Rain") ans="Risk of dengue 🦟";
        else ans="Normal seasonal issues";
    }

    typeEffect(ans);
}

/* TYPE EFFECT */
function typeEffect(text){
    aiOutput.innerText="";
    let i=0;
    let inter = setInterval(()=>{
        aiOutput.innerText+=text[i];
        i++;
        if(i>=text.length) clearInterval(inter);
    },20);
}

/* VOICE AI */
function startVoice(){
    if(!('webkitSpeechRecognition' in window)){
        alert("Not supported");
        return;
    }

    const rec = new webkitSpeechRecognition();
    rec.lang="en-IN";
    rec.start();

    aiOutput.innerText="Listening... 🎤";

    rec.onresult = e=>{
        const speech = e.results[0][0].transcript;
        aiInput.value = speech;
        askAI();
    };
}