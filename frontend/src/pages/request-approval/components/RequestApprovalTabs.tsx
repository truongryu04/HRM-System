import { CheckCircle2, Clock3 } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils";
import type { ApprovalQueueTab } from "@/types/request.type";

const queueTabs: Array<{
  value: ApprovalQueueTab;
  label: string;
  description: string;
  icon: typeof Clock3;
}> = [
  {
    value: "pending",
    label: "Chờ tôi duyệt",
    description: "Các yêu cầu đang cần bạn xử lý",
    icon: Clock3,
  },
  {
    value: "recently-handled",
    label: "Đã xử lý gần đây",
    description: "Yêu cầu bạn vừa duyệt hoặc từ chối",
    icon: CheckCircle2,
  },
];

interface RequestApprovalTabsProps {
  activeTab: ApprovalQueueTab;
  counts: Record<ApprovalQueueTab, number>;
  onTabChange: (tab: ApprovalQueueTab) => void;
}

export function RequestApprovalTabs({
  activeTab,
  counts,
  onTabChange,
}: RequestApprovalTabsProps) {
  return (
    <div className="-mt-2 mb-5 flex flex-wrap gap-1 border-b">
      {queueTabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
              activeTab === tab.value &&
                "border-b border-teal-500 text-foreground",
            )}
            title={tab.description}
          >
            <Icon className="size-4" />
            {tab.label}
            <Badge variant="outline">{counts[tab.value]}</Badge>
          </button>
        );
      })}
    </div>
  );
}
