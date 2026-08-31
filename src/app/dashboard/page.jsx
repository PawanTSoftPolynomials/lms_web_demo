"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";
import useAuth from "@/hooks/useAuth";

export default function Dashboard() {
    const router = useRouter();

    const {
        user,
        loading,
        logout,
    } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (<div className="min-h-screen bg-background flex items-center justify-center text-foreground">
                Loading... </div>
        );
    }

    return (<div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-transparent bg-background">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center"><h1
                    className="text-2xl font-bold text-primary">
                    Orange Tree LMS </h1>
                    <button
                        onClick={() => {
                            logout();
                            router.push("/login");
                        }}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                <div className="bg-background border border-transparent rounded-2xl p-6 mb-6">
                    <h2 className="text-3xl font-bold">
                        Welcome, {user?.name}
                    </h2>

                    <p className="text-muted-foreground mt-2">
                        Role: {user?.role}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-background border border-transparent rounded-xl p-6">
                        <h3 className="text-lg font-semibold">
                            Courses
                        </h3>

                        <p className="text-4xl font-bold mt-4">
                            0
                        </p>
                    </div>

                    <div className="bg-background border border-transparent rounded-xl p-6">
                        <h3 className="text-lg font-semibold">
                            Progress
                        </h3>

                        <p className="text-4xl font-bold mt-4">
                            0%
                        </p>
                    </div>

                    <div className="bg-background border border-transparent rounded-xl p-6">
                        <h3 className="text-lg font-semibold">
                            Certificates
                        </h3>

                        <p className="text-4xl font-bold mt-4">
                            0
                        </p>
                    </div>
                </div>
            </main>
        </div>


    );
}
