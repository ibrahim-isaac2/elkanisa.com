"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/ThemeContext";
import { cn } from "@/lib/utils";

export default function CompetitionsSection() {
  const { theme } = useTheme();

  return (
    <section
      className={cn(
        "py-8 sm:py-12 px-4 sm:px-6 text-center",
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black",
      )}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white rounded-full flex items-center justify-center">
            <Image
              src="/BM.png"
              alt="BM Logo"
              width={64}
              height={64}
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain"
            />
          </div>
          <h2
            className={cn(
              "text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900",
            )}
          >
            مسابقات متنوعة خاصة بالبرنامج المشترك بالمنيا
          </h2>
        </div>
        <Button
          asChild
          className={cn(
            "px-6 py-3 text-base xs:text-lg sm:text-xl md:text-2xl font-bold rounded-lg transition-colors duration-300",
            theme === "dark"
              ? "bg-blue-700 hover:bg-blue-800 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white",
          )}
        >
          <a
            href="https://competitions-hema.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ابدأ الآن
          </a>
        </Button>
      </div>
    </section>
  );
}
