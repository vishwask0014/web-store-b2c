"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useAuth } from "@/app/providers/AuthProvider";
import { Store, Plus, Phone, Tag, AlertTriangle } from "lucide-react";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";

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

  const fetchStores = async () => {
    if (!user?.uid) return;
    const res = await fetch(`/api/stores?ownerId=${user.uid}`);
    const data = await res.json();
    setStores(data);
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

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Store</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your stores (max 2)</p>
          </div>
          <Button size="sm" className="gap-2" onPress={() => setShowForm(!showForm)} isDisabled={enabledStores.length >= 2 && !showForm}>
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "New Store"}
          </Button>
        </div>

        {enabledStores.length >= 2 && !showForm && (
          <p className="text-xs text-amber-600">
            Store limit reached. You can only have 2 stores per account.
          </p>
        )}

        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Store</h3>
            <div className="grid gap-4 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor={emailId} className="text-sm text-slate-700">Store Name</Label>
                <Input id={emailId} placeholder="My Store" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={phoneId} className="text-sm text-slate-700">Phone Number</Label>
                <Input id={phoneId} placeholder="+1 234 567 8900" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={categoryId} className="text-sm text-slate-700">Category</Label>
                <Input id={categoryId} placeholder="e.g. Home Cleaning, Tools, Electronics" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onPress={handleCreate} isDisabled={loading}>
                {loading ? "Creating..." : "Create Store"}
              </Button>
            </div>
          </div>
        )}

        {stores.length === 0 && !showForm ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
            No stores yet. Create one to get started.
          </div>
        ) : (
          <div className="grid gap-4">
            {stores.map((s) => (
              <div
                key={s._id}
                className={`rounded-xl border p-5 flex items-center justify-between ${
                  s.disabled
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    s.disabled ? "bg-red-100 text-red-500" : "bg-indigo-100 text-indigo-600"
                  }`}>
                    {s.disabled ? <AlertTriangle className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      {s.disabled && (
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-medium">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phoneNumber}</span>
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{s.category}</span>
                      <span className="text-slate-300">ID: {s.uniqueStoreId}</span>
                    </div>
                    {s.disabledReason && (
                      <p className="text-xs text-red-500 mt-1">{s.disabledReason}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}