"use client";

import { auth } from "@/app/lib/firebase";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { sendPasswordResetEmail } from "firebase/auth";
import { useId, useState } from "react";
import { Label } from "react-aria-components";
import { inputClass, labelClass, errorClass, successClass } from "./authStyles";

export default function ForgotPassword() {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        setError("");
        setSent(false);
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
            setTimeout(() => {
                setIsOpen(false);
                setEmail("");
                setSent(false);
            }, 2500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-sm text-blue-400 transition-colors hover:text-blue-300"
            >
                Forgot password?
            </button>

            <Dialog
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                className="border-white/10 bg-zinc-900"
            >
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Reset your password</DialogTitle>
                    <DialogDescription>
                        Enter the email address associated with your account and we&apos;ll
                        send you a link to reset your password.
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="text-zinc-400">
                    <div className="grid gap-2">
                        <Label htmlFor={id} className={labelClass}>
                            Email
                        </Label>
                        <input
                            id={id}
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {error && (
                        <p className="mt-3 text-sm text-red-400">{error}</p>
                    )}
                    {sent && (
                        <p className={successClass}>Check your inbox for the reset link.</p>
                    )}
                </DialogBody>
                <DialogFooter>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="h-10 rounded-full border border-white/10 px-5 text-sm font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={loading}
                        className="h-10 rounded-full bg-blue-500 px-5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </DialogFooter>
            </Dialog>
        </>
    );
}