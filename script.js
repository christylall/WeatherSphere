const API_KEY = "da287b27ab2c62083846949656a915d4";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

let currentTemp = 0;
let currentWeather = "";

/* WEATHER ICONS */
const icons = {
Clear:"☀️", Clouds:"☁️", Rain:"🌧️", Snow:"❄️", Thunderstorm:"⚡"
};

/* WEATHER */
async function getWeather(city){
homeSection.innerHTML="Loading...";

const res1 = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
const data = await res1.json();

if(data.cod !== 200){
homeSection.innerHTML="City not found";
return;
}

const res2 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
const forecast = await res2.json();

render(data, forecast);
}

/* RENDER */
function render(current, forecast){

currentTemp = current.main.temp;
currentWeather = current.weather[0].main;

const hourly = forecast.list.slice(0,8);

homeSection.innerHTML=`
<div>
<h2>${current.name}</h2>
<h1>${currentTemp}°C</h1>
<p>${icons[currentWeather]} ${current.weather[0].description}</p>
</div>

<div class="swipe-container">
<div class="swipe-slider" id="slider">

<div class="swipe-slide">
<h3>Hourly</h3>
${hourly.map(h=>`
<div class="forecast-card">
${h.dt_txt.split(" ")[1].slice(0,5)}<br>
${icons[h.weather[0].main]} ${h.main.temp}°C
</div>
`).join("")}
</div>

<div class="swipe-slide">
<h3>Tomorrow</h3>
<p>Weather Data</p>
</div>

<div class="swipe-slide">
<h3>5 Days</h3>
<p>Forecast Data</p>
</div>

</div>
</div>
`;

initSwipe();
}

/* FIXED SLIDER (PC + MOBILE) */
function initSwipe(){
const slider=document.getElementById("slider");
if(!slider) return;

let index=0;
let startX=0;

slider.onmousedown=e=>startX=e.clientX;

window.onmouseup=e=>{
let diff=e.clientX-startX;
if(diff<-50 && index<2) index++;
if(diff>50 && index>0) index--;
slider.style.transform=`translateX(-${index*100}%)`;
};

slider.ontouchstart=e=>startX=e.touches[0].clientX;

slider.ontouchend=e=>{
let diff=e.changedTouches[0].clientX-startX;
if(diff<-50 && index<2) index++;
if(diff>50 && index>0) index--;
slider.style.transform=`translateX(-${index*100}%)`;
};
}

/* SEARCH */
searchBtn.onclick=()=>getWeather(searchInput.value);

/* THEME */
themeToggle.onclick=()=>{
document.body.classList.toggle("dark-mode");
};

/* DEFAULT */
getWeather("Delhi");

/* AI */
window.askAI=function(){
const q=document.getElementById("aiInput").value.toLowerCase();
const out=document.getElementById("aiOutput");

if(q.includes("temperature"))
out.innerText=`${currentTemp}°C`;
else
out.innerText="Ask weather question";
};

window.fillQuestion=function(q){
document.getElementById("aiInput").value=q;
askAI();
};