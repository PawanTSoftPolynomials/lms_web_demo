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
      <div className="py-10 text-center text-muted-foreground text-xs font-medium">
        {message}
      </div>
    );
  }

  return (
    <div className="py-16 text-center flex flex-col items-center gap-3">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-2xs">
          <Icon size={26} />
        </div>
      )}
      {title && <h3 className="text-base font-bold text-foreground">{title}</h3>}
      {(description || message) && (
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">{description || message}</p>
      )}
      {actionText && (
        <Button onClick={onAction} className="mt-2 font-bold shadow-2xs">
          {actionText}
        </Button>
      )}
    </div>
  );
}
