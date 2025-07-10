'use client';

import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import AddHymn from "@/components/add-hymn";
import AudioBible from "@/components/audio-bible";
import InstallButton from "@/components/install-button";
import AddLecture from "@/components/add-lecture";
import AttendanceRecord from "@/components/attendance-record";
import WordAndMelodyHymns from "@/components/word-and-melody-hymns";
import Footer from "@/components/footer";
import TextBible from "@/components/TextBible";
import PowerPointSection from "@/components/PowerPointSection";
import DailyVerse from "@/components/DailyVerse";
import ChatBot from "@/components/ChatBot";
import CompetitionsSection from "@/components/CompetitionsSection";
import { useEffect, useState } from "react";

export default function Home() {
  const [isOnline, setIsOnline] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // تسجيل الـ Service Worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // مراقبة حالة الاتصال
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // قائمة الأقسام لشريط التنقل
  const sections = [
    { id: "word-and-melody-hymns", label: "ترانيم كلمة ولحن", component: <WordAndMelodyHymns /> },
    { id: "audio-bible", label: "الكتاب المقدس المسموع", component: <AudioBible /> },
    { id: "add-lecture", label: "إضافة محاضرة", component: <AddLecture /> },
    { id: "attendance-record", label: "تسجيل الحضور", component: <AttendanceRecord /> },
    { id: "powerpoint-section", label: "عروض تقديمية", component: <PowerPointSection /> },
    { id: "competitions-section", label: "المسابقات", component: <CompetitionsSection /> },
    { id: "daily-verse", label: "آية اليوم", component: <DailyVerse /> },
  ];

  // التعامل مع فتح الشات بوت
  const toggleChatBot = () => {
    const chatButton = document.querySelector('button[aria-label="فتح المحادثة"]');
    if (chatButton instanceof HTMLElement) {
      chatButton.click(); // محاكاة ضغط زر الأيقونة العائمة
    }
    setActiveSection(null); // إلغاء أي قسم مفتوح آخر
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!isOnline && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center">
          أنت في وضع عدم الاتصال. بعض الوظائف قد تكون محدودة.
        </div>
      )}
      <main className="container mx-auto p-6 space-y-8 flex-1">
        <Header />
        <HeroSection />
        <div className="space-y-8 max-w-4xl mx-auto">
          <TextBible />
          <AddHymn />
        </div>

        {/* شريط التنقل */}
        <nav className="bg-sidebar-background shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-sidebar-foreground mb-4 text-center">
            استكشف المزيد
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                }}
                className="bg-sidebar-primary text-sidebar-primary-foreground px-4 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
              >
                {section.label}
              </button>
            ))}
            <button
              onClick={toggleChatBot}
              className="bg-sidebar-primary text-sidebar-primary-foreground px-4 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
            >
              الشات بوت
            </button>
          </div>
        </nav>

        {/* عرض القسم المختار */}
        {activeSection && (
          <div className="mt-8 max-w-4xl mx-auto animate-fadeOnce">
            {sections.find((section) => section.id === activeSection)?.component}
          </div>
        )}

        {/* عرض الشات بوت */}
        <ChatBot />
      </main>
      <InstallButton />
      <Footer />
    </div>
  );
}
