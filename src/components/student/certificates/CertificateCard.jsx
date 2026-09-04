"use client";

import { Award, Download, Calendar, Hash, User, Eye } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CertificateCard({ cert, onView, onPrint }) {
  return (
    <Card
      className="
        relative
        overflow-hidden
        transition-all
        duration-300
        hover:border-primary/30
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
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Award size={24} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
              <Hash size={10} />
              {cert.certificateNo}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar size={10} className="text-primary/80" />
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
          <h3 className="text-lg font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
            {cert.course?.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {cert.course?.description || "Course completion credential."}
          </p>
        </div>

        {/* Recipient info */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
              <User size={10} className="text-muted-foreground" />
            </div>
            <span className="font-semibold">{cert.user?.name}</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onView(cert)}
              variant="outline"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg"
            >
              <Eye size={12} />
              View
            </Button>
            <Button
              onClick={() => onPrint(cert)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-gradient-to-br from-orange-500 to-pink-600 text-foreground border-none rounded-lg shadow-md shadow-orange-500/10"
            >
              <Download size={12} />
              Print / Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
