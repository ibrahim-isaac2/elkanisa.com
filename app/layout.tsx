import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeContext";

const inter = Inter({ subsets: ["latin"] });

// تصدير metadata
export const metadata: Metadata = {
  title: "الكنيسة - ترانيم الكنسية والكتاب المقدس بدون إنترنت",
  description: "استمتع بترانيم كنسية، الكتاب المقدس النصي والمسموع، وخدمات كنسية بدون إنترنت مع تطبيق الكنيسة.",
  keywords: ["ترانيم الكنسية", "الكتاب المقدس", "تطبيق الكنيسة", "ترانيم بدون إنترنت", "خدمات كنسية"], // كلمات مفتاحية
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
        {/* Open Graph Tags */}
        <meta property="og:title" content="الكنيسة - ترانيم والكتاب المقدس" />
        <meta
          property="og:description"
          content="تطبيق الكنيسة يقدم ترانيم كنسية، الكتاب المقدس النصي والمسموع، وخدمات بدون إنترنت."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://elkanisa.com" />
        <meta property="og:type" content="website" />
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="الكنيسة - ترانيم والكتاب المقدس" />
        <meta
          name="twitter:description"
          content="تطبيق الكنيسة يقدم ترانيم كنسية، الكتاب المقدس، وخدمات بدون إنترنت."
        />
        <meta name="twitter:image" content="/og-image.png" />
        {/* Schema Markup للصفحة الرئيسية */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "الكنيسة",
              "url": "https://elkanisa.com",
              "description":
                "تطبيق الكنيسة لعرض الترانيم الكنسية، الكتاب المقدس، وإدارة الخدمات الكنسية بدون إنترنت.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://elkanisa.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
