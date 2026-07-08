import Card from "@/components/ui/Card";

export default function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        {Icon && (
          <Icon className="text-4xl text-orange-500" />
        )}
      </div>
    </Card>
  );
}