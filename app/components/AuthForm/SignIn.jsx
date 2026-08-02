"use client";

import { auth } from "@/app/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Label } from "react-aria-components";
import { motion } from "framer-motion";
import useAuthStore from "@/app/stores/authStore";
import { headingClass, subheadingClass, labelClass, inputClass, buttonClass, errorClass } from "./authStyles";
import { friendlyAuthError } from "./firebaseErrors";

export default function SignIn() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";
    const nameId = useId();
    const emailId = useId();
    const passwordId = useId();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName: name });

            const idToken = await cred.user.getIdToken();
            await useAuthStore.getState().login(idToken, name);

            const role = useAuthStore.getState().user?.role;
            router.replace(role === "customer" ? "/shop" : redirect);
        } catch (err) {
            setError(friendlyAuthError(err));
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
            <h2 className={`${headingClass} mb-2`}>Create Account</h2>
            <p className={subheadingClass}>Create your account to get started.</p>

            <div className="flex flex-col gap-4">
                <div className="w-full grid gap-2">
                    <Label htmlFor={nameId} className={labelClass}>Name</Label>
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
                    <Label htmlFor={emailId} className={labelClass}>Email</Label>
                    <input
                        id={emailId}
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className="w-full grid gap-2">
                    <Label htmlFor={passwordId} className={labelClass}>Password</Label>
                    <input
                        id={passwordId}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {error && <p className={errorClass}>{error}</p>}

                <button
                    onClick={handleSignIn}
                    disabled={loading}
                    className={buttonClass}
                >
                    {loading ? "Creating account..." : "Create Account"}
                </button>
            </div>
        </motion.div>
    );
}
