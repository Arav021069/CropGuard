// src/api/weatherApi.js
//
// No real weather endpoint has been configured yet, so this returns
// clearly marked mock/fallback data with the same shape a real provider
// would return. Swapping in a real API later means only touching this
// file — nothing else in the app needs to change.
//
// To connect a real weather API later, set in .env.local:
//   VITE_WEATHER_API_URL=https://your-weather-provider.example.com/forecast

const WEATHER_ENDPOINT = import.meta.env.VITE_WEATHER_API_URL || null;

// Mock data used whenever no real endpoint is configured. Never presented
// to the farmer as live data — WeatherCard shows a "Demo data" tag whenever
// isMock is true.
const MOCK_WEATHER = {
  temperatureC: 29,
  humidityPercent: 62,
  rainChancePercent: 20,
  condition: 'partly_cloudy', // 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'unknown'
  isMock: true,
};

function mockDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getWeather(lat, lng) {
  if (!WEATHER_ENDPOINT) {
    await mockDelay(500);
    return MOCK_WEATHER;
  }

  const response = await fetch(`${WEATHER_ENDPOINT}?lat=${lat}&lng=${lng}`);
  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }
  const data = await response.json();

  // Normalize field names, same pattern as diagnoseApi.js. Adjust the
  // right-hand keys to match whatever the real provider returns.
  return {
    temperatureC: data.temperatureC ?? data.temp_c ?? null,
    humidityPercent: data.humidityPercent ?? data.humidity ?? null,
    rainChancePercent: data.rainChancePercent ?? data.chance_of_rain ?? null,
    condition: data.condition ?? 'unknown',
    isMock: false,
  };
}
