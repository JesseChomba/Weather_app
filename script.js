let unit = "metric"; // Default is Celsius

   function toggleUnit() {
       unit = document.getElementById("unitToggle").checked ? "imperial" : "metric";
       const city = document.getElementById("city").value.trim();
       if (city) getWeather();
   }

   function getWeather() {
       const city = document.getElementById("city").value.trim();
       const weatherInfo = document.getElementById("weatherInfo");
       const forecastInfo = document.getElementById("forecast");
       if (!city) {
           weatherInfo.innerHTML = "<p style='color:red;'>Please enter a city name.</p>";
           return;
       }

       // Track the weather search event with Vercel Analytics
       if (window.VA) {
           window.VA.track("Weather Search", { city: city, unit: unit });
       }

       weatherInfo.innerHTML = "<div class='loader'></div>";
       forecastInfo.innerHTML = "<div class='loader'></div>";

       fetch(`/api/weather?city=${city}&units=${unit}`)
           .then(res => res.json())
           .then(data => {
               if (data.message) throw new Error(data.message);
               showCurrentWeather(data);
               saveToRecent(city);
           })
           .catch(err => {
               weatherInfo.innerHTML = `
                   <p style='color:red;'>Error: ${err.message}</p>
                   <button onclick="getWeather()">Retry</button>
               `;
           });

       fetch(`/api/forecast?city=${city}&units=${unit}`)
           .then(res => res.json())
           .then(data => {
               console.log("Forecast API response (city):", data);
               showForecast(data);
           })
           .catch(err => {
               console.error("Forecast fetch error (city):", err.message);
               forecastInfo.innerHTML = `
                   <p style='color:red;'>Error loading forecast: ${err.message}</p>
                   <button onclick="getWeather()">Retry</button>
               `;
           });
   }

   function showCurrentWeather(data) {
       const weatherInfo = document.getElementById("weatherInfo");
       const tempUnit = unit === "metric" ? "°C" : "°F";

       weatherInfo.innerHTML = `
           <h2>${data.name}, ${data.sys.country}</h2>
           <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
           <div id="weatherDetails">
               <p>${data.weather[0].description}</p>
               <p>Temperature: ${data.main.temp} ${tempUnit}</p>
               <p>Feels Like: ${data.main.feels_like} ${tempUnit}</p>
               <p>Humidity: ${data.main.humidity}%</p>
               <p>Wind Speed: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}</p>
           </div>
       `;
   }

   function showForecast(data) {
       if (!data || !data.list) {
           throw new Error("Forecast data is invalid or empty");
       }
       const forecastEl = document.getElementById("forecast");
       const tempUnit = unit === "metric" ? "°C" : "°F";
       const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
       forecastEl.innerHTML = "<h3>5-Day Forecast</h3>";

       daily.forEach(item => {
           const date = new Date(item.dt_txt).toLocaleDateString("en-US", {
               weekday: "short",
               month: "short",
               day: "numeric"
           });
           forecastEl.innerHTML += `
               <div class="forecast-card">
                   <strong>${date}</strong>
                   <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
                   <p>${item.main.temp} ${tempUnit}</p>
                   <p>${item.weather[0].description}</p>
               </div>
           `;
       });
   }

   function saveToRecent(city) {
       let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
       if (!recent.includes(city)) {
           recent.unshift(city);
           if (recent.length > 5) recent.pop();
           localStorage.setItem("recentCities", JSON.stringify(recent));
       }
       showRecent();
   }

   function showRecent() {
       const recent = JSON.parse(localStorage.getItem("recentCities")) || [];
       const container = document.getElementById("recentSearches");
       container.innerHTML = "<p>Recent Searches:</p>";
       recent.forEach(city => {
           const btn = document.createElement("button");
           btn.textContent = city;
           btn.setAttribute("aria-label", `Search weather for ${city}`);
           btn.onclick = () => {
               document.getElementById("city").value = city;
               getWeather();
           };
           container.appendChild(btn);
       });
   }

   function getLocation() {
       if (!navigator.geolocation) {
           alert("Geolocation is not supported by your browser.");
           return;
       }
       navigator.geolocation.getCurrentPosition(pos => {
           const { latitude, longitude } = pos.coords;
           console.log("Geolocation coordinates:", { latitude, longitude });

           // Track the geolocation search event with Vercel Analytics
           if (window.VA) {
               window.VA.track("Geolocation Search", { latitude: latitude, longitude: longitude, unit: unit });
           }

           const weatherInfo = document.getElementById("weatherInfo");
           const forecastInfo = document.getElementById("forecast");

           weatherInfo.innerHTML = "<div class='loader'></div>";
           forecastInfo.innerHTML = "<div class='loader'></div>";

           fetch(`/api/weather?lat=${latitude}&lon=${longitude}&units=${unit}`)
               .then(res => res.json())
               .then(data => {
                   if (data.message) throw new Error(data.message);
                   showCurrentWeather(data);
                   saveToRecent(data.name);
               })
               .catch(err => {
                   console.error("Weather fetch error (geolocation):", err.message);
                   weatherInfo.innerHTML = `
                       <p style='color:red;'>Error: ${err.message}</p>
                       <button onclick="getLocation()">Retry</button>
                   `;
               });

           fetch(`/api/forecast?lat=${latitude}&lon=${longitude}&units=${unit}`)
               .then(res => res.json())
               .then(data => {
                   console.log("Forecast API response (geolocation):", data);
                   if (!data || !data.list) {
                       throw new Error("Forecast data is invalid or empty");
                   }
                   showForecast(data);
               })
               .catch(err => {
                   console.error("Forecast fetch error (geolocation):", err.message);
                   forecastInfo.innerHTML = `
                       <p style='color:red;'>Forecast unavailable for this location.</p>
                       <button onclick="getLocation()">Retry</button>
                   `;
               });
       }, err => {
           const weatherInfo = document.getElementById("weatherInfo");
           weatherInfo.innerHTML = `
               <p style='color:red;'>Unable to retrieve location: ${err.message}</p>
               <button onclick="getLocation()">Retry</button>
           `;
       });
   }

   function toggleTheme() {
       const isDark = document.body.classList.toggle("dark");
       localStorage.setItem("theme", isDark ? "dark" : "light");
       updateThemeButton();

       // Track theme toggle event with Vercel Analytics
       if (window.VA) {
           window.VA.track("Theme Toggle", { theme: isDark ? "dark" : "light" });
       }
   }

   function loadTheme() {
       const savedTheme = localStorage.getItem("theme");
       if (savedTheme === "dark") {
           document.body.classList.add("dark");
           document.getElementById("themeToggle").checked = true;
       }
       updateThemeButton();
   }

   function updateThemeButton() {
       const isDark = document.body.classList.contains("dark");
       const toggle = document.getElementById("themeToggle");
       if (toggle) {
           toggle.checked = isDark;
       }
   }

   window.onload = () => {
       loadTheme();
       showRecent();
       document.getElementById("city").focus();
   };