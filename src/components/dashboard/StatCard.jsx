import Card from "@/components/ui/Card";

export default function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <Card>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-400">
            {title}
          </p>

          <h2 className="text-3xl font-bold">
            {value}
          </h2>
        </div>

        <Icon className="text-orange-500 text-3xl" />
      </div>
    </Card>
  );
}