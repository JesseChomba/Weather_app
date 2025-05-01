let unit = "metric"; // Default is Celsius
let skycons; // Declare skycons variable

function toggleUnit() {
    unit = document.getElementById("unitToggle").checked ? "imperial" : "metric";
    const city = document.getElementById("city").value.trim();
    if (city) getWeather();
}

function getSkyconIcon(weatherMain) {
    const map = {
        "Clear": "CLEAR_DAY",
        "Clouds": "PARTLY_CLOUDY_DAY",
        "Rain": "RAIN",
        "Drizzle": "SLEET",
        "Snow": "SNOW",
        "Thunderstorm": "SLEET",
        "Mist": "FOG",
        "Haze": "FOG",
        "Fog": "FOG"
    };
    return map[weatherMain] || "CLOUDY";
}

function getWeather() {
    const city = document.getElementById("city").value.trim();
    const weatherInfo = document.getElementById("weatherInfo");
    const forecastInfo = document.getElementById("forecast");
    if (!city) {
        weatherInfo.innerHTML = "<p style='color:red;'>Please enter a city name.</p>";
        return;
    }

    weatherInfo.innerHTML = "<div class='loader'></div>";
    forecastInfo.innerHTML = "<div class='loader'></div>";

    fetch(`/weather?city=${city}&units=${unit}`)
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

    fetch(`/forecast?city=${city}&units=${unit}`)
        .then(res => res.json())
        .then(data => {
            console.log("Forecast API response (city):", data); // Debug log
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
    const iconId = "weatherIcon";
    const iconCanvas = `<canvas id="${iconId}" width="128" height="128"></canvas>`;

    // Default rendering with Skycons canvas
    weatherInfo.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        ${iconCanvas}
        <div id="weatherDetails">
            <p>${data.weather[0].description}</p>
            <p>Temperature: ${data.main.temp} ${tempUnit}</p>
            <p>Feels Like: ${data.main.feels_like} ${tempUnit}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind Speed: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}</p>
        </div>
    `;

    // Attempt to render Skycons icon
    if (skycons && typeof Skycons !== "undefined") {
        const skyconType = getSkyconIcon(data.weather[0].main);
        const isDark = document.body.classList.contains("dark");
        skycons.color = isDark ? "#e5e7eb" : "#1a1a1a";
        console.log(`Attempting to render Skycons: ${skyconType}`); // Debug log
        setTimeout(() => {
            try {
                skycons.set(iconId, Skycons[skyconType]);
                skycons.play();
                // Check if the canvas has content by checking its data
                const canvas = document.getElementById(iconId);
                const context = canvas.getContext("2d");
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
                const isEmpty = !imageData.some(channel => channel !== 0);
                if (isEmpty) {
                    console.warn("Skycons failed to render, falling back to OpenWeatherMap icon.");
                    fallbackToOpenWeatherIcon(data, weatherInfo, tempUnit);
                }
            } catch (err) {
                console.error("Skycons rendering error:", err.message);
                fallbackToOpenWeatherIcon(data, weatherInfo, tempUnit);
            }
        }, 200); // Increased delay to ensure DOM readiness
    } else {
        console.error("Skycons library not loaded, falling back to OpenWeatherMap icon.");
        fallbackToOpenWeatherIcon(data, weatherInfo, tempUnit);
    }
}

function fallbackToOpenWeatherIcon(data, weatherInfo, tempUnit) {
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
        console.log("Geolocation coordinates:", { latitude, longitude }); // Debug log
        const weatherInfo = document.getElementById("weatherInfo");
        const forecastInfo = document.getElementById("forecast");

        weatherInfo.innerHTML = "<div class='loader'></div>";
        forecastInfo.innerHTML = "<div class='loader'></div>";

        // Fetch current weather
        fetch(`/weather?lat=${latitude}&lon=${longitude}&units=${unit}`)
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

        // Fetch 5-day forecast
        fetch(`/forecast?lat=${latitude}&lon=${longitude}&units=${unit}`)
            .then(res => res.json())
            .then(data => {
                console.log("Forecast API response (geolocation):", data); // Debug log
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

    // Update Skycon icon color
    const iconEl = document.getElementById("weatherIcon");
    if (iconEl && skycons && skycons.list[iconEl]) {
        skycons.color = isDark ? "#e5e7eb" : "#1a1a1a";
        setTimeout(() => {
            try {
                skycons.set("weatherIcon", skycons.list[iconEl]);
                skycons.play();
                // Check if the canvas rendered
                const canvas = document.getElementById("weatherIcon");
                const context = canvas.getContext("2d");
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
                const isEmpty = !imageData.some(channel => channel !== 0);
                if (isEmpty) {
                    console.warn("Skycons failed to render after theme change, falling back to OpenWeatherMap icon.");
                    const weatherInfo = document.getElementById("weatherInfo");
                    const tempUnit = unit === "metric" ? "°C" : "°F";
                    const data = {
                        name: weatherInfo.querySelector("h2").textContent.split(",")[0],
                        sys: { country: weatherInfo.querySelector("h2").textContent.split(",")[1].trim() },
                        weather: [{ description: weatherInfo.querySelector("#weatherDetails p").textContent }],
                        main: {
                            temp: parseFloat(weatherInfo.querySelector("#weatherDetails p:nth-child(2)").textContent.replace("Temperature: ", "").replace(tempUnit, "")),
                            feels_like: parseFloat(weatherInfo.querySelector("#weatherDetails p:nth-child(3)").textContent.replace("Feels Like: ", "").replace(tempUnit, "")),
                            humidity: parseInt(weatherInfo.querySelector("#weatherDetails p:nth-child(4)").textContent.replace("Humidity: ", "").replace("%", ""))
                        },
                        wind: { speed: parseFloat(weatherInfo.querySelector("#weatherDetails p:nth-child(5)").textContent.replace("Wind Speed: ", "").replace(unit === "metric" ? "m/s" : "mph", "")) }
                    };
                    // Fetch the icon code from OpenWeatherMap if needed
                    fetch(`/weather?city=${data.name}&units=${unit}`)
                        .then(res => res.json())
                        .then(updatedData => {
                            data.weather[0].icon = updatedData.weather[0].icon;
                            fallbackToOpenWeatherIcon(data, weatherInfo, tempUnit);
                        });
                }
            } catch (err) {
                console.error("Skycons rendering error on theme change:", err.message);
            }
        }, 200);
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
    if (typeof Skycons !== "undefined") {
        skycons = new Skycons({ color: "black" }); // Initialize skycons after window load
        console.log("Skycons initialized successfully.");
    } else {
        console.error("Skycons library failed to load.");
    }
    loadTheme();
    showRecent();
    document.getElementById("city").focus();
};