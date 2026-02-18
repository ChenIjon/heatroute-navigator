import { useMemo, useState } from 'react';
import { LocateFixed, ArrowUpDown, Navigation, Crosshair, X, ChevronDown, ChevronUp, MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LatLng } from '@/types/heattrack';

const CITY_OPTIONS: Record<string, { name: string; center: LatLng }[]> = {
  北京市: [
    { name: '北京市', center: { lat: 39.9042, lng: 116.4074 } },
  ],
  上海市: [
    { name: '上海市', center: { lat: 31.2304, lng: 121.4737 } },
  ],
  广东省: [
    { name: '广州市', center: { lat: 23.1291, lng: 113.2644 } },
    { name: '深圳市', center: { lat: 22.5431, lng: 114.0579 } },
  ],
  浙江省: [
    { name: '杭州市', center: { lat: 30.2741, lng: 120.1551 } },
    { name: '宁波市', center: { lat: 29.8683, lng: 121.544 } },
  ],
  四川省: [
    { name: '成都市', center: { lat: 30.5728, lng: 104.0668 } },
    { name: '绵阳市', center: { lat: 31.4675, lng: 104.6796 } },
  ],
};

interface Props {
  originText: string;
  destText: string;
  onOriginChange: (v: string) => void;
  onDestChange: (v: string) => void;
  onLocate: () => void;
  onLocateCurrent: () => void;
  locateFailed: boolean;
  selectedCityName: string | null;
  onSelectCity: (cityName: string, center: LatLng) => void;
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
  onLocate, onLocateCurrent, locateFailed, selectedCityName, onSelectCity,
  onSwap, onPlanRoute, onPickMode, onClear,
  onExpand, onCollapse, loading, hasRoute, collapsed,
}: Props) {
  const canPlan = originText.trim().length > 0 && destText.trim().length > 0;
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const availableCities = useMemo(() => {
    if (!selectedProvince) return [];
    return CITY_OPTIONS[selectedProvince] ?? [];
  }, [selectedProvince]);

  const handleConfirmCity = () => {
    if (!selectedProvince || !selectedCity) return;
    const city = (CITY_OPTIONS[selectedProvince] ?? []).find((item) => item.name === selectedCity);
    if (!city) return;
    onSelectCity(city.name, city.center);
    setCityDialogOpen(false);
  };

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
    <>
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
          <div className="w-[84px] shrink-0 pl-1">
            {selectedCityName ? (
              <div className="text-base font-semibold text-foreground truncate">{selectedCityName}</div>
            ) : (
              <>
                <p className="text-[10px] text-muted-foreground leading-none mb-1">选择城市</p>
                <Button
                  variant="ghost"
                  className="h-6 px-1.5 text-[10px] leading-none bg-transparent hover:bg-transparent"
                  onClick={() => setCityDialogOpen(true)}
                >
                  <MapPinned className="w-3 h-3 mr-1" />
                  省份-城市
                </Button>
              </>
            )}
            {selectedCityName && (
              <Button
                variant="ghost"
                className="h-5 px-1 text-[10px] leading-none bg-transparent hover:bg-transparent mt-1"
                onClick={() => setCityDialogOpen(true)}
              >
                切换城市
              </Button>
            )}
          </div>

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

      <Dialog open={cityDialogOpen} onOpenChange={setCityDialogOpen}>
        <DialogContent className="max-w-sm p-4">
          <DialogHeader>
            <DialogTitle className="text-base">选择城市</DialogTitle>
            <DialogDescription className="text-xs">按“省份 → 城市”顺序选择后确认。</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Select
              value={selectedProvince}
              onValueChange={(value) => {
                setSelectedProvince(value);
                setSelectedCity('');
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="选择省份" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CITY_OPTIONS).map((province) => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="选择城市" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-1">
            <Button className="h-9" onClick={handleConfirmCity} disabled={!selectedProvince || !selectedCity}>
              确认城市
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
