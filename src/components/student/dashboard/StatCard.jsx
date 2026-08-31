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
        hover:border-primary/40
        hover:-translate-y-1
      "
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-foreground">
                        {value}
                    </h3>

                    {description && (
                        <p className="mt-2 text-sm text-muted-foreground">
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
              bg-primary/10
              text-primary
            "
                    >
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}