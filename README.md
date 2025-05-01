# Weather App

This is a simple weather application backend built with Express.js. It uses the OpenWeatherMap API to provide current weather data and 5-day forecasts based on city names or geographic coordinates. The app serves a static frontend from the `Public` directory.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Weather_app
   ```

2. Install dependencies:
   ```bash
   npm install node-fetch@2 ## It is necesary to note that you need to uninstall existing node fetch packages before this one
   ```

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key:
   ```
   API_KEY=your_openweathermap_api_key
   ```

## Usage

Start the server with:

```bash
npm start server.js
```

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

## Frontend

Static frontend files (HTML, CSS, JavaScript) are served from the `Public` directory.

## License

This project is licensed under the ISC License.
