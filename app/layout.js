import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";

export const metadata = {
  title: "Marketplace — List Products & Services",
  description: "A marketplace for sellers and service providers to list products, services, and set their own charges.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
