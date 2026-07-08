import Card from "@/components/ui/Card";
import ActionCard from "./ActionCard";

export default function QuickActions({ actions }) {
  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Quick Actions
        </h2>

        <p className="mt-1 text-slate-400">
          Frequently used shortcuts
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            {...action}
          />
        ))}
      </div>
    </Card>
  );
}