import { Briefcase, Clock3, UserCheck, UserX, Users } from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import type { AttendanceDashboard } from "../../types/attendance.type";

interface AttendanceStatsCardsProps {
  data?: AttendanceDashboard;
  isLoading?: boolean;
}

export function AttendanceStatsCards({
  data,
  isLoading,
}: AttendanceStatsCardsProps) {
  const stats = [
    {
      title: "Tổng nhân viên",
      value: data?.totalEmployees ?? 0,
      icon: Users,
    },
    {
      title: "Có mặt",
      value: data?.present ?? 0,
      icon: UserCheck,
    },
    {
      title: "Đi muộn",
      value: data?.late ?? 0,
      icon: Clock3,
    },
    {
      title: "Vắng mặt",
      value: data?.absent ?? 0,
      icon: UserX,
    },
    {
      title: "Đang làm việc",
      value: data?.working ?? 0,
      icon: Briefcase,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>

                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "--" : item.value}
                </p>
              </div>

              <Icon className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
