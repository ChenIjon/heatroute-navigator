import type { LatLng, RouteResult, HeatSeries, RouteMetrics, WeatherInfo } from '@/types/heattrack';

const WEATHER_LABELS: Record<number, string> = {
  0: '晴朗',
  1: '晴间多云',
  2: '多云',
  3: '阴天',
  45: '有雾',
  48: '有雾',
  51: '小雨',
  53: '小雨',
  55: '小雨',
  61: '降雨',
  63: '降雨',
  65: '强降雨',
  80: '阵雨',
  81: '阵雨',
  82: '阵雨',
  95: '雷阵雨',
};

export async function planRoute(origin: LatLng, destination: LatLng): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('网络请求失败');
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.length) throw new Error('无法规划路线，请检查起终点是否可达');
  const route = data.routes[0];
  return {
    geometry: route.geometry,
    distance: +(route.distance / 1000).toFixed(1),
    duration: +Math.max(1, route.duration / 60).toFixed(0),
  };
}

export async function fetchHeatSeries(): Promise<HeatSeries> {
  await new Promise(r => setTimeout(r, 600));
  return {
    hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    legend: [
      { min: 46, color: '#7f1734', label: '极端热应激' },
      { min: 38, color: '#d62728', label: '强热应激' },
      { min: 32, color: '#ff7f0e', label: '中等热应激' },
      { min: 26, color: '#ffbb78', label: '轻微热应激' },
      { min: 9, color: '#2ca02c', label: '无热应激' },
    ],
  };
}

export async function fetchTodayWeather(point: LatLng): Promise<WeatherInfo> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lng}` +
    '&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto';

  const res = await fetch(url);
  if (!res.ok) throw new Error('天气数据请求失败');
  const data = await res.json();
  const current = data?.current;

  if (
    typeof current?.temperature_2m !== 'number' ||
    typeof current?.relative_humidity_2m !== 'number' ||
    typeof current?.weather_code !== 'number'
  ) {
    throw new Error('天气数据解析失败');
  }

  return {
    weatherCode: current.weather_code,
    weatherLabel: WEATHER_LABELS[current.weather_code] ?? '天气',
    temperature: Math.round(current.temperature_2m),
    humidity: Math.round(current.relative_humidity_2m),
    source: 'live',
  };
}

export function mockWeatherInfo(): WeatherInfo {
  const samples = [
    { weatherCode: 0, weatherLabel: '晴朗', temperature: 31, humidity: 52 },
    { weatherCode: 2, weatherLabel: '多云', temperature: 28, humidity: 61 },
    { weatherCode: 61, weatherLabel: '降雨', temperature: 25, humidity: 83 },
  ];
  const picked = samples[Math.floor(Math.random() * samples.length)];

  return {
    ...picked,
    source: 'mock',
  };
}

export function mockMetrics(distance: number, duration: number, hour: number): RouteMetrics {
  const factor = Math.max(0, 1 - Math.abs(hour - 14) / 6);
  const base = 22 + factor * 16;
  return {
    distance,
    duration,
    peakUTCI: +(base + 5 + Math.random() * 3).toFixed(1),
    avgUTCI: +(base + Math.random() * 2).toFixed(1),
  };
}

export function parseCoordInput(input: string): LatLng | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/[,\s]+/).map(Number);
  if (parts.length >= 2 && parts.every(n => !isNaN(n))) {
    const [a, b] = parts;
    // Assume lng,lat format as per spec
    if (Math.abs(b) <= 90 && Math.abs(a) <= 180) {
      return { lng: a, lat: b };
    }
    // Try lat,lng
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
      return { lng: b, lat: a };
    }
  }
  return null;
}

export async function geocodeChineseCity(province: string, city: string): Promise<LatLng> {
  const buildUrl = (name: string) =>
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=8&language=zh&format=json`;

  const candidates = [`${city} ${province}`, city];

  for (const keyword of candidates) {
    const res = await fetch(buildUrl(keyword));
    if (!res.ok) continue;
    const data = await res.json();
    const results: Array<{ latitude: number; longitude: number; country_code?: string; admin1?: string; name?: string }> = data?.results ?? [];

    const matched =
      results.find((item) => item.country_code === 'CN' && (item.admin1?.includes(province.replace(/省|市|自治区|特别行政区/g, '')) || item.name?.includes(city.replace(/市|地区|盟|自治州|县/g, '')))) ??
      results.find((item) => item.country_code === 'CN') ??
      results[0];

    if (matched && Number.isFinite(matched.latitude) && Number.isFinite(matched.longitude)) {
      return { lat: matched.latitude, lng: matched.longitude };
    }
  }

  throw new Error('城市定位失败');
}
