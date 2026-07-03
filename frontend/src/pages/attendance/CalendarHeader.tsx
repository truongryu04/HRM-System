import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../../components/ui/button";

interface Props {
  month: number;
  year: number;

  canCheckIn: boolean;
  canCheckOut: boolean;

  onCheckIn: () => void;
  onCheckOut: () => void;

  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  month,
  year,
  onPrev,
  onNext,
  onToday,
  onCheckIn,
  onCheckOut,
  canCheckIn,
  canCheckOut,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-light">
        {year} Tháng {month}
      </h1>

      <div className="flex gap-2">
        <div className="flex items-center gap-2">
          {canCheckIn && <Button onClick={onCheckIn}>Check In</Button>}

          {canCheckOut && (
            <Button variant="destructive" onClick={onCheckOut}>
              Check Out
            </Button>
          )}

          <Button variant="outline" onClick={onToday}>
            Hôm nay
          </Button>
        </div>
        <Button size="icon" variant="outline" onClick={onPrev}>
          <ChevronLeft size={18} />
        </Button>

        <Button size="icon" variant="outline" onClick={onNext}>
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
