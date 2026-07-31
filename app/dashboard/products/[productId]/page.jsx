"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useAuth } from "@/app/providers/AuthProvider";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";
import { Package, Wrench, Plus, Trash2, AlertTriangle, Link2 } from "lucide-react";

const MAX_SERVICES = 7;

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
  const [pool, setPool] = useState([]);
  const [store, setStore] = useState(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [svcName, setSvcName] = useState("");
  const [svcCharges, setSvcCharges] = useState("");
  const [svcDescription, setSvcDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!storeId || !productId) return;
    const [prod, svcs, str] = await Promise.all([
      fetch(`/api/stores/${storeId}/products/${productId}`).then((r) => r.json()),
      fetch(`/api/stores/${storeId}/services`).then((r) => r.json()),
      fetch(`/api/stores/${storeId}`).then((r) => r.json()),
    ]);
    setProduct(prod);
    setPool(svcs);
    setStore(str);
  };

  useEffect(() => {
    load();
  }, [storeId, productId]);

  const linkedIds = product?.services?.map((s) => s.serviceId) || [];
  const remaining = MAX_SERVICES - linkedIds.length;
  const availablePool = pool.filter((s) => !linkedIds.includes(s._id));

  const handleLinkServices = async () => {
    setError("");
    if (selectedServices.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: [...linkedIds, ...selectedServices] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedServices([]);
      setShowLinkForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkService = async (serviceId) => {
    const res = await fetch(`/api/stores/${storeId}/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        services: linkedIds.filter((id) => id !== serviceId),
      }),
    });
    if (res.ok) load();
  };

  const handleCreateAndLink = async () => {
    setError("");
    if (!svcName.trim() || !svcCharges) {
      setError("Service name and charges are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/services`, {
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
      const linkRes = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: [...linkedIds, data._id] }),
      });
      const linkData = await linkRes.json();
      if (!linkRes.ok) throw new Error(linkData.error);
      setSvcName("");
      setSvcCharges("");
      setSvcDescription("");
      setShowCreateForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-sm text-text-muted">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1 flex-wrap">
            <Link href="/dashboard/products" className="hover:text-primary-400 text-text-muted">Products</Link>
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
              <span className="text-xs text-text-muted">
                ({linkedIds.length}/{MAX_SERVICES} linked)
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="gap-2 w-fit" onPress={() => setShowLinkForm(!showLinkForm)} isDisabled={remaining <= 0 || availablePool.length === 0}>
                <Link2 className="w-4 h-4" />
                {showLinkForm ? "Cancel" : "Link from Store Services"}
              </Button>
              <Button size="sm" variant="secondary" className="gap-2 w-fit" onPress={() => setShowCreateForm(!showCreateForm)} isDisabled={remaining <= 0}>
                <Plus className="w-4 h-4" />
                {showCreateForm ? "Cancel" : "New Service"}
              </Button>
            </div>
          </div>

          {remaining <= 0 && (
            <p className="text-xs text-warning mb-3">
              You can link at most {MAX_SERVICES} services to a product. Unlink one to add more.
            </p>
          )}

          {showLinkForm && (
            <div className="mb-4 p-4 rounded-xl border border-border-default bg-bg-muted">
              <p className="text-sm text-text-secondary mb-3">
                Select services from your store pool to link to this product ({availablePool.length} available):
              </p>
              <div className="grid gap-2 mb-4">
                {availablePool.map((s) => (
                  <label key={s._id} className="flex items-center gap-3 p-3 rounded-xl border border-border-default bg-bg-surface cursor-pointer hover:border-primary-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s._id)}
                      onChange={() => toggleService(s._id)}
                      className="accent-primary-500 w-4 h-4"
                    />
                    <span className="text-sm text-text-primary">{s.name}</span>
                    <span className="text-xs text-text-muted ml-auto">${s.charges}</span>
                  </label>
                ))}
              </div>
              {error && <p className="text-sm text-danger mb-3">{error}</p>}
              <Button onPress={handleLinkServices} isDisabled={loading || selectedServices.length === 0}>
                {loading ? "Saving..." : `Link ${selectedServices.length} Service${selectedServices.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          )}

          {showCreateForm && (
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
                <Button onPress={handleCreateAndLink} isDisabled={loading}>
                  {loading ? "Adding..." : "Create & Link Service"}
                </Button>
              </div>
            </div>
          )}

          {linkedIds.length === 0 ? (
            <p className="text-sm text-text-muted">
              No services linked to this product yet. Link services from your store or create a new one.
            </p>
          ) : (
            <div className="grid gap-3">
              {product.services.map((svc) => (
                <div key={svc.serviceId} className="flex items-center justify-between p-4 rounded-xl border border-border-default bg-bg-muted">
                  <div>
                    <p className="font-medium text-sm text-text-primary">{svc.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">${svc.charges}</p>
                  </div>
                  <button
                    onClick={() => handleUnlinkService(svc.serviceId)}
                    className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Unlink service"
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