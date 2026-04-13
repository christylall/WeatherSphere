const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

let currentTemp = 0;
let currentWeather = "";

/* AQI */
async function getAQI(lat, lon){
const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
const data = await res.json();
return data.list?.[0]?.main?.aqi || "--";
}

/* WEATHER */
async function getWeather(city){

homeSection.innerHTML="Loading...";

const current = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`).then(r=>r.json());
const forecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`).then(r=>r.json());

render(current, forecast);
}

/* RENDER */
async function render(current, forecast){

currentTemp = current.main.temp;
currentWeather = current.weather[0].main;

const aqi = await getAQI(current.coord.lat, current.coord.lon);

/* GROUP DAYS */
let days = {};
forecast.list.forEach(i=>{
let d=i.dt_txt.split(" ")[0];
if(!days[d]) days[d]=[];
days[d].push(i);
});

const keys = Object.keys(days);
const tomorrow = keys[1];
const fiveDays = keys.slice(1,6);

/* UI */
homeSection.innerHTML=`
<h2>${current.name}</h2>
<h1>${currentTemp}°C</h1>
<p>${current.weather[0].description}</p>

<div class="weather-grid">

<div class="card">
<h3>AQI</h3>
<p>${aqi}</p>
</div>

<div class="card">
<h3>Tomorrow</h3>
<p>${days[tomorrow][0].weather[0].main}</p>
<p>${days[tomorrow][0].main.temp}°C</p>
</div>

<div class="card">
<h3>5 Days Avg</h3>
${fiveDays.map(d=>{
let avg = (days[d].reduce((s,x)=>s+x.main.temp,0)/days[d].length).toFixed(1);
return `<p>${d} : ${avg}°C</p>`;
}).join("")}
</div>

</div>

<div class="swipe-container">
<div class="swipe-slider" id="slider">

<div class="swipe-slide">
<h3>Hourly</h3>
${forecast.list.slice(0,6).map(h=>`
<p>${h.dt_txt.split(" ")[1].slice(0,5)} - ${h.main.temp}°C</p>
`).join("")}
</div>

<div class="swipe-slide">
<h3>Details</h3>
<p>Humidity: ${current.main.humidity}%</p>
<p>Wind: ${current.wind.speed}</p>
</div>

<div class="swipe-slide">
<h3>Info</h3>
<p>WeatherSphere Live Data</p>
</div>

</div>
</div>
`;

initSwipe();
}

/* SWIPE FIX (LAPTOP + MOBILE) */
function initSwipe(){
const slider=document.getElementById("slider");
if(!slider) return;

let index=0,startX=0;

slider.onmousedown=e=>startX=e.clientX;

window.onmouseup=e=>{
let diff=e.clientX-startX;
if(diff<-50&&index<2)index++;
if(diff>50&&index>0)index--;
slider.style.transform=`translateX(-${index*100}%)`;
};

slider.ontouchstart=e=>startX=e.touches[0].clientX;

slider.ontouchend=e=>{
let diff=e.changedTouches[0].clientX-startX;
if(diff<-50&&index<2)index++;
if(diff>50&&index>0)index--;
slider.style.transform=`translateX(-${index*100}%)`;
};
}

/* EVENTS */
searchBtn.onclick=()=>getWeather(searchInput.value);

/* DEFAULT */
getWeather("Delhi");