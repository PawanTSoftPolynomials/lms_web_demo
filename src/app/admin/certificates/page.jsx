"use client";

import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";
import Button from "@/components/ui/Button";

import {
  getCertificates,
  getCertificateById,
} from "@/services/certificate.service";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] =
    useState([]);

  const [
    selectedCertificate,
    setSelectedCertificate,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const loadCertificates =
    async () => {
      try {
        setLoading(true);

        const data =
          await getCertificates();

        setCertificates(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCertificates();
  }, []);

  const filteredCertificates =
    useMemo(() => {
      if (!search.trim())
        return certificates;

      const keyword =
        search.toLowerCase();

      return certificates.filter(
        (certificate) =>
          certificate.user?.name
            ?.toLowerCase()
            .includes(keyword) ||
          certificate.user?.email
            ?.toLowerCase()
            .includes(keyword) ||
          certificate.course?.title
            ?.toLowerCase()
            .includes(keyword) ||
          certificate.certificateNo
            ?.toLowerCase()
            .includes(keyword)
      );
    }, [
      certificates,
      search,
    ]);

  const handleView =
    async (
      certificateId
    ) => {
      try {
        const data =
          await getCertificateById(
            certificateId
          );

        setSelectedCertificate(
          data
        );
      } catch (error) {
        console.error(error);
      }
    };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Certificates"
        subtitle="Manage all issued certificates"
      />

      <Card>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <Input
            placeholder="Search student, course or certificate..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="md:max-w-md"
          />

          <div className="text-sm text-slate-400">
            Total Certificates
            <span className="ml-2 font-semibold text-white">
              {
                filteredCertificates.length
              }
            </span>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-slate-800 text-left text-slate-400">

                <th className="p-4">
                  Certificate No
                </th>

                <th className="p-4">
                  Student
                </th>

                <th className="p-4">
                  Email
                </th>

                <th className="p-4">
                  Course
                </th>

                <th className="p-4">
                  Issued
                </th>

                <th className="p-4 w-24">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>
                            {filteredCertificates.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="p-10 text-center text-slate-400"
                  >
                    No certificates found.
                  </td>

                </tr>

              ) : (

                filteredCertificates.map(
                  (certificate) => (

                    <tr
                      key={certificate.id}
                      className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                    >

                      <td className="p-4 font-medium">
                        {certificate.certificateNo}
                      </td>

                      <td className="p-4">
                        {certificate.user?.name}
                      </td>

                      <td className="p-4 text-slate-300">
                        {certificate.user?.email}
                      </td>

                      <td className="p-4">
                        {certificate.course?.title}
                      </td>

                      <td className="p-4 text-slate-300">
                        {new Date(
                          certificate.issuedAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="p-4">

                        <Button
                          size="sm"
                          onClick={() =>
                            handleView(
                              certificate.id
                            )
                          }
                        >
                          View
                        </Button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </Card>

      {selectedCertificate && (

        <Card>

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">
              Certificate Details
            </h2>

            <Button
              variant="ghost"
              onClick={() =>
                setSelectedCertificate(
                  null
                )
              }
            >
              Close
            </Button>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <p className="text-sm text-slate-400">
                Certificate Number
              </p>

              <p className="mt-1 font-semibold">
                {
                  selectedCertificate.certificateNo
                }
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-400">
                Student
              </p>

              <p className="mt-1 font-semibold">
                {
                  selectedCertificate.user?.name
                }
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-400">
                Email
              </p>

              <p className="mt-1 font-semibold">
                {
                  selectedCertificate.user?.email
                }
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-400">
                Course
              </p>

              <p className="mt-1 font-semibold">
                {
                  selectedCertificate.course?.title
                }
              </p>

            </div>

            <div>

              <p className="text-sm text-slate-400">
                Issued On
              </p>

              <p className="mt-1 font-semibold">
                {new Date(
                  selectedCertificate.issuedAt
                ).toLocaleString()}
              </p>

            </div>

          </div>

        </Card>

      )}

    </div>
  );
}