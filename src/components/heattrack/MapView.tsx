import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LatLng, RouteResult } from '@/types/heattrack';

const makeIcon = (color: string, label: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;color:white;font-weight:700;">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const originIcon = makeIcon('#22c55e', '起');
const destIcon = makeIcon('#ef4444', '终');

interface MapViewProps {
  origin: LatLng | null;
  destination: LatLng | null;
  route: RouteResult | null;
  heatLayerOn: boolean;
  selectedHour: number;
  pickMode: boolean;
  focusPoint: LatLng | null;
  focusZoom: number | null;
  onMapClick: (latlng: LatLng) => void;
}

export default function MapView({
  origin, destination, route, heatLayerOn, selectedHour, pickMode, focusPoint, focusZoom, onMapClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const heatLayerRef = useRef<L.GridLayer | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const pickModeRef = useRef(pickMode);

  onMapClickRef.current = onMapClick;
  pickModeRef.current = pickMode;

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [31.23, 121.47],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (pickModeRef.current) {
        onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Origin marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (originMarkerRef.current) { map.removeLayer(originMarkerRef.current); originMarkerRef.current = null; }
    if (origin) {
      originMarkerRef.current = L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(map);
    }
  }, [origin]);

  // Destination marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (destMarkerRef.current) { map.removeLayer(destMarkerRef.current); destMarkerRef.current = null; }
    if (destination) {
      destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);
    }
  }, [destination]);

  // Route polyline + fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (routeLineRef.current) { map.removeLayer(routeLineRef.current); routeLineRef.current = null; }
    if (route) {
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
      routeLineRef.current = L.polyline(coords, { color: '#f97316', weight: 5, opacity: 0.85 }).addTo(map);
      if (coords.length > 0) {
        map.fitBounds(L.latLngBounds(coords.map(c => L.latLng(c[0], c[1]))), { padding: [60, 60], maxZoom: 15 });
      }
    }
  }, [route]);

  // Heat overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (heatLayerRef.current) { map.removeLayer(heatLayerRef.current); heatLayerRef.current = null; }
    if (!heatLayerOn) return;

    const HeatGrid = L.GridLayer.extend({
      createTile: function (coords: L.Coords) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        const blockSize = 32;
        for (let x = 0; x < 256; x += blockSize) {
          for (let y = 0; y < 256; y += blockSize) {
            const hash = ((coords.x * 256 + x) * 31 + (coords.y * 256 + y) * 17 + selectedHour * 53) % 100;
            const hourFactor = Math.max(0, 1 - Math.abs(selectedHour - 14) / 6);
            const adjusted = hash * (0.4 + hourFactor * 0.6);
            let color: string;
            if (adjusted < 20) color = 'rgba(44, 160, 44, 0.28)';
            else if (adjusted < 40) color = 'rgba(255, 187, 120, 0.30)';
            else if (adjusted < 60) color = 'rgba(255, 127, 14, 0.32)';
            else if (adjusted < 80) color = 'rgba(214, 39, 40, 0.30)';
            else color = 'rgba(127, 23, 52, 0.35)';
            ctx.fillStyle = color;
            ctx.fillRect(x, y, blockSize, blockSize);
          }
        }
        return canvas;
      },
    });

    const HeatGridCtor = HeatGrid as unknown as new (options?: L.GridLayerOptions) => L.GridLayer;
    heatLayerRef.current = new HeatGridCtor({ opacity: 1 });
    heatLayerRef.current!.addTo(map);
  }, [heatLayerOn, selectedHour]);


  // Focus map to a specific point (e.g. current location)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusPoint) return;
    const nextZoom = focusZoom ?? Math.max(map.getZoom(), 15);
    map.setView([focusPoint.lat, focusPoint.lng], nextZoom, { animate: true });
  }, [focusPoint, focusZoom]);
  // Cursor style for pick mode
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.cursor = pickMode ? 'crosshair' : '';
    }
  }, [pickMode]);

  return <div ref={containerRef} className="h-full w-full" />;
}
