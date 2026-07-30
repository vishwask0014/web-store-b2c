"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState } from "react";

const ROLE_BADGE = {
    admin: "bg-primary-500/15 text-primary-400",
    seller: "bg-success/15 text-success",
    operator: "bg-warning/15 text-warning",
    customer: "bg-slate-500/15 text-text-muted",
};

export default function UsersPage() {
    const { userType } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (userType !== "admin") return;
        const fetchUsers = async () => {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        };
        fetchUsers();
    }, [userType]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Users</h1>
                    <p className="text-sm text-text-muted mt-1">Manage all registered users</p>
                </div>

                <div className="rounded-2xl border border-border-default bg-bg-surface overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-divider bg-bg-muted text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u._id} className="border-b border-border-divider last:border-0">
                                            <td className="px-4 py-3 font-medium text-text-primary">{u.name}</td>
                                            <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role] || ROLE_BADGE.customer}`}>
                                                    {u.role || "customer"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-text-muted">
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