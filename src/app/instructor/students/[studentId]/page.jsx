'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function InstructorStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId;

  useEffect(() => {
    if (studentId) {
      router.replace(`/instructor/students?studentId=${studentId}`);
    }
  }, [studentId, router]);

  return (
    <div className="min-h-screen text-foreground flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest font-mono">
          Loading Student Details...
        </span>
      </div>
    </div>
  );
}
