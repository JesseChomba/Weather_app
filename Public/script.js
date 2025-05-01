let unit = "metric"; // default is Celsius
const skycons = new Skycons({ color: "black" }); // will adjust based on theme

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

    weatherInfo.innerHTML = "<p>Loading current weather...</p>";
    forecastInfo.innerHTML = "";

    fetch(`/weather?city=${city}&units=${unit}`)
        .then(res => res.json())
        .then(data => {
            if (data.message) throw new Error(data.message);
            showCurrentWeather(data);
            saveToRecent(city);
        })
        .catch(err => {
            weatherInfo.innerHTML = `<p style='color:red;'>${err.message}</p>`;
        });

    fetch(`/forecast?city=${city}&units=${unit}`)
        .then(res => res.json())
        .then(showForecast)
        .catch(() => {});
}

function showCurrentWeather(data) {
    const weatherInfo = document.getElementById("weatherInfo");
    const tempUnit = unit === "metric" ? "°C" : "°F";
    const iconId = "weatherIcon";
    const iconCanvas = `<canvas id="${iconId}" width="128" height="128"></canvas>`;
    
    weatherInfo.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        ${iconCanvas}
        <p>${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp} ${tempUnit}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}</p>
    `;

    const skyconType = getSkyconIcon(data.weather[0].main);
    const isDark = document.body.classList.contains("dark");
    skycons.color = isDark ? "white" : "black";
    skycons.set(iconId, Skycons[skyconType]);
    skycons.play();
}

function showForecast(data) {
    const forecastEl = document.getElementById("forecast");
    const tempUnit = unit === "metric" ? "°C" : "°F";
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    forecastEl.innerHTML = "<h3>5-Day Forecast</h3>";

    daily.forEach(item => {
        forecastEl.innerHTML += `
            <div>
                <strong>${item.dt_txt.split(" ")[0]}</strong><br>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icon">
                <p>${item.main.temp} ${tempUnit}</p>
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
    container.innerHTML = "<p>Recent:</p>";
    recent.forEach(city => {
        const btn = document.createElement("button");
        btn.textContent = city;
        btn.onclick = () => {
            document.getElementById("city").value = city;
            getWeather();
        };
        container.appendChild(btn);
    });
}

function getLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported");
        return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        fetch(`/weather?lat=${latitude}&lon=${longitude}&units=${unit}`)
            .then(res => res.json())
            .then(showCurrentWeather)
            .catch(err => alert(err.message));
    });
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeButton();

    // Update Skycon icon color
    skycons.color = isDark ? "white" : "black";
    const iconEl = document.getElementById("weatherIcon");
    if (iconEl) {
        const iconType = skycons.list["weatherIcon"];
        if (iconType) {
            skycons.set("weatherIcon", iconType);
        }
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
    updateThemeButton();
}

function updateThemeButton() {
    const isDark = document.body.classList.contains("dark");
    const btn = document.getElementById("themeToggle");
    if (btn) {
        btn.textContent = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    }
}

window.onload = () => {
    loadTheme();
    showRecent();
};
