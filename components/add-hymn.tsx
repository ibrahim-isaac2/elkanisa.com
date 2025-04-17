"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, X, Plus, Minus, Settings, Palette, Type, Upload, Download } from "lucide-react";

export default function AddHymn() {
  // Hymn data states
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState<string[]>([]);
  const [slideCount, setSlideCount] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);

  // Display states
  const [showPreview, setShowPreview] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Display settings
  const [settings, setSettings] = useState({
    background: "bg-gradient-to-br from-indigo-900 to-purple-900",
    textColor: "text-white",
    fontSize: 48,
    watermark: "",
    watermarkColor: "text-white",
    watermarkSize: 20,
    autoAdvance: false,
    autoAdvanceInterval: 10,
  });
  const [activeTab, setActiveTab] = useState("theme");

  // Touch handling states for swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Themes and colors
  const themes = [
    { name: "افتراضي", background: "bg-gradient-to-br from-indigo-900 to-purple-900", text: "text-white" },
    { name: "أزرق داكن", background: "bg-gradient-to-br from-blue-800 to-blue-950", text: "text-white" },
    { name: "أخضر داكن", background: "bg-gradient-to-br from-emerald-800 to-green-950", text: "text-white" },
    { name: "أرجواني داكن", background: "bg-gradient-to-br from-purple-800 to-purple-950", text: "text-white" },
    { name: "فاتح", background: "bg-gradient-to-br from-gray-100 to-white", text: "text-black" },
    { name: "بني فاتح", background: "bg-gradient-to-br from-amber-50 to-amber-100", text: "text-amber-900" },
    { name: "رمادي داكن", background: "bg-gradient-to-br from-gray-700 to-gray-900", text: "text-white" },
    { name: "أحمر داكن", background: "bg-gradient-to-br from-red-800 to-red-950", text: "text-white" },
  ];

  const textColors = [
    { name: "أبيض", class: "text-white" },
    { name: "أسود", class: "text-black" },
    { name: "أحمر", class: "text-red-500" },
    { name: "أخضر", class: "text-green-500" },
    { name: "أزرق", class: "text-blue-500" },
    { name: "أصفر", class: "text-yellow-500" },
    { name: "برتقالي", class: "text-orange-500" },
    { name: "بنفسجي", class: "text-purple-500" },
  ];

  // Initialize slides array when slideCount changes
  useEffect(() => {
    if (currentStep === 1) {
      setSlides(Array(slideCount).fill(""));
    }
  }, [slideCount, currentStep]);

  // Handle slide navigation
  const handleNextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const deltaX = touchStartX - touchEndX;
    const swipeThreshold = 50;

    if (deltaX > swipeThreshold) {
      handleNextSlide();
    } else if (deltaX < -swipeThreshold) {
      handlePrevSlide();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Handle keyboard navigation in fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showPreview) return;

      switch (e.key) {
        case "ArrowRight":
          handlePrevSlide();
          break;
        case "ArrowLeft":
          handleNextSlide();
          break;
        case "Escape":
          exitFullScreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreview, handleNextSlide, handlePrevSlide]);

  // Handle auto-advance
  useEffect(() => {
    if (showPreview && settings.autoAdvance) {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }

      autoAdvanceTimerRef.current = setInterval(() => {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide((prev) => prev + 1);
        } else {
          if (autoAdvanceTimerRef.current) {
            clearInterval(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
          }
        }
      }, settings.autoAdvanceInterval * 1000);

      return () => {
        if (autoAdvanceTimerRef.current) {
          clearInterval(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = null;
        }
      };
    }
  }, [showPreview, settings.autoAdvance, settings.autoAdvanceInterval, currentSlide, slides.length]);

  // Handle form submission to send email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hymnData = {
      title,
      slides,
      timestamp: new Date().toISOString(),
    };

    try {
      const emailContent = `
        New Hymn Submission
        Title: ${hymnData.title}
        Timestamp: ${hymnData.timestamp}
        Slides:
        ${hymnData.slides.map((slide, index) => `Slide ${index + 1}:\n${slide}\n`).join("\n")}
      `;

      // Using a simple mailto link to trigger email client
      const mailtoLink = `mailto:infotojesus@gmail.com?subject=New Hymn Submission: ${encodeURIComponent(hymnData.title)}&body=${encodeURIComponent(emailContent)}`;

      window.location.href = mailtoLink;

      alert("تم إعداد البريد الإلكتروني! يرجى إرساله من تطبيق البريد الخاص بك.");
      // Reset form
      setTitle("");
      setSlides([]);
      setSlideCount(1);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error preparing email:", error);
      alert("حدث خطأ أثناء إعداد البريد الإلكتروني");
    }
  };

  // Handle slide content change
  const handleSlideContentChange = (index: number, content: string) => {
    const newSlides = [...slides];
    newSlides[index] = content;
    setSlides(newSlides);
  };

  // Handle fullscreen exit
  const exitFullScreen = () => {
    setShowPreview(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn("Error attempting to exit fullscreen:", err);
      });
    }

    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  // Handle PowerPoint download
  const handleDownloadPowerPoint = () => {
    const content = slides.map((slide, index) => `Slide ${index + 1}:\n${slide}\n\n`).join("");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    alert("تم تحميل الملف بنجاح");
  };

  // Handle entering fullscreen mode
  const enterFullScreen = () => {
    setShowPreview(true);
    setCurrentSlide(0);

    document.documentElement.requestFullscreen().catch((err) => {
      console.warn("Error attempting to enable fullscreen:", err);
    });
  };

  // Update a specific setting
  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Render the settings panel
  const renderSettingsPanel = () => {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
        onClick={() => setShowSettings(false)}
      >
        <div
          className="bg-background border border-border rounded-xl shadow-2xl p-4 xs:p-6 w-11/12 sm:w-80 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            onClick={(e) => e.stopPropagation()}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4 bg-background border-border">
              <TabsTrigger
                value="theme"
                className="text-xs xs:text-sm text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                المظهر
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="text-xs xs:text-sm text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                النص
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="text-xs xs:text-sm text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                متقدم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <div className="font-bold text-foreground text-sm">الخلفية</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => updateSetting("background", theme.background)}
                    className={`p-2 xs:p-3 rounded-lg ${theme.background} ${theme.text} text-xs xs:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs xs:text-sm transition-colors duration-200"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  إضافة خلفية مخصصة
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const imageUrl = e.target?.result as string;
                        alert("تم تحميل الصورة بنجاح");
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <div className="font-bold text-foreground text-sm">لون النص</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {textColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateSetting("textColor", color.class)}
                    className={`p-2 xs:p-3 rounded-lg bg-muted ${color.class} text-xs xs:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs xs:text-sm text-foreground font-semibold">
                    حجم الخط: {settings.fontSize}px
                  </Label>
                </div>
                <Slider
                  min={24}
                  max={96}
                  step={2}
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSetting("fontSize", value[0])}
                />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <div className="font-bold text-foreground text-sm">الشعار</div>
                </div>
                <Input
                  type="text"
                  value={settings.watermark}
                  onChange={(e) => updateSetting("watermark", e.target.value)}
                  placeholder="أدخل نص الشعار هنا"
                  className="mb-4 text-xs xs:text-sm bg-background border-border text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <div className="font-bold text-foreground text-sm">لون الشعار</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {textColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => updateSetting("watermarkColor", color.class)}
                      className={`p-2 xs:p-3 rounded-lg bg-muted ${color.class} text-xs xs:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs xs:text-sm text-foreground font-semibold">
                      حجم خط الشعار: {settings.watermarkSize}px
                    </Label>
                  </div>
                  <Slider
                    min={12}
                    max={48}
                    step={1}
                    value={[settings.watermarkSize]}
                    onValueChange={(value) => updateSetting("watermarkSize", value[0])}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-advance" className="text-xs xs:text-sm text-foreground font-semibold">
                  تقدم تلقائي
                </Label>
                <Switch
                  id="auto-advance"
                  checked={settings.autoAdvance}
                  onCheckedChange={(checked) => updateSetting("autoAdvance", checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {settings.autoAdvance && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs xs:text-sm text-foreground font-semibold">
                      الفاصل الزمني: {settings.autoAdvanceInterval} ثانية
                    </Label>
                  </div>
                  <Slider
                    min={5}
                    max={30}
                    step={1}
                    value={[settings.autoAdvanceInterval]}
                    onValueChange={(value) => updateSetting("autoAdvanceInterval", value[0])}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div className="font-bold text-foreground text-sm">معلومات</div>
                </div>
                <div className="text-xs xs:text-sm text-muted-foreground space-y-2">
                  <p>استخدم مفاتيح الأسهم للتنقل بين الشرائح</p>
                  <p>اضغط ESC للخروج من وضع ملء الشاشة</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full mt-6 text-xs xs:text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
            onClick={() => setShowSettings(false)}
          >
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-background max-w-4xl mx-auto w-full">
      <CardHeader className="bg-background">
        <CardTitle className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-xl xs:text-2xl sm:text-3xl text-right">
          إضافة ترنيمة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 xs:space-y-6">
        {!showPreview ? (
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
                    alert("الرجاء إدخال عنوان الترنيمة");
                    return;
                  }
                  setCurrentStep(2);
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
                  <Label htmlFor={`slide-${index}`} className="text-right text-sm xs:text-base text-foreground font-semibold">
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
                    const hasEmptySlide = slides.some((slide) => !slide.trim());
                    if (hasEmptySlide) {
                      alert("الرجاء إدخال محتوى لجميع الشرائح");
                      return;
                    }
                    enterFullScreen();
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
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center ${settings.background}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="text-center px-4 xs:px-8 w-full">
                <p
                  className={`font-extrabold ${settings.textColor} leading-relaxed whitespace-pre-line max-w-6xl mx-auto text-right arabic-text`}
                  style={{ fontSize: `${settings.fontSize}px` }}
                >
                  {slides[currentSlide]}
                </p>
              </div>

              {settings.watermark && (
                <div
                  className={`absolute top-4 right-4 opacity-50 ${settings.watermarkColor} text-right arabic-text`}
                  style={{ fontSize: `${settings.watermarkSize}px` }}
                >
                  {settings.watermark}
                </div>
              )}
            </div>

            <div className="fixed top-4 xs:top-8 left-4 xs:left-8 flex items-center gap-2 xs:gap-4 z-30">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-white/20 text-white rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12"
                onClick={exitFullScreen}
              >
                <X className="h-4 xs:h-6 w-4 xs:w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-white/20 text-white rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 xs:h-6 w-4 xs:w-6" />
              </Button>
            </div>

            <div className="fixed bottom-8 xs:bottom-12 left-0 right-0 flex justify-center items-center px-6 xs:px-12 z-30">
              <span className="text-white text-sm xs:text-xl font-medium bg-black/50 px-4 xs:px-6 py-1 xs:py-2 rounded-full">
                {currentSlide + 1} / {slides.length}
              </span>
            </div>

            {showSettings && renderSettingsPanel()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}