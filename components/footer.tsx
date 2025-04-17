"use client";

import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/app/ThemeContext";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme } = useTheme();
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    // جلب عدد الزوار الحالي
    fetch("/api/visitor")
      .then((res) => res.json())
      .then((data) => setVisitorCount(data.count));

    // زيادة عدد الزوار مع كل تحميل للصفحة
    fetch("/api/visitor", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setVisitorCount(data.count));
  }, []); // يتنفذ مرة واحدة لما الصفحة تتحمل

  return (
    <footer
      className={`py-6 px-4 min-h-[300px] w-full mt-auto transition-colors duration-300 ${
        theme === "dark" ? "bg-black" : "bg-gray-50"
      }`}
      dir="rtl"
      style={{ zIndex: 10 }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-start items-start gap-8 md:gap-20">
          <div className="text-right w-full md:w-2/3 order-2 md:order-1 md:mr-auto">
            <h3
              className={`text-2xl xs:text-3xl font-bold mb-1 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              م/ إبراهيم إسحق
            </h3>
            <p
              className={`text-base xs:text-lg ${
                theme === "dark" ? "text-white" : "text-gray-700"
              } mb-4`}
            >
              مهندس أمن سيبراني، كاتب، مصمم جرافيك
            </p>

            <h4
              className={`text-xl xs:text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              عن التطبيق
            </h4>
            <p
              className={`text-base xs:text-lg ${
                theme === "dark" ? "text-white" : "text-gray-700"
              } leading-relaxed`}
            >
              تطبيق مساعد للخدام لعرض الترانيم والكتاب المقدس بطريقة احترافية
              وسهل الاستخدام. يمكنك استخدام هذا التطبيق في اجتماعات الكنيسة
              والخدمات المختلفة.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start order-1 md:order-2 w-full md:w-auto">
            <div className="relative w-40 h-40 xs:w-48 xs:h-48">
              <img
                src="/myfooter.jpg"
                alt="Ibrahim Isaac"
                className="w-full h-full rounded-full object-cover absolute top-0 left-0 z-10"
              />
              <motion.div
                className="absolute top-0 left-0 w-full h-full rounded-full bg-transparent border-4 border-transparent"
                animate={{
                  rotate: 360,
                  borderImage: [
                    "linear-gradient(45deg, #4b5bdc, #d14bd4, #ffaa00, #00ffaa) 1",
                    "linear-gradient(45deg, #ffaa00, #00ffaa, #4b5bdc, #d14bd4) 1",
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                }}
                style={{
                  boxShadow:
                    "0 0 20px rgba(75, 91, 220, 0.7), 0 0 40px rgba(209, 75, 212, 0.5), 0 0 60px rgba(255, 170, 0, 0.6)",
                  filter: "blur(2px)",
                }}
              />
            </div>

            <p
              className={`text-base xs:text-lg ${
                theme === "dark" ? "text-white" : "text-gray-900"
              } mt-4 font-medium`}
            >
              ibrahim isaac
            </p>

            <div className="flex gap-4 xs:gap-6 mt-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  <Instagram className="h-5 xs:h-6 w-5 xs:w-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  <Twitter className="h-5 xs:h-6 w-5 xs:w-6" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="https://www.facebook.com/share/1AJSJen6xu/?mibextid=qi2Omg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  <Facebook className="h-5 xs:h-6 w-5 xs:w-6" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  <Linkedin className="h-5 xs:h-6 w-5 xs:w-6" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </motion.div>
            </div>

            <div className="flex gap-3 mt-4">
              <Link
                href="/portfolio"
                className={`border ${
                  theme === "dark"
                    ? "border-white text-white hover:bg-gray-800"
                    : "border-gray-900 text-gray-900 hover:bg-gray-200"
                } px-4 xs:px-6 py-1 hover:bg-transparent text-sm transition-colors`}
              >
                Portfolio
              </Link>
              <Link
                href="mailto:contact@example.com"
                className={`border ${
                  theme === "dark"
                    ? "border-white text-white hover:bg-gray-800"
                    : "border-gray-900 text-gray-900 hover:bg-gray-200"
                } px-4 xs:px-6 py-1 hover:bg-transparent text-sm transition-colors`}
              >
                Email me
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mt-6 text-center ${
          theme === "dark" ? "text-white" : "text-gray-700"
        }`}
      >
        <p className="text-sm">
          عدد الزوار: {visitorCount} | © 2025 ابراهيم اسحق . جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}