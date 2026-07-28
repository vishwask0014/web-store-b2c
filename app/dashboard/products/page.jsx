import DashboardLayout from "@/app/components/common/dashboardLayout";

export default function ProductsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your product catalog</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">All Products</span>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors">
                            Add Product
                        </button>
                    </div>
                    <div className="p-8 text-center text-sm text-slate-400">
                        No products yet. Click &quot;Add Product&quot; to create one.
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}