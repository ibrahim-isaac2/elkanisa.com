import { Metadata } from "next";
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
import OfflineHandler from "@/components/OfflineHandler";

// إضافة Metadata مخصصة للصفحة الرئيسية
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "الكنيسة - ترانيم كنسية والكتاب المقدس بدون إنترنت",
    description:
      "اكتشف تطبيق الكنيسة لتحميل ترانيم كنسية بدون إنترنت، قراءة وسماع الكتاب المقدس النصي والمسموع، آية يومية مسيحية، إدارة خدمات كنسية، تسجيل حضور، وعروض تقديمية بجودة عالية.",
    keywords: [
      "ترانيم كنسية",
      "ترانيم بدون إنترنت",
      "الكتاب المقدس",
      "الكتاب المقدس مسموع",
      "آية اليوم",
      "تطبيق الكنيسة",
      "خدمات كنسية",
      "تطبيق ديني عربي",
      "ترانيم مسيحية",
      "سجل حضور كنسي",
      "عروض تقديمية كنسية",
      "شات بوت ديني",
      "ترانيم كنسية 2025",
      "الكتاب المقدس أوفلاين",
      "ترانيم كنسية مجانية",
    ],
  };
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <OfflineHandler />
      <main className="container mx-auto p-6 space-y-8 flex-1">
        <Header />
        <h1 className="text-3xl font-bold text-center">
          الكنيسة - ترانيم كنسية والكتاب المقدس بدون إنترنت
        </h1>
        <HeroSection />
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* قسم الكتاب المقدس النصي */}
          <section>
            <h2 className="text-2xl font-semibold">الكتاب المقدس النصي</h2>
            <p>اقرأ الكتاب المقدس باللغة العربية بدون إنترنت مع تطبيق الكنيسة.</p>
            <TextBible />
            <a href="/text-bible" className="text-blue-600 hover:underline">
              تصفح الكتاب المقدس النصي
            </a>
          </section>

          {/* قسم الترانيم */}
          <section>
            <h2 className="text-2xl font-semibold">ترانيم كنسية</h2>
            <p>استمتع بتحميل ترانيم كنسية بدون إنترنت مع كلمات وموسيقى بجودة عالية.</p>
            <WordAndMelodyHymns />
            <a href="/hymns" className="text-blue-600 hover:underline">
              اكتشف المزيد من الترانيم
            </a>
          </section>

          {/* قسم الكتاب المقدس المسموع */}
          <section>
            <h2 className="text-2xl font-semibold">الكتاب المقدس المسموع</h2>
            <p>استمع إلى الكتاب المقدس باللغة العربية أوفلاين في أي وقت.</p>
            <AudioBible />
            <a href="/audio-bible" className="text-blue-600 hover:underline">
              استمع الآن
            </a>
          </section>

          {/* قسم إضافة محاضرة */}
          <section>
            <h2 className="text-2xl font-semibold">إضافة محاضرة</h2>
            <p>أضف محاضرات كنسية وشاركها مع المجتمع الكنسي بسهولة.</p>
            <AddLecture />
          </section>

          {/* قسم إضافة ترنيمة */}
          <section>
            <h2 className="text-2xl font-semibold">إضافة ترنيمة</h2>
            <p>أضف ترانيم كنسية جديدة مع كلمات وموسيقى لإثراء مكتبة الترانيم.</p>
            <AddHymn />
          </section>

          {/* قسم سجل الحضور */}
          <section>
            <h2 className="text-2xl font-semibold">سجل الحضور</h2>
            <p>تابع حضور الخدمات الكنسية بسهولة مع سجل الحضور الإلكتروني.</p>
            <AttendanceRecord />
          </section>

          {/* قسم العروض التقديمية */}
          <section>
            <h2 className="text-2xl font-semibold">عروض تقديمية كنسية</h2>
            <p>استعرض وأنشئ عروض تقديمية للخدمات الكنسية بجودة عالية.</p>
            <PowerPointSection />
          </section>

          {/* قسم آية اليوم */}
          <section>
            <h2 className="text-2xl font-semibold">آية اليوم</h2>
            <p>استلهم يوميًا بآية من الكتاب المقدس مع تطبيق الكنيسة.</p>
            <DailyVerse />
          </section>

          {/* قسم الشات بوت */}
          <section>
            <h2 className="text-2xl font-semibold">شات بوت ديني</h2>
            <p>تواصل مع شات بوت الكنيسة للإجابة على أسئلتك الدينية في أي وقت.</p>
            <ChatBot />
          </section>
        </div>
      </main>
      <InstallButton />
      <Footer />
    </div>
  );
}
