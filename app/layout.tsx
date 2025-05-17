import Head from "next/head";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <Head>
        <title>الكنيسة</title>
        <meta name="description" content="استمتع بترانيم كنسية، الكتاب المقدس النصي والمسموع، آية اليوم، خدمات كنسية، وتطبيق ديني بدون إنترنت مع الكنيسة." />
        <meta name="keywords" content="ترانيم كنسية, الكتاب المقدس, آية اليوم, تطبيق كنسي عربي, ترانيم روحية, الكتاب المقدس بالعربية, تطبيق ديني بدون إنترنت" />
        <meta property="og:title" content="الكنيسة - ترانيم وكتاب مقدس" />
        <meta property="og:description" content="استمتع بترانيم كنسية، الكتاب المقدس النصي والمسموع، وآية اليوم." />
        <meta property="og:image" content="https://elkanisa.com/og-image.jpg" />
        <meta property="og:url" content="https://elkanisa.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="الكنيسة" />
        <meta name="twitter:description" content="استمتع بترانيم كنسية، الكتاب المقدس النصي والمسموع، وآية اليوم." />
        <meta name="twitter:image" content="https://elkanisa.com/og-image.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "الكنيسة",
            "url": "https://elkanisa.com",
            "description": "موقع ديني يقدم ترانيم كنسية، الكتاب المقدس النصي والمسموع، وآية اليوم."
          })}
        </script>
      </Head>
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
