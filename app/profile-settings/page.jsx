"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import DashboardLayout from "@/app/components/common/dashboardLayout";
import ShopLayout from "@/app/components/common/ShopLayout";
import { CreditCard, MapPin, Trash2, Plus, Star, User as UserIcon, Check } from "lucide-react";

function ProfileContent() {
  const { user } = useAuth();
  const uid = user?.uid;

  const nameId = useId();
  const phoneId = useId();
  const addrId = useId();
  const cityId = useId();
  const stateId = useId();
  const zipId = useId();
  const countryId = useId();
  const cardNumId = useId();
  const holderId = useId();
  const expiryId = useId();
  const cvvId = useId();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState({});

  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!uid) return;
    const res = await fetch(`/api/users?uid=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setLocation(data.location || {});
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [uid]);

  const saveProfile = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, name, phone, location }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess("Profile updated.");
      fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const addCard = async () => {
    setError("");
    setSuccess("");
    if (!cardNumber.replace(/\s/g, "").length || !expiry || !holderName.trim()) {
      setError("Card number, holder name, and expiry are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          addCard: { cardNumber, holderName, expiry },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setCardNumber("");
      setHolderName("");
      setExpiry("");
      setCvv("");
      setShowCardForm(false);
      setSuccess("Card added.");
      fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeCard = async (cardId) => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, removeCard: cardId }),
    });
    if (res.ok) {
      setSuccess("Card removed.");
      fetchProfile();
    }
  };

  const setDefaultCard = async (cardId) => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, defaultPaymentMethod: cardId }),
    });
    if (res.ok) {
      setSuccess("Default payment method updated.");
      fetchProfile();
    }
  };

  const toggleAutoPay = async (value) => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, autoPay: value }),
    });
    if (res.ok) {
      setSuccess(value ? "Auto payment enabled." : "Auto payment disabled.");
      fetchProfile();
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-text-muted">Loading profile...</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Profile</h1>
        <p className="text-sm text-text-muted mt-1">Manage your details, location, and payment methods</p>
      </div>

      {(error || success) && (
        <div className={`rounded-xl p-3 text-sm ${error ? "border border-danger/30 bg-danger/5 text-danger" : "border border-success/30 bg-success/5 text-success"}`}>
          {error || success}
        </div>
      )}

      <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-text-secondary" />
          <h2 className="text-lg font-semibold text-text-primary">Personal Details</h2>
        </div>
        <div className="grid gap-4 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={nameId} className="text-sm text-text-secondary">Full Name</Label>
              <Input id={nameId} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={phoneId} className="text-sm text-text-secondary">Phone</Label>
              <Input id={phoneId} placeholder="+1 234 567 8900" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-sm text-text-secondary">Email (login)</Label>
            <Input value={profile?.email || ""} disabled className="opacity-60" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-text-secondary" />
          <h2 className="text-lg font-semibold text-text-primary">Location</h2>
        </div>
        <div className="grid gap-4 max-w-lg">
          <div className="grid gap-2">
            <Label htmlFor={addrId} className="text-sm text-text-secondary">Address</Label>
            <Input
              id={addrId}
              placeholder="Street address"
              value={location.address || ""}
              onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={cityId} className="text-sm text-text-secondary">City</Label>
              <Input id={cityId} value={location.city || ""} onChange={(e) => setLocation((prev) => ({ ...prev, city: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={stateId} className="text-sm text-text-secondary">State</Label>
              <Input id={stateId} value={location.state || ""} onChange={(e) => setLocation((prev) => ({ ...prev, state: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={zipId} className="text-sm text-text-secondary">Zip / Postal Code</Label>
              <Input id={zipId} value={location.zip || ""} onChange={(e) => setLocation((prev) => ({ ...prev, zip: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={countryId} className="text-sm text-text-secondary">Country</Label>
              <Input id={countryId} value={location.country || ""} onChange={(e) => setLocation((prev) => ({ ...prev, country: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      <Button className="w-fit" onPress={saveProfile} isDisabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </Button>

      <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary">Payment Methods</h2>
          </div>
          <Button size="sm" className="gap-2 w-fit" onPress={() => setShowCardForm(!showCardForm)}>
            <Plus className="w-4 h-4" />
            {showCardForm ? "Cancel" : "Add Card"}
          </Button>
        </div>

        {showCardForm && (
          <div className="mb-4 p-4 rounded-xl border border-border-default bg-bg-muted">
            <div className="grid gap-3 max-w-md">
              <div className="grid gap-1">
                <Label htmlFor={cardNumId} className="text-sm text-text-secondary">Card Number</Label>
                <Input
                  id={cardNumId}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  inputMode="numeric"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor={holderId} className="text-sm text-text-secondary">Cardholder Name</Label>
                <Input id={holderId} placeholder="Name on card" value={holderName} onChange={(e) => setHolderName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor={expiryId} className="text-sm text-text-secondary">Expiry (MM/YY)</Label>
                  <Input id={expiryId} placeholder="09/28" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} inputMode="numeric" />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={cvvId} className="text-sm text-text-secondary">CVV</Label>
                  <Input id={cvvId} placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" type="password" />
                </div>
              </div>
              <p className="text-xs text-text-muted">
                CVV is used for verification only and is never stored. Card numbers are stored masked (last 4 digits).
              </p>
              <Button onPress={addCard} isDisabled={saving}>
                {saving ? "Adding..." : "Add Card"}
              </Button>
            </div>
          </div>
        )}

        {(profile?.paymentMethods || []).length === 0 ? (
          <p className="text-sm text-text-muted">No payment methods yet. Add a credit or debit card to get started.</p>
        ) : (
          <div className="grid gap-3">
            {profile.paymentMethods.map((card) => {
              const isDefault = profile.defaultPaymentMethod === String(card._id);
              return (
                <div
                  key={card._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
                    isDefault ? "border-primary-500/50 bg-primary-500/5" : "border-border-default bg-bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-text-primary">
                        {card.brand || "Card"} &bull;&bull;&bull;&bull; {card.last4}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {card.holderName} &middot; Expires {card.expiry}
                      </p>
                    </div>
                    {isDefault && (
                      <span className="flex items-center gap-1 text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isDefault && (
                      <button
                        onClick={() => setDefaultCard(card._id)}
                        className="text-xs text-primary-400 hover:text-primary-500 font-medium px-2 py-1.5 rounded-lg hover:bg-primary-500/10 transition-colors"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      onClick={() => removeCard(card._id)}
                      className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Remove card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-border-default">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              onClick={() => toggleAutoPay(!profile?.autoPay)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                profile?.autoPay ? "bg-primary-500" : "bg-bg-muted"
              }`}
              aria-pressed={profile?.autoPay}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  profile?.autoPay ? "translate-x-5" : ""
                }`}
              />
            </button>
            <span className="text-sm text-text-secondary">
              Auto payment
              {profile?.autoPay && (
                <span className="ml-2 text-xs text-success flex items-center gap-1">
                  <Check className="w-3 h-3" /> On — will use your default card
                </span>
              )}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { userType } = useAuth();
  const Layout = userType === "customer" ? ShopLayout : DashboardLayout;

  return (
    <Layout>
      <ProfileContent />
    </Layout>
  );
}