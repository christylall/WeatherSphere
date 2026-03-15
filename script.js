const API_KEY = "da287b27ab2c62083846949656a915d4";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const homeSection = document.getElementById("homeSection");

/* CITY BUTTONS */

document.querySelectorAll(".location-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
const city = btn.dataset.location;
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

/* AQI FETCH */

async function getAQI(lat,lon){

const res = await fetch(
`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
);

const data = await res.json();

return data.list[0].main.aqi;

}

/* FETCH WEATHER */

async function getWeather(city){

try{

homeSection.innerHTML="Loading...";

const currentRes = await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
);

const current = await currentRes.json();

if(current.cod!==200){
homeSection.innerHTML="City not found";
return;
}

const forecastRes = await fetch(
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
);

const forecast = await forecastRes.json();

renderWeather(current,forecast);

}catch{

homeSection.innerHTML="API Error";

}

}

/* RENDER WEATHER */

async function renderWeather(current,forecast){

const icon = weatherSettings[current.weather[0].main] || "🌡️";

const lat=current.coord.lat;
const lon=current.coord.lon;

const aqi = await getAQI(lat,lon);

let aqiText="Good";
if(aqi===2) aqiText="Fair";
if(aqi===3) aqiText="Moderate";
if(aqi===4) aqiText="Poor";
if(aqi===5) aqiText="Very Poor";

/* SUNRISE SUNSET */

const sunrise = new Date(current.sys.sunrise*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
const sunset = new Date(current.sys.sunset*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});

/* FEELS LIKE */

const feels=current.main.feels_like.toFixed(1);

/* GROUP FORECAST */

const daily={};

forecast.list.forEach(item=>{
const date=item.dt_txt.split(" ")[0];
if(!daily[date]) daily[date]=[];
daily[date].push(item);
});

const days=Object.keys(daily);
const tomorrow=days[1];
const fiveDays=days.slice(1,6);
const hourly=forecast.list.slice(0,8);

/* HTML */

homeSection.innerHTML=`

<div class="current-weather">

<h2>${current.name}, ${current.sys.country}</h2>

<h1>${current.main.temp.toFixed(1)}°C</h1>

<p>${icon} ${current.weather[0].description}</p>

<p>🌡 Feels Like: ${feels}°C</p>

<p>💧 Humidity: ${current.main.humidity}%</p>

<p>💨 Wind: ${current.wind.speed} m/s</p>

<p>🌅 Sunrise: ${sunrise}</p>

<p>🌇 Sunset: ${sunset}</p>

</div>


<div class="aqi-card">

<h3>Air Quality</h3>

<p>AQI Level: ${aqiText}</p>

</div>


<div class="prevention-card">

<h3>Health Advice</h3>

<p>Drink water, avoid long exposure if pollution is high, and wear suitable clothes based on temperature.</p>

</div>


<div class="swipe-container">

<div class="swipe-slider" id="swipeSlider">

<!-- HOURLY -->

<div class="swipe-slide">

<h3>Hourly Forecast</h3>

<div class="hourly-cards">

${hourly.map(h=>{

const time=h.dt_txt.split(" ")[1].slice(0,5);
const temp=h.main.temp.toFixed(1);
const main=h.weather[0].main;

return`
<div class="hour-card">
<p>${time}</p>
<p>${weatherSettings[main]}</p>
<p>${temp}°C</p>
</div>
`;

}).join("")}

</div>

</div>

<!-- TOMORROW -->

<div class="swipe-slide">

<h3>Tomorrow</h3>

<div class="tomorrow-box">

${daily[tomorrow].map(t=>{

const time=t.dt_txt.split(" ")[1].slice(0,5);
const temp=t.main.temp.toFixed(1);
const main=t.weather[0].main;

return`
<p>${time} ${weatherSettings[main]} ${temp}°C</p>
`;

}).join("")}

</div>

</div>

<!-- FIVE DAYS -->

<div class="swipe-slide">

<h3>5 Day Forecast</h3>

<div class="forecast-cards">

${fiveDays.map(day=>{

const avg=(daily[day].reduce((s,d)=>s+d.main.temp,0)/daily[day].length).toFixed(1);

const main=daily[day][0].weather[0].main;

const dayName = new Date(day).toLocaleDateString("en-US",{weekday:"short"});

return`
<div class="forecast-card">
<p>${dayName}</p>
<p>${weatherSettings[main]}</p>
<p>${avg}°C</p>
</div>
`;

}).join("")}

</div>

</div>

</div>

</div>

`;

initSwipe();

}

/* SWIPE */

function initSwipe(){

const slider=document.getElementById("swipeSlider");

let startX=0;
let index=0;

slider.addEventListener("touchstart",e=>{
startX=e.touches[0].clientX;
});

slider.addEventListener("touchend",e=>{

const diff=startX-e.changedTouches[0].clientX;

if(diff>50 && index<2) index++;
if(diff<-50 && index>0) index--;

slider.style.transform=`translateX(-${index*100}%)`;

});

}

/* AI FUNCTIONS */

function fillQuestion(q){
document.getElementById("aiInput").value=q;
}

function askAI(){

const tempElement=document.querySelector(".current-weather h1");

if(!tempElement){
document.getElementById("aiOutput").innerText="Load weather first.";
return;
}

const temp=parseInt(tempElement.innerText);

const q=document.getElementById("aiInput").value.toLowerCase();

let answer="I cannot answer that.";

if(q.includes("temperature")){
answer="Current temperature is "+temp+"°C";
}

else if(q.includes("wear")){

if(temp<10) answer="Wear a warm jacket.";
else if(temp<20) answer="Light jacket recommended.";
else if(temp<30) answer="Normal clothes are fine.";
else answer="Wear cotton clothes.";

}

else if(q.includes("crop")){
answer="Rice, wheat and vegetables grow well in this weather.";
}

else if(q.includes("disease")){
answer="Flu or dehydration can occur depending on weather.";
}

document.getElementById("aiOutput").innerText=answer;

}

/* SEARCH */

searchBtn.addEventListener("click",()=>{
if(searchInput.value.trim()){
getWeather(searchInput.value.trim());
}
});

/* DARK MODE */

themeToggle.addEventListener("click",()=>{
document.body.classList.toggle("dark-mode");
});

/* AUTO LOCATION */

window.addEventListener("load",()=>{

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition(async pos=>{

const lat=pos.coords.latitude;
const lon=pos.coords.longitude;

const res=await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
);

const data=await res.json();

const forecastRes=await fetch(
`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
);

const forecast=await forecastRes.json();

renderWeather(data,forecast);

});

}else{

getWeather("Delhi");

}

});