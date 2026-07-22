"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
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
          <span className="bg-orange-600/20 text-orange-400 px-4 py-2 rounded-full text-sm">
            Modern Learning Platform
          </span>

          <h1 className="text-5xl md:text-6xl font-bold mt-6 leading-tight">
            Learn Faster.
            <br />
            Build Skills.
            <br />
            Grow Your Career.
          </h1>

          <p className="text-slate-400 text-xl mt-6 max-w-2xl">
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400">
              Students
            </h3>

            <h2 className="text-4xl font-bold text-orange-500 mt-2">
              {stats.students}+
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400">
              Courses
            </h3>

            <h2 className="text-4xl font-bold text-orange-500 mt-2">
              {stats.courses}+
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400">
              Certificates
            </h3>

            <h2 className="text-4xl font-bold text-orange-500 mt-2">
              {stats.certificates}+
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}