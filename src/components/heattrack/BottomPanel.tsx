import { ChevronUp, ChevronDown, Layers, Clock, Route, Timer, Thermometer, ThermometerSun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { RouteMetrics } from '@/types/heattrack';

interface Props {
  expanded: boolean;
  onToggleExpand: () => void;
  heatLayerOn: boolean;
  onToggleHeat: () => void;
  selectedHour: number;
  onOpenHourPicker: () => void;
  metrics: RouteMetrics | null;
  heatLoading: boolean;
  heatLoaded: boolean;
}

function MetricItem({ icon: Icon, label, value, unit }: {
  icon: React.ElementType; label: string; value: string; unit: string;
}) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-background/60">
      <Icon className="w-4 h-4 text-muted-foreground mb-1" />
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground">{unit}</span>
    </div>
  );
}

export default function BottomPanel({
  expanded, onToggleExpand, heatLayerOn, onToggleHeat,
  selectedHour, onOpenHourPicker, metrics, heatLoading, heatLoaded,
}: Props) {
  return (
    <div className="glass-card rounded-t-2xl transition-all duration-300 ease-out">
      {/* Drag handle */}
      <button
        className="w-full flex justify-center pt-2 pb-1"
        onClick={onToggleExpand}
      >
        <div className="w-10 h-1 rounded-full bg-border" />
      </button>

      <div className="px-4 pb-4 space-y-3">
        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">热暴露图层</span>
            <Switch checked={heatLayerOn} onCheckedChange={onToggleHeat} />
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-sm"
              onClick={onOpenHourPicker}
              disabled={!heatLoaded}
            >
              {selectedHour}:00 ▾
            </Button>
            {heatLoading && (
              <span className="text-xs text-muted-foreground animate-pulse">加载中…</span>
            )}
            {heatLoaded && !heatLoading && (
              <span className="text-[10px] text-muted-foreground">已加载</span>
            )}
          </div>
        </div>

        {/* Compact metrics (always show if available) */}
        {metrics && !expanded && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              <Route className="w-3.5 h-3.5 inline mr-1" />
              {metrics.distance} km
            </span>
            <span className="text-muted-foreground">
              <Timer className="w-3.5 h-3.5 inline mr-1" />
              {metrics.duration} min
            </span>
            <span className="text-heat-strong font-medium">
              峰值 {metrics.peakUTCI}°C
            </span>
            <span className="text-muted-foreground">
              均值 {metrics.avgUTCI}°C
            </span>
          </div>
        )}

        {/* Expanded metrics */}
        {metrics && expanded && (
          <>
            <p className="text-xs font-semibold text-foreground/70">路线结果</p>
            <div className="grid grid-cols-2 gap-2">
              <MetricItem icon={Route} label="总里程" value={String(metrics.distance)} unit="km" />
              <MetricItem icon={Timer} label="预计时长" value={String(metrics.duration)} unit="min" />
              <MetricItem icon={ThermometerSun} label="峰值UTCI" value={String(metrics.peakUTCI)} unit="°C" />
              <MetricItem icon={Thermometer} label="平均UTCI" value={String(metrics.avgUTCI)} unit="°C" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              ℹ️ 小时切换仅替换热暴露瓦片，不重算路线与指标
            </p>
            <Button variant="outline" className="w-full h-9 text-sm" disabled>
              查看优化建议（V2）
            </Button>
          </>
        )}

        {!metrics && (
          <p className="text-xs text-muted-foreground text-center py-1">
            输入起终点并规划路线以查看指标
          </p>
        )}
      </div>

      {/* Expand indicator */}
      <button className="w-full flex justify-center pb-2" onClick={onToggleExpand}>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
