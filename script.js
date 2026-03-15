const API_KEY="da287b27ab2c62083846949656a915d4"

const homeSection=document.getElementById("homeSection")
const searchBtn=document.getElementById("searchBtn")
const searchInput=document.getElementById("searchInput")
const themeToggle=document.getElementById("themeToggle")

let currentWeather=""
let currentTemp=0

/* QUICK CITY BUTTONS */

document.querySelectorAll(".location-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
getWeather(btn.dataset.location)
})
})

const weatherIcons={
Clear:"☀️",
Clouds:"☁️",
Rain:"🌧️",
Snow:"❄️",
Thunderstorm:"⚡",
Mist:"🌫️",
Haze:"🌫️",
Drizzle:"🌦️"
}

/* AQI */

async function getAQI(lat,lon){

try{

const res=await fetch(
`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
)

const data=await res.json()

return data.list[0].main.aqi

}catch{

return "--"

}

}

/* WEATHER */

async function getWeather(city){

homeSection.innerHTML="Loading Weather..."

try{

const currentRes=await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
)

const current=await currentRes.json()

if(current.cod!==200){
homeSection.innerHTML="City not found"
return
}

const forecastRes=await fetch(
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
)

const forecast=await forecastRes.json()

renderWeather(current,forecast)

}catch{

homeSection.innerHTML="Weather API Error"

}

}

/* LOCATION WEATHER */

async function getWeatherByLocation(lat,lon){

const currentRes=await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
)

const current=await currentRes.json()

const forecastRes=await fetch(
`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
)

const forecast=await forecastRes.json()

renderWeather(current,forecast)

}

/* RENDER */

async function renderWeather(current,forecast){

const weatherMain=current.weather[0].main
currentWeather=weatherMain
currentTemp=current.main.temp

const icon=weatherIcons[weatherMain]||"🌡️"

const lat=current.coord.lat
const lon=current.coord.lon

const aqi=await getAQI(lat,lon)

const sunrise=new Date(current.sys.sunrise*1000)
.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})

const sunset=new Date(current.sys.sunset*1000)
.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})

const hourly=forecast.list.slice(0,8)

/* DAILY GROUP */

const daily={}

forecast.list.forEach(item=>{

const date=item.dt_txt.split(" ")[0]

if(!daily[date]) daily[date]=[]

daily[date].push(item)

})

const days=Object.keys(daily)

const tomorrow=days[1]

const fiveDays=days.slice(1,6)

/* HEALTH ADVICE */

let advice="Stay hydrated"

if(weatherMain==="Rain") advice="Carry umbrella ☔"
if(weatherMain==="Clear") advice="Wear sunglasses 😎"
if(weatherMain==="Clouds") advice="Light jacket recommended"
if(aqi>=4) advice="Avoid outdoor activities"

/* UI */

homeSection.innerHTML=`

<div id="weatherAnimation"></div>

<div class="current-weather">

<h2>${current.name}, ${current.sys.country}</h2>

<h1>${currentTemp.toFixed(1)}°C</h1>

<p>${icon} ${current.weather[0].description}</p>

<p>Feels Like ${current.main.feels_like.toFixed(1)}°C</p>

<p>Humidity ${current.main.humidity}%</p>

<p>Wind ${current.wind.speed} m/s</p>

<p>Sunrise ${sunrise}</p>

<p>Sunset ${sunset}</p>

</div>

<div class="aqi-card">
<h3>Air Quality</h3>
<p>${aqi}</p>
</div>

<div class="prevention-card">
<h3>Health Advice</h3>
<p>${advice}</p>
</div>

<div class="swipe-container">

<div class="swipe-slider" id="slider">

<div class="swipe-slide">

<h3>Hourly Forecast</h3>

<div class="hourly-cards">

${hourly.map(h=>{

const time=h.dt_txt.split(" ")[1].slice(0,5)
const temp=h.main.temp.toFixed(1)
const main=h.weather[0].main

return`

<div class="hour-card">
<p>${time}</p>
<p>${weatherIcons[main]}</p>
<p>${temp}°C</p>
</div>

`

}).join("")}

</div>

</div>

<div class="swipe-slide">

<h3>Tomorrow</h3>

<div class="tomorrow-box">

${daily[tomorrow].map(t=>{

const time=t.dt_txt.split(" ")[1].slice(0,5)
const temp=t.main.temp.toFixed(1)
const main=t.weather[0].main

return `<p>${time} ${weatherIcons[main]} ${temp}°C</p>`

}).join("")}

</div>

</div>

<div class="swipe-slide">

<h3>5 Day Forecast</h3>

<div class="forecast-cards">

${fiveDays.map(day=>{

const avg=(daily[day].reduce((s,d)=>s+d.main.temp,0)/daily[day].length).toFixed(1)

const main=daily[day][0].weather[0].main

const name=new Date(day).toLocaleDateString("en-US",{weekday:"short"})

return`

<div class="forecast-card">
<p>${name}</p>
<p>${weatherIcons[main]}</p>
<p>${avg}°C</p>
</div>

`

}).join("")}

</div>

</div>

</div>

</div>
`

runAnimation(weatherMain)
initSwipe()

}

/* ANIMATION */

function runAnimation(type){

const box=document.getElementById("weatherAnimation")
if(!box) return

box.innerHTML=""

if(type==="Rain"||type==="Drizzle"){

for(let i=0;i<80;i++){

const drop=document.createElement("div")
drop.className="rain-drop"

drop.style.left=Math.random()*100+"%"
drop.style.animationDuration=(0.6+Math.random())+"s"

box.appendChild(drop)

}

}

else if(type==="Clear"){

const sun=document.createElement("div")
sun.className="sun"

const rays=document.createElement("div")
rays.className="sun-rays"

box.appendChild(sun)
box.appendChild(rays)

}

else if(type==="Clouds"){

for(let i=0;i<5;i++){

const cloud=document.createElement("div")

cloud.className="cloud"

cloud.style.top=(10+i*15)+"%"
cloud.style.animationDuration=(25+i*5)+"s"

box.appendChild(cloud)

}

}

}

/* SWIPE */

function initSwipe(){

const slider=document.getElementById("slider")

let startX=0
let index=0

slider.addEventListener("touchstart",e=>{
startX=e.touches[0].clientX
})

slider.addEventListener("touchend",e=>{

const diff=startX-e.changedTouches[0].clientX

if(diff>50 && index<2) index++
if(diff<-50 && index>0) index--

slider.style.transform=`translateX(-${index*100}%)`

})

}

/* SEARCH */

searchBtn.addEventListener("click",()=>{
const city=searchInput.value.trim()
if(city) getWeather(city)
})

/* DARK MODE */

themeToggle.addEventListener("click",()=>{
document.body.classList.toggle("dark-mode")
})

/* AUTO LOCATION */

window.addEventListener("load",()=>{

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(pos=>{

getWeatherByLocation(
pos.coords.latitude,
pos.coords.longitude
)

})

}else{

getWeather("Delhi")

}

})