const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY;

app.use(express.static(path.join(__dirname, "public")));

// Current weather route (by city or coordinates)
app.get("/weather", async (req, res) => {
    const { city, lat, lon, units = "metric" } = req.query;
    let url = "";

    if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    } else if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`;
    } else {
        return res.status(400).json({ message: "City or coordinates required" });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`City not found: ${errorText}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Weather API error:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// 5-day forecast route (by city or coordinates)
app.get("/forecast", async (req, res) => {
    const { city, lat, lon, units = "metric" } = req.query;
    console.log("Forecast request query:", { city, lat, lon, units }); // Debug log
    let url = "";

    if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    } else if (city) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${units}`;
    } else {
        return res.status(400).json({ message: "City or coordinates required" });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Forecast API response error:", { url, status: response.status, errorText });
            throw new Error(`Forecast data not found: ${errorText}`);
        }
        const data = await response.json();
        if (!data.list) {
            console.error("Forecast API response missing 'list':", data);
            throw new Error("Forecast response missing 'list' property");
        }
        res.json(data);
    } catch (err) {
        console.error("Forecast API error:", err.message);
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});