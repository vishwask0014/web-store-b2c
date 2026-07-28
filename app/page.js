import { Button } from "@/components/tailgrids/core/button";
import { Store, Package, Wrench, ArrowRight, Sparkles, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white">
              ▲
            </div>
            <span className="text-lg font-semibold text-slate-900">Marketplace</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900">How It Works</a>
            <a href="#categories" className="hover:text-slate-900">Categories</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </a>
            <a href="/auth">
              <Button variant="primary" size="sm">Get Started</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
                <Sparkles className="h-4 w-4" />
                The marketplace for service providers
              </div>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                List your products & services.
                <span className="block text-indigo-400">Grow your business.</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-slate-300">
                Whether you sell home cleaning products, offer repair services, or provide
                professional tools — list everything in one place. Set your own prices, add
                service charges, and reach customers who need what you offer.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/auth">
                  <Button variant="primary" size="lg" className="gap-2 bg-indigo-500 hover:bg-indigo-400">
                    Start Selling <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button variant="primary" appearance="outline" size="lg" className="border-slate-600 text-slate-200 hover:border-slate-500 hover:text-white">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">HomeClean Co.</p>
                      <p className="text-xs text-slate-400">Service Provider</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: Package, label: "Eco Cleaner Bottle", price: "$24.99" },
                      { icon: Wrench, label: "Deep Cleaning Service", price: "$89.00" },
                      { icon: Package, label: "Professional Mop Kit", price: "$49.99" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-indigo-400" />
                          <span className="text-sm text-slate-200">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-center text-sm text-emerald-400">
                    + Add service charges available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Active Sellers", value: "2,400+" },
              { label: "Products Listed", value: "12,000+" },
              { label: "Services Available", value: "5,800+" },
              { label: "Happy Customers", value: "50,000+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">
              Get started in three simple steps. No complicated setup required.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up as a seller or service provider. Set up your store profile in minutes.",
              },
              {
                step: "02",
                title: "List Products & Services",
                description: "Add your products, set prices, and define service charges for your work.",
              },
              {
                step: "03",
                title: "Start Earning",
                description: "Customers discover your listings. Fulfill orders and grow your business.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                  {item.step}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything You Need</h2>
            <p className="mt-4 text-lg text-slate-600">
              Tools to help you list, manage, and sell your products and services.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Package,
                title: "Product Listings",
                description: "List physical products with images, descriptions, and pricing.",
              },
              {
                icon: Wrench,
                title: "Service Catalog",
                description: "Offer services with custom pricing — hourly rates, fixed fees, or add-ons.",
              },
              {
                icon: Store,
                title: "Service Charges",
                description: "Add service charges on top of product prices for installation, delivery, or setup.",
              },
              {
                icon: Users,
                title: "Multi-Operator",
                description: "Multiple operators can list under one store. Assign who handles what.",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Built-in payment processing so you get paid on time, every time.",
              },
              {
                icon: Sparkles,
                title: "Easy Management",
                description: "Dashboard to manage listings, track orders, and view earnings.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Who Is This For?</h2>
            <p className="mt-4 text-lg text-slate-600">
              Built for independent sellers, service professionals, and small businesses.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Product Sellers",
                examples: "Home cleaners, tools, equipment, packaged goods",
                description: "List your products, set inventory, and manage orders from a single dashboard.",
                color: "bg-indigo-500",
              },
              {
                title: "Service Providers",
                examples: "Cleaners, repair technicians, installers, consultants",
                description: "Offer your skills with flexible pricing — add service charges for extra work.",
                color: "bg-emerald-500",
              },
              {
                title: "Operators",
                examples: "Multi-service companies, agencies, teams",
                description: "Manage a team of operators under one account. Each operator can list their own offerings.",
                color: "bg-amber-500",
              },
            ].map((cat) => (
              <div key={cat.title} className="group rounded-xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className={`mb-4 h-1.5 w-12 rounded-full ${cat.color}`} />
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{cat.title}</h3>
                <p className="mb-4 text-sm font-medium text-slate-500">{cat.examples}</p>
                <p className="text-sm leading-relaxed text-slate-600">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to start selling?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Create your store in minutes. List products, offer services, set your own charges — all from one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/auth">
              <Button variant="primary" size="lg" className="gap-2 bg-indigo-500 hover:bg-indigo-400">
                Create Your Store <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white">
                ▲
              </div>
              <span className="text-sm font-semibold text-slate-900">Marketplace</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}