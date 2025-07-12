"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X, Plus, Minus, Settings, Palette, Type, Copyright, Upload, Download } from "lucide-react"

type Theme = {
  name: string
  background: string
  text: string
  isCustom?: boolean
  customUrl?: string
}

export default function AddHymn() {
  // Hymn data states
  const [title, setTitle] = useState("")
  const [slides, setSlides] = useState<string[]>([])
  const [slideCount, setSlideCount] = useState(1)
  const [currentStep, setCurrentStep] = useState(1)

  // Display states
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState("theme")

  // Touch handling states for swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Display settings aligned with hero-section.tsx
  const [currentTheme, setCurrentTheme] = useState<Theme>({
    name: "افتراضي",
    background: "bg-black",
    text: "text-white",
  })
  const [customThemes, setCustomThemes] = useState<Theme[]>([])
  const [currentTextColor, setCurrentTextColor] = useState({ name: "أبيض", class: "text-white" })
  const [globalFontSize, setGlobalFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const savedFontSize = localStorage.getItem("globalFontSize")
      return savedFontSize ? Number.parseInt(savedFontSize, 10) : 72
    }
    return 72
  })
  const [watermark, setWatermark] = useState("")
  const [watermarkColor, setWatermarkColor] = useState({ name: "أبيض", class: "text-white" })
  const [watermarkFontSize, setWatermarkFontSize] = useState(20)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [autoAdvanceInterval, setAutoAdvanceInterval] = useState(10)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [imagePositionX, setImagePositionX] = useState(50)
  const [imagePositionY, setImagePositionY] = useState(50)
  const [imageSize, setImageSize] = useState(50)
  const [slideTransition, setSlideTransition] = useState<string>("none")

  // Themes and colors aligned with hero-section.tsx
  const themes: Theme[] = [
    { name: "افتراضي", background: "bg-black", text: "text-white" },
    { name: "أزرق داكن", background: "bg-gradient-to-br from-blue-800 to-blue-950", text: "text-white" },
    { name: "أخضر داكن", background: "bg-gradient-to-br from-emerald-800 to-green-950", text: "text-white" },
    { name: "أرجواني داكن", background: "bg-gradient-to-br from-purple-800 to-purple-950", text: "text-white" },
    { name: "فاتح", background: "bg-gradient-to-br from-gray-100 to-white", text: "text-black" },
    { name: "بني فاتح", background: "bg-gradient-to-br from-amber-50 to-amber-100", text: "text-amber-900" },
    { name: "رمادي داكن", background: "bg-gradient-to-br from-gray-700 to-gray-900", text: "text-white" },
    { name: "أحمر داكن", background: "bg-gradient-to-br from-red-800 to-red-950", text: "text-white" },
    { name: "برتقالي داكن", background: "bg-gradient-to-br from-orange-800 to-orange-950", text: "text-white" },
    { name: "أصفر فاتح", background: "bg-gradient-to-br from-yellow-50 to-yellow-200", text: "text-yellow-900" },
  ]

  const textColors = [
    { name: "أبيض", class: "text-white" },
    { name: "أسود", class: "text-black" },
    { name: "أحمر", class: "text-red-500" },
    { name: "أخضر", class: "text-green-500" },
    { name: "أزرق", class: "text-blue-500" },
    { name: "أصفر", class: "text-yellow-500" },
    { name: "برتقالي", class: "text-orange-500" },
    { name: "بنفسجي", class: "text-purple-500" },
  ]

  const transitionOptions = [
    { name: "تلاشي", value: "fade" },
    { name: "انزلاق", value: "slide" },
    { name: "بدون تأثير", value: "none" },
  ]

  // Font size control functions
  const increaseFontSize = useCallback(() => {
    setGlobalFontSize((prev) => {
      const newSize = Math.min(prev + 4, 120)
      if (typeof window !== "undefined") {
        localStorage.setItem("globalFontSize", newSize.toString())
      }
      return newSize
    })
  }, [])

  const decreaseFontSize = useCallback(() => {
    setGlobalFontSize((prev) => {
      const newSize = Math.max(prev - 4, 20)
      if (typeof window !== "undefined") {
        localStorage.setItem("globalFontSize", newSize.toString())
      }
      return newSize
    })
  }, [])

  // Initialize slides array when slideCount changes
  useEffect(() => {
    if (currentStep === 1) {
      setSlides(Array(slideCount).fill(""))
    }
  }, [slideCount, currentStep])

  // Handle slide navigation
  const handleNextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1)
    }
  }, [currentSlide, slides.length])

  const handlePrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
    }
  }, [currentSlide])

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchEndX(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return

    const deltaX = touchStartX - touchEndX
    const swipeThreshold = 50

    if (deltaX > swipeThreshold) {
      handleNextSlide()
    } else if (deltaX < -swipeThreshold) {
      handlePrevSlide()
    }

    setTouchStartX(null)
    setTouchEndX(null)
  }

  // Handle keyboard navigation in fullscreen mode - Updated to support all arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFullScreen) return

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          handlePrevSlide()
          break
        case "ArrowLeft":
        case "ArrowDown":
          handleNextSlide()
          break
        case "Escape":
          exitFullScreen()
          break
        case "+":
        case "=":
          increaseFontSize()
          break
        case "-":
        case "_":
          decreaseFontSize()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showFullScreen, handleNextSlide, handlePrevSlide, increaseFontSize, decreaseFontSize])

  // Handle auto-advance
  useEffect(() => {
    if (showFullScreen && autoAdvance) {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current)
      }

      autoAdvanceTimerRef.current = setInterval(() => {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide((prev) => prev + 1)
        } else {
          if (autoAdvanceTimerRef.current) {
            clearInterval(autoAdvanceTimerRef.current)
            autoAdvanceTimerRef.current = null
          }
        }
      }, autoAdvanceInterval * 1000)

      return () => {
        if (autoAdvanceTimerRef.current) {
          clearInterval(autoAdvanceTimerRef.current)
          autoAdvanceTimerRef.current = null
        }
      }
    }
  }, [showFullScreen, autoAdvance, autoAdvanceInterval, currentSlide, slides.length])

  // Handle form submission to send email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const hymnData = {
      title,
      slides,
      timestamp: new Date().toISOString(),
    }

    try {
      const emailContent = `
        New Hymn Submission
        Title: ${hymnData.title}
        Timestamp: ${hymnData.timestamp}
        Slides:
        ${hymnData.slides.map((slide, index) => `Slide ${index + 1}:\n${slide}\n`).join("\n")}
      `

      const mailtoLink = `mailto:infotojesus@gmail.com?subject=New Hymn Submission: ${encodeURIComponent(hymnData.title)}&body=${encodeURIComponent(emailContent)}`

      window.location.href = mailtoLink

      alert("تم إعداد البريد الإلكتروني! يرجى إرساله من تطبيق البريد الخاص بك.")
      setTitle("")
      setSlides([])
      setSlideCount(1)
      setCurrentStep(1)
    } catch (error) {
      console.error("Error preparing email:", error)
      alert("حدث خطأ أثناء إعداد البريد الإلكتروني")
    }
  }

  // Handle slide content change
  const handleSlideContentChange = (index: number, content: string) => {
    const newSlides = [...slides]
    newSlides[index] = content
    setSlides(newSlides)
  }

  // Handle fullscreen exit - Updated to return to main page
  const exitFullScreen = useCallback(() => {
    setShowFullScreen(false)
    setCurrentSlide(0)
    if (typeof window !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn("Error attempting to exit fullscreen:", err)
      })
    }

    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
  }, [])

  // Handle PowerPoint download
  const handleDownloadPowerPoint = () => {
    const content = slides.map((slide, index) => `Slide ${index + 1}:\n${slide}\n\n`).join("")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${title}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
    alert("تم تحميل الملف بنجاح")
  }

  // Handle entering fullscreen mode
  const enterFullScreen = () => {
    setShowFullScreen(true)
    setCurrentSlide(0)

    document.documentElement.requestFullscreen().catch((err) => {
      console.warn("Error attempting to enable fullscreen:", err)
    })
  }

  // Handle upload background
  const handleUploadBackground = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]
      if (!validImageTypes.includes(file.type)) {
        alert("يرجى اختيار ملف صورة (مثل PNG، JPG، GIF، إلخ).")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        const newTheme: Theme = {
          name: `مخصص ${customThemes.length + 1}`,
          background: "",
          text: "text-white",
          isCustom: true,
          customUrl: imageUrl,
        }
        setCustomThemes((prev) => [...prev, newTheme])
        setCurrentTheme(newTheme)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle upload image
  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]
      if (!validImageTypes.includes(file.type)) {
        alert("يرجى اختيار ملف صورة (مثل PNG، JPG، GIF، إلخ).")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Calculate dynamic font size
  const calculateDynamicFontSize = (text: string) => {
    const textLength = text.length
    const baseFontSize = globalFontSize
    const minFontSize = 24
    const maxFontSize = 120

    if (textLength < 50) {
      return Math.min(baseFontSize * 1.2, maxFontSize)
    } else if (textLength > 200) {
      return Math.max(baseFontSize * 0.8, minFontSize)
    }
    return baseFontSize
  }

  // Save settings
  const saveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("globalFontSize", globalFontSize.toString())
      localStorage.setItem("slideTransition", slideTransition)
    }
    setShowSettings(false)
  }

  // Transition variants
  const getTransitionVariants = () => {
    switch (slideTransition) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.1, ease: "easeOut" },
        }
      case "slide":
        return {
          initial: { x: 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 },
          transition: { duration: 0.1, ease: "easeOut" },
        }
      case "none":
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0 },
        }
    }
  }

  // Render settings panel
  const renderSettingsPanel = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
        onClick={() => setShowSettings(false)}
      >
        <div
          className="bg-black border border-gray-500 rounded-xl shadow-2xl p-4 xs:p-6 w-11/12 sm:w-80 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            onClick={(e) => e.stopPropagation()}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4 bg-black border-gray-500">
              <TabsTrigger
                value="theme"
                className="text-xs xs:text-sm text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                المظهر
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="text-xs xs:text-sm text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                النص
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="text-xs xs:text-sm text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                متقدم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-gray-400" />
                <div className="font-bold text-white text-sm">الخلفية</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[...themes, ...customThemes].map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setCurrentTheme(theme)}
                    className={`p-2 xs:p-3 rounded-lg ${theme.isCustom ? "bg-gray-700" : theme.background} ${theme.text} text-xs xs:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                    style={
                      theme.isCustom && theme.customUrl
                        ? {
                            backgroundImage: `url(${theme.customUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    {theme.name}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs xs:text-sm transition-colors duration-200"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  إضافة خلفية مخصصة
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleUploadBackground}
                  className="hidden"
                />
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4 text-gray-400" />
                <div className="font-bold text-white text-sm">لون النص</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {textColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setCurrentTextColor(color)}
                    className={`p-2 xs:p-3 rounded-lg bg-gray-700 ${color.class} text-xs xs:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs xs:text-sm text-white font-semibold">حجم الخط: {globalFontSize}px</Label>
                </div>
                <Slider
                  min={24}
                  max={120}
                  step={2}
                  value={[globalFontSize]}
                  onValueChange={(value) => setGlobalFontSize(value[0])}
                />
                <div className="text-xs text-gray-400 mt-2">
                  💡 يمكنك أيضاً استخدام أزرار التحكم أسفل الشاشة أو مفاتيح + و - للتحكم في حجم الخط
                  <br />🎯 استخدم الأسهم الأربعة للتنقل بين الشرائح
                </div>
              </div>

              <div className="pt-4 border-t border-gray-500">
                <div className="flex items-center gap-2 mb-2">
                  <Copyright className="h-4 w-4 text-gray-400" />
                  <div className="font-bold text-white text-sm">الشعار</div>
                </div>
                <input
                  type="text"
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  placeholder="أدخل نص الشعار هنا"
                  className="w-full p-2 border border-gray-500 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4 text-sm text-right"
                />

                <div className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4 text-gray-400" />
                  <div className="font-bold text-white text-sm">لون الشعار</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {textColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setWatermarkColor(color)}
                      className={`p-2 xs:p-3 rounded-lg bg-gray-700 ${color.class} text-xs xs:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs xs:text-sm text-white font-semibold">
                      حجم خط الشعار: {watermarkFontSize}px
                    </Label>
                  </div>
                  <Slider
                    min={12}
                    max={48}
                    step={1}
                    value={[watermarkFontSize]}
                    onValueChange={(value) => setWatermarkFontSize(value[0])}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-advance" className="text-xs xs:text-sm text-white font-semibold">
                  تقدم تلقائي
                </Label>
                <Switch
                  id="auto-advance"
                  checked={autoAdvance}
                  onCheckedChange={setAutoAdvance}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {autoAdvance && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs xs:text-sm text-white font-semibold">
                      الفاصل الزمني: {autoAdvanceInterval} ثانية
                    </Label>
                  </div>
                  <Slider
                    min={5}
                    max={30}
                    step={1}
                    value={[autoAdvanceInterval]}
                    onValueChange={(value) => setAutoAdvanceInterval(value[0])}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs xs:text-sm text-white font-semibold">تأثير الانتقال بين الشرائح</Label>
                <Select value={slideTransition} onValueChange={setSlideTransition}>
                  <SelectTrigger className="w-full bg-gray-800 text-white border-gray-500">
                    <SelectValue placeholder="اختر تأثير الانتقال" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-500">
                    {transitionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-gray-700">
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-gray-500">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <div className="font-bold text-white text-sm">صورة في الخلفية</div>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs xs:text-sm transition-colors duration-200"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  اختيار صورة
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                />

                {backgroundImage && (
                  <>
                    <div className="space-y-2 mt-4">
                      <Label className="text-xs xs:text-sm text-white font-semibold">
                        الموضع الأفقي: {imagePositionX}%
                      </Label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[imagePositionX]}
                        onValueChange={(value) => setImagePositionX(value[0])}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label className="text-xs xs:text-sm text-white font-semibold">
                        الموضع العمودي: {imagePositionY}%
                      </Label>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[imagePositionY]}
                        onValueChange={(value) => setImagePositionY(value[0])}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label className="text-xs xs:text-sm text-white font-semibold">الحجم: {imageSize}%</Label>
                      <Slider
                        min={10}
                        max={100}
                        step={1}
                        value={[imageSize]}
                        onValueChange={(value) => setImageSize(value[0])}
                        className="w-full"
                      />
                    </div>
                    <Button
                      onClick={() => setBackgroundImage(null)}
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white text-xs xs:text-sm transition-colors duration-200"
                      size="sm"
                    >
                      إزالة الصورة
                    </Button>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-gray-500">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-4 w-4 text-gray-400" />
                  <div className="font-bold text-white text-sm">معلومات</div>
                </div>
                <div className="text-xs xs:text-sm text-gray-400 space-y-2">
                  <p>استخدم الأسهم الأربعة للتنقل بين الشرائح</p>
                  <p>اضغط ESC للعودة إلى الصفحة الرئيسية</p>
                  <p>استخدم أزرار A+ و A- أسفل الشاشة لتغيير حجم الخط</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full mt-6 text-xs xs:text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            onClick={saveSettings}
          >
            حفظ الإعدادات
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <Card className="bg-background max-w-4xl mx-auto w-full">
      <CardHeader className="bg-background">
        <CardTitle className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-xl xs:text-2xl sm:text-3xl text-right">
          إضافة ترنيمة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 xs:space-y-6">
        {!showFullScreen ? (
          currentStep === 1 ? (
            // Step 1: Enter hymn title and number of slides
            <div className="space-y-4 xs:space-y-6">
              <div className="space-y-2">
                <Label className="text-right text-sm xs:text-base text-foreground font-semibold">عنوان الترنيمة</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="أدخل عنوان الترنيمة"
                  className="bg-background border-border text-foreground text-right text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-right text-sm xs:text-base text-foreground font-semibold">عدد الشرائح</Label>
                <div className="flex items-center gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setSlideCount(Math.max(1, slideCount - 1))}
                    className="bg-background border-border text-foreground h-8 w-8 xs:h-10 xs:w-10 hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm xs:text-base text-foreground">{slideCount}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setSlideCount(slideCount + 1)}
                    className="bg-background border-border text-foreground h-8 w-8 xs:h-10 xs:w-10 hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                className="w-full mt-4 text-sm xs:text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
                onClick={() => {
                  if (!title.trim()) {
                    alert("الرجاء إدخال عنوان الترنيمة")
                    return
                  }
                  setCurrentStep(2)
                }}
              >
                التالي
              </Button>
            </div>
          ) : (
            // Step 2: Enter slide content
            <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-6">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-4 text-right text-foreground">
                إدخال محتوى الشرائح لـ "{title}"
              </h2>

              {slides.map((slide, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md border-border">
                  <Label
                    htmlFor={`slide-${index}`}
                    className="text-right text-sm xs:text-base text-foreground font-semibold"
                  >
                    شريحة {index + 1}
                  </Label>
                  <Textarea
                    id={`slide-${index}`}
                    value={slide}
                    onChange={(e) => handleSlideContentChange(index, e.target.value)}
                    placeholder={`أدخل محتوى الشريحة ${index + 1}`}
                    rows={4}
                    className="bg-background border-border text-foreground text-right text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-2 xs:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="bg-background border-border text-foreground text-sm xs:text-base hover:bg-muted"
                >
                  رجوع
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const hasEmptySlide = slides.some((slide) => !slide.trim())
                    if (hasEmptySlide) {
                      alert("الرجاء إدخال محتوى لجميع الشرائح")
                      return
                    }
                    enterFullScreen()
                  }}
                  className="text-sm xs:text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
                >
                  عرض الترنيمة
                </Button>
                <Button
                  type="submit"
                  className="text-sm xs:text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
                >
                  إرسال الترنيمة بالبريد
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPowerPoint}
                  className="bg-background border-border text-foreground text-sm xs:text-base hover:bg-muted"
                >
                  <Download className="h-4 w-4 mr-2" />
                  تحميلها
                </Button>
              </div>
            </form>
          )
        ) : (
          // Fullscreen preview mode
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0 }}
              className={`fixed inset-0 z-50 flex items-center justify-center ${
                currentTheme.isCustom ? "" : currentTheme.background
              }`}
              style={
                currentTheme.isCustom && currentTheme.customUrl
                  ? {
                      backgroundImage: `url(${currentTheme.customUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }
                  : {}
              }
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {currentTheme.isCustom && currentTheme.customUrl && <div className="absolute inset-0 bg-black/50 z-10" />}
              {backgroundImage && (
                <img
                  src={backgroundImage || "/placeholder.svg"}
                  alt="Background Image"
                  className="absolute z-15"
                  style={{
                    left: `${imagePositionX}%`,
                    top: `${imagePositionY}%`,
                    transform: "translate(-50%, -50%)",
                    width: `${imageSize}%`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              )}

              <motion.div
                key={currentSlide}
                {...getTransitionVariants()}
                className="relative w-full h-full flex items-center justify-center z-20"
              >
                <div className="text-center px-4 sm:px-8 w-full h-full flex items-center justify-center">
                  <p
                    className={`${currentTextColor.class} leading-relaxed whitespace-pre-line max-w-4xl sm:max-w-6xl mx-auto responsive-text text-center`}
                    style={{
                      fontSize: `${calculateDynamicFontSize(slides[currentSlide])}px`,
                      fontFamily: '"Noto Sans Arabic", sans-serif',
                      fontWeight: 700,
                      direction: "rtl",
                      textAlign: "center",
                    }}
                  >
                    {slides[currentSlide]}
                  </p>
                </div>

                {watermark && (
                  <div
                    className={`absolute top-4 xs:bottom-4 right-4 opacity-50 ${watermarkColor.class} z-30 text-sm xs:text-base`}
                    style={{ fontSize: `${watermarkFontSize}px` }}
                  >
                    {watermark}
                  </div>
                )}
              </motion.div>

              <div className="fixed top-8 left-8 flex items-center gap-4 sm:gap-6 z-30">
                <button
                  onClick={exitFullScreen}
                  className="p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200"
                  aria-label="إغلاق"
                >
                  <X className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200"
                  aria-label="الإعدادات"
                >
                  <Settings className="h-6 w-6" />
                </button>
              </div>

              {/* Font size control buttons - centered at bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={decreaseFontSize}
                        disabled={globalFontSize <= 20}
                        className={`w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 ${
                          globalFontSize <= 20
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-black/80 active:bg-black/90"
                        }`}
                        aria-label="تصغير الخط"
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-lg font-bold">A</span>
                          <Minus className="h-3 w-3 ml-1" />
                        </div>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>تصغير الخط (حالياً: {globalFontSize}px)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  {globalFontSize}px
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={increaseFontSize}
                        disabled={globalFontSize >= 120}
                        className={`w-12 h-12 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 ${
                          globalFontSize >= 120
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-black/80 active:bg-black/90"
                        }`}
                        aria-label="تكبير الخط"
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-lg font-bold">A</span>
                          <Plus className="h-3 w-3 ml-1" />
                        </div>
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>تكبير الخط (حالياً: {globalFontSize}px)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              {/* Slide counter moved to left */}
              <div className="fixed bottom-8 left-8 z-30">
                <div className="text-white font-semibold bg-black/50 px-3 py-2 rounded-full backdrop-blur-sm">
                  {currentSlide + 1} / {slides.length}
                </div>
              </div>

              {showSettings && renderSettingsPanel()}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}
