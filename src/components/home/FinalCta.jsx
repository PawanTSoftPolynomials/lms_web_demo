"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function FinalCta() {
  return (
    <section className="py-6 sm:py-8 lg:py-10 border-t border-border">
      <div className="flex flex-col items-center gap-4 sm:gap-5 rounded-2xl sm:rounded-3xl bg-primary p-6 sm:p-10 lg:p-12 text-center shadow-xs">
        <h2 className="text-xl sm:text-3xl font-bold text-primary-foreground">
          Ready to Start Your Learning Journey?
        </h2>
        <p className="max-w-lg text-xs sm:text-sm text-primary-foreground/90 leading-relaxed">
          Create your free account today to explore verified courses, track your module progress, and earn completion certificates.
        </p>

        <div className="mt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button asChild size="lg" className="bg-primary-foreground text-primary hover:brightness-95 font-bold w-full sm:w-auto">
            <Link href="/register">
              <span>Create Free Account</span>
              <ArrowRight size={15} className="ml-1" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-bold w-full sm:w-auto"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
