"use client";

import Link from "next/link";

export default function AuthFooter({
  backHref,
  backText,
  question,
  actionHref,
  actionText,
}) {
  return (
    <div className="border-t border-border pt-5 text-center">
      {backHref && (
        <Link
          href={backHref}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← {backText}
        </Link>
      )}

      {question && (
        <p className="mt-3 text-sm text-muted-foreground">
          {question}{" "}
          <Link
            href={actionHref}
            className="font-semibold text-primary hover:text-primary"
          >
            {actionText}
          </Link>
        </p>
      )}
    </div>
  );
}