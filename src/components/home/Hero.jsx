"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { getLandingData } from "@/services/landing.service";

export default function Hero() {
  const [stats, setStats] = useState({ students: 0, courses: 0, certificates: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getLandingData();
      if (data && data.stats) {
        setStats(data.stats);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="min-h-[75vh] flex items-center py-16">
      <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left Content */}
        <div>
          <Eyebrow>Modern Learning Platform</Eyebrow>

          <h1 className="text-5xl md:text-6xl font-bold mt-6 leading-tight text-foreground">
            Learn Faster.
            <br />
            Build Skills.
            <br />
            <span className="text-primary">Grow Your Career.</span>
          </h1>

          <p className="text-muted-foreground text-xl mt-6 max-w-2xl">
            Access courses, track progress,
            complete quizzes, and earn
            certificates through Orange LMS.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/register">
              <Button className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Stats */}
        <div className="grid gap-5">
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-luxury-sm">
            <h3 className="text-muted-foreground">
              Students
            </h3>

            <h2 className="text-4xl font-bold text-primary mt-2">
              {stats.students}+
            </h2>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-luxury-sm">
            <h3 className="text-muted-foreground">
              Courses
            </h3>

            <h2 className="text-4xl font-bold text-primary mt-2">
              {stats.courses}+
            </h2>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-luxury-sm">
            <h3 className="text-muted-foreground">
              Certificates
            </h3>

            <h2 className="text-4xl font-bold text-primary mt-2">
              {stats.certificates}+
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}