export default async function handler(req, res) {
  const { city } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;
  if (!city || !apiKey) {
    return res.status(400).json({ error: "Missing city or API key" });
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Weather API error" });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
