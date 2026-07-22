"use client";

import { useState, useEffect } from "react";
import { initialAdminData } from "@/data/adminDashboardData";

import AdminHeader from "@/components/admin/dashboard/AdminHeader";
import QuickActionBar from "@/components/admin/dashboard/QuickActionBar";
import SystemAlertsBanner from "@/components/admin/dashboard/SystemAlertsBanner";

import PendingApprovalsPanel from "@/components/admin/dashboard/PendingApprovalsPanel";
import TodaysOperationsPanel from "@/components/admin/dashboard/TodaysOperationsPanel";
import MessagesSupportPanel from "@/components/admin/dashboard/MessagesSupportPanel";

import AIInsightsPanel from "@/components/admin/dashboard/AIInsightsPanel";

import StudentManagementPanel from "@/components/admin/dashboard/StudentManagementPanel";
import CourseManagementPanel from "@/components/admin/dashboard/CourseManagementPanel";
import InstructorManagementPanel from "@/components/admin/dashboard/InstructorManagementPanel";

import EnrollmentCenterPanel from "@/components/admin/dashboard/EnrollmentCenterPanel";
import CertificateCenterPanel from "@/components/admin/dashboard/CertificateCenterPanel";
import FinancePaymentsPanel from "@/components/admin/dashboard/FinancePaymentsPanel";

import SystemHealthPanel from "@/components/admin/dashboard/SystemHealthPanel";

import RecentActivityPanel from "@/components/admin/dashboard/RecentActivityPanel";
import AnalyticsSummariesPanel from "@/components/admin/dashboard/AnalyticsSummariesPanel";

import ActionDrawerModal from "@/components/admin/dashboard/modals/ActionDrawerModal";

export default function AdminDashboardPage() {
  const [adminData, setAdminData] = useState(initialAdminData);
  const [activeModalAction, setActiveModalAction] = useState(null);
  const [theme, setTheme] = useState("dark");

  // Global Keyboard Shortcut: Ctrl + K or Cmd + K for Search Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActiveModalAction({ type: "search_palette", title: "Search Command Palette" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleOpenAction = (actionConfig) => {
    setActiveModalAction(actionConfig);
  };

  const handleCloseModal = () => {
    setActiveModalAction(null);
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans antialiased transition-colors duration-200`}>
      {/* Top Header */}
      <AdminHeader
        onOpenSearch={() => handleOpenAction({ type: "search_palette", title: "Search Command Palette" })}
        onOpenAction={handleOpenAction}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Quick Action Bar */}
      <QuickActionBar onOpenAction={handleOpenAction} />

      {/* Main Workspace Container */}
      <main className="p-6 space-y-6 max-w-[1800px] mx-auto">
        {/* System Alerts Banner (Sticky / Top Priority) */}
        <SystemAlertsBanner
          alerts={adminData.systemAlerts}
          onOpenAction={handleOpenAction}
        />

        {/* 1. OPERATIONAL TRIAD: Pending Approvals | Today's Operations | Messages & Support */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <PendingApprovalsPanel
            pendingData={adminData.pendingApprovals}
            onOpenAction={handleOpenAction}
          />
          <TodaysOperationsPanel
            operationsData={adminData.todaysOperations}
            onOpenAction={handleOpenAction}
          />
          <MessagesSupportPanel
            messagesData={adminData.messagesSupport}
            onOpenAction={handleOpenAction}
          />
        </section>

        {/* 2. AI OPERATIONAL INSIGHTS */}
        <section>
          <AIInsightsPanel
            insights={adminData.aiInsights}
            onOpenAction={handleOpenAction}
          />
        </section>

        {/* 3. CORE INTERVENTIONS: Student Intervention | Course Review | Instructor Management */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <StudentManagementPanel
            studentData={adminData.studentManagement}
            onOpenAction={handleOpenAction}
          />
          <CourseManagementPanel
            courseData={adminData.courseManagement}
            onOpenAction={handleOpenAction}
          />
          <InstructorManagementPanel
            instructorData={adminData.instructorManagement}
            onOpenAction={handleOpenAction}
          />
        </section>

        {/* 4. CENTER PIPELINES: Enrollment Center | Certificate Center | Finance & Payments */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <EnrollmentCenterPanel
            enrollmentData={adminData.enrollmentCenter}
            onOpenAction={handleOpenAction}
          />
          <CertificateCenterPanel
            certificateData={adminData.certificateCenter}
            onOpenAction={handleOpenAction}
          />
          <FinancePaymentsPanel
            financeData={adminData.financeCenter}
            onOpenAction={handleOpenAction}
          />
        </section>

        {/* 5. SYSTEM HEALTH MONITOR */}
        <section>
          <SystemHealthPanel
            healthData={adminData.systemHealth}
            onOpenAction={handleOpenAction}
          />
        </section>

        {/* 6. RECENT ACTIVITY LOG & OPERATIONAL ANALYTICS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5">
            <RecentActivityPanel
              activityData={adminData.recentActivity}
              onOpenAction={handleOpenAction}
            />
          </div>
          <div className="lg:col-span-7">
            <AnalyticsSummariesPanel
              summaries={adminData.analyticsSummaries}
              onOpenAction={handleOpenAction}
            />
          </div>
        </section>
      </main>

      {/* Slide-over Command Drawer / Modal System */}
      <ActionDrawerModal
        actionState={activeModalAction}
        onClose={handleCloseModal}
        onPerformAction={(res) => {
          console.log("Action performed:", res);
        }}
      />
    </div>
  );
}
