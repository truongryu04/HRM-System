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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-xl font-light sm:text-2xl">
        {year} Tháng {month}
      </h1>

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {canCheckIn && <Button onClick={onCheckIn}>Check In</Button>}

          {canCheckOut && (
            <Button variant="destructive" onClick={onCheckOut}>
              Check Out
            </Button>
          )}

          <Button variant="primary" onClick={onToday}>
            Hôm nay
          </Button>
        </div>
        <Button size="icon" variant="primary" onClick={onPrev}>
          <ChevronLeft size={18} />
        </Button>

        <Button size="icon" variant="primary" onClick={onNext}>
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
