const API_KEY="da287b27ab2c62083846949656a915d4"

const homeSection=document.getElementById("homeSection")
const searchBtn=document.getElementById("searchBtn")
const searchInput=document.getElementById("searchInput")
const themeToggle=document.getElementById("themeToggle")

/* QUICK CITY BUTTONS */

document.querySelectorAll(".location-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
const city=btn.dataset.location
getWeather(city)
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

renderWeather(current,forecast)

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

const forecastRes=await fetch(
`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
)

const forecast=await forecastRes.json()

renderWeather(current,forecast)

}catch{

homeSection.innerHTML="Location weather error"

}

}

/* RENDER WEATHER */

async function renderWeather(current,forecast){

const weatherMain=current.weather[0].main
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

<h1>${current.main.temp.toFixed(1)}°C</h1>

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

if(type==="Rain" || type==="Drizzle"){

for(let i=0;i<60;i++){

const drop=document.createElement("div")
drop.className="rain-drop"

drop.style.left=Math.random()*100+"%"
drop.style.animationDuration=(0.5+Math.random())+"s"

box.appendChild(drop)

}

}

/* CLEAR */

else if(type==="Clear"){

const sun=document.createElement("div")
sun.className="sun"

box.appendChild(sun)

}

/* CLOUDS */

else if(type==="Clouds"){

for(let i=0;i<4;i++){

const cloud=document.createElement("div")

cloud.className="cloud"

cloud.style.top=(10+i*15)+"%"
cloud.style.animationDuration=(20+i*5)+"s"

box.appendChild(cloud)

}

}

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

/* AI FUNCTIONS */

function fillQuestion(q){
document.getElementById("aiInput").value=q
}

function askAI(){

const question=document.getElementById("aiInput").value.toLowerCase()
const output=document.getElementById("aiOutput")

let answer="Try asking about weather, clothes or crops."

if(question.includes("wear")){
answer="Wear light clothes in heat, jackets in cold, and carry umbrella during rain."
}

else if(question.includes("crop")){
answer="Rice grows well in rain, wheat in cool weather and maize in warm climate."
}

else if(question.includes("disease")){
answer="Rainy weather increases mosquito diseases like dengue."
}

else if(question.includes("temperature")){
answer="The temperature is shown in the weather section above."
}

output.innerText=answer

}

/* AUTO LOCATION */

window.addEventListener("load",()=>{

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(pos=>{

const lat=pos.coords.latitude
const lon=pos.coords.longitude

getWeatherByLocation(lat,lon)

},()=>{

getWeather("Delhi")

})

}else{

getWeather("Delhi")

}

})