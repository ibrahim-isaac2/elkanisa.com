import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeContext";

const inter = Inter({ subsets: ["latin"] });

// تصدير metadata مع كلمات مفتاحية شاملة
export const metadata: Metadata = {
  title: "تطبيق الكنيسة",
  description: "استمتع بترانيم كنسية، الكتاب المقدس النصي والمسموع، آية اليوم، خدمات كنسية، وتطبيق ديني بدون إنترنت مع تطبيق الكنيسة. اكتشف ترانيم كلمات وألحان، تسجيل حضور، وعروض تقديمية دينية.",
  keywords: [
    "تطبيق الكنيسة",
    "ترانيم كنسية",
    "ترانيم بدون إنترنت",
    "الكتاب المقدس",
    "الكتاب المقدس النصي",
    "الكتاب المقدس المسموع",
    "خدمات كنسية",
    "آية اليوم",
    "ترانيم كلمات وألحان",
    "تطبيق كنسي عربي",
    "ترانيم روحية",
    "الكتاب المقدس بالعربية",
    "تطبيق ديني بدون إنترنت",
    "تسجيل حضور كنسي",
    "عروض تقديمية كنسية",
    "شات بوت ديني",
    "ترانيم مسيحية عربية",
    "الكتاب المقدس الصوتي",
    "تطبيق ترانيم كنسية",
    "خدمات الكنيسة بدون إنترنت",
    "آيات يومية ملهمة",
    "ترانيم كنسية للصلاة",
    "الكتاب المقدس للقراءة",
    "تطبيق ديني للمسيحيين",
    "ترانيم كنسية مع الكلمات",
    "خدمات روحية عربية"
  ],
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
        {/* تحسينات الـ Favicon */}
        <link rel="shortcut icon" type="image/png" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        {/* Open Graph Tags */}
        <meta property="og:title" content="تطبيق الكنيسة - ترانيم كنسية والكتاب المقدس بدون إنترنت" />
        <meta
          property="og:description"
          content="تطبيق الكنيسة يقدم ترانيم كنسية، الكتاب المقدس النصي والمسموع، آية اليوم، وخدمات كنسية بدون إنترنت."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://elkanisa.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="تطبيق الكنيسة" />
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="تطبيق الكنيسة - ترانيم كنسية والكتاب المقدس" />
        <meta
          name="twitter:description"
          content="تطبيق الكنيسة يقدم ترانيم كنسية، الكتاب المقدس النصي والمسموع، وخدمات كنسية بدون إنترنت."
        />
        <meta name="twitter:image" content="/og-image.png" />
        {/* Schema Markup للصفحة الرئيسية */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "تطبيق الكنيسة",
              "url": "https://elkanisa.com",
              "description":
                "تطبيق الكنيسة لعرض الترانيم الكنسية، الكتاب المقدس النصي والمسموع، آية اليوم، وإدارة الخدمات الكنسية بدون إنترنت.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://elkanisa.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Schema Markup للوجو */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "تطبيق الكنيسة",
              "url": "https://elkanisa.com",
              "logo": "https://elkanisa.com/icon.png",
              "sameAs": [
                "https://x.com/elkanisa"
              ]
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
