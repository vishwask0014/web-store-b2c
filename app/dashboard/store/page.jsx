"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useAuth } from "@/app/providers/AuthProvider";
import { Store, Plus, Phone, Tag, AlertTriangle, Wrench, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";

const MAX_SERVICES_PER_STORE = 7;

export default function StorePage() {
  const { user } = useAuth();
  const emailId = useId();
  const phoneId = useId();
  const categoryId = useId();

  const [stores, setStores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [servicesByStore, setServicesByStore] = useState({});
  const [openServices, setOpenServices] = useState({});
  const [svcForm, setSvcForm] = useState({});
  const [svcError, setSvcError] = useState("");
  const [svcLoading, setSvcLoading] = useState(false);

  const fetchStores = async () => {
    if (!user?.uid) return;
    const res = await fetch(`/api/stores?ownerId=${user.uid}`);
    const data = await res.json();
    setStores(data);
    data.forEach((s) => {
      fetch(`/api/stores/${s.uniqueStoreId}/services`)
        .then((r) => r.json())
        .then((svcs) =>
          setServicesByStore((prev) => ({ ...prev, [s.uniqueStoreId]: svcs }))
        );
    });
  };

  useEffect(() => {
    fetchStores();
  }, [user]);

  const handleCreate = async () => {
    setError("");
    if (!name.trim() || !phoneNumber.trim() || !category.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber, category, ownerId: user.uid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setName("");
      setPhoneNumber("");
      setCategory("");
      setShowForm(false);
      fetchStores();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const enabledStores = stores.filter((s) => !s.disabled);

  const handleAddService = async (storeId) => {
    setSvcError("");
    const form = svcForm[storeId] || {};
    if (!form.name?.trim() || !form.charges) {
      setSvcError("Service name and charges are required.");
      return;
    }
    setSvcLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          charges: Number(form.charges),
          description: form.description || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSvcForm((prev) => ({ ...prev, [storeId]: {} }));
      setServicesByStore((prev) => ({ ...prev, [storeId]: [data, ...(prev[storeId] || [])] }));
    } catch (err) {
      setSvcError(err.message);
    } finally {
      setSvcLoading(false);
    }
  };

  const handleDeleteService = async (storeId, serviceId) => {
    const res = await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
    if (res.ok) {
      setServicesByStore((prev) => ({
        ...prev,
        [storeId]: (prev[storeId] || []).filter((s) => s._id !== serviceId),
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Store</h1>
            <p className="text-sm text-text-muted mt-1">Manage your stores (max 2)</p>
          </div>
          <Button size="sm" className="gap-2 w-fit" onPress={() => setShowForm(!showForm)} isDisabled={enabledStores.length >= 2 && !showForm}>
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "New Store"}
          </Button>
        </div>

        {enabledStores.length >= 2 && !showForm && (
          <p className="text-xs text-warning flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Store limit reached. You can only have 2 stores per account.
          </p>
        )}

        {showForm && (
          <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Create Store</h3>
            <div className="grid gap-4 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor={emailId} className="text-sm text-text-secondary">Store Name</Label>
                <Input id={emailId} placeholder="My Store" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={phoneId} className="text-sm text-text-secondary">Phone Number</Label>
                <Input id={phoneId} placeholder="+1 234 567 8900" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={categoryId} className="text-sm text-text-secondary">Category</Label>
                <Input id={categoryId} placeholder="e.g. Home Cleaning, Tools, Electronics" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button onPress={handleCreate} isDisabled={loading}>
                {loading ? "Creating..." : "Create Store"}
              </Button>
            </div>
          </div>
        )}

        {stores.length === 0 && !showForm ? (
          <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted">
            No stores yet. Create one to get started.
          </div>
        ) : (
          <div className="grid gap-4">
            {stores.map((s) => (
              <div
                key={s._id}
                className={`rounded-2xl border p-5 ${
                  s.disabled
                    ? "border-danger/30 bg-danger/5"
                    : "border-border-default bg-bg-surface"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    s.disabled ? "bg-danger/15 text-danger" : "bg-primary-500/15 text-primary-400"
                  }`}>
                    {s.disabled ? <AlertTriangle className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{s.name}</p>
                      {s.disabled && (
                        <span className="text-xs text-danger bg-danger/10 px-2 py-0.5 rounded-full font-medium">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted flex-wrap">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phoneNumber}</span>
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{s.category}</span>
                      <span className="text-text-placeholder">ID: {s.uniqueStoreId}</span>
                    </div>
                    {s.disabledReason && (
                      <p className="text-xs text-danger mt-1">{s.disabledReason}</p>
                    )}
                  </div>
                </div>
                  {!s.disabled && (
                    <div className="w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2 w-fit"
                        onPress={() =>
                          setOpenServices((prev) => ({
                            ...prev,
                            [s.uniqueStoreId]: !prev[s.uniqueStoreId],
                          }))
                        }
                      >
                        {openServices[s.uniqueStoreId] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Services ({(servicesByStore[s.uniqueStoreId] || []).length}/{MAX_SERVICES_PER_STORE})
                      </Button>
                    </div>
                  )}
                </div>
              {!s.disabled && openServices[s.uniqueStoreId] && (
                <div className="mt-4 pt-4 border-t border-border-default">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-4 h-4 text-text-secondary" />
                    <p className="text-sm font-medium text-text-primary">Store services pool</p>
                    <p className="text-xs text-text-muted">
                      Select these when adding a product (max 7 per product)
                    </p>
                  </div>
                  {(servicesByStore[s.uniqueStoreId] || []).length === 0 ? (
                    <p className="text-sm text-text-muted mb-3">No services yet. Add one below.</p>
                  ) : (
                    <div className="grid gap-2 mb-4">
                      {(servicesByStore[s.uniqueStoreId] || []).map((svc) => (
                        <div
                          key={svc._id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border-default bg-bg-muted"
                        >
                          <div>
                            <p className="font-medium text-sm text-text-primary">{svc.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">
                              ${svc.charges}
                              {svc.description ? ` — ${svc.description}` : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteService(s.uniqueStoreId, svc._id)}
                            className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Delete service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(servicesByStore[s.uniqueStoreId] || []).length < MAX_SERVICES_PER_STORE && (
                    <div className="grid gap-3 max-w-md">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          placeholder="Service name"
                          value={svcForm[s.uniqueStoreId]?.name || ""}
                          onChange={(e) =>
                            setSvcForm((prev) => ({
                              ...prev,
                              [s.uniqueStoreId]: { ...(prev[s.uniqueStoreId] || {}), name: e.target.value },
                            }))
                          }
                          className="sm:col-span-2"
                        />
                        <Input
                          type="number"
                          placeholder="Charges $"
                          value={svcForm[s.uniqueStoreId]?.charges || ""}
                          onChange={(e) =>
                            setSvcForm((prev) => ({
                              ...prev,
                              [s.uniqueStoreId]: { ...(prev[s.uniqueStoreId] || {}), charges: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <Input
                        placeholder="Description (optional)"
                        value={svcForm[s.uniqueStoreId]?.description || ""}
                        onChange={(e) =>
                          setSvcForm((prev) => ({
                            ...prev,
                            [s.uniqueStoreId]: { ...(prev[s.uniqueStoreId] || {}), description: e.target.value },
                          }))
                        }
                      />
                      {svcError && <p className="text-sm text-danger">{svcError}</p>}
                      <Button size="sm" className="gap-2 w-fit" onPress={() => handleAddService(s.uniqueStoreId)} isDisabled={svcLoading}>
                        <Plus className="w-4 h-4" />
                        {svcLoading ? "Adding..." : "Add Service"}
                      </Button>
                    </div>
                  )}
                  {(servicesByStore[s.uniqueStoreId] || []).length >= MAX_SERVICES_PER_STORE && (
                    <p className="text-xs text-warning flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Service limit reached (max {MAX_SERVICES_PER_STORE} per store).
                    </p>
                  )}
                </div>
              )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}