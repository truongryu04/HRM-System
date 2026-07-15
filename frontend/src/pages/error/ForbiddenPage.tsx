import { ArrowLeft, Home, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="rounded-full bg-destructive/10 p-4 text-destructive">
            <ShieldX className="size-10" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Lỗi 403</p>
            <h1 className="text-2xl font-bold tracking-tight">
              Bạn không có quyền truy cập
            </h1>
            <p className="text-sm text-muted-foreground">
              Tài khoản hiện tại không được phép xem trang này. Hãy liên hệ
              quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft /> Quay lại
            </Button>
            <Button onClick={() => navigate("/", { replace: true })}>
              <Home /> Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
