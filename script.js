const API_KEY="da287b27ab2c62083846949656a915d4";

const searchInput=document.getElementById("searchInput");
const searchBtn=document.getElementById("searchBtn");
const themeToggle=document.getElementById("themeToggle");
const homeSection=document.getElementById("homeSection");

/* DEFAULT CITY BUTTONS */

document.querySelectorAll(".location-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
const city=btn.dataset.location;
getWeather(city);
});
});

/* WEATHER ICONS */

const weatherSettings={
Clear:"☀️",
Clouds:"☁️",
Rain:"🌧️",
Snow:"❄️",
Thunderstorm:"⚡",
Mist:"🌫️",
Haze:"🌫️",
Drizzle:"🌦️"
};

/* AI KNOWLEDGE */

const aiQA={
hello:"Hello! I am WeatherSphere AI.",
temperature:"Temperature tells how hot or cold the weather is.",
humidity:"Humidity shows how much moisture is in the air.",
wind:"Wind speed tells how fast the air moves.",
rain:"Rain means water droplets falling from clouds.",
snow:"Snow is frozen water from clouds."
};

/* WEATHER FETCH */

async function getWeather(city){

try{

homeSection.innerHTML="Loading..."

const currentRes=await fetch(
"https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric"
)

const current=await currentRes.json()

if(current.cod!==200){
homeSection.innerHTML="City not found"
return
}

const forecastRes=await fetch(
"https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric"
)

const forecast=await forecastRes.json()

renderWeather(current,forecast)

}catch{

homeSection.innerHTML="API Error"

}

}

/* RENDER WEATHER */

function renderWeather(current,forecast){

const icon=weatherSettings[current.weather[0].main]||"🌡️"

const daily={}
forecast.list.forEach(item=>{
const date=item.dt_txt.split(" ")[0]
if(!daily[date]) daily[date]=[]
daily[date].push(item)
})

const fiveDays=Object.keys(daily).slice(1,6)

homeSection.innerHTML=`

<div id="weatherAnimation"></div><div class="swipe-container"><div class="swipe-slider" id="swipeSlider"><div class="swipe-slide"><div class="current-weather"><h2>${current.name}, ${current.sys.country}</h2><h1>${current.main.temp}°C</h1><p>${icon} ${current.weather[0].description}</p><p>💧 ${current.main.humidity}%</p><p>💨 ${current.wind.speed} m/s</p></div><h3>5 Day Forecast</h3><div class="forecast-cards">${fiveDays.map(day=>{

const avg=(daily[day].reduce((s,d)=>s+d.main.temp,0)/daily[day].length).toFixed(1)
const main=daily[day][0].weather[0].main

return`

<div class="forecast-card"><p>${day}</p><p>${weatherSettings[main]}</p><p>${avg}°C</p></div>
`}).join("")}

</div></div><div class="swipe-slide"><div class="ai-chat"><h3>WeatherSphere AI</h3><div class="suggestions"><button onclick="fillQuestion('temperature')">Temperature</button>

<button onclick="fillQuestion('humidity')">Humidity</button>

<button onclick="fillQuestion('wind')">Wind</button>

<button onclick="fillQuestion('what should I wear today')">Dress</button>

<button onclick="fillQuestion('best crop')">Crop</button>

<button onclick="fillQuestion('disease')">Disease</button>

</div><input id="aiInput" placeholder="Ask weather question"><button onclick="askAI()">Ask</button>

<p id="aiOutput"></p></div></div></div></div>
`initSwipe()

setWeatherAnimation(current.weather[0].main)

}

/* SWIPE (MOBILE + PC) */

function initSwipe(){

const slider=document.getElementById("swipeSlider")

let startX=0
let currentIndex=0

function move(diff){

if(diff>50 && currentIndex<1) currentIndex++

if(diff<-50 && currentIndex>0) currentIndex--

slider.style.transform="translateX(-${currentIndex*100}%)"

}

slider.addEventListener("touchstart",e=>{

startX=e.touches[0].clientX

})

slider.addEventListener("touchend",e=>{

move(startX-e.changedTouches[0].clientX)

})

slider.addEventListener("mousedown",e=>{

startX=e.clientX

slider.onmouseup=e2=>{

move(startX-e2.clientX)

}

})

}

/* WEATHER ANIMATION */

function setWeatherAnimation(weather){

const container=document.getElementById("weatherAnimation")

container.innerHTML=""

if(weather==="Rain"||weather==="Drizzle"){

for(let i=0;i<100;i++){

const drop=document.createElement("div")

drop.className="rain-drop"

drop.style.left=Math.random()*100+"%"

container.appendChild(drop)

}

}

else if(weather==="Clear"){

const sun=document.createElement("div")

sun.className="sun"

container.appendChild(sun)

}

else if(weather==="Clouds"){

for(let i=0;i<3;i++){

const cloud=document.createElement("div")

cloud.className="cloud"

cloud.style.top=(40+Math.random()*120)+"px"

container.appendChild(cloud)

}

}

else if(weather==="Snow"){

for(let i=0;i<80;i++){

const snow=document.createElement("div")

snow.className="snow"

snow.style.left=Math.random()*100+"%"

container.appendChild(snow)

}

}

else if(weather==="Thunderstorm"){

const flash=document.createElement("div")

flash.className="lightning"

container.appendChild(flash)

}

}

/* AI INPUT */

function fillQuestion(q){

document.getElementById("aiInput").value=q

}

/* AI ANSWER */

function askAI(){

const q=document.getElementById("aiInput").value.toLowerCase()

let answer="Sorry I don't know."

for(const key in aiQA){

if(q.includes(key)) answer=aiQA[key]

}

if(q.includes("wear")){

const temp=parseInt(document.querySelector(".current-weather h1").innerText)

if(temp<10) answer="Cold weather. Wear jacket."

else if(temp<20) answer="Light jacket recommended."

else if(temp<30) answer="Normal clothes are fine."

else answer="Hot weather. Wear cotton clothes."

}

if(q.includes("crop")){

answer="Rice wheat maize and vegetables grow well depending on rainfall and humidity."

}

if(q.includes("disease")){

answer="Flu dengue and dehydration can occur in certain weather. Stay hydrated."

}

document.getElementById("aiOutput").innerText=answer

}

/* SEARCH */

searchBtn.addEventListener("click",()=>{

if(searchInput.value.trim())

getWeather(searchInput.value.trim())

})

/* DARK MODE */

themeToggle.addEventListener("click",()=>{

document.body.classList.toggle("dark-mode")

})

/* AUTO LOCATION */

window.addEventListener("load",()=>{

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(async pos=>{

const lat=pos.coords.latitude
const lon=pos.coords.longitude

const res=await fetch(
"https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric"
)

const data=await res.json()

const forecastRes=await fetch(
"https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric"
)

const forecast=await forecastRes.json()

renderWeather(data,forecast)

})

}else{

getWeather("Delhi")

}

});