"use client";

import { auth } from "@/app/lib/firebase";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Label } from "react-aria-components";

export default function Login() {
    const router = useRouter();
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
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
            console.log('Successfully login into your account')
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Welcome back
            </h2>
            <p className="text-sm text-slate-500 mb-8">
                Sign in with your email and password to continue.
            </p>

            <div className="flex flex-col gap-4">
                <div className="w-full grid gap-2">
                    <Label htmlFor={id} className="text-sm text-slate-700">
                        Email
                    </Label>
                    <Input
                        id={id}
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        className='text-black'
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="w-full grid gap-2">
                    <Label htmlFor={passwordId} className="text-sm text-slate-700">
                        Password
                    </Label>
                    <Input
                        id={passwordId}
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        className='text-black'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleLogin}
                    isDisabled={loading}
                    className="w-full"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </Button>
            </div>
        </div>
    );
}