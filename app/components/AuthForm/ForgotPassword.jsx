"use client";

import { auth } from "@/app/lib/firebase";
import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { sendPasswordResetEmail } from "firebase/auth";
import { useId, useState } from "react";
import { Label } from "react-aria-components";

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
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
            >
                Forgot password?
            </button>

            <Dialog isOpen={isOpen} onOpenChange={setIsOpen} className="w-sm">
                <DialogHeader>
                    <DialogTitle>Reset your password</DialogTitle>
                    <DialogDescription>
                        Enter the email address associated with your account and we&apos;ll
                        send you a link to reset your password.
                    </DialogDescription>
                </DialogHeader>
                <DialogBody>
                    <div className="grid gap-2">
                        <Label htmlFor={id} className="text-sm text-slate-700">
                            Email
                        </Label>
                        <Input
                            id={id}
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}
                    {sent && (
                        <p className="mt-2 text-sm text-emerald-600">
                            Check your inbox for the reset link.
                        </p>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button appearance="outline" onPress={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onPress={handleReset}
                        isDisabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}