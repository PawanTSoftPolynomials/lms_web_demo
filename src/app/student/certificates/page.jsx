"use client";

import { useState, useMemo } from "react";
import { Award, Download, Calendar, Hash, User, Eye, Search } from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import useCertificates from "@/hooks/queries/student/useCertificates";

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const { data: certificates = [], isLoading, isError } = useCertificates();
  
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);

  // Fallback mock certificates for sandbox testing if none exist in the database
  const displayCertificates = useMemo(() => {
    if (certificates && certificates.length > 0) {
      return certificates;
    }
    
    // Sandbox Mocks
    return [
      {
        id: "mock_cert_1",
        certificateNo: "OT-JV-98421",
        issuedAt: "2026-06-15T00:00:00.000Z",
        course: {
          title: "Java Core Essentials",
          description: "Master object-oriented programming concepts, multithreading, and memory management in Java."
        },
        user: {
          name: user?.name || "Student User",
          email: user?.email || "student@orangelms.com"
        }
      },
      {
        id: "mock_cert_2",
        certificateNo: "OT-WD-38291",
        issuedAt: "2026-07-02T00:00:00.000Z",
        course: {
          title: "Next.js Web Development",
          description: "Build production-ready fullstack applications using server components, route handlers, and Tailwind CSS."
        },
        user: {
          name: user?.name || "Student User",
          email: user?.email || "student@orangelms.com"
        }
      }
    ];
  }, [certificates, user]);

  const filteredCertificates = useMemo(() => {
    const query = search.toLowerCase();
    return displayCertificates.filter((cert) =>
      cert.course?.title?.toLowerCase().includes(query) ||
      cert.certificateNo?.toLowerCase().includes(query)
    );
  }, [displayCertificates, search]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Card className="p-8 text-center border-red-500/25 bg-red-500/5">
        <h2 className="text-xl font-semibold text-red-400">
          Unable to load certificates
        </h2>
        <p className="mt-2 text-slate-400">
          Please check your connection and try again later.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Certificates"
        subtitle="Manage, view, and print your officially earned course completion credentials."
      />

      {/* Info notice about mocks */}
      {(!certificates || certificates.length === 0) && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-xs text-orange-400 flex items-center gap-2 shadow-inner">
          <Award size={16} className="text-orange-500" />
          <span>
            <strong>Sandbox Mode:</strong> You are viewing sample completion certificates. Earn official credentials by completing course lessons and quizzes.
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by course title or certificate code..."
          className="
            w-full
            pl-10
            pr-4
            py-2.5
            rounded-xl
            border
            border-slate-800/80
            bg-slate-900/40
            text-sm
            text-white
            placeholder-slate-500
            focus:border-orange-500/50
            focus:outline-none
            focus:ring-1
            focus:ring-orange-500/20
            transition-all
            duration-300
          "
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredCertificates.map((cert) => (
          <Card
            key={cert.id}
            className="
              relative
              overflow-hidden
              transition-all
              duration-300
              hover:border-orange-500/30
              hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]
              hover:-translate-y-1
              group
            "
          >
            {/* Ambient Background Glow decoration */}
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br from-orange-500/10 to-pink-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />

            <div className="flex flex-col gap-6 relative">
              {/* Header Info */}
              <div className="flex justify-between items-start gap-4">
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Award size={24} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Hash size={10} />
                    {cert.certificateNo}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={10} className="text-orange-500/80" />
                    {new Date(cert.issuedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-orange-400 transition-colors">
                  {cert.course?.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {cert.course?.description || "Course completion credential."}
                </p>
              </div>

              {/* Recipient info */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                    <User size={10} className="text-slate-400" />
                  </div>
                  <span className="font-semibold">{cert.user?.name}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedCert(cert)}
                    variant="outline"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg"
                  >
                    <Eye size={12} />
                    View
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedCert(cert);
                      setTimeout(() => handlePrint(), 150);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-gradient-to-br from-orange-500 to-pink-600 text-white border-none rounded-lg shadow-md shadow-orange-500/10"
                  >
                    <Download size={12} />
                    Print / Save
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCertificates.length === 0 && (
        <Card className="p-12 text-center border-slate-800/80">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
            <Award size={24} />
          </div>
          <h3 className="text-lg font-semibold text-white">No certificates found</h3>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or view your course progress to complete modules.
          </p>
        </Card>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          {/* Close Backdrop click */}
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedCert(null)} />

          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-850 rounded-2xl p-8 shadow-2xl z-10 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Actions */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/60 print:hidden">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award size={16} className="text-orange-500" />
                Certificate Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shadow-md shadow-orange-500/15 transition-all"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Certificate Page */}
            <div className="
              relative
              w-full
              aspect-[1.414/1]
              border-[8px]
              border-double
              border-orange-500/40
              bg-slate-950
              p-12
              rounded-xl
              flex
              flex-col
              justify-between
              align-center
              text-center
              overflow-hidden
              shadow-inner
              print:border-slate-300
              print:bg-white
              print:text-black
            ">
              {/* Decorative Corner Borders */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-orange-500/30 print:border-slate-300 pointer-events-none" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-orange-500/30 print:border-slate-300 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-orange-500/30 print:border-slate-300 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-orange-500/30 print:border-slate-300 pointer-events-none" />

              {/* Certificate Header */}
              <div className="space-y-1">
                <div className="flex justify-center text-orange-500 print:text-slate-600 mb-2">
                  <Award size={40} className="drop-shadow-[0_0_10px_rgba(249,115,22,0.3)] print:drop-shadow-none" />
                </div>
                <h1 className="text-xl font-bold tracking-widest uppercase text-slate-200 print:text-black">
                  Certificate of Completion
                </h1>
                <p className="text-[10px] tracking-wider uppercase text-slate-400 print:text-slate-500 font-semibold">
                  Orange Tree Learning Management System
                </p>
              </div>

              {/* Body */}
              <div className="space-y-4">
                <p className="text-[11px] italic text-slate-400 print:text-slate-500">
                  This credential is proudly presented to
                </p>
                <h2 className="text-3xl font-extrabold text-white print:text-black border-b border-slate-800/80 pb-2 max-w-md mx-auto tracking-wide font-serif">
                  {selectedCert.user?.name}
                </h2>
                <p className="text-[11px] text-slate-400 print:text-slate-600 max-w-lg mx-auto leading-relaxed">
                  for successfully satisfying all academic specifications, coursework modules, and final assessments for the study of
                </p>
                <h3 className="text-xl font-bold text-orange-400 print:text-slate-800 tracking-wide leading-tight">
                  {selectedCert.course?.title}
                </h3>
              </div>

              {/* Footer signatures & dates */}
              <div className="flex justify-between items-end border-t border-slate-850 print:border-slate-200 pt-6 max-w-xl mx-auto w-full text-left text-[10px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Credential ID</span>
                  <span className="font-mono text-slate-300 print:text-black font-semibold">{selectedCert.certificateNo}</span>
                </div>
                
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="w-16 h-0.5 bg-slate-800 print:bg-slate-300 mb-1" />
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Authorized Seal</span>
                  <span className="font-serif italic text-slate-300 print:text-black font-semibold">Orange Tree LMS</span>
                </div>

                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Date of Issue</span>
                  <span className="text-slate-300 print:text-black font-semibold">
                    {new Date(selectedCert.issuedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
