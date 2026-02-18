import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, RotateCcw, Check, LocateFixed, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView from '@/components/heattrack/MapView';
import InputCard from '@/components/heattrack/InputCard';
import BottomPanel from '@/components/heattrack/BottomPanel';
import UTCILegend from '@/components/heattrack/UTCILegend';
import HourPicker from '@/components/heattrack/HourPicker';
import WeatherFloatingCard from '@/components/heattrack/WeatherFloatingCard';
import { planRoute, fetchHeatSeries, mockMetrics, parseCoordInput, fetchTodayWeather, mockWeatherInfo } from '@/lib/api';
import type { LatLng, RouteResult, RouteMetrics, HeatSeries, WeatherInfo } from '@/types/heattrack';

export default function Index() {
  // Input state
  const [originText, setOriginText] = useState('');
  const [destText, setDestText] = useState('');
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);

  // Route state
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Heat state
  const [heatLayerOn, setHeatLayerOn] = useState(false);
  const [heatSeries, setHeatSeries] = useState<HeatSeries | null>(null);
  const [heatLoading, setHeatLoading] = useState(false);
  const [selectedHour, setSelectedHour] = useState(14);
  const [hourPickerOpen, setHourPickerOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherExpanded, setWeatherExpanded] = useState(false);

  // UI state
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [inputCardCollapsed, setInputCardCollapsed] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [locateFailed, setLocateFailed] = useState(false);
  const [focusPoint, setFocusPoint] = useState<LatLng | null>(null);
  const [focusZoom, setFocusZoom] = useState<number | null>(null);
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null);
  const [pickStep, setPickStep] = useState<'origin' | 'destination'>('origin');

  const showWeatherCard = !!origin && !!destination && !pickMode;

  useEffect(() => {
    if (!showWeatherCard || !origin) {
      setWeather(null);
      setWeatherExpanded(false);
      setWeatherLoading(false);
      return;
    }

    let cancelled = false;
    const loadWeather = async () => {
      setWeatherLoading(true);
      try {
        const data = await fetchTodayWeather(origin);
        if (!cancelled) {
          setWeather(data);
        }
      } catch {
        if (!cancelled) {
          setWeather(mockWeatherInfo());
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    };

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [showWeatherCard, origin]);

  const formatCoord = (p: LatLng) => `${p.lng.toFixed(5)},${p.lat.toFixed(5)}`;

  // Handlers
  const handlePlanRoute = useCallback(async () => {
    const o = parseCoordInput(originText);
    const d = parseCoordInput(destText);
    if (!o) { toast.error('起点格式错误，请输入 lng,lat'); return; }
    if (!d) { toast.error('终点格式错误，请输入 lng,lat'); return; }
    setOrigin(o);
    setDestination(d);
    setRouteLoading(true);
    try {
      const result = await planRoute(o, d);
      setRoute(result);
      setMetrics(mockMetrics(result.distance, result.duration, selectedHour));
      setDrawerExpanded(true);
      setInputCardCollapsed(true);
      toast.success('路线规划成功');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '路线规划失败';
      toast.error(message);
    } finally {
      setRouteLoading(false);
    }
  }, [originText, destText, selectedHour]);

  const handleToggleHeat = useCallback(async () => {
    if (!heatLayerOn && !heatSeries) {
      setHeatLoading(true);
      try {
        const series = await fetchHeatSeries();
        setHeatSeries(series);
        const now = new Date().getHours();
        const closest = series.hours.reduce((prev, curr) =>
          Math.abs(curr - now) < Math.abs(prev - now) ? curr : prev
        );
        setSelectedHour(closest);
        setHeatLayerOn(true);
        toast.success('热暴露图层已加载');
      } catch {
        toast.error('热暴露数据加载失败');
      } finally {
        setHeatLoading(false);
      }
    } else {
      setHeatLayerOn((v) => !v);
    }
  }, [heatLayerOn, heatSeries]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocateFailed(true);
      toast.error('此设备不支持定位');
      return;
    }

    const loadingId = toast.loading('正在请求定位权限...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(p);
        setOriginText(formatCoord(p));
        setLocateFailed(false);
        setFocusPoint(p);
        setFocusZoom(15);
        toast.success('已定位到当前位置', { id: loadingId });
      },
      () => {
        setLocateFailed(true);
        toast.error('定位失败，请检查权限', { id: loadingId });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSwap = useCallback(() => {
    setOriginText(destText);
    setDestText(originText);
    setOrigin(destination);
    setDestination(origin);
  }, [originText, destText, origin, destination]);

  const handleClear = useCallback(() => {
    setOriginText('');
    setDestText('');
    setOrigin(null);
    setDestination(null);
    setRoute(null);
    setMetrics(null);
    setDrawerExpanded(false);
    setInputCardCollapsed(false);
    setLocateFailed(false);
    setFocusPoint(null);
    setFocusZoom(null);
    setSelectedCityName(null);
    setWeather(null);
    setWeatherExpanded(false);
  }, []);

  const handleSelectCity = useCallback((cityName: string, center: LatLng) => {
    setSelectedCityName(cityName);
    setFocusPoint(center);
    setFocusZoom(11);
    toast.success(`已切换到${cityName}`);
  }, []);

  const handlePickMode = useCallback(() => {
    setInputCardCollapsed(false);
    setPickMode(true);
    setPickStep('origin');
  }, []);

  const handleMapClick = useCallback(
    (latlng: LatLng) => {
      if (!pickMode) return;
      if (pickStep === 'origin') {
        setOrigin(latlng);
        setOriginText(formatCoord(latlng));
        setPickStep('destination');
      } else {
        setDestination(latlng);
        setDestText(formatCoord(latlng));
      }
    },
    [pickMode, pickStep]
  );

  const handlePickDone = useCallback(() => {
    setPickMode(false);
  }, []);

  const handlePickReset = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setOriginText('');
    setDestText('');
    setPickStep('origin');
  }, []);

  const handlePickBack = useCallback(() => {
    setPickMode(false);
  }, []);

  const handleHourApply = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* Map fills entire screen */}
      <div className="absolute inset-0 z-0">
        <MapView
          origin={origin}
          destination={destination}
          route={route}
          heatLayerOn={heatLayerOn}
          selectedHour={selectedHour}
          pickMode={pickMode}
          focusPoint={focusPoint}
          focusZoom={focusZoom}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Pick mode overlay */}
      {pickMode ? (
        <>
          <div className="absolute top-0 left-0 right-0 z-20 glass-card flex items-center gap-3 px-4 py-3">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={handlePickBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium flex-1">
              地图点选：{pickStep === 'origin' ? '请点击选择起点' : '请点击选择终点'}
            </span>
          </div>
          {/* Step indicator */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 glass-card rounded-full px-4 py-2 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full border-2 ${origin ? 'bg-green-500 border-green-300' : 'bg-muted border-border'}`} />
            <span className="text-xs">起点</span>
            <div className="w-6 h-0.5 bg-border" />
            <div className={`w-3 h-3 rounded-full border-2 ${destination ? 'bg-red-500 border-red-300' : 'bg-muted border-border'}`} />
            <span className="text-xs">终点</span>
          </div>
          <div className="absolute bottom-6 left-4 right-4 z-20 glass-card rounded-2xl p-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleLocate}>
              <LocateFixed className="w-4 h-4 mr-1" />
              定位做起点
            </Button>
            <Button variant="outline" className="flex-1" onClick={handlePickReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              重选
            </Button>
            <Button className="flex-1" onClick={handlePickDone} disabled={!origin || !destination}>
              <Check className="w-4 h-4 mr-1" />
              完成
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* App header */}
          <div className="absolute top-0 left-0 right-0 z-10 glass-card flex items-center justify-between px-4 py-2.5">
            <h1 className="text-base font-bold tracking-tight text-foreground">
              🔥 HeatTrack
            </h1>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Input card */}
          <div className="absolute top-11 left-0 right-0 z-10">
            <InputCard
              originText={originText}
              destText={destText}
              onOriginChange={setOriginText}
              onDestChange={setDestText}
              onLocate={handleLocate}
              onLocateCurrent={handleLocate}
              locateFailed={locateFailed}
              selectedCityName={selectedCityName}
              onSelectCity={handleSelectCity}
              onSwap={handleSwap}
              onPlanRoute={handlePlanRoute}
              onPickMode={handlePickMode}
              onClear={handleClear}
              onExpand={() => setInputCardCollapsed(false)}
              onCollapse={() => setInputCardCollapsed(true)}
              loading={routeLoading}
              hasRoute={!!route}
              collapsed={inputCardCollapsed}
            />
          </div>

          {/* UTCI Legend */}
          <div className="absolute right-3 bottom-72 z-10">
            <UTCILegend
              legend={heatSeries?.legend ?? []}
              visible={heatLayerOn && !!heatSeries}
            />
          </div>

          {/* Weather Floating Card */}
          {showWeatherCard ? (
            <div className="absolute left-3 bottom-72 z-10">
              <WeatherFloatingCard
                weather={weather}
                loading={weatherLoading}
                expanded={weatherExpanded}
                onToggleExpand={() => setWeatherExpanded((v) => !v)}
              />
            </div>
          ) : null}

          {/* Bottom Panel */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <BottomPanel
              expanded={drawerExpanded}
              onToggleExpand={() => setDrawerExpanded((v) => !v)}
              heatLayerOn={heatLayerOn}
              onToggleHeat={handleToggleHeat}
              selectedHour={selectedHour}
              onOpenHourPicker={() => setHourPickerOpen(true)}
              metrics={metrics}
              heatLoading={heatLoading}
              heatLoaded={!!heatSeries}
            />
          </div>
        </>
      )}

      {/* Hour Picker */}
      <HourPicker
        open={hourPickerOpen}
        onClose={() => setHourPickerOpen(false)}
        hours={heatSeries?.hours ?? [14]}
        current={selectedHour}
        onApply={handleHourApply}
      />
    </div>
  );
}
