import Button from "./Button";

export default function PageHeader({
  title,
  description,
  actionText,
  onAction,
  actionVariant = "primary",
  actionIcon = null,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">

      <div>

        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {title}
        </h1>

        {description && (
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            {description}
          </p>
        )}

      </div>

      {actionText && (
        <Button
          variant={actionVariant}
          onClick={onAction}
          className="shrink-0"
        >
          {actionIcon}
          {actionText}
        </Button>
      )}

    </div>
  );
}