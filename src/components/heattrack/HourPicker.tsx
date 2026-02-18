import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  hours: number[];
  current: number;
  onApply: (hour: number) => void;
}

export default function HourPicker({ open, onClose, hours, current, onApply }: Props) {
  const [selected, setSelected] = useState(current);

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader>
          <SheetTitle className="text-base">选择热暴露时段</SheetTitle>
        </SheetHeader>
        <div className="mt-4 max-h-[50vh] overflow-y-auto space-y-1">
          {hours.map((h) => (
            <button
              key={h}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                selected === h
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'hover:bg-muted text-foreground'
              }`}
              onClick={() => setSelected(h)}
            >
              {h}:00{current === h && selected !== h ? '（当前）' : ''}
              {selected === h ? ' ●' : ''}
            </button>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            应用
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
