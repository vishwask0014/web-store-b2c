import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import SplashGate from "@/components/splash/SplashGate";

export const metadata = {
  title: "B2C Store — Buy Products & Services from Local Stores",
  description:
    "B2C Store is a marketplace where local sellers list products and services, and customers browse, shop, and pay.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <SplashGate />
      </body>
    </html>
  );
}
