import { BarChart3 } from "lucide-react";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Analytics APIs will be connected later."
      />

      <Card tone="flat">
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <BarChart3 size={28} />
          </div>

          <h2 className="text-lg font-semibold text-foreground">Coming Soon</h2>
        </div>
      </Card>
    </div>
  );
}
