import Login from "@/app/components/AuthForm/Login";
import SignIn from "@/app/components/AuthForm/SignIn";
import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";

export default function page() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-xl grid md:grid-cols-2 bg-white">
                {/* LEFT — form panel */}
                <div className="p-8 sm:p-10 w-fit flex flex-col justify-center">
                    <TabRoot defaultValue="signUp" className="w-fit">
                        <TabList className="flex gap-2 border-b border-slate-200 !w-fit">
                            <TabTrigger
                                className="px-4 py-2 text-sm font-medium text-slate-500 data-[selected]:text-slate-900 data-[selected]:border-b-2 data-[selected]:border-indigo-500"
                                value="signUp"
                            >
                                Sign Up
                            </TabTrigger>
                            <TabTrigger
                                className="px-4 py-2 text-sm font-medium text-slate-500 data-[selected]:text-slate-900 data-[selected]:border-b-2 data-[selected]:border-indigo-500"
                                value="signIn"
                            >
                                Sign In
                            </TabTrigger>

                        </TabList>

                        <TabContent value="signUp">
                            <Login />
                        </TabContent>

                        <TabContent value="signIn">
                            <SignIn />
                        </TabContent>
                    </TabRoot>
                </div>

                {/* RIGHT — brand panel */}
                <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 text-white">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold">
                            ▲
                        </div>
                        <span className="text-lg font-medium text-white/60">
                            Your Brand
                        </span>
                    </div>

                    <div>
                        <p className="text-lg leading-snug text-white/90">
                            One account, however you'd rather sign in — email and
                            password, or your phone.
                        </p>
                    </div>

                    <div className="text-sm text-white/50">
                        Need help? Contact us via{" "}
                        <span className="text-white/80 font-medium">
                            support@yourbrand.com
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}