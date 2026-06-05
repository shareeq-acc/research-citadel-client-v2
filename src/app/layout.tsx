import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Research Citadel",
  description: "Encrypted scientific peer annotation ledger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-neo-bg text-neo-dark font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
