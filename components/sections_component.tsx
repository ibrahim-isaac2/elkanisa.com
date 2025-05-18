"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/app/ThemeContext";

// هذا المكون سيكون مخفياً بصرياً ولكنه سيكون موجوداً في الكود لمحركات البحث
const SEOSectionsComponent = () => {
  const { theme } = useTheme();
  
  // قائمة الأقسام الرئيسية في الموقع
  const sections = [
    { id: "text-bible", title: "الكتاب المقدس النصي", description: "قراءة الكتاب المقدس النصي بطريقة احترافية" },
    { id: "word-and-melody-hymns", title: "ترانيم الكلمة واللحن", description: "مجموعة من ترانيم الكلمة واللحن المسيحية" },
    { id: "audio-bible", title: "الكتاب المقدس المسموع", description: "استمع إلى الكتاب المقدس بصوت واضح" },
    { id: "add-lecture", title: "إضافة محاضرة", description: "إضافة محاضرات دينية وروحية" },
    { id: "add-hymn", title: "إضافة ترنيمة", description: "إضافة ترانيم جديدة إلى المكتبة" },
    { id: "attendance-record", title: "سجل الحضور", description: "تسجيل حضور الاجتماعات والخدمات" },
    { id: "powerpoint-section", title: "العروض التقديمية", description: "عروض تقديمية للاجتماعات والخدمات" },
    { id: "competitions-section", title: "المسابقات", description: "مسابقات متنوعة خاصة بالبرنامج المشترك" },
    { id: "daily-verse", title: "آية اليوم", description: "آية يومية من الكتاب المقدس للتأمل" },
    { id: "chat-bot", title: "المساعد الآلي", description: "مساعد آلي للإجابة على الأسئلة الروحية" },
    { id: "songs", title: "الترانيم", description: "مكتبة كاملة من الترانيم المسيحية" }
  ];

  return (
    <nav 
      aria-label="أقسام الموقع" 
      className="sr-only" // مخفي بصرياً ولكن متاح لقارئات الشاشة ومحركات البحث
    >
      <h2 className="sr-only">أقسام الموقع</h2>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <Link 
              href={`/#${section.id}`} 
              aria-label={section.title}
              data-description={section.description}
            >
              {section.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// هذا المكون سيكون مخفياً بصرياً ولكنه سيحتوي على روابط لكل الترانيم
const HiddenSongsLinks = () => {
  // هذا المكون سيتم ملؤه ديناميكياً بالترانيم من ملف songs.json
  return (
    <div className="sr-only">
      <h2>الترانيم</h2>
      <p>مكتبة كاملة من الترانيم المسيحية تشمل ترانيم التسبيح والعبادة والتأمل</p>
      {/* هنا سيتم إضافة روابط لكل الترانيم ديناميكياً */}
    </div>
  );
};

// المكون الرئيسي الذي سيتم إضافته إلى الصفحة
export default function SectionsComponent() {
  return (
    <div className="sr-only">
      <SEOSectionsComponent />
      <HiddenSongsLinks />
    </div>
  );
}
