export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
}

export interface HeatSeries {
  hours: number[];
  legend: UTCILevel[];
}

export interface UTCILevel {
  min: number;
  color: string;
  label: string;
}

export interface RouteMetrics {
  distance: number;
  duration: number;
  peakUTCI: number;
  avgUTCI: number;
}

export interface WeatherInfo {
  weatherCode: number;
  weatherLabel: string;
  temperature: number;
  humidity: number;
  source: 'live' | 'mock';
}
