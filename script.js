const API_KEY = "da287b27ab2c62083846949656a915d4";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const homeSection = document.getElementById("homeSection");

/* WEATHER ICONS */
const weatherSettings = {
  Clear:"☀️",
  Clouds:"☁️",
  Rain:"🌧️",
  Snow:"❄️",
  Thunderstorm:"⚡",
  Mist:"🌫️",
  Haze:"🌫️",
  Drizzle:"🌦️"
};

/* RULE-BASED AI */
const aiQA = {
  "hello":"Hello! How can I help you?",
  "hi":"Hi there! Need any weather info?",
  "temperature":"Temperature shows how hot or cold the weather is.",
  "humidity":"Humidity tells how much water is in the air.",
  "wind":"Wind speed tells how fast the air is moving.",
  "aqi":"AQI indicates the air quality: 1-Good to 5-Very Poor.",
  "sunrise":"Sunrise shows the time when the sun rises in the city.",
  "sunset":"Sunset shows the time when the sun sets in the city.",
  "delhi":"Delhi is the capital city of India.",
  "mumbai":"Mumbai is the financial capital of India.",
  "chennai":"Chennai is a major city in southern India, famous for its beaches.",
  "kolkata":"Kolkata is the cultural capital of India.",
  "weather":"Weather shows temperature, humidity, wind, and condition.",
  "rain":"Rain means water droplets falling from clouds.",
  "snow":"Snow is frozen water falling from clouds.",
  "clouds":"Clouds indicate cloudy weather.",
  "clear":"Clear means sunny weather with no clouds.",
  "thunderstorm":"Thunderstorm is stormy weather with lightning and thunder.",
  "mist":"Mist is tiny water droplets in the air causing reduced visibility.",
  "haze":"Haze is dust or smoke in the air causing a slight fog.",
  "drizzle":"Drizzle is light rain with small droplets."
};

/* GET WEATHER */
async function getWeather(city){
  try{
    homeSection.innerHTML = `<p class="loading">Loading...</p>`;

    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const current = await currentRes.json();
    if(current.cod !== 200){
      homeSection.innerHTML = `<p>City not found</p>`;
      return;
    }

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const forecast = await forecastRes.json();

    const aqiRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}`
    );
    const aqiData = await aqiRes.json();

    renderData(current,forecast,aqiData);

  }catch{
    homeSection.innerHTML = `<p>API Error</p>`;
  }
}

/* RENDER DATA */
function renderData(current,forecast,aqiData){
  const icon = weatherSettings[current.weather[0].main] || "🌡️";
  const sunrise = new Date(current.sys.sunrise*1000).toLocaleTimeString();
  const sunset = new Date(current.sys.sunset*1000).toLocaleTimeString();
  const hourlyData = forecast.list.slice(0,8);
  const tomorrowData = forecast.list.slice(8,16);
  let tomorrowAvg = (tomorrowData.reduce((s,d)=>s+d.main.temp,0)/tomorrowData.length).toFixed(1);
  let tomorrowMain = tomorrowData[0].weather[0].main;

  const aqiIndex = aqiData.list[0].main.aqi;
  const aqiLevels = {
    1:{text:"Good",color:"#4CAF50"},
    2:{text:"Fair",color:"#8BC34A"},
    3:{text:"Moderate",color:"#FFC107"},
    4:{text:"Poor",color:"#FF5722"},
    5:{text:"Very Poor",color:"#F44336"}
  };
  const aqiInfo = aqiLevels[aqiIndex];

  homeSection.innerHTML = `
    <div id="weatherAnimation"></div>

    <div class="swipe-container">
      <div class="swipe-slider" id="swipeSlider">

        <div class="swipe-slide">
          <div class="current-weather">
            <h2>${current.name}, ${current.sys.country}</h2>
            <h1>${current.main.temp}°C</h1>
            <p>${icon} ${current.weather[0].description}</p>
            <p>💧 ${current.main.humidity}% | 💨 ${current.wind.speed} m/s</p>
            <p>🌅 ${sunrise}</p>
            <p>🌇 ${sunset}</p>
          </div>

          <div class="aqi-card" style="background:${aqiInfo.color}">
            AQI ${aqiIndex} - ${aqiInfo.text}
          </div>

          <h3>Hourly Forecast</h3>
          <div class="hourly-slider">
            ${hourlyData.map(hour=>{
              const time = new Date(hour.dt_txt).getHours();
              const icon = weatherSettings[hour.weather[0].main] || "🌡️";
              return `
                <div class="hour-card">
                  <p>${time}:00</p>
                  <p>${icon}</p>
                  <p>${hour.main.temp}°C</p>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="swipe-slide">
          <div class="current-weather">
            <h2>Tomorrow</h2>
            <h1>${tomorrowAvg}°C</h1>
            <p>${weatherSettings[tomorrowMain]} ${tomorrowMain}</p>
          </div>
        </div>

      </div>
    </div>

    <div class="ai-chat">
      <h3>🤖 WeatherSphere AI (Rule-based)</h3>
      <input id="aiInput" placeholder="Ask anything...">
      <button onclick="askAI()">Ask AI</button>
      <p id="aiOutput"></p>
    </div>
  `;

  initSwipe();
  setWeatherAnimation(current.weather[0].main);
}

/* SWIPE */
function initSwipe(){
  const slider=document.getElementById("swipeSlider");
  let startX=0, currentIndex=0;

  slider.addEventListener("touchstart",e=>{ startX=e.touches[0].clientX });
  slider.addEventListener("touchend",e=>{
    let endX=e.changedTouches[0].clientX;
    if(startX-endX>50 && currentIndex<1) currentIndex++;
    if(endX-startX>50 && currentIndex>0) currentIndex--;
    slider.style.transform=`translateX(-${currentIndex*100}%)`
  });
}

/* WEATHER ANIMATION */
function setWeatherAnimation(weather){
  const container=document.getElementById("weatherAnimation");
  container.innerHTML="";
  if(weather==="Rain"||weather==="Drizzle"){
    for(let i=0;i<100;i++){
      const drop=document.createElement("div");
      drop.className="rain-drop";
      drop.style.left=Math.random()*100+"%";
      container.appendChild(drop);
    }
  } else if(weather==="Clear"){
    const sun=document.createElement("div");
    sun.className="sun";
    container.appendChild(sun);
  } else if(weather==="Clouds"){
    for(let i=0;i<3;i++){
      const cloud=document.createElement("div");
      cloud.className="cloud";
      cloud.style.top=(40+Math.random()*120)+"px";
      container.appendChild(cloud);
    }
  } else if(weather==="Snow"){
    for(let i=0;i<80;i++){
      const snow=document.createElement("div");
      snow.className="snow";
      snow.style.left=Math.random()*100+"%";
      container.appendChild(snow);
    }
  } else if(weather==="Thunderstorm"){
    const flash=document.createElement("div");
    flash.className="lightning";
    container.appendChild(flash);
  }
}

/* RULE-BASED AI FUNCTION */
function askAI(){
  const question=document.getElementById("aiInput").value.toLowerCase();
  let answer="Sorry, I don't know the answer.";
  for(const key in aiQA){
    if(question.includes(key)){
      answer=aiQA[key];
      break;
    }
  }
  document.getElementById("aiOutput").innerText=answer;
}

/* SEARCH */
searchBtn.addEventListener("click",()=>{
  if(searchInput.value.trim())
    getWeather(searchInput.value.trim())
});

/* DARK MODE */
themeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark-mode")
});

/* DEFAULT */
window.addEventListener("load",()=>{
  getWeather("Delhi")
});