import { RotateCcw, Search } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface AttendanceFilterProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  onSearch: (value: string) => void;

  date: string;
  setDate: (value: string) => void;

  departmentId: string;
  setDepartmentId: (value: string) => void;

  positionId: string;
  setPositionId: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  departments: Array<{
    id: number;
    code: string;
    name: string;
  }>;

  positions: Array<{
    id: number;
    code: string;
    name: string;
  }>;

  onReset: () => void;
}

export function AttendanceFilter({
  searchInput,
  setSearchInput,
  onSearch,
  date,
  setDate,
  departmentId,
  setDepartmentId,
  positionId,
  setPositionId,
  status,
  setStatus,
  departments,
  positions,
  onReset,
}: AttendanceFilterProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 xl:grid-cols-14">
          {/* Tìm kiếm */}
          <div className="space-y-2 lg:col-span-4">
            <Label htmlFor="employee-search">Tìm kiếm nhân viên</Label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="employee-search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSearch(searchInput);
                    }
                  }}
                  placeholder="Nhập tên nhân viên..."
                  className="pl-9"
                />
              </div>

              <Button
                type="button"
                onClick={() => onSearch(searchInput.trim())}
                className="shrink-0"
              >
                <Search className="size-4" />
              </Button>
            </div>
          </div>

          {/* Ngày */}
          <div className="space-y-2 lg:col-span-2">
            <Label>Ngày chấm công</Label>

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Phòng ban */}
          <div className="space-y-2 lg:col-span-2">
            <Label>Phòng ban</Label>

            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>

                {departments.map((department) => (
                  <SelectItem key={department.id} value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vị trí */}
          <div className="space-y-2 lg:col-span-2">
            <Label>Vị trí</Label>

            <Select value={positionId} onValueChange={setPositionId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>

                {positions.map((position) => (
                  <SelectItem key={position.id} value={String(position.id)}>
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trạng thái */}
          <div className="space-y-2 lg:col-span-2">
            <Label>Trạng thái</Label>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>

                <SelectItem value="working">Đang làm</SelectItem>

                <SelectItem value="late_present">Đi muộn có mặt</SelectItem>

                <SelectItem value="leave">Nghỉ phép</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          <div className="flex items-end lg:col-span-2">
            <Button variant="outline" className="w-full" onClick={onReset}>
              <RotateCcw className="mr-2 size-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
