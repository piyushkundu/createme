import type { Metadata, Viewport } from "next";
import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreateMe India Map Challenge",
  description: "Test your knowledge of Indian states with this interactive map quiz.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-[100dvh] bg-[#020617] text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-100`}>
        <main className="flex-1 w-full mx-auto relative flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
