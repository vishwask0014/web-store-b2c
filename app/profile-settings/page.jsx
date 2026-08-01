"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useId, useState, useEffect } from "react";
import DashboardLayout from "@/app/components/common/dashboardLayout";
import ShopLayout from "@/app/components/common/ShopLayout";
import {
  CreditCard,
  MapPin,
  Trash2,
  Plus,
  Star,
  User as UserIcon,
  Check,
  Smartphone,
  Wallet,
  Landmark,
} from "lucide-react";
import { inputClass, labelClass, errorClass, successClass } from "@/app/components/AuthForm/authStyles";

function PayoutCard({ userType, profile, onSaved }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const payout = profile?.payout;

  const [type, setType] = useState(payout?.type || "bank");
  const [accountHolder, setAccountHolder] = useState(payout?.accountHolder || "");
  const [accountNumber, setAccountNumber] = useState(payout?.accountNumber || "");
  const [ifsc, setIfsc] = useState(payout?.ifsc || "");
  const [bankName, setBankName] = useState(payout?.bankName || "");
  const [upiId, setUpiId] = useState(payout?.upiId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setType(payout?.type || "bank");
    setAccountHolder(payout?.accountHolder || "");
    setAccountNumber(payout?.accountNumber || "");
    setIfsc(payout?.ifsc || "");
    setBankName(payout?.bankName || "");
    setUpiId(payout?.upiId || "");
  }, [payout]);

  const save = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, payout: { type, accountHolder, accountNumber, ifsc, bankName, upiId } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Payout details saved.");
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!["seller", "operator", "admin"].includes(userType)) return null;

  return (
    <div className="rounded-3xl border border-white/5 bg-[#18181B] p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Payout Settings</h2>
            <p className="text-xs text-zinc-500">Where you receive your share — {100 - 6}% of every sale</p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
          6% platform fee
        </span>
      </div>

      {(error || success) && (
        <div className={error ? errorClass : successClass}>{error || success}</div>
      )}

      <div className="grid max-w-lg gap-4">
        <div className="flex w-fit gap-1 rounded-xl border border-white/5 bg-zinc-950 p-1">
          <button
            onClick={() => setType("bank")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              type === "bank" ? "bg-blue-500/15 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Landmark className="h-4 w-4" /> Bank account
          </button>
          <button
            onClick={() => setType("upi")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              type === "upi" ? "bg-blue-500/15 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Smartphone className="h-4 w-4" /> UPI
          </button>
        </div>

        {type === "bank" ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className={labelClass}>Account Holder Name</label>
                <input className={inputClass} value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className={labelClass}>Account Number</label>
                <input
                  className={inputClass}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <label className={labelClass}>IFSC Code</label>
                <input
                  className={inputClass}
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="HDFC0001234"
                />
              </div>
              <div className="grid gap-2">
                <label className={labelClass}>Bank Name</label>
                <input className={inputClass} value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>
            </div>
            {payout?.accountNumber && (
              <p className="text-xs text-zinc-500">
                On file: {payout.accountHolder} · ••••{payout.accountNumber.slice(-4)} ({payout.bankName || "bank"})
              </p>
            )}
          </>
        ) : (
          <>
            <div className="grid gap-2">
              <label className={labelClass}>UPI ID</label>
              <input
                className={inputClass}
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
              />
            </div>
            {payout?.upiId && (
              <p className="text-xs text-zinc-500">On file: {payout.upiId}</p>
            )}
          </>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-fit rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.99] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Payout Details"}
        </button>
        <p className="text-xs text-zinc-600">
          Payouts are automatically sent when an order is marked delivered — {100 - 6}% of the order value, with 6%
          deducted as the B2C Store platform fee.
        </p>
      </div>
    </div>
  );
}

function ProfileContent() {
  const { user, userType } = useAuth();
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
  const [methodType, setMethodType] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

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
    if (uid) {
      void Promise.resolve().then(fetchProfile);
    }
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

  const addUpi = async () => {
    setError("");
    setSuccess("");
    if (!upiId.trim()) {
      setError("UPI ID is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          addUpi: { upiId, holderName: holderName.trim() || "" },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setUpiId("");
      setHolderName("");
      setShowCardForm(false);
      setSuccess("UPI ID added.");
      fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removePaymentMethod = async (methodId) => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, removePaymentMethod: methodId }),
    });
    if (res.ok) {
      setSuccess("Payment method removed.");
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
    return <div className="text-sm text-zinc-500">Loading profile...</div>;
  }

  const SectionHeader = ({ icon: Icon, title, action }) => (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      </div>
      {action}
    </div>
  );

  const AddButton = () => (
    <button
      onClick={() => setShowCardForm(!showCardForm)}
      className="flex w-fit items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98]"
    >
      <Plus className="h-4 w-4" />
      {showCardForm ? "Cancel" : "Add Payment Method"}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Profile</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your details, location, and payment methods</p>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-fit rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.99] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {(error || success) && (
        <div className={error ? errorClass : successClass}>{error || success}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-[#18181B] p-6">
          <SectionHeader icon={UserIcon} title="Personal Details" />
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor={nameId} className={labelClass}>
                  Full Name
                </label>
                <input id={nameId} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor={phoneId} className={labelClass}>
                  Phone
                </label>
                <input
                  id={phoneId}
                  className={inputClass}
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className={labelClass}>Email (login)</label>
              <input value={profile?.email || ""} disabled className={`${inputClass} opacity-50`} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#18181B] p-6">
          <SectionHeader icon={MapPin} title="Location" />
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor={addrId} className={labelClass}>
                Address
              </label>
              <input
                id={addrId}
                className={inputClass}
                placeholder="Street address"
                value={location.address || ""}
                onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor={cityId} className={labelClass}>
                  City
                </label>
                <input
                  id={cityId}
                  className={inputClass}
                  value={location.city || ""}
                  onChange={(e) => setLocation((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={stateId} className={labelClass}>
                  State
                </label>
                <input
                  id={stateId}
                  className={inputClass}
                  value={location.state || ""}
                  onChange={(e) => setLocation((prev) => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={zipId} className={labelClass}>
                  Zip / Postal Code
                </label>
                <input
                  id={zipId}
                  className={inputClass}
                  value={location.zip || ""}
                  onChange={(e) => setLocation((prev) => ({ ...prev, zip: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={countryId} className={labelClass}>
                  Country
                </label>
                <input
                  id={countryId}
                  className={inputClass}
                  value={location.country || ""}
                  onChange={(e) => setLocation((prev) => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#18181B] p-6">
        <SectionHeader icon={CreditCard} title="Payment Methods" action={<AddButton />} />

        {showCardForm && (
          <div className="mb-4 rounded-2xl border border-white/5 bg-zinc-950 p-4">
            <div className="grid gap-3 max-w-md">
              <div className="flex w-fit gap-1 rounded-xl border border-white/5 bg-zinc-950 p-1">
                <button
                  onClick={() => setMethodType("card")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    methodType === "card" ? "bg-blue-500/15 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Card
                </button>
                <button
                  onClick={() => setMethodType("upi")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    methodType === "upi" ? "bg-blue-500/15 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> UPI
                </button>
              </div>

              {methodType === "card" ? (
                <>
                  <div className="grid gap-1">
                    <label htmlFor={cardNumId} className={labelClass}>
                      Card Number
                    </label>
                    <input
                      id={cardNumId}
                      className={inputClass}
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor={holderId} className={labelClass}>
                      Cardholder Name
                    </label>
                    <input
                      id={holderId}
                      className={inputClass}
                      placeholder="Name on card"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1">
                      <label htmlFor={expiryId} className={labelClass}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        id={expiryId}
                        className={inputClass}
                        placeholder="09/28"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor={cvvId} className={labelClass}>
                        CVV
                      </label>
                      <input
                        id={cvvId}
                        className={inputClass}
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        inputMode="numeric"
                        type="password"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    CVV is used for verification only and is never stored. Card numbers are stored masked (last 4
                    digits).
                  </p>
                  <button
                    onClick={addCard}
                    disabled={saving}
                    className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.99] disabled:opacity-50"
                  >
                    {saving ? "Adding..." : "Add Card"}
                  </button>
                </>
              ) : (
                <>
                  <div className="grid gap-1">
                    <label className={labelClass}>UPI ID</label>
                    <input
                      className={inputClass}
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor={holderId} className={labelClass}>
                      Name (optional)
                    </label>
                    <input
                      id={holderId}
                      className={inputClass}
                      placeholder="Name linked to UPI"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Pay directly from your bank account at checkout using your UPI ID.
                  </p>
                  <button
                    onClick={addUpi}
                    disabled={saving}
                    className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.99] disabled:opacity-50"
                  >
                    {saving ? "Adding..." : "Add UPI"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {(profile?.paymentMethods || []).length === 0 ? (
          <p className="text-sm text-zinc-500">No payment methods yet. Add a card or UPI ID to get started.</p>
        ) : (
          <div className="grid gap-3">
            {profile.paymentMethods.map((method) => {
              const isDefault = profile.defaultPaymentMethod === String(method._id);
              const isUpi = method.type === "upi";
              return (
                <div
                  key={method._id}
                  className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                    isDefault ? "border-blue-500/40 bg-blue-500/5" : "border-white/5 bg-zinc-950"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                      {isUpi ? <Smartphone className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                    </div>
                    <div>
                      {isUpi ? (
                        <>
                          <p className="text-sm font-medium text-zinc-100">{method.upiId}</p>
                          {method.holderName && (
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {method.holderName} &middot; UPI
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-zinc-100">
                            {method.brand || "Card"} &bull;&bull;&bull;&bull; {method.last4}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {method.holderName} &middot; Expires {method.expiry}
                          </p>
                        </>
                      )}
                    </div>
                    {isDefault && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                        <Star className="h-3 w-3" /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!isDefault && (
                      <button
                        onClick={() => setDefaultCard(method._id)}
                        className="rounded-lg px-2 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/10 hover:text-blue-300"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      onClick={() => removePaymentMethod(method._id)}
                      className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Remove payment method"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 border-t border-white/5 pt-5">
          <label className="flex cursor-pointer items-center gap-3">
            <button
              onClick={() => toggleAutoPay(!profile?.autoPay)}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                profile?.autoPay ? "bg-blue-500" : "bg-zinc-800"
              }`}
              aria-pressed={profile?.autoPay}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  profile?.autoPay ? "translate-x-5" : ""
                }`}
              />
            </button>
            <span className="text-sm text-zinc-400">
              Auto payment
              {profile?.autoPay && (
                <span className="ml-2 flex items-center gap-1 text-xs text-emerald-400">
                  <Check className="h-3 w-3" /> On — will use your default card
                </span>
              )}
            </span>
          </label>
        </div>
      </div>

      <PayoutCard userType={userType} profile={profile} onSaved={fetchProfile} />
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
