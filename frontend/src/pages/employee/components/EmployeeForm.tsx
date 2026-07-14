import { useRef, useState } from "react";
import { Camera, ImageUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import type {
  EmployeeCreateRequest,
  EmployeeGender,
  EmployeeStatus,
  EmployeeSummary,
} from "@/types/employee.type";
import {
  employeeGenderOptions,
  employeeStatusOptions,
} from "../employee.constants";
import { getInitials, toDateInputValue } from "../../../utils/employee.utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useNavigate } from "react-router-dom";

type EmployeeMode = "create" | "edit";

interface EmployeeFormDialogProps {
  mode: EmployeeMode;
  employee: EmployeeSummary | null;
  departments: Array<{ id: number; code: string; name: string }>;
  positions: Array<{ id: number; code: string; name: string }>;
  onSubmit: (payload: EmployeeCreateRequest) => Promise<void>;
  loading: boolean;
}

interface EmployeeFormState {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender: EmployeeGender;
  dob: string;
  joinDate: string;
  status: EmployeeStatus;
  departmentId: string;
  positionId: string;
  avatarUrl: string;
  avatarFileName: string;
}

export function EmployeeForm({
  mode,
  employee,
  departments,
  positions,
  onSubmit,
  loading,
}: EmployeeFormDialogProps) {
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File>();
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [form, setForm] = useState<EmployeeFormState>(() =>
    mode === "edit" && employee
      ? {
        employeeCode: employee.employeeCode ?? "",
        fullName: employee.fullName ?? "",
        email: employee.email ?? "",
        phone: employee.phone ?? "",
        address: employee.address ?? "",
        gender: employee.gender ?? "MALE",
        dob: toDateInputValue(employee.dob),
        joinDate: toDateInputValue(employee.joinDate),
        status: employee.status ?? "ACTIVE",
        departmentId: employee.department?.id
          ? String(employee.department.id)
          : "",
        positionId: employee.position?.id ? String(employee.position.id) : "",
        avatarUrl: employee.avatarUrl ?? "",
        avatarFileName: "",
      }
      : {
        employeeCode: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        gender: "MALE",
        dob: "",
        joinDate: "",
        status: "ACTIVE",
        departmentId: "",
        positionId: "",
        avatarUrl: "",
        avatarFileName: "",
      },
  );

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Vui lòng chọn một file ảnh hợp lệ");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện không được vượt quá 5 MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
          avatarFileName: file.name,
        }));
        setAvatarFile(file);
        setRemoveAvatar(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleClearAvatar = () => {
    setForm((prev) => ({
      ...prev,
      avatarUrl: "",
      avatarFileName: "",
    }));
    setAvatarFile(undefined);
    setRemoveAvatar(Boolean(employee?.avatarUrl));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.employeeCode.trim()) {
      toast.error("Vui lòng nhập mã nhân viên");
      return;
    }

    if (!form.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!form.dob) {
      toast.error("Vui lòng chọn ngày sinh");
      return;
    }

    if (!form.joinDate) {
      toast.error("Vui lòng chọn ngày vào làm");
      return;
    }

    if (!form.departmentId) {
      toast.error("Vui lòng chọn phòng ban");
      return;
    }

    if (!form.positionId) {
      toast.error("Vui lòng chọn vị trí");
      return;
    }

    await onSubmit({
      employeeCode: form.employeeCode.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      gender: form.gender,
      dob: form.dob,
      joinDate: form.joinDate,
      status: form.status,
      avatarUrl: avatarFile ? undefined : form.avatarUrl.trim() || undefined,
      departmentId: Number(form.departmentId),
      positionId: Number(form.positionId),
      avatar: avatarFile,
      removeAvatar,
    });
  };

  const previewName = form.fullName.trim() || employee?.fullName || "Nhân viên";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "create" ? "Thêm nhân viên" : "Sửa nhân viên"}
            </h1>

            <p className="text-muted-foreground">
              Quản lý thông tin hồ sơ nhân viên.
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6 xl:grid-cols-[70%_30%]">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employee-code">Mã nhân viên</Label>
                    <Input
                      id="employee-code"
                      value={form.employeeCode}
                      disabled={mode === "edit"}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          employeeCode: e.target.value,
                        }))
                      }
                      placeholder="EMP001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee-full-name">Họ và tên</Label>
                    <Input
                      id="employee-full-name"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee-email">Email</Label>
                    <Input
                      id="employee-email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="name@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee-phone">Số điện thoại</Label>
                    <Input
                      id="employee-phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="0901234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Giới tính</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          gender: value as EmployeeGender,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeGenderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee-dob">Ngày sinh</Label>
                    <Input
                      id="employee-dob"
                      type="date"
                      value={form.dob}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          dob: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee-join-date">Ngày vào làm</Label>
                    <Input
                      id="employee-join-date"
                      type="date"
                      value={form.joinDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          joinDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          status: value as EmployeeStatus,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="employee-address">Địa chỉ</Label>
                    <Textarea
                      id="employee-address"
                      value={form.address}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Nhập địa chỉ liên hệ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Phòng ban</Label>
                    <Select
                      value={form.departmentId}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          departmentId: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem
                            key={department.id}
                            value={String(department.id)}
                          >
                            {department.code} - {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Vị trí</Label>
                    <Select
                      value={form.positionId}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          positionId: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn vị trí" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem
                            key={position.id}
                            value={String(position.id)}
                          >
                            {position.code} - {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ảnh đại diện</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">Ảnh đại diện</p>
                        <p className="text-sm text-muted-foreground">
                          Chọn ảnh trực tiếp từ máy để lưu vào hồ sơ nhân viên.
                        </p>
                      </div>
                      <Camera className="size-5 text-muted-foreground" />
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24 border">
                        <AvatarImage
                          src={form.avatarUrl || undefined}
                          alt={previewName}
                        />
                        <AvatarFallback>
                          {getInitials(previewName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex w-full flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleFileSelect}
                          >
                            <ImageUp className="size-4" />
                            Chọn ảnh từ máy
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClearAvatar}
                            disabled={!form.avatarUrl}
                          >
                            <Trash2 className="size-4" />
                            Xóa ảnh
                          </Button>
                        </div>

                        {form.avatarFileName ? (
                          <p className="text-xs text-muted-foreground">
                            Đã chọn: {form.avatarFileName}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/employees")}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-teal-500 text-white hover:bg-teal-700"
          >
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </Button>
        </div>
      </div>
    </form>
  );
}
