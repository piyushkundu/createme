import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "createme.in — India Map Challenge",
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
      <body
        style={{ fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif" }}
        className="min-h-[100dvh] flex flex-col"
      >
        <main className="flex-1 w-full mx-auto relative flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
