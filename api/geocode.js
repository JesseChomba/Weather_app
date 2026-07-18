const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const query = String(req.query.q || '').trim();
  const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 5);
  if (query.length < 2) return res.status(400).json({ message: 'Enter at least two characters.' });
  if (!process.env.API_KEY) return res.status(500).json({ message: 'Weather service is not configured.' });
  try {
    const params = new URLSearchParams({ q: query, limit: String(limit), appid: process.env.API_KEY });
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?${params}`, { timeout: 8000 });
    if (!response.ok) throw new Error(`OpenWeather returned ${response.status}`);
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(await response.json());
  } catch (error) {
    console.error('Geocoding API error:', error.message);
    return res.status(502).json({ message: 'Location suggestions are temporarily unavailable.' });
  }
};
