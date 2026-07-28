"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
                    <p className="text-sm text-text-muted mt-1">Platform configuration</p>
                </div>

                <div className="rounded-2xl border border-border-default bg-bg-surface p-6 text-center text-sm text-text-muted">
                    Settings panel coming soon.
                </div>
            </div>
        </DashboardLayout>
    );
}