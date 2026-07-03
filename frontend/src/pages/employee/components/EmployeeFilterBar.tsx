import { RotateCcw, Search } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  employeeGenderOptions,
  employeeStatusOptions,
} from "../employee.constants";

interface EmployeeFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  onSearch: (value: string) => void;
  departmentId: string;
  setDepartmentId: (value: string) => void;
  positionId: string;
  setPositionId: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  joinDateFrom: string;
  setJoinDateFrom: (value: string) => void;
  joinDateTo: string;
  setJoinDateTo: (value: string) => void;
  departments: Array<{ id: number; code: string; name: string }>;
  positions: Array<{ id: number; code: string; name: string }>;
  onReset: () => void;
}

export function EmployeeFilters({
  searchInput,
  setSearchInput,
  onSearch,
  departmentId,
  setDepartmentId,
  positionId,
  setPositionId,
  status,
  setStatus,
  gender,
  setGender,
  joinDateFrom,
  setJoinDateFrom,
  joinDateTo,
  setJoinDateTo,
  departments,
  positions,
  onReset,
}: EmployeeFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* <div className="space-y-2 lg:col-span-4">
            <Label htmlFor="employee-search">Tìm kiếm</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="employee-search"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  onSearch(event.target.value);
                }}
                placeholder="Mã, tên, email, số điện thoại"
                className="pl-9"
              />
            </div>
          </div> */}
          <div className="space-y-2 lg:col-span-4">
            <Label htmlFor="employee-search">Tìm kiếm</Label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="employee-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onSearch(searchInput);
                    }
                  }}
                  placeholder="Mã, tên, email, số điện thoại"
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                onClick={() => onSearch(searchInput.trim())}
                className="shrink-0 bg-teal-500 text-white hover:bg-violet-700"
              >
                <Search className="size-4" />
              </Button>
            </div>
          </div>
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
                    {department.code} - {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                    {position.code} - {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {employeeStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>Giới tính</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {employeeGenderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 lg:col-span-3 xl:col-span-2">
            <Label htmlFor="join-date-from">Ngày vào từ</Label>
            <Input
              id="join-date-from"
              type="date"
              value={joinDateFrom}
              onChange={(event) => setJoinDateFrom(event.target.value)}
            />
          </div>

          <div className="space-y-2 lg:col-span-3 xl:col-span-2">
            <Label htmlFor="join-date-to">Đến</Label>
            <Input
              id="join-date-to"
              type="date"
              value={joinDateTo}
              onChange={(event) => setJoinDateTo(event.target.value)}
            />
          </div>

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
