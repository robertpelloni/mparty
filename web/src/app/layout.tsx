import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mparty WebEngine Dashboard",
  description: "WebAssembly emulation dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased bg-black text-white`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
