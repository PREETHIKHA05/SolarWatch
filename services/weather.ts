// Fetch current weather for a city using OpenWeatherMap API
export async function fetchWeather(city: string) {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) throw new Error("Missing WEATHER_API_KEY");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}
