import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/components/TelegramProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Telegram Mini App",
  description: "A premium mini app built with Next.js for Telegram",
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
      <head>
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          defer
        />
      </head>
      <body className={inter.variable}>
        <ThemeProvider>
          <TelegramProvider>{children}</TelegramProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
