"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Script from "next/script";

// تحويل اسم الترنيمة إلى رابط صديق للسيو
const slugify = (title: string): string => {
  return title
    .replace(/[\u064B-\u065F]/g, "") // إزالة التشكيل
    .replace(/[^\u0600-\u06FF\w\s]/g, "") // الاحتفاظ بالحروف العربية والإنجليزية والأرقام
    .replace(/\s+/g, "-") // استبدال المسافات بشرطات
    .toLowerCase();
};

// مكون البيانات المنظمة للترانيم
const HymnStructuredData = ({ songs }: { songs: any[] }) => {
  return (
    <>
      {songs.map((song, index) => {
        const hymnSlug = slugify(song.title);
        const structuredData = {
          "@context": "https://schema.org",
          "@type": "MusicComposition",
          "name": song.title,
          "url": `https://elkanisa.com/hymns/${hymnSlug}`,
          "inLanguage": song.title.match(/[a-zA-Z]/) ? "en" : "ar",
          "lyrics": {
            "@type": "CreativeWork",
            "text": song.verses ? song.verses.flat().join("\n") : ""
          },
          "musicCompositionForm": "Hymn",
          "keywords": [
            "ترانيم كنسية",
            "ترانيم مسيحية",
            "ترانيم روحية",
            song.title,
            ...(song.verses ? song.verses.flat().slice(0, 5) : [])
          ]
        };

        return (
          <Script
            key={`hymn-structured-data-${index}`}
            id={`hymn-structured-data-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        );
      })}
    </>
  );
};

// مكون روابط الترانيم المخفية
const HiddenHymnsLinks = ({ songs }: { songs: any[] }) => {
  return (
    <div className="sr-only">
      <h2>الترانيم</h2>
      <p>مكتبة كاملة من الترانيم المسيحية تشمل ترانيم التسبيح والعبادة والتأمل</p>
      <ul>
        {songs.map((song, index) => {
          const hymnSlug = slugify(song.title);
          return (
            <li key={`hymn-link-${index}`}>
              <Link 
                href={`/hymns/${hymnSlug}`}
                aria-label={`ترنيمة ${song.title}`}
              >
                {song.title}
              </Link>
              <div>
                {song.verses && song.verses.flat().slice(0, 3).map((verse: string, vIndex: number) => (
                  <p key={`verse-${index}-${vIndex}`}>{verse}</p>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// المكون الرئيسي
export default function SEOHymnsComponent() {
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    // تحميل بيانات الترانيم
    const loadSongs = async () => {
      try {
        const response = await fetch('/songs.json');
        if (!response.ok) {
          throw new Error('فشل تحميل الترانيم');
        }
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error('خطأ في تحميل الترانيم:', error);
      }
    };

    loadSongs();
  }, []);

  if (songs.length === 0) {
    return null;
  }

  return (
    <>
      <Head>
        <title>الترانيم - الكنيسة</title>
        <meta name="description" content="مكتبة كاملة من الترانيم المسيحية تشمل ترانيم التسبيح والعبادة والتأمل" />
      </Head>
      
      <HymnStructuredData songs={songs} />
      <HiddenHymnsLinks songs={songs} />
    </>
  );
}
