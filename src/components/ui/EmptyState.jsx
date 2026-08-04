import Button from "./Button";

export default function EmptyState({
  message,
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) {
  if (!title && !Icon && !actionText) {
    return (
      <div className="py-10 text-center text-slate-400">
        {message}
      </div>
    );
  }

  return (
    <div className="py-16 text-center flex flex-col items-center gap-3">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-450 flex items-center justify-center">
          <Icon size={26} />
        </div>
      )}
      {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
      {(description || message) && (
        <p className="text-sm text-slate-400 max-w-sm">{description || message}</p>
      )}
      {actionText && (
        <Button onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
}
