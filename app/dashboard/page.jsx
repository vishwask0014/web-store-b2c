import DashboardLayout from "../components/common/dashboardLayout";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Overview of your store</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: "Total Products", value: "0", color: "bg-indigo-500" },
                        { label: "Active Store", value: "1", color: "bg-emerald-500" },
                        { label: "Orders", value: "0", color: "bg-amber-500" },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center text-white font-bold text-sm`}>
                                {stat.value}
                            </div>
                            <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Products</h2>
                    <p className="text-sm text-slate-400">No products yet. Add your first product to get started.</p>
                </div>
            </div>
        </DashboardLayout>
    )
}