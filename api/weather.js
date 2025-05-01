const fetch = require("node-fetch");

module.exports = async (req, res) => {
    const { city, lat, lon, units = "metric" } = req.query;
    const API_KEY = process.env.API_KEY;
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
};