"use client";

import { auth } from "@/app/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import useAuthStore from "@/app/stores/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Label } from "react-aria-components";
import { motion } from "framer-motion";
import { Phone, MessageSquareCode } from "lucide-react";
import { headingClass, subheadingClass, labelClass, inputClass, buttonClass, errorClass } from "./authStyles";

const FIREBASE_ERRORS = {
  "auth/invalid-phone-number": "Enter a valid phone number with country code (e.g. +1 555 555 5555).",
  "auth/missing-phone-number": "Enter your phone number with country code.",
  "auth/quota-exceeded": "Too many SMS requests. Please try again later.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/code-expired": "This code has expired. Request a new one.",
  "auth/invalid-verification-code": "The code you entered is incorrect. Try again.",
  "auth/missing-verification-code": "Enter the 6-digit code you received.",
  "auth/popup-blocked": "The verification popup was blocked. Allow popups and try again.",
  "auth/captcha-check-failed": "Verification failed. Please try again.",
};

function friendlyError(code, fallback) {
  return FIREBASE_ERRORS[code] || fallback;
}

export default function PhoneLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const phoneId = useId();
  const nameId = useId();
  const codeId = useId();

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const sendOtp = async () => {
    setError("");
    if (!/^\+\d{7,15}$/.test(phone.trim())) {
      setError("Enter your full number with country code, e.g. +91 98765 43210");
      return;
    }
    setLoading(true);
    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      const result = await signInWithPhoneNumber(auth, phone.trim(), verifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err) {
      setError(friendlyError(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (!confirmationResult) {
      setError("Session expired. Please request a new code.");
      setStep("phone");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const cred = await confirmationResult.confirm(code.trim());
      const idToken = await cred.user.getIdToken();
      await useAuthStore.getState().login(idToken, name.trim() || undefined);
      router.replace(redirect);
    } catch (err) {
      setError(friendlyError(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={`${headingClass} mb-2 flex items-center gap-2.5`}>
        {step === "phone" ? (
          <>
            <Phone className="h-6 w-6 text-blue-400" /> Phone Sign In
          </>
        ) : (
          <>
            <MessageSquareCode className="h-6 w-6 text-blue-400" /> Verify Code
          </>
        )}
      </h2>
      <p className={subheadingClass}>
        {step === "phone"
          ? "We'll text you a one-time code. No password needed."
          : `Enter the 6-digit code sent to ${phone}.`}
      </p>

      <div className="flex flex-col gap-4">
        {step === "phone" ? (
          <>
            <div className="w-full grid gap-2">
              <Label htmlFor={nameId} className={labelClass}>
                Name (first time only)
              </Label>
              <input
                id={nameId}
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="w-full grid gap-2">
              <Label htmlFor={phoneId} className={labelClass}>
                Phone Number
              </Label>
              <input
                id={phoneId}
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        ) : (
          <div className="w-full grid gap-2">
            <Label htmlFor={codeId} className={labelClass}>
              Verification Code
            </Label>
            <input
              id={codeId}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClass} text-center text-lg tracking-[0.5em]`}
            />
          </div>
        )}

        <div id="recaptcha-container" />

        {error && <p className={errorClass}>{error}</p>}

        {step === "otp" && (
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="self-start text-sm text-zinc-500 underline transition-colors hover:text-zinc-300"
          >
            Change phone number
          </button>
        )}

        <button
          onClick={step === "phone" ? sendOtp : verifyOtp}
          disabled={loading}
          className={buttonClass}
        >
          {loading
            ? step === "phone"
              ? "Sending code..."
              : "Verifying..."
            : step === "phone"
              ? "Send OTP"
              : "Verify & Sign In"}
        </button>
      </div>
    </motion.div>
  );
}
