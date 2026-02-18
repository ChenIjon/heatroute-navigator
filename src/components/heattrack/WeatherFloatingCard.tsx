import { Cloud, CloudDrizzle, CloudRain, Sun, ChevronDown, ChevronUp } from 'lucide-react';
import type { WeatherInfo } from '@/types/heattrack';

interface WeatherFloatingCardProps {
  weather: WeatherInfo | null;
  loading: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  if (code <= 1) return <Sun className={className} />;
  if (code <= 3 || code === 45 || code === 48) return <Cloud className={className} />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className={className} />;
  return <CloudRain className={className} />;
}

export default function WeatherFloatingCard({
  weather,
  loading,
  expanded,
  onToggleExpand,
}: WeatherFloatingCardProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden min-w-[68px] max-w-[220px]">
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium"
      >
        <span>天气</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded ? (
        <div className="px-3 pb-3 text-xs">
          {loading ? (
            <div className="text-muted-foreground">加载中...</div>
          ) : weather ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <WeatherIcon code={weather.weatherCode} className="w-5 h-5 text-primary" />
                <span className="font-medium">{weather.weatherLabel}</span>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <p>温度：{weather.temperature}℃</p>
                <p>湿度：{weather.humidity}%</p>
              </div>
              {weather.source === 'mock' ? (
                <p className="text-[10px] text-muted-foreground mt-2">天气 API 不可用，显示模拟数据</p>
              ) : null}
            </>
          ) : (
            <div className="text-muted-foreground">暂无天气数据</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
