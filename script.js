const API_KEY = "YOUR_API_KEY";

const homeSection = document.getElementById("homeSection");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

let index = 0;
let currentTemp = 0;
let currentWeather = "";

searchBtn.onclick = () => getWeather(searchInput.value);

document.querySelectorAll(".location-btn").forEach(b=>{
b.onclick = ()=>getWeather(b.dataset.location);
});

const icons = {
Clear:"☀️",
Clouds:"☁️",
Rain:"🌧️"
};

async function getWeather(city){

const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
const data = await res.json();

const fore = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
const fdata = await fore.json();

render(data,fdata);

}

function render(current,forecast){

currentTemp = current.main.temp;
currentWeather = current.weather[0].main;

const hourly = forecast.list.slice(0,8);

homeSection.innerHTML = `

<div class="current-weather">
<h2>${current.name}</h2>
<h1>${currentTemp}°C</h1>
<p>${icons[currentWeather] || "🌡️"} ${currentWeather}</p>
</div>

<div class="swipe-container">
<div class="swipe-slider" id="slider">

<div class="swipe-slide">
<h3>Hourly</h3>
${hourly.map(h=>`<p>${h.dt_txt.slice(11,16)} ${h.main.temp}°C</p>`).join("")}
</div>

<div class="swipe-slide">
<h3>Tomorrow</h3>
<p>Forecast data</p>
</div>

<div class="swipe-slide">
<h3>5 Days</h3>
<p>Forecast data</p>
</div>

</div>
</div>
`;

index=0;
updateDots();
initSwipe();

}

function initSwipe(){
const slider=document.getElementById("slider");
let startX=0;

slider.ontouchstart=e=>startX=e.touches[0].clientX;
slider.ontouchend=e=>move(startX-e.changedTouches[0].clientX);

slider.onmousedown=e=>startX=e.clientX;
slider.onmouseup=e=>move(startX-e.clientX);
}

function move(diff){
if(diff>50 && index<2) index++;
if(diff<-50 && index>0) index--;

updateSlider();
}

function goSlide(i){
index=i;
updateSlider();
}

function updateSlider(){
document.getElementById("slider").style.transform=`translateX(-${index*100}%)`;
updateDots();
}

function updateDots(){
document.querySelectorAll(".dot").forEach((d,i)=>{
d.classList.toggle("active",i===index);
});
}

/* SIMPLE AI */
function askAI(){
const q=document.getElementById("aiInput").value.toLowerCase();
if(q.includes("temp")) document.getElementById("aiOutput").innerText=currentTemp+"°C";
else document.getElementById("aiOutput").innerText="Ask temp/weather related";
}