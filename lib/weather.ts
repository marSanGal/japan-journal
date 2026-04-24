const WMO_TO_WEATHER: Record<number, string> = {
  0: 'Sunny',
  1: 'Sunny',
  2: 'Cloudy',
  3: 'Cloudy',
  45: 'Cloudy',
  48: 'Cloudy',
  51: 'Rainy',
  53: 'Rainy',
  55: 'Rainy',
  56: 'Rainy',
  57: 'Rainy',
  61: 'Rainy',
  63: 'Rainy',
  65: 'Rainy',
  66: 'Rainy',
  67: 'Rainy',
  71: 'Snowy',
  73: 'Snowy',
  75: 'Snowy',
  77: 'Snowy',
  80: 'Rainy',
  81: 'Rainy',
  82: 'Rainy',
  85: 'Snowy',
  86: 'Snowy',
  95: 'Rainy',
  96: 'Rainy',
  99: 'Rainy',
};

export const fetchWeatherForDate = async (
  date: string,
  lat = 35.68,
  lng = 139.77
): Promise<string | null> => {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&daily=weather_code,temperature_2m_max` +
      `&timezone=Asia/Tokyo` +
      `&start_date=${date}&end_date=${date}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const code = data?.daily?.weather_code?.[0];
    const maxTemp = data?.daily?.temperature_2m_max?.[0];

    if (code == null) return null;

    let label = WMO_TO_WEATHER[code] || 'Cloudy';

    if (maxTemp != null && maxTemp >= 32) label = 'Hot';
    if (label === 'Sunny' && maxTemp != null && maxTemp >= 18 && maxTemp <= 26) {
      label = 'Perfect';
    }

    return label;
  } catch {
    return null;
  }
};
