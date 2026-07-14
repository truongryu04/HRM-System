import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import {
  useEmployeeProfile,
  useUpdateEmployeeProfile,
} from "../../hooks/useEmployeeProfile";
import type {
  EmployeeGender,
  EmployeeProfileUpdateRequest,
  EmployeeSummary,
} from "../../types/employee.type";
import { getApiErrorMessage } from "../../utils/api-error";

function ProfileForm({ employee }: { employee: EmployeeSummary }) {
  const navigate = useNavigate();
  const mutation = useUpdateEmployeeProfile();
  const [form, setForm] = useState<EmployeeProfileUpdateRequest>({
    fullName: employee.fullName,
    phone: employee.phone ?? "",
    address: employee.address ?? "",
    gender: employee.gender,
    dob: employee.dob?.slice(0, 10),
    avatarUrl: employee.avatarUrl ?? "",
  });

  const updateForm = (values: Partial<EmployeeProfileUpdateRequest>) =>
    setForm((current) => ({ ...current, ...values }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fullName?.trim()) return toast.error("Vui lòng nhập họ và tên");
    if (!form.dob) return toast.error("Vui lòng chọn ngày sinh");
    if (new Date(form.dob) >= new Date())
      return toast.error("Ngày sinh phải trước ngày hiện tại");

    try {
      await mutation.mutateAsync({
        ...form,
        fullName: form.fullName.trim(),
        phone: form.phone?.trim(),
        address: form.address?.trim(),
        avatarUrl: form.avatarUrl?.trim(),
      });
      toast.success("Cập nhật thông tin cá nhân thành công");
      navigate("/profile");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Cập nhật thông tin cá nhân thất bại"),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cập nhật profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-name">Họ và tên</Label>
            <Input
              id="profile-name"
              value={form.fullName ?? ""}
              onChange={(event) => updateForm({ fullName: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Số điện thoại</Label>
            <Input
              id="profile-phone"
              type="tel"
              value={form.phone ?? ""}
              onChange={(event) => updateForm({ phone: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-dob">Ngày sinh</Label>
            <Input
              id="profile-dob"
              type="date"
              value={form.dob ?? ""}
              onChange={(event) => updateForm({ dob: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Giới tính</Label>
            <Select
              value={form.gender}
              onValueChange={(value) =>
                updateForm({ gender: value as EmployeeGender })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="FEMALE">Nữ</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-avatar">URL ảnh đại diện</Label>
            <Input
              id="profile-avatar"
              type="url"
              value={form.avatarUrl ?? ""}
              onChange={(event) =>
                updateForm({ avatarUrl: event.target.value })
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-address">Địa chỉ</Label>
            <Textarea
              id="profile-address"
              value={form.address ?? ""}
              onChange={(event) => updateForm({ address: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" asChild>
          <Link to="/profile">Hủy</Link>
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-teal-500 text-white hover:bg-teal-700"
        >
          <Save />
          {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
}

export default function EmployeeProfileEditPage() {
  const { data: employee, isLoading, isError } = useEmployeeProfile();
  if (isLoading)
    return (
      <div className="py-12 text-center text-muted-foreground">
        Đang tải hồ sơ...
      </div>
    );
  if (isError || !employee)
    return (
      <div className="rounded-xl border p-8 text-center text-destructive">
        Không thể tải hồ sơ cá nhân.
      </div>
    );
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button variant="outline" asChild>
          <Link to="/profile">
            <ArrowLeft />
            Quay lại hồ sơ
          </Link>
        </Button>
        <div>
          <h4 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa thông tin cá nhân
          </h4>
        </div>
      </div>
      <ProfileForm employee={employee} />
    </div>
  );
}
