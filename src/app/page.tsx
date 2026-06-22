"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0B3D] via-[#1B145C] to-[#0A082A]" />

      {/* Glow Blobs */}
      <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-pink-500/40 blur-[140px]" />

      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-orange-400/40 blur-[150px]" />

      <div className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-pink-400/30 blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Navbar */}
        <nav className="mt-6 flex items-center justify-between rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl px-6 py-5 shadow-2xl">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            Orange LMS
          </h1>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="
                rounded-xl
                border border-white/20
                bg-white/10
                px-5 py-2.5
                backdrop-blur-xl
                hover:bg-white/20
                transition-all
              "
            >
              Login
            </Link>

            <Link
              href="/register"
              className="
                rounded-xl
                bg-gradient-to-r
                from-orange-400
                to-pink-500
                px-5 py-2.5
                text-white
                shadow-[0_10px_30px_rgba(255,105,180,0.4)]
                hover:scale-105
                transition-all
              "
            >
              Register
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="min-h-[80vh] flex items-center">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                inline-block
                rounded-full
                border border-white/20
                bg-white/10
                px-5 py-2
                text-pink-300
                backdrop-blur-xl
              "
            >
              Modern Learning Platform
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8 text-6xl md:text-7xl font-black leading-tight"
            >
              <span className="shine-text">
                Learn Faster.
              </span>

              <br />

              <span className="text-white">
                Build Skills.
              </span>

              <br />

              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                Grow Your Career.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 max-w-2xl text-xl text-slate-300"
            >
              Access courses, track progress,
              complete quizzes, and earn
              certificates through Orange LMS.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex gap-5"
            >
              <Link
                href="/register"
                className="
                  rounded-2xl
                  bg-gradient-to-r
                  from-orange-400
                  to-pink-500
                  px-8 py-4
                  font-semibold
                  text-white
                  shadow-[0_10px_30px_rgba(255,105,180,0.4)]
                  hover:scale-105
                  transition-all
                "
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="
                  rounded-2xl
                  border border-white/20
                  bg-white/10
                  backdrop-blur-xl
                  px-8 py-4
                  hover:bg-white/20
                  transition-all
                "
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid gap-8 pb-24 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.2,
              }}
              whileHover={{
                scale: 1.05,
                rotateX: -5,
                rotateY: 5,
              }}
              className="
                float-card
                rounded-[32px]
                border border-white/20
                bg-white/10
                backdrop-blur-2xl
                p-8
                shadow-2xl
                hover:border-pink-400
                transition-all duration-500
              "
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <div className="mb-5 h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg" />

              <h3 className="text-2xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-3 text-slate-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </section>
      </div>
    </main>
  );
}