import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Pacifico } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cursive",
});

export const metadata: Metadata = {
  title: "createme.in | India Map Challenge",
  description: "Test your knowledge of Indian geography with this interactive map quiz.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${pacifico.variable}`}>
      <body className="min-h-[100dvh] flex flex-col font-sans antialiased">
        <main className="flex-1 w-full mx-auto relative flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
