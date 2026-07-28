"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Label } from "react-aria-components";


export default function Login() {
    const route = useRouter();
    const id = useId();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState();


    const handleLogin = () => {
        signInWithEmailAndPassword({ email, password }).then({

        })

    }


    return (
        <>

            <div className="flex flex-col">
                <h2 className="text-2xl ">Sign Up</h2>

                <div className="flex flex-col gap-4">
                    <div className="max-w-sm w-full grid gap-2">
                        <Label htmlFor={id}>Email</Label>
                        <Input id={id} placeholder="Enter your email" />
                    </div>

                    <div className="max-w-sm w-full grid gap-2">
                        <Label htmlFor={id}>Password</Label>
                        <Input id={id} placeholder="Enter your Password" />
                    </div>

                    <Button variant="primary" size="sm" onClick={handleLogin}>Submit</Button>
                </div>
            </div>

        </>
    )
}