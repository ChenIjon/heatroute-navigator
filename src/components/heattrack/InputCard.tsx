import { LocateFixed, ArrowUpDown, Navigation, Crosshair, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  originText: string;
  destText: string;
  onOriginChange: (v: string) => void;
  onDestChange: (v: string) => void;
  onLocate: () => void;
  onLocateCurrent: () => void;
  locateFailed: boolean;
  onSwap: () => void;
  onPlanRoute: () => void;
  onPickMode: () => void;
  onClear: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  loading: boolean;
  hasRoute: boolean;
  collapsed: boolean;
}

export default function InputCard({
  originText, destText, onOriginChange, onDestChange,
  onLocate, onLocateCurrent, locateFailed, onSwap, onPlanRoute, onPickMode, onClear,
  onExpand, onCollapse, loading, hasRoute, collapsed,
}: Props) {
  const canPlan = originText.trim().length > 0 && destText.trim().length > 0;

  if (collapsed) {
    return (
      <div className="glass-card rounded-2xl p-3 mx-3 mt-2">
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-9 text-sm flex-1" onClick={onPickMode}>
            <Crosshair className="w-4 h-4 mr-1" />
            重新选择
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={onExpand}
            title="展开卡片"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-3 mx-3 mt-2 space-y-2">
      <div className="flex items-center gap-1 min-h-4">
        <Button
          variant="ghost"
          className="h-4 px-1.5 text-[10px] leading-none text-muted-foreground bg-transparent hover:bg-transparent"
          onClick={onLocateCurrent}
        >
          <LocateFixed className="w-3 h-3 mr-1" />
          定位当前
        </Button>
        {locateFailed && <span className="text-[10px] leading-none text-red-500">定位失败</span>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1 pt-1">
          <div className="w-3 h-3 rounded-full bg-heat-safe border-2 border-card shadow" />
          <div className="w-0.5 h-5 bg-border" />
          <div className="w-3 h-3 rounded-full bg-destructive border-2 border-card shadow" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Input
              placeholder="起点 (lng,lat 或地点名)"
              value={originText}
              onChange={(e) => onOriginChange(e.target.value)}
              className="h-9 text-sm bg-background/60"
            />
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={onLocate} title="定位">
              <LocateFixed className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              placeholder="终点 (lng,lat 或地点名)"
              value={destText}
              onChange={(e) => onDestChange(e.target.value)}
              className="h-9 text-sm bg-background/60"
            />
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={onSwap} title="交换">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1 h-9 text-sm font-semibold"
          onClick={onPlanRoute}
          disabled={!canPlan || loading}
        >
          <Navigation className="w-4 h-4 mr-1" />
          {loading ? '规划中…' : '规划路线'}
        </Button>
        <Button variant="secondary" className="h-9 text-sm" onClick={onPickMode}>
          <Crosshair className="w-4 h-4 mr-1" />
          地图点选
        </Button>
        {(hasRoute || originText || destText) && (
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClear}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onCollapse}
          title="上拉缩小"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
