import type { UTCILevel } from '@/types/heattrack';

interface Props {
  legend: UTCILevel[];
  visible: boolean;
}

export default function UTCILegend({ legend, visible }: Props) {
  if (!visible || legend.length === 0) return null;

  return (
    <div className="glass-card rounded-xl px-3 py-2.5 min-w-[110px]">
      <p className="text-[11px] font-semibold text-foreground/70 mb-1.5">UTCI 图例</p>
      <div className="flex flex-col gap-1">
        {legend.map((level) => (
          <div key={level.min} className="flex items-center gap-2">
            <div
              className="w-5 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-[10px] text-foreground/80 leading-tight">
              {level.min}+ {level.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
