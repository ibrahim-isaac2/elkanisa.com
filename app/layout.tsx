import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeContext";

const inter = Inter({ subsets: ["latin"] });

// تصدير Metadata لكل الصفحات
export const metadata: Metadata = {
  title: "الكنيسة",
  description:
    "اكتشف تطبيق الكنيسة لتحميل ترانيم كنسية بدون إنترنت، قراءة وسماع الكتاب المقدس النصي والمسموع، آية يومية مسيحية، إدارة خدمات كنسية، تسجيل حضور، وعروض تقديمية بجودة عالية في تطبيق ديني عربي سهل الاستخدام.",
  keywords: [
    "ترانيم كنسية",
    "ترانيم بدون إنترنت",
    "الكتاب المقدس",
    "الكتاب المقدس مسموع",
    "الكتاب المقدس نصي",
    "آية اليوم",
    "تطبيق الكنيسة",
    "خدمات كنسية",
    "تطبيق ديني عربي",
    "ترانيم مسيحية",
    "ترانيم نص وموسيقى",
    "سجل حضور كنسي",
    "عروض تقديمية كنسية",
    "شات بوت ديني",
    "تطبيق كنسي بدون إنترنت",
    "ترانيم عربية",
    "الكتاب المقدس بالعربية",
    "آيات يومية مسيحية",
    "محاضرات كنسية",
    "ترانيم كنسية 2025",
    "تطبيق مسيحي عربي",
    "خدمات كنسية أونلاين",
    "إضافة ترانيم",
    "الكتاب المقدس أوفلاين",
    "ترانيم كنسية مجانية",
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
        <link rel="shortcut icon" type="image/png" href="/icon.png" />
        <meta name="theme-color" content="#000000" />
        {/* Preload critical CSS for faster loading */}
        <link rel="preload" href="/globals.css" as="style" />
        {/* Open Graph Tags */}
        <meta
          property="og:title"
          content="الكنيسة - ترانيم كنسية والكتاب المقدس بدون إنترنت"
        />
        <meta
          property="og:description"
          content="اكتشف تطبيق الكنيسة لتحميل ترانيم كنسية بدون إنترنت، قراءة وسماع الكتاب المقدس، آية يومية، خدمات كنسية، وعروض تقديمية بجودة عالية."
        />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://elkanisa.com" />
        <meta property="og:type" content="website" />
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="الكنيسة - ترانيم كنسية والكتاب المقدس بدون إنترنت"
        />
        <meta
          name="twitter:description"
          content="اكتشف تطبيق الكنيسة لترانيم كنسية، الكتاب المقدس النصي والمسموع، آية يومية، وخدمات بدون إنترنت."
        />
        <meta name="twitter:image" content="/og-image.png" />
        {/* Schema Markup للموقع */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "الكنيسة",
              "url": "https://elkanisa.com",
              "description":
                "تطبيق الكنيسة لتحميل ترانيم كنسية، قراءة وسماع الكتاب المقدس، آية يومية، إدارة خدمات كنسية، تسجيل حضور، وعروض تقديمية بدون إنترنت.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://elkanisa.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Schema Markup لتطبيق PWA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MobileApplication",
              "name": "الكنيسة",
              "operatingSystem": "Web",
              "applicationCategory": "Lifestyle",
              "description":
                "تطبيق الكنيسة يقدم ترانيم كنسية، الكتاب المقدس النصي والمسموع، آية يومية، وخدمات كنسية بدون إنترنت.",
              "url": "https://elkanisa.com",
              "image": "/og-image.png",
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
