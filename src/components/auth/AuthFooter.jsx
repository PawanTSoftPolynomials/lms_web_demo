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
    <div className="border-t border-slate-800 pt-5 text-center">
      {backHref && (
        <Link
          href={backHref}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← {backText}
        </Link>
      )}

      {question && (
        <p className="mt-3 text-sm text-slate-500">
          {question}{" "}
          <Link
            href={actionHref}
            className="font-semibold text-orange-500 hover:text-orange-400"
          >
            {actionText}
          </Link>
        </p>
      )}
    </div>
  );
}