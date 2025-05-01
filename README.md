# Weather App

This is a simple weather application backend built with Express.js. It uses the OpenWeatherMap API to provide current weather data and 5-day forecasts based on city names or geographic coordinates. The app serves a static frontend from the project root directory.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JesseChomba/Weather_app.git
   cd Weather_app
   ```

2. Install dependencies:
   ```bash
   npm install node-fetch@2
   ```
   _Note: If you have other versions of node-fetch installed, you may need to uninstall them before installing version 2._

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key:
   ```
   API_KEY=your_openweathermap_api_key
   ```

## Usage

Start the server with:

```bash
npm start
```

This runs the backend server located at `api/weather.js`.

The server will run on [http://localhost:3000](http://localhost:3000).

## API Endpoints

- **GET /weather**

  Get current weather data by city or coordinates.

  Query parameters:
  - `city` (string): City name (e.g., London)
  - `lat` (number): Latitude coordinate
  - `lon` (number): Longitude coordinate
  - `units` (string, optional): Units of measurement (`metric` or `imperial`, default is `metric`)

  Example:
  ```
  /weather?city=London&units=metric
  ```

- **GET /forecast**

  Get 5-day weather forecast by city.

  Query parameters:
  - `city` (string): City name (required)
  - `units` (string, optional): Units of measurement (`metric` or `imperial`, default is `metric`)

  Example:
  ```
  /forecast?city=London&units=metric
  ```

## Backend

The backend API files are located in the `api` folder:
- `weather.js`: Handles current weather data requests.
- `forecast.js`: Handles 5-day weather forecast requests.

## Frontend

Static frontend files (HTML, CSS, JavaScript) are served from the project root directory.

### Frontend Features

- Light/Dark theme toggle button.
- Input field to enter city name for weather lookup.
- Button to get weather by current geolocation.
- Unit toggle between Celsius (°C) and Fahrenheit (°F).
- Display of recent city searches.
- Weather icon animations using Skycons.
- Display of current weather details and 5-day forecast.

## License

This project is licensed under the ISC License.
