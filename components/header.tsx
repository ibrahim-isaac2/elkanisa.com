"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/app/ThemeContext"

export default function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Set isMounted to true after the component mounts on the client
  useEffect(() => {
    setIsMounted(true)
    setCurrentTime(new Date())
  }, [])

  // Update the time every second, but only on the client
  useEffect(() => {
    if (isMounted) {
      const timer = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isMounted])

  // Format the time only if the component is mounted and currentTime is set
  const formattedTime = isMounted && currentTime
    ? currentTime.toLocaleTimeString("ar-EG", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "Loading...";

  // SVG Icons as inline components
  const BookIcon = () => (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Book cover */}
      <path
        d="M20 12H48C50.2091 12 52 13.7909 52 16V48C52 50.2091 50.2091 52 48 52H20C17.7909 52 16 50.2091 16 48V16C16 13.7909 17.7909 12 20 12Z"
        fill="#1F2937"
        stroke="#111827"
        strokeWidth="2"
      />
      {/* Pages */}
      <path
        d="M20 12V52H16C16 50.2091 17.7909 48 20 48V12Z"
        fill="#F5F5DC"
        stroke="#D2D2A8"
        strokeWidth="1"
      />
      {/* Cross on the cover */}
      <path
        d="M34 24V40M26 32H42"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Bookmark ribbon */}
      <path
        d="M30 52L34 56L38 52H30Z"
        fill="#DC2626"
      />
    </motion.svg>
   );

  const MusicIcon = () => (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Speaker background */}
      <circle
        cx="32"
        cy="32"
        r="24"
        fill="#D1D5DB"
        stroke="#9CA3AF"
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="32"
        r="12"
        fill="#111827"
      />
      {/* Music note */}
      <path
        d="M48 16V40C48 42.2091 46.2091 44 44 44C41.7909 44 40 42.2091 40 40C40 37.7909 41.7909 36 44 36C45.1046 36 46.1046 36.4477 46.8284 37.1716L47 16H48Z"
        fill="#3B82F6"
        stroke="#2563EB"
        strokeWidth="2"
      />
      <circle cx="44" cy="40" r="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="2" />
      <path
        d="M40 20V44C40 46.2091 38.2091 48 36 48C33.7909 48 32 46.2091 32 44C32 41.7909 33.7909 40 36 40C37.1046 40 38.1046 40.4477 38.8284 41.1716L39 20H40Z"
        fill="#3B82F6"
        stroke="#2563EB"
        strokeWidth="2"
      />
      <circle cx="36" cy="44" r="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="2" />
    </motion.svg>
   );

  return (
    <header className="text-center py-8 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] relative">
      {/* Header Controls Container */}
      <div className="fixed top-4 right-4 flex items-center gap-4">
        {/* Clock */}
        <div className="bg-[hsl(var(--background))] px-3 py-1 rounded-md shadow-md border border-[hsl(var(--border))]">
          <span className="text-[hsl(var(--foreground))] font-mono text-sm">
            {formattedTime}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-900 shadow-md"
            aria-label="Toggle Theme"
          >
            <div className="relative w-full h-full">
              {/* Sun Icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: theme === "dark" ? 0 : 1 }}
                animate={{ opacity: theme === "dark" ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-5 h-5 rounded-full bg-yellow-400 relative">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1.5 bg-yellow-400"
                      style={{
                        left: "50%",
                        top: "50%",
                        transformOrigin: "0 0",
                        transform: `rotate(${i * 45}deg) translate(-50%, ${-5 - (i % 2 === 0 ? 2 : 0)}px)`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Moon Icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: theme === "dark" ? 1 : 0 }}
                animate={{ opacity: theme === "dark" ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-5 h-5 rounded-full bg-gray-800 relative overflow-hidden">
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-gray-300 right-0 top-0 transform translate-x-1 -translate-y-1" />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-3 left-1.5" />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-1.5 left-2.5" />
                </div>
              </motion.div>
            </div>
          </button>
        </motion.div>
      </div>

      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-center gap-4">
          <div className="h-20 w-20 flex-shrink-0">
            <MusicIcon />
          </div>
          <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]">
            {" "}
            صــــديــــق لــــكــــل خــــادم{" "}
          </h2>
          <div className="h-20 w-20 flex-shrink-0">
            <BookIcon />
          </div>
        </div>
      </div>
    </header>
  )
}

