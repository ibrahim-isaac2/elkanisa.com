import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeContext";

const inter = Inter({ subsets: ["latin"] });

// تصدير metadata (مش لازم 'use client' هنا)
export const metadata: Metadata = {
  title: "الــــكـــنـــيــســة",
  description: "تطبيق عرض الترانيم والكتاب المقدس مع دعم التشغيل بدون إنترنت",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" type="image/png" href="/icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}