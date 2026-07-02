import Card from "@/components/ui/Card";

export default function StatCard({
                                     title,
                                     value,
                                     icon,
                                     description,
                                 }) {
    return (
        <Card
            className="
        p-5
        transition-all
        duration-300
        hover:border-orange-500/40
        hover:-translate-y-1
      "
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400">
                        {title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-white">
                        {value}
                    </h3>

                    {description && (
                        <p className="mt-2 text-sm text-slate-500">
                            {description}
                        </p>
                    )}
                </div>

                {icon && (
                    <div
                        className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-orange-500/10
              text-orange-500
            "
                    >
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}