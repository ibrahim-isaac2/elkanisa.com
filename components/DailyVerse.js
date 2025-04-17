"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5"; // استيراد أيقونة الإغلاق
import { FaBible } from "react-icons/fa"; // استيراد أيقونة الكتاب المقدس

export default function DailyVerse() {
  const [verse, setVerse] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);

  // دالة لتحويل النص المشفر من Unicode إلى عربي
  const decodeUnicode = (str) => {
    return str.replace(/\\u([0-9A-Fa-f]{4})/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
  };

  useEffect(() => {
    console.log("Starting to fetch verse...");
    fetch("/bible_arabic_full.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Data fetched successfully:", data);
        if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
          throw new Error("Verses data is not an array or is empty");
        }
        const randomIndex = Math.floor(Math.random() * data.verses.length);
        const selectedVerse = data.verses[randomIndex];
        console.log("Selected verse:", selectedVerse);
        if (!selectedVerse || !selectedVerse.book_name) {
          throw new Error("Selected verse is invalid or missing book_name");
        }
        setVerse({
          book: decodeUnicode(selectedVerse.book_name),
          chapter: selectedVerse.chapter,
          verse: selectedVerse.verse,
          text: decodeUnicode(selectedVerse.text),
        });
        setIsVisible(true);
      })
      .catch((error) => {
        console.error("Error fetching verse:", error);
        setError(error.message);
      });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  console.log("Rendering... isVisible:", isVisible, "verse:", verse, "error:", error);

  if (error) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-[1000] transition-all duration-300">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-2xl max-w-md w-[90%] text-center relative border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
          <p className="text-red-500 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!isVisible || !verse) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-[1000] transition-all duration-300">
      <div className="relative bg-gradient-to-br from-white to-blue-50 p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%] text-center border border-blue-100 transform transition-all duration-500 hover:scale-105">
        {/* زر الإغلاق */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <IoClose size={24} />
        </button>

        {/* العنوان مع الأيقونة */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <FaBible className="text-blue-500" size={24} />
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700">آية الان </h2>
        </div>

        {/* الشاهد (اسم الكتاب، الإصحاح، الآية) */}
        <p className="text-lg md:text-xl font-semibold text-gray-800 mb-3 bg-blue-100 py-2 rounded-lg">
          {verse.book} {verse.chapter}:{verse.verse}
        </p>

        {/* نص الآية */}
        <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 px-2">
          {verse.text}
        </p>

        {/* زر تم القراءة */}
        <button
          onClick={handleClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-md"
        >
          تم القراءة
        </button>
      </div>
    </div>
  );
}