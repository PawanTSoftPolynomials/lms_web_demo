import Link from "next/link";

import Button from "@/components/ui/Button";

export default function FinalCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-8 py-14 text-center shadow-luxury-md sm:px-16">
        <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
          Ready to start learning?
        </h2>
        <p className="max-w-xl text-primary-foreground/80">
          Create your free account and start your first course today —
          no commitment required.
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full bg-primary-foreground text-primary hover:brightness-95 sm:w-auto">
            <Link href="/register">Get Started</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
