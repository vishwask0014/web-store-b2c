"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useAuth } from "@/app/providers/AuthProvider";
import { useParams, useSearchParams } from "next/navigation";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";
import { Package, Wrench, Plus, Trash2, AlertTriangle } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const productId = params.productId;
  const { user } = useAuth();

  const svcNameId = useId();
  const svcChargesId = useId();
  const svcDescId = useId();

  const [product, setProduct] = useState(null);
  const [services, setServices] = useState([]);
  const [store, setStore] = useState(null);
  const [showSvcForm, setShowSvcForm] = useState(false);
  const [svcName, setSvcName] = useState("");
  const [svcCharges, setSvcCharges] = useState("");
  const [svcDescription, setSvcDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storeId || !productId) return;
    fetch(`/api/stores/${storeId}/products/${productId}`)
      .then((r) => r.json())
      .then(setProduct);
    fetch(`/api/stores/${storeId}/products/${productId}/services`)
      .then((r) => r.json())
      .then(setServices);
    fetch(`/api/stores/${storeId}`)
      .then((r) => r.json())
      .then(setStore);
  }, [storeId, productId]);

  const handleAddService = async () => {
    setError("");
    if (!svcName.trim() || !svcCharges) {
      setError("Service name and charges are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/products/${productId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: svcName,
          charges: Number(svcCharges),
          description: svcDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSvcName("");
      setSvcCharges("");
      setSvcDescription("");
      setShowSvcForm(false);
      const updated = await fetch(`/api/stores/${storeId}/products/${productId}/services`).then((r) => r.json());
      setServices(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    const res = await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
    }
  };

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-sm text-text-muted">Loading...</div>
      </DashboardLayout>
    );
  }

  const remaining = store ? store.serviceLimit - services.length : 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1 flex-wrap">
            <a href="/dashboard/products" className="hover:text-primary-400 text-text-muted">Products</a>
            <span>/</span>
            <span className="text-text-primary">{product.name}</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
            <Package className="w-6 h-6 text-primary-500" />
            {product.name}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {store?.name} &middot; ${product.price} &middot; Qty: {product.quantity} &middot; ID: {product.uniqueProductId}
          </p>
        </div>

        {store?.disabled && (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            This store is disabled: {store.disabledReason}
          </div>
        )}

        <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">Services</h2>
              {store && (
                <span className="text-xs text-text-muted">
                  ({services.length}/{store.serviceLimit} used)
                </span>
              )}
            </div>
            <Button size="sm" className="gap-2 w-fit" onPress={() => setShowSvcForm(!showSvcForm)} isDisabled={remaining <= 0 && !showSvcForm}>
              <Plus className="w-4 h-4" />
              {showSvcForm ? "Cancel" : "Add Service"}
            </Button>
          </div>

          {remaining <= 0 && !showSvcForm && (
            <p className="text-xs text-warning mb-3">
              Service limit reached. Contact <strong>b2cstore.support@gmail.com</strong> to increase your limit.
            </p>
          )}

          {showSvcForm && (
            <div className="mb-4 p-4 rounded-xl border border-border-default bg-bg-muted">
              <div className="grid gap-3 max-w-md">
                <div className="grid gap-1">
                  <Label htmlFor={svcNameId} className="text-sm text-text-secondary">Service Name</Label>
                  <Input id={svcNameId} placeholder="Installation" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={svcChargesId} className="text-sm text-text-secondary">Charges ($)</Label>
                  <Input id={svcChargesId} type="number" placeholder="29.99" value={svcCharges} onChange={(e) => setSvcCharges(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={svcDescId} className="text-sm text-text-secondary">Description</Label>
                  <textarea
                    id={svcDescId}
                    placeholder="What does this service include?"
                    value={svcDescription}
                    onChange={(e) => setSvcDescription(e.target.value)}
                    className="rounded-xl border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 min-h-[60px]"
                  />
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button onPress={handleAddService} isDisabled={loading}>
                  {loading ? "Adding..." : "Add Service"}
                </Button>
              </div>
            </div>
          )}

          {services.length === 0 ? (
            <p className="text-sm text-text-muted">No services added to this product yet.</p>
          ) : (
            <div className="grid gap-3">
              {services.map((svc) => (
                <div key={svc._id} className="flex items-center justify-between p-4 rounded-xl border border-border-default bg-bg-muted">
                  <div>
                    <p className="font-medium text-sm text-text-primary">{svc.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      ${svc.charges}{svc.description ? ` — ${svc.description}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteService(svc._id)}
                    className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}