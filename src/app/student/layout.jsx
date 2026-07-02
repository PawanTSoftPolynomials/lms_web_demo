"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getProfile } from "../../services/auth.service";

export default function Layout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validate = async () => {
      try {
        const token = Cookies.get("accessToken");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await getProfile();
        const user = response.data || response;

        if (user.role !== "STUDENT") {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error(error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <DashboardLayout role="STUDENT" title="Student Dashboard">
      {children}
    </DashboardLayout>
  );
}
