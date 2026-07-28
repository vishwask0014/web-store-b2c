"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { auth, db } from "@/app/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Label } from "react-aria-components";

export default function SignIn() {
    const router = useRouter();
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
            await setDoc(doc(db, "users", cred.user.uid), {
                name,
                email,
                role: "customer",
                createdAt: new Date().toISOString(),
            });
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl">Create Account</h2>

            <div className="max-w-sm w-full grid gap-2">
                <Label htmlFor={nameId}>Name</Label>
                <Input
                    id={nameId}
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    className='text-black'
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="max-w-sm w-full grid gap-2">
                <Label htmlFor={emailId}>Email</Label>
                <Input
                    id={emailId}
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    className='text-black'
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="max-w-sm w-full grid gap-2">
                <Label htmlFor={passwordId}>Password</Label>
                <Input
                    id={passwordId}
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    className='text-black'
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
                variant="primary"
                size="sm"
                onClick={handleSignIn}
                isDisabled={loading}
            >
                {loading ? "Creating account..." : "Create Account"}
            </Button>
        </div>
    );
}
