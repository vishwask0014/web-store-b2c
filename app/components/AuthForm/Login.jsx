"use client";

import { auth } from "@/app/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Label } from "react-aria-components";
import { motion } from "framer-motion";
import useAuthStore from "@/app/stores/authStore";
import ForgotPassword from "./ForgotPassword";
import { headingClass, subheadingClass, labelClass, inputClass, buttonClass, errorClass } from "./authStyles";
import { friendlyAuthError } from "./firebaseErrors";

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";
    const id = useId();
    const passwordId = useId();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await cred.user.getIdToken();
            await useAuthStore.getState().login(idToken);
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
            <h2 className={`${headingClass} mb-2`}>Welcome back</h2>
            <p className={subheadingClass}>Sign in with your email and password to continue.</p>

            <div className="flex flex-col gap-4">
                <div className="w-full grid gap-2">
                    <Label htmlFor={id} className={labelClass}>Email</Label>
                    <input
                        id={id}
                        type="email"
                        placeholder="Enter your email"
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
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className="flex justify-end w-full">
                    <ForgotPassword />
                </div>

                {error && <p className={errorClass}>{error}</p>}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={buttonClass}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </div>
        </motion.div>
    );
}
