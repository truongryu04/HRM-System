import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import type { RequestTypeRequest } from "@/types/request-type.type";
import { defaultRequestTypes } from "../request-type.constants";

interface DefaultRequestTypesCardProps {
  loading: boolean;
  onCreate: (payload: RequestTypeRequest) => void;
}

export function DefaultRequestTypesCard({
  loading,
  onCreate,
}: DefaultRequestTypesCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold">Loại yêu cầu mặc định</h2>
          <p className="text-sm text-muted-foreground">
            Tạo nhanh các loại phổ biến: nghỉ phép, sửa chấm công, OT, đổi ca
            và mượn thiết bị.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {defaultRequestTypes.map((requestType) => (
            <Button
              key={requestType.code}
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => onCreate(requestType)}
            >
              {requestType.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
