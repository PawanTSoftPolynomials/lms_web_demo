'use client';

import { useAuth } from '@/context/AuthContext';

export default function WelcomeSection() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">
        Welcome back, {user?.name} 👋
      </h1>

      <p className="text-slate-400 mt-1">
        Manage your courses and teaching content.
      </p>
    </div>
  );
}
