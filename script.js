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

/* WEATHER BY CITY */

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

renderWeather(current)

}catch{

homeSection.innerHTML="Weather API Error"

}

}

/* WEATHER BY LOCATION */

async function getWeatherByLocation(lat,lon){

homeSection.innerHTML="Detecting weather..."

try{

const currentRes=await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
)

const current=await currentRes.json()

renderWeather(current)

}catch{

homeSection.innerHTML="Location weather error"

}

}

/* RENDER WEATHER */

async function renderWeather(current){

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

let advice="Stay hydrated"

if(weatherMain==="Rain") advice="Carry umbrella ☔"
if(weatherMain==="Clear") advice="Wear sunglasses 😎"
if(weatherMain==="Clouds") advice="Light jacket recommended"
if(aqi>=4) advice="Avoid outdoor activities"

homeSection.innerHTML=`

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

`

runAnimation(weatherMain)

}

/* WEATHER ANIMATION */

function runAnimation(type){

const box=document.getElementById("weatherAnimation")
if(!box) return

box.innerHTML=""

/* RAIN */

if(type==="Rain"||type==="Drizzle"){

for(let i=0;i<80;i++){

const drop=document.createElement("div")
drop.className="rain-drop"

drop.style.left=Math.random()*100+"%"
drop.style.animationDuration=(0.6+Math.random())+"s"

box.appendChild(drop)

}

}

/* SUNNY */

else if(type==="Clear"){

const sun=document.createElement("div")
sun.className="sun"

const rays=document.createElement("div")
rays.className="sun-rays"

box.appendChild(sun)
box.appendChild(rays)

}

/* CLOUDS */

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

/* SEARCH */

searchBtn.addEventListener("click",()=>{

const city=searchInput.value.trim()

if(city) getWeather(city)

})

/* ENTER KEY SEARCH */

searchInput.addEventListener("keypress",e=>{
if(e.key==="Enter"){
searchBtn.click()
}
})

/* DARK MODE */

themeToggle.addEventListener("click",()=>{
document.body.classList.toggle("dark-mode")
})

/* AI */

function fillQuestion(q){
document.getElementById("aiInput").value=q
}

function askAI(){

const q=document.getElementById("aiInput").value.toLowerCase()
const out=document.getElementById("aiOutput")

let ans="Try asking: temperature, what to wear, crop or disease."

if(q.includes("temperature")){
ans=`Current temperature is ${currentTemp.toFixed(1)}°C`
}

else if(q.includes("wear")){

if(currentWeather==="Rain"){
ans="It is raining. Wear waterproof shoes and carry umbrella ☔"
}

else if(currentTemp>32){
ans="Weather is hot. Wear light cotton clothes ☀️"
}

else if(currentTemp<15){
ans="Weather is cold. Wear warm jacket 🧥"
}

else{
ans="Comfortable casual clothes are suitable."
}

}

else if(q.includes("crop")){

if(currentWeather==="Rain"){
ans="Rainy weather supports rice and sugarcane 🌾"
}

else if(currentTemp>30){
ans="Warm weather is good for maize and cotton 🌽"
}

else{
ans="Wheat grows well in this climate."
}

}

else if(q.includes("disease")){

if(currentWeather==="Rain"){
ans="Mosquito diseases like dengue may increase 🦟"
}

else if(currentTemp>35){
ans="Risk of heatstroke and dehydration."
}

else{
ans="Normal seasonal infections may occur."
}

}

out.innerText=ans

}

/* AUTO LOCATION */

window.addEventListener("load",()=>{

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(pos=>{

getWeatherByLocation(
pos.coords.latitude,
pos.coords.longitude
)

},()=>{

getWeather("Delhi")

})

}else{

getWeather("Delhi")

}

})