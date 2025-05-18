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
import SectionHandler from "@/components/SectionHandler"; // استيراد المكون غير المرئي
import SEOWrapper from "@/components/seo_wrapper"; // استيراد مكون SEO الجديد
import { useEffect, useState } from "react";

export default function Home() {
  const [isOnline, setIsOnline] = useState(true);

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
    window.removeEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* إضافة مكون SEO الجديد (مخفي بصرياً) */}
      <SEOWrapper />
      
      {/* إضافة المكون غير المرئي */}
      <SectionHandler />
      
      {!isOnline && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center">
          أنت في وضع عدم الاتصال. بعض الوظائف قد تكون محدودة.
        </div>
      )}
      <main className="container mx-auto p-6 space-y-8 flex-1">
        <Header />
        <h1 className="text-3xl font-bold text-center">
        </h1>
        <HeroSection />
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* إضافة معرفات للأقسام فقط بدون تغيير الشكل */}
          <div id="text-bible">
            <TextBible />
          </div>
          
          <div id="word-and-melody-hymns">
            <WordAndMelodyHymns />
          </div>
          
          <div id="audio-bible">
            <AudioBible />
          </div>
          
          <div id="add-lecture">
            <AddLecture />
          </div>
          
          <div id="add-hymn">
            <AddHymn />
          </div>
          
          <div id="attendance-record">
            <AttendanceRecord />
          </div>
          
          <div id="powerpoint-section">
            <PowerPointSection />
          </div>
          
          <div id="competitions-section">
            <CompetitionsSection />
          </div>
        </div>
      </main>
      <InstallButton />
      
      <div id="footer">
        <Footer />
      </div>
      
      <div id="daily-verse">
        <DailyVerse />
      </div>
      
      <div id="chat-bot">
        <ChatBot />
      </div>
    </div>
  );
}
