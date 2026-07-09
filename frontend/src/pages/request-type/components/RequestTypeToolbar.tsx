import { Search } from "lucide-react";

import { Input } from "../../../components/ui/input";

interface RequestTypeToolbarProps {
  search: string;
  total: number;
  onSearchChange: (search: string) => void;
}

export function RequestTypeToolbar({
  search,
  total,
  onSearchChange,
}: RequestTypeToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo code, tên, handler key"
          className="pl-9"
        />
      </div>

      <div className="text-sm text-muted-foreground">{total} loại yêu cầu</div>
    </div>
  );
}
