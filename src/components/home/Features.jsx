import Card from "@/components/ui/Card";

export default function Features() {
  const features = [
    {
      title: "Courses",
      description:
        "Learn through structured modules and lessons.",
    },
    {
      title: "Quizzes",
      description:
        "Test your knowledge and improve continuously.",
    },
    {
      title: "Certificates",
      description:
        "Earn certificates after course completion.",
    },
    {
      title: "Progress Tracking",
      description:
        "Monitor learning progress in real time.",
    },
    {
      title: "Role Based Access",
      description:
        "Admin, Instructor, and Student dashboards.",
    },
    {
      title: "Responsive Design",
      description:
        "Access the platform from any device.",
    },
  ];

  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">
          Platform Features
        </h2>

        <p className="text-slate-400 mt-4">
          Everything you need to manage learning.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title}>
            <h3 className="text-xl font-semibold">
              {feature.title}
            </h3>

            <p className="text-slate-400 mt-3">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}