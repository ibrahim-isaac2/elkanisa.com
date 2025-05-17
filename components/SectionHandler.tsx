"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SectionHandler() {
  const router = useRouter();
  
  useEffect(() => {
    // تحديث URL عند التمرير إلى قسم معين
    const handleScroll = () => {
      // الحصول على جميع الأقسام
      const sections = [
        'text-bible',
        'word-and-melody-hymns',
        'audio-bible',
        'add-lecture',
        'add-hymn',
        'attendance-record',
        'powerpoint-section',
        'competitions-section',
        'daily-verse',
        'chat-bot',
        'footer'
      ];
      
      // تحديد القسم الحالي المرئي
      let currentSection = '';
      let minDistance = Infinity;
      
      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          // حساب المسافة من أعلى الشاشة
          const distance = Math.abs(rect.top);
          
          // إذا كان هذا القسم أقرب إلى أعلى الشاشة
          if (distance < minDistance) {
            minDistance = distance;
            currentSection = sectionId;
          }
        }
      });
      
      // تحديث URL فقط إذا كان القسم الحالي مختلفًا عن القسم في URL
      if (currentSection && window.location.pathname !== `/${currentSection}`) {
        window.history.replaceState({ sectionId: currentSection }, '', `/${currentSection}`);
      }
    };
    
    // استخدام throttle لتحسين الأداء (تنفيذ الدالة مرة كل 200 مللي ثانية)
    let timeout: NodeJS.Timeout;
    const throttledScroll = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          handleScroll();
          timeout = null;
        }, 200);
      }
    };
    
    // التعامل مع التحميل الأولي للصفحة
    const handleInitialLoad = () => {
      const path = window.location.pathname;
      if (path !== '/' && path.length > 1) {
        const sectionId = path.substring(1); // إزالة الشرطة المائلة الأولى
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        } else {
          // إذا لم يتم العثور على القسم، قم بإعادة التوجيه إلى الصفحة الرئيسية
          router.push('/');
        }
      }
    };
    
    // التعامل مع أزرار التنقل للمتصفح (الرجوع والتقدم)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.sectionId) {
        const section = document.getElementById(event.state.sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // إذا كان المستخدم في الصفحة الرئيسية
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    window.addEventListener('scroll', throttledScroll);
    window.addEventListener('popstate', handlePopState);
    handleInitialLoad();
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(timeout);
    };
  }, [router]);
  
  return null; // هذا المكون لا يعرض أي شيء
}
