import { Button } from "@/components/tailgrids/core/button";
import Logo from "@/app/components/common/Logo";
import Link from "next/link";
import {
  Store,
  Package,
  Wrench,
  ArrowRight,
  Sparkles,
  Users,
  Shield,
  UserPlus,
  ClipboardList,
  DollarSign,
  ShoppingBag,
  Briefcase,
  Building2,
} from "lucide-react";

const stats = [
  { label: "Active Sellers", value: "2,400+" },
  { label: "Products Listed", value: "12,000+" },
  { label: "Services Available", value: "5,800+" },
  { label: "Happy Customers", value: "50,000+" },
];

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up as a seller or service provider. Set up your store profile in minutes.",
  },
  {
    icon: ClipboardList,
    title: "List Products & Services",
    description:
      "Add your products, set prices, and define service charges for your work.",
  },
  {
    icon: DollarSign,
    title: "Start Earning",
    description:
      "Customers discover your listings. Fulfill orders and grow your business.",
  },
];

const features = [
  {
    icon: Package,
    title: "Product Listings",
    description:
      "List physical products with images, descriptions, and pricing.",
  },
  {
    icon: Wrench,
    title: "Service Catalog",
    description:
      "Offer services with custom pricing — hourly rates, fixed fees, or add-ons.",
  },
  {
    icon: Store,
    title: "Service Charges",
    description:
      "Add service charges on top of product prices for installation, delivery, or setup.",
  },
  {
    icon: Users,
    title: "Multi-Operator",
    description:
      "Multiple operators can list under one store. Assign who handles what.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description:
      "Built-in payment processing so you get paid on time, every time.",
  },
  {
    icon: Sparkles,
    title: "Easy Management",
    description:
      "Dashboard to manage listings, track orders, and view earnings.",
  },
];

const categories = [
  {
    icon: ShoppingBag,
    title: "Product Sellers",
    examples: "Home cleaners, tools, equipment, packaged goods",
    description:
      "List your products, set inventory, and manage orders from a single dashboard.",
  },
  {
    icon: Briefcase,
    title: "Service Providers",
    examples: "Cleaners, repair technicians, installers, consultants",
    description:
      "Offer your skills with flexible pricing — add service charges for extra work.",
  },
  {
    icon: Building2,
    title: "Operators",
    examples: "Multi-service companies, agencies, teams",
    description:
      "Manage a team of operators under one account. Each operator can list their own offerings.",
  },
];

const heroItems = [
  { icon: Package, label: "Eco Cleaner Bottle", price: "$24.99" },
  { icon: Wrench, label: "Deep Cleaning Service", price: "$89.00" },
  { icon: Package, label: "Professional Mop Kit", price: "$49.99" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border-default bg-bg-primary/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-text-secondary md:flex">
            <Link href="/shop" className="transition-colors hover:text-text-primary">
              Shop
            </Link>
            <Link
              href="#features"
              className="transition-colors hover:text-text-primary"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="transition-colors hover:text-text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#categories"
              className="transition-colors hover:text-text-primary"
            >
              Categories
            </Link>
          </nav>
          <Link href="/auth">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-bg-primary via-bg-primary to-bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-400">
                <Sparkles className="h-4 w-4" />
                The marketplace for service providers
              </div>
              <h1 className="text-4xl font-bold leading-tight text-text-primary sm:text-5xl lg:text-6xl">
                List your products & services.
                <span className="block text-primary-400">
                  Grow your business.
                </span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
                Whether you sell home cleaning products, offer repair services, or
                provide professional tools — list everything in one place. Set your
                own prices, add service charges, and reach customers who need what
                you offer.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth">
                  <Button variant="primary" size="lg" className="gap-2">
                    Start Selling <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="primary" appearance="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-border-default bg-bg-surface p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/20 text-primary-400">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      HomeClean Co.
                    </p>
                    <p className="text-xs text-text-muted">Service Provider</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {heroItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-border-default bg-bg-muted px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-primary-400" />
                        <span className="text-sm text-text-secondary">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-success/20 bg-success/10 px-4 py-2.5 text-center text-sm text-success">
                  + Add service charges available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border-default bg-bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Get started in three simple steps. No complicated setup required.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/20 text-primary-400">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-bg-muted text-xs font-bold text-text-muted">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Tools to help you list, manage, and sell your products and services.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border-default bg-bg-primary p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Who Is This For?
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Built for independent sellers, service professionals, and small
              businesses.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="group rounded-2xl border border-border-default bg-bg-surface p-8 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                  <cat.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  {cat.title}
                </h3>
                <p className="mb-4 text-sm font-medium text-text-muted">
                  {cat.examples}
                </p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-bg-primary via-bg-primary to-bg-surface py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Ready to start selling?
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Create your store in minutes. List products, offer services, set your
            own charges — all from one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/auth">
              <Button variant="primary" size="lg" className="gap-2">
                Create Your Store <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default bg-bg-primary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Logo showText={false} />
              <span className="text-sm font-semibold text-text-primary">
                B2C Store
              </span>
            </div>
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} B2C Store. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
