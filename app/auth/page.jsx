import Login from "@/app/components/AuthForm/Login";
import SignIn from "@/app/components/AuthForm/SignIn";
import PhoneLogin from "@/app/components/AuthForm/PhoneLogin";
import { Suspense } from "react";
import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";

export default function AuthPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary p-4">
            <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl grid md:grid-cols-2 bg-bg-surface border border-border-default">
                {/* LEFT — form panel */}
                <div className="p-8 sm:p-10 flex flex-col justify-center">
                    <Suspense
                        fallback={
                            <div className="text-sm text-text-secondary">Loading...</div>
                        }
                    >
                        <TabRoot variant="minimal" defaultValue="signUp" className="border-0 !p-0">
                        <TabList>
                            <div className="flex gap-0 border-b border-border-divider w-full">
                                <TabTrigger
                                    value="signUp"
                                    className="px-4 py-2.5 text-sm font-medium text-text-muted data-[active=true]:text-text-primary border-b-2 border-transparent data-[active=true]:border-primary-500 rounded-none"
                                >
                                    Sign Up
                                </TabTrigger>
                                <TabTrigger
                                    value="signIn"
                                    className="px-4 py-2.5 text-sm font-medium text-text-muted data-[active=true]:text-text-primary border-b-2 border-transparent data-[active=true]:border-primary-500 rounded-none"
                                >
                                    Sign In
                                </TabTrigger>
                                <TabTrigger
                                    value="phone"
                                    className="px-4 py-2.5 text-sm font-medium text-text-muted data-[active=true]:text-text-primary border-b-2 border-transparent data-[active=true]:border-primary-500 rounded-none"
                                >
                                    Phone OTP
                                </TabTrigger>
                            </div>
                        </TabList>

                        <TabContent value="signUp" className="pt-6 px-0">
                            <Login />
                        </TabContent>

                        <TabContent value="signIn" className="pt-6 px-0">
                            <SignIn />
                        </TabContent>

                        <TabContent value="phone" className="pt-6 px-0">
                            <PhoneLogin />
                        </TabContent>
                        </TabRoot>
                    </Suspense>
                </div>

                {/* RIGHT — brand panel */}
                <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-bg-primary to-primary-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center font-bold text-text-primary text-sm">
                            S
                        </div>
                        <span className="text-lg font-medium text-text-muted">
                            Store
                        </span>
                    </div>

                    <div>
                        <p className="text-xl leading-snug text-text-primary">
                            One account, however you&apos;d rather sign in.
                        </p>
                    </div>

                    <div className="text-sm text-text-muted">
                        Need help? Contact us via{" "}
                        <span className="text-text-secondary font-medium">
                            support@store.com
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}