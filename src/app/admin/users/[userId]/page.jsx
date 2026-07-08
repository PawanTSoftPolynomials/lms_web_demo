"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Shield,
  Calendar,
  CircleCheck,
} from "lucide-react";

import { useUser } from "@/hooks/queries/admin/useUsers";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";
import UserAvatar from "@/components/admin/users/UserAvatar";

export default function UserDetailsPage() {
  const router = useRouter();
  const { userId } = useParams();

  const { data: user, isLoading, isError } = useUser(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="py-24 text-center text-red-500">Failed to load user.</div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="User Details" subtitle="View user information." />

      <Card>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center lg:w-64">
            <UserAvatar name={user.name} size="lg" />

            <h2 className="mt-4 text-2xl font-bold text-white text-center">
              {user.name}
            </h2>

            <p className="text-gray-400">{user.email}</p>

            <Button
              className="mt-6 w-full flex items-center justify-center gap-2"
              onClick={() => router.push(`/admin/users/edit/${user.id}`)}
            >
              <Pencil size={18} />
              Edit User
            </Button>
          </div>

          {/* Details */}
          <div className="flex-1 grid gap-6 md:grid-cols-2">
            <InfoCard
              icon={<Mail size={18} />}
              label="Email"
              value={user.email}
            />

            <InfoCard
              icon={<Shield size={18} />}
              label="Role"
              value={user.role}
            />

            <InfoCard
              icon={<CircleCheck size={18} />}
              label="Status"
              value={user.status}
            />

            <InfoCard
              icon={<Calendar size={18} />}
              label="Joined"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-3 text-orange-400 mb-3">
        {icon}

        <span className="font-medium">{label}</span>
      </div>

      <p className="text-white break-all">{value}</p>
    </div>
  );
}
