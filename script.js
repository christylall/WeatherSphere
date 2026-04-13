const API_KEY = "da287b27ab2c62083846949656a915d4";
a
let index = 0;
let currentTemp = 0;

document.addEventListener("DOMContentLoaded",()=>{
getWeather("Delhi");
});

/* WEATHER */
async function getWeather(city){

const res = await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
);
const current = await res.json();

const res2 = await fetch(
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
);
const forecast = await res2.json();

currentTemp = current.main.temp;

render(current,forecast);
}

/* RENDER */
function render(current,forecast){

const hourly = forecast.list.slice(0,8);

const daily = {};
forecast.list.forEach(i=>{
const d=i.dt_txt.split(" ")[0];
if(!daily[d]) daily[d]=[];
daily[d].push(i);
});

const days = Object.keys(daily);

document.getElementById("homeSection").innerHTML=`
<div class="current-weather">
<h2>${current.name}</h2>
<h1>${currentTemp}°C</h1>
<p>${current.weather[0].main}</p>
</div>

<div class="aqi-card">AQI</div>
<div class="prevention-card">Advice</div>

<div class="swipe-wrapper">
<div class="swipe-slider" id="slider">

<div class="swipe-slide">
<h3>Today</h3>
${hourly.map(h=>`<div class="forecast-card">${h.main.temp}°C</div>`).join("")}
</div>

<div class="swipe-slide">
<h3>Tomorrow</h3>
${daily[days[1]].map(h=>`<div class="forecast-card">${h.main.temp}°C</div>`).join("")}
</div>

<div class="swipe-slide">
<h3>5 Days</h3>
${days.slice(0,5).map(d=>`<div class="forecast-card">${d}</div>`).join("")}
</div>

</div>

<div class="dots">
<span onclick="go(0)"></span>
<span onclick="go(1)"></span>
<span onclick="go(2)"></span>
</div>

</div>
`;

initSwipe();
runAnim(current.weather[0].main);
}

/* SWIPE FIX */
function initSwipe(){

const slider=document.getElementById("slider");
if(!slider) return;

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

window.go=(i)=>{
index=i;
slider.style.transform=`translateX(-${index*100}%)`;
};
}

/* ANIMATION */
function runAnim(type){
const box=document.getElementById("weatherAnimation");
box.innerHTML="";

for(let i=0;i<4;i++){
let c=document.createElement("div");
c.className="cloud";
c.style.top=i*20+"%";
box.appendChild(c);
}

if(type==="Rain"){
for(let i=0;i<40;i++){
let r=document.createElement("div");
r.className="rain-drop";
r.style.left=Math.random()*100+"%";
box.appendChild(r);
}
}

if(type==="Clear"){
let s=document.createElement("div");
s.className="sun";
box.appendChild(s);
}
}

/* AI FIX */
window.fillQuestion=(q)=>{
document.getElementById("aiInput").value=q;
askAI();
};

window.askAI=()=>{
let i=document.getElementById("aiInput").value.toLowerCase();
let o=document.getElementById("aiOutput");

if(i.includes("temperature")) o.innerText=currentTemp+"°C";
else if(i.includes("wear")) o.innerText=currentTemp>30?"Light clothes":"Normal clothes";
else if(i.includes("weather")) o.innerText="Weather shown above";
else o.innerText="Ask properly";
};