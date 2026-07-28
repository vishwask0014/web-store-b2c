"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { db } from "@/app/lib/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function UsersPage() {
    const { userType } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (userType !== "admin") return;
        const fetchUsers = async () => {
            const q = query(collection(db, "users"));
            const snap = await getDocs(q);
            setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        };
        fetchUsers();
    }, [userType]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage all registered users</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="border-b border-slate-100 last:border-0">
                                            <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                    {u.role || "customer"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}