import DashboardLayout from "@/app/components/common/dashboardLayout";

export default function StorePage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Store</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your store settings</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                    Store settings coming soon.
                </div>
            </div>
        </DashboardLayout>
    )
}