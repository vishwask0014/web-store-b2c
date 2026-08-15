import Login from "@/app/components/AuthForm/Login";
import SignIn from "@/app/components/AuthForm/SignIn";
import PhoneLogin from "@/app/components/AuthForm/PhoneLogin";
import { Suspense } from "react";
import Link from "next/link";
import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";
import { Store, BarChart3, Zap, ShieldCheck } from "lucide-react";
import Logo from "@/app/components/common/Logo";

const FEATURES = [
  { icon: Store, title: "Sell to thousands", desc: "Launch your store and reach customers across the marketplace." },
  { icon: BarChart3, title: "Real-time analytics", desc: "Track revenue, orders and inventory as they happen." },
  { icon: Zap, title: "Fast onboarding", desc: "From sign-up to first product in under five minutes." },
];

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 p-4">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <Link href="/" aria-label="B2C Store Home" className="relative mb-8 flex justify-center transition-opacity hover:opacity-80">
        <Logo />
      </Link>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50 md:grid-cols-[1.1fr_1fr]">
        {/* LEFT — form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-zinc-100">B2C Store</p>
              <p className="text-[11px] text-zinc-500">Marketplace for sellers</p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="text-sm text-zinc-500">Loading...</div>
            }
          >
            <TabRoot variant="minimal" defaultValue="signUp" className="border-0 !p-0">
              <TabList>
                <div className="flex w-fit rounded-full border border-white/10 bg-zinc-950 p-1">
                  <TabTrigger
                    value="signUp"
                    className="rounded-full px-4 py-2 text-sm font-medium text-zinc-500 transition-colors data-[active=true]:bg-blue-500 data-[active=true]:text-white"
                  >
                    Sign Up
                  </TabTrigger>
                  <TabTrigger
                    value="signIn"
                    className="rounded-full px-4 py-2 text-sm font-medium text-zinc-500 transition-colors data-[active=true]:bg-blue-500 data-[active=true]:text-white"
                  >
                    Sign In
                  </TabTrigger>
                  <TabTrigger
                    value="phone"
                    className="rounded-full px-4 py-2 text-sm font-medium text-zinc-500 transition-colors data-[active=true]:bg-blue-500 data-[active=true]:text-white"
                  >
                    Phone OTP
                  </TabTrigger>
                </div>
              </TabList>

              <TabContent value="signUp" className="pt-8 px-0">
                <Login />
              </TabContent>

              <TabContent value="signIn" className="pt-8 px-0">
                <SignIn />
              </TabContent>

              <TabContent value="phone" className="pt-8 px-0">
                <PhoneLogin />
              </TabContent>
            </TabRoot>
          </Suspense>
        </div>

        {/* RIGHT — brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-l border-white/5 bg-zinc-950/60 p-10 md:flex">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
          <div>

            <div className="relative">
              <h2 className="text-2xl font-bold leading-snug tracking-tight text-zinc-100">
                Your marketplace,
                <br />
                <span className="text-blue-400">your store.</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                One account for buying and selling. Create your store, list products, and start earning.
              </p>
            </div>

            <div className="relative flex flex-col gap-4 mt-8">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-zinc-900 text-blue-400">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{f.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-2 text-xs text-zinc-600">
            <div>
              <div className="text-emerald-500/70 flex gap-1 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500/70" />
                Secured by
              </div>
              <span className="text-zinc-400">
                Firebase Authentication
              </span>
            </div>
            <div>
              Need help?<br />
              <span className="font-medium text-zinc-400 mt-1">support@b2cstore.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
