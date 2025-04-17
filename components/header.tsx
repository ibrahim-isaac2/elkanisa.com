"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/app/ThemeContext"

export default function Header() {
  const [leftImages, setLeftImages] = useState([])
  const [rightImages, setRightImages] = useState([])
  const [currentLeft, setCurrentLeft] = useState(0)
  const [currentRight, setCurrentRight] = useState(0)
  const [currentTime, setCurrentTime] = useState<Date | null>(null) // Initialize as null
  const [isMounted, setIsMounted] = useState(false) // Track if component is mounted
  const { theme, toggleTheme } = useTheme()

  // Set isMounted to true after the component mounts on the client
  useEffect(() => {
    setIsMounted(true)
    setCurrentTime(new Date()) // Set initial time after mounting
  }, [])

  // Fetch images
  useEffect(() => {
    fetch("/api/images/left")
      .then((res) => res.json())
      .then((data) => setLeftImages(data))
      .catch((error) => console.error("Error fetching left images:", error))

    fetch("/api/images/right")
      .then((res) => res.json())
      .then((data) => setRightImages(data))
      .catch((error) => console.error("Error fetching right images:", error))
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

  // Left images animation
  useEffect(() => {
    if (leftImages.length > 0) {
      const leftInterval = setInterval(() => {
        setCurrentLeft((prev) => (prev + 1) % leftImages.length)
      }, 5000)
      return () => clearInterval(leftInterval)
    }
  }, [leftImages.length])

  // Right images animation
  useEffect(() => {
    if (rightImages.length > 0) {
      const rightInterval = setInterval(() => {
        setCurrentRight((prev) => (prev + 1) % rightImages.length)
      }, 5000)
      return () => clearInterval(rightInterval)
    }
  }, [rightImages.length])

  // Format the time only if the component is mounted and currentTime is set
  const formattedTime = isMounted && currentTime
    ? currentTime.toLocaleTimeString('ar-EG', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : "Loading..."; // Fallback during SSR

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
            {leftImages.length > 0 ? (
              <img
                src={leftImages[currentLeft] || "/placeholder.svg"}
                alt="Left animation"
                className="h-full w-full object-contain animate-fadeOnce"
                key={currentLeft}
              />
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>
          <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]">
            {" "}
            صــــديــــق لــــكــــل خــــادم{" "}
          </h2>
          <div className="h-20 w-20 flex-shrink-0">
            {rightImages.length > 0 ? (
              <img
                src={rightImages[currentRight] || "/placeholder.svg"}
                alt="Right animation"
                className="h-full w-full object-contain animate-fadeOnce"
                key={currentRight}
              />
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}