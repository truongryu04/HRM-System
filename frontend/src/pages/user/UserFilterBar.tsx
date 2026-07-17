// components/UserFilterBar.tsx

import { Input } from "../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import type { Role } from "@/types/role.type";

interface UserFilterBarProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  onSearch: (value: string) => void;

  role: string;
  setRole: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  linkedEmployee: string;
  setLinkedEmployee: (value: string) => void;

  roles: Role[];
}

export function UserFilterBar({
  searchInput,
  setSearchInput,
  onSearch,
  role,
  setRole,
  status,
  setStatus,
  linkedEmployee,
  setLinkedEmployee,
  roles,
}: UserFilterBarProps) {
  const handleReset = () => {
    setSearchInput("");
    onSearch("");
    setRole("all");
    setStatus("all");
    setLinkedEmployee("all");
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {/* Search */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Tìm email hoặc tên nhân viên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch(searchInput.trim());
              }
            }}
            className="pl-9"
          />
        </div>

        <Button
          type="button"
          onClick={() => onSearch(searchInput.trim())}
          variant="primary"
        >
          <Search className="size-4" />
        </Button>
      </div>

      {/* Role */}
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-full lg:w-[180px]">
          <SelectValue placeholder="Vai trò" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Tất cả vai trò</SelectItem>

          {roles.map((roleItem) => (
            <SelectItem key={roleItem.id} value={roleItem.name}>
              {roleItem.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full lg:w-[180px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
          <SelectItem value="PENDING">Chờ kích hoạt</SelectItem>
          <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
          <SelectItem value="LOCKED">Đã khóa</SelectItem>
          <SelectItem value="SUSPENDED">Tạm khóa</SelectItem>
        </SelectContent>
      </Select>

      {/* Employee Link Status */}
      <Select value={linkedEmployee} onValueChange={setLinkedEmployee}>
        <SelectTrigger className="w-full lg:w-[200px]">
          <SelectValue placeholder="Liên kết nhân viên" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>

          <SelectItem value="linked">Đã liên kết</SelectItem>

          <SelectItem value="unlinked">Chưa liên kết</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      <Button onClick={handleReset} variant="primary">
        <RotateCcw className="mr-2 size-4" />
        Reset
      </Button>
    </div>
  );
}
