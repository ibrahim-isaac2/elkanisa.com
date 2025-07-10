"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Palette,
  Mic,
  Type,
  Copyright,
  Upload,
  Settings,
  Heart,
  Download,
  AlignJustify,
  Columns,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/app/ThemeContext";
import Fuse from "fuse.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// تعريفات الأنواع المخصصة لـ SpeechRecognition
interface SpeechRecognitionResult {
  transcript: string;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[][];
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  new (): SpeechRecognition;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface Song {
  title: string;
  verses: string[][];
  chorus?: string[];
  formated?: boolean;
  chorusFirst?: boolean;
  type: "song";
  lyrics?: string[];
}

type Theme = {
  background: string;
  text: string;
  name: string;
  isCustom?: boolean;
  customUrl?: string;
};

const themes: Theme[] = [
  { name: "افتراضي", background: "bg-black", text: "text-white" },
  {
    name: "أزرق داكن",
    background: "bg-gradient-to-br from-blue-800 to-blue-950",
    text: "text-white",
  },
  {
    name: "أخضر داكن",
    background: "bg-gradient-to-br from-emerald-800 to-green-950",
    text: "text-white",
  },
  {
    name: "أرجواني داكن",
    background: "bg-gradient-to-br from-purple-800 to-purple-950",
    text: "text-white",
  },
  {
    name: "فاتح",
    background: "bg-gradient-to-br from-gray-100 to-white",
    text: "text-black",
  },
  {
    name: "بني فاتح",
    background: "bg-gradient-to-br from-amber-50 to-amber-100",
    text: "text-amber-900",
  },
  {
    name: "رمادي داكن",
    background: "bg-gradient-to-br from-gray-700 to-gray-900",
    text: "text-white",
  },
  {
    name: "أحمر داكن",
    background: "bg-gradient-to-br from-red-800 to-red-950",
    text: "text-white",
  },
  {
    name: "برتقالي داكن",
    background: "bg-gradient-to-br from-orange-800 to-orange-950",
    text: "text-white",
  },
  {
    name: "أصفر فاتح",
    background: "bg-gradient-to-br from-yellow-50 to-yellow-200",
    text: "text-yellow-900",
  },
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

const transitionOptions = [
  { name: "تلاشي", value: "fade" },
  { name: "انزلاق", value: "slide" },
  { name: "بدون تأثير", value: "none" },
];

// دالة للبحث عن الآيات المتطابقة
const findMatchingVerses = (song: Song, query: string) => {
  const normalizedQuery = normalizeText(query);
  const matchingVerses: { type: string; index: number; line: string }[] = [];

  song.verses.forEach((verse, verseIndex) => {
    verse.forEach((line, lineIndex) => {
      if (normalizeText(line).includes(normalizedQuery)) {
        matchingVerses.push({ type: "verse", index: verseIndex, line: line });
      }
    });
  });

  if (song.chorus) {
    song.chorus.forEach((line, lineIndex) => {
      if (normalizeText(line).includes(normalizedQuery)) {
        matchingVerses.push({ type: "chorus", index: lineIndex, line: line });
      }
    });
  }

  return matchingVerses;
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .trim();
};

export default function HeroSection() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [selectedItem, setSelectedItem] = useState<Song | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [currentTextColor, setCurrentTextColor] = useState(textColors[0]);
  const [globalFontSize, setGlobalFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const savedFontSize = localStorage.getItem("globalFontSize");
      return savedFontSize ? parseInt(savedFontSize, 10) : 72;
    }
    return 72;
  });
  const [watermark, setWatermark] = useState("");
  const [watermarkColor, setWatermarkColor] = useState(textColors[0]);
  const [watermarkFontSize, setWatermarkFontSize] = useState(20);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoAdvanceInterval, setAutoAdvanceInterval] = useState(10);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<"slides" | "list">("slides");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);
  const [imageSize, setImageSize] = useState(50);
  const [slideTransition, setSlideTransition] = useState<string>("fade");

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const calculateDynamicFontSize = (text: string) => {
    const textLength = text.length;
    const baseFontSize = globalFontSize;
    const minFontSize = 24;
    const maxFontSize = 120;

    if (textLength < 50) {
      return Math.min(baseFontSize * 1.2, maxFontSize);
    } else if (textLength > 200) {
      return Math.max(baseFontSize * 0.8, minFontSize);
    }
    return baseFontSize;
  };

  const fuse = useMemo(() => {
    if (songs.length === 0) return null;
    return new Fuse(songs, {
      keys: ["lyrics"],
      threshold: 0.2,
      minMatchCharLength: 1,
      includeScore: true,
      shouldSort: true,
      distance: 100,
    });
  }, [songs]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const songsRes = await fetch("/songs.json");
        if (!songsRes.ok) throw new Error("فشل تحميل الترانيم");
        const songsData = await songsRes.json();
        if (!Array.isArray(songsData)) {
          throw new Error("بيانات الترانيم ليست مصفوفة");
        }
        const formattedSongs = songsData.map((song: Song) => ({
          ...song,
          type: "song" as const,
          lyrics: [
            normalizeText(song.title),
            ...(song.verses ? song.verses.flat().map(normalizeText) : []),
            ...(song.chorus ? song.chorus.map(normalizeText) : []),
          ],
        }));
        setSongs(formattedSongs);
      } catch (error) {
        console.error("حدث خطأ في تحميل البيانات:", error);
        setError("فشل تحميل البيانات. الرجاء المحاولة لاحقًا.");
      }
    };
    loadData();
  }, []);

  const performSearch = useCallback(
    (query: string) => {
      if (!fuse || !query.trim()) {
        setSearchResults([]);
        return;
      }
      const normalizedQuery = normalizeText(query);
      const results = fuse.search(normalizedQuery).map((result) => result.item);
      setSearchResults(results.slice(0, 50));
    },
    [fuse]
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, performSearch]);

  useEffect(() => {
    const setInitialFontSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setGlobalFontSize((prev) => {
          const savedFontSize = localStorage.getItem("globalFontSize");
          return savedFontSize ? parseInt(savedFontSize, 10) : 48;
        });
      } else if (width >= 640 && width < 1024) {
        setGlobalFontSize((prev) => {
          const savedFontSize = localStorage.getItem("globalFontSize");
          return savedFontSize ? parseInt(savedFontSize, 10) : 72;
        });
      } else {
        setGlobalFontSize((prev) => {
          const savedFontSize = localStorage.getItem("globalFontSize");
          return savedFontSize ? parseInt(savedFontSize, 10) : 96;
        });
      }
    };

    setInitialFontSize();
    window.addEventListener("resize", setInitialFontSize);
    return () => window.removeEventListener("resize", setInitialFontSize);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const rec = new SpeechRecognitionAPI() as SpeechRecognition;
        rec.lang = "ar";
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false;
        setRecognition(rec);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        try {
          setRecentSearches(JSON.parse(savedSearches));
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }

      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error("Failed to parse favorites", e);
        }
      }

      const savedPlaylist = localStorage.getItem("playlist");
      if (savedPlaylist) {
        try {
          setPlaylist(JSON.parse(savedPlaylist));
        } catch (e) {
          console.error("Failed to parse playlist", e);
        }
      }
    }
  }, []);

  const handleVoiceSearch = () => {
    if (!recognition) {
      setVoiceError(
        "متصفحك لا يدعم البحث الصوتي. جرب استخدام Chrome أو Edge."
      );
      return;
    }

    if (!navigator.onLine) {
      setVoiceError("تحتاج إلى الاتصال بالإنترنت لاستخدام البحث الصوتي.");
      return;
    }

    setVoiceError(null);
    setIsListening((prev) => !prev);

    if (!isListening) {
      try {
        recognition.start();
      } catch (err) {
        console.error("خطأ أثناء بدء التسجيل:", err);
        setVoiceError("فشل بدء التسجيل. تأكد من إعدادات الميكروفون.");
        setIsListening(false);
        return;
      }

      recognition.onresult = (event) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          addToRecentSearches(transcript);
        } else {
          setVoiceError("لم يتم التعرف على أي كلام. حاول التحدث بصوت أعلى.");
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        let errorMessage = "حدث خطأ أثناء البحث الصوتي: ";
        switch (event.error) {
          case "no-speech":
            errorMessage +=
              "لم يتم التعرف على أي صوت. تأكد من أنك تتحدث بصوت واضح.";
            break;
          case "audio-capture":
            errorMessage +=
              "فشل في التقاط الصوت. تأكد من أن الميكروفون متصل ويعمل.";
            break;
          case "not-allowed":
            errorMessage +=
              "لم يتم منح إذن استخدام الميكروفون. تحقق من إعدادات المتصفح.";
            break;
          case "network":
            errorMessage += "فشل الاتصال بالخادم. تأكد من اتصالك بالإنترنت.";
            break;
          case "language-not-supported":
            errorMessage += "اللغة غير مدعومة. حاول تغيير إعدادات اللغة.";
            break;
          default:
            errorMessage += event.error;
        }
        setVoiceError(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
    }
  };

  useEffect(() => {
    return () => {
      if (recognition && isListening) {
        recognition.stop();
      }
    };
  }, [isListening, recognition]);

  const addToRecentSearches = (query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const newSearches = [query, ...prev.filter((s) => s !== query)].slice(
        0,
        5
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("recentSearches", JSON.stringify(newSearches));
      }
      return newSearches;
    });
  };

  const toggleFavorite = useCallback(
    (songTitle: string) => {
      setFavorites((prev) => {
        const newFavorites = prev.includes(songTitle)
          ? prev.filter((title) => title !== songTitle)
          : [...prev, songTitle];
        if (typeof window !== "undefined") {
          localStorage.setItem("favorites", JSON.stringify(newFavorites));
        }
        return newFavorites;
      });
    },
    []
  );

  const togglePlaylist = useCallback(
    (songTitle: string) => {
      setPlaylist((prev) => {
        const newPlaylist = prev.includes(songTitle)
          ? prev.filter((title) => title !== songTitle)
          : [...prev, songTitle];
        if (typeof window !== "undefined") {
          localStorage.setItem("playlist", JSON.stringify(newPlaylist));
        }
        return newPlaylist;
      });
    },
    []
  );

  const handleItemSelect = (item: Song) => {
    setSelectedItem(item);
    setCurrentSlide(0);
    setShowFullScreen(true);

    if (searchQuery) {
      addToRecentSearches(searchQuery);
    }

    if (typeof window !== "undefined") {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Error attempting to enable fullscreen:", err);
      });
    }

    setSearchQuery("");
    setSearchResults([]);
    setShowRecentSearches(false);
  };

  const formatContent = useCallback((item: Song) => {
    if (!item) return [];

    let content: string[] = [];
    if (item.chorusFirst && item.chorus) {
      content.push(...item.chorus);
    }
    item.verses.forEach((verse, idx) => {
      content.push(...verse);
      if (item.chorus && !item.chorusFirst && idx < item.verses.length - 1) {
        content.push(...item.chorus);
      }
    });
    content.push("SITE_ICON_SLIDE");
    return content;
  }, []);

  const handleNextSlide = useCallback(() => {
    if (!selectedItem) return;
    const content = formatContent(selectedItem);
    if (currentSlide < content.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, selectedItem, formatContent]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

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

  const exitFullScreen = useCallback(() => {
    setShowFullScreen(false);
    if (typeof window !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn("Error attempting to exit fullscreen:", err);
      });
    }
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const handleUploadBackground = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/tiff",
      ];
      if (!validImageTypes.includes(file.type)) {
        alert("يرجى اختيار ملف صورة (مثل PNG، JPG، GIF، إلخ).");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newTheme: Theme = {
          name: `مخصص ${customThemes.length + 1}`,
          background: "",
          text: "text-white",
          isCustom: true,
          customUrl: imageUrl,
        };
        setCustomThemes((prev) => [...prev, newTheme]);
        setCurrentTheme(newTheme);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/tiff",
      ];
      if (!validImageTypes.includes(file.type)) {
        alert("يرجى اختيار ملف صورة (مثل PNG، JPG، GIF، إلخ).");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (showFullScreen && autoAdvance && selectedItem) {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }

      autoAdvanceTimerRef.current = setInterval(() => {
        const content = formatContent(selectedItem);
        if (currentSlide < content.length - 1) {
          setCurrentSlide((prev) => prev + 1);
        } else {
          if (autoAdvanceTimerRef.current) {
            clearInterval(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
          }
        }
      }, autoAdvanceInterval * 1000);

      return () => {
        if (autoAdvanceTimerRef.current) {
          clearInterval(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = null;
        }
      };
    }
  }, [
    showFullScreen,
    autoAdvance,
    autoAdvanceInterval,
    currentSlide,
    selectedItem,
    formatContent,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFullScreen) return;

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

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showFullScreen, handleNextSlide, handlePrevSlide, exitFullScreen]);

  useEffect(() => {
    if (typeof window !== "undefined" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const saveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("globalFontSize", globalFontSize.toString());
      localStorage.setItem("slideTransition", slideTransition);
    }
    setShowSettings(false);
  };

  const getTransitionVariants = () => {
    switch (slideTransition) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case "slide":
        return {
          initial: { x: 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 },
        };
      case "none":
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        };
    }
  };

  return (
    <div className={`relative min-h-screen bg-background`}>
      {!showFullScreen ? (
        <div className="p-4 sm:p-6 w-full">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 text-foreground">
              الــــــتــــــرانــــــيــــــم
            </h1>
            <p className="text-muted-foreground text-center max-w-md text-sm sm:text-base font-semibold">
              ابحث عن ترانيمك المفضلة واعرضها بطريقة احترافية
            </p>
          </div>

          <div className="relative w-full max-w-3xl mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-black rounded-2xl blur-xl opacity-20 -z-10"></div>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="search"
                placeholder="ابحث عن ترنيمة..."
                className={`w-full pl-36 pr-4 py-4 sm:py-5 text-base sm:text-lg rounded-xl border-2 ${
                  theme === "dark" ? "border-white" : "border-black"
                } bg-card text-foreground shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ring focus:border-${
                  theme === "dark" ? "white" : "black"
                } backdrop-blur-sm hover:shadow-2xl`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setShowRecentSearches(false);
                  }
                }}
                onFocus={() => {
                  if (!searchQuery.trim() && recentSearches.length > 0) {
                    setShowRecentSearches(true);
                  }
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <Search className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                <button
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-full hover:bg-muted transition-colors duration-200 ${
                    isListening ? "bg-destructive text-destructive-foreground" : ""
                  }`}
                >
                  <Mic className="h-5 sm:h-6 w-5 sm:w-6" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
                >
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
              </div>
            </div>
          </div>

          {isListening && (
            <div className="text-green-500 text-sm mt-3 text-center animate-pulse font-semibold">
              جاري الاستماع... تحدث الآن بصوت واضح.
            </div>
          )}

          {voiceError && (
            <div className="text-destructive text-sm mt-3 text-center font-semibold">
              {voiceError}
            </div>
          )}

          <AnimatePresence>
            {showRecentSearches &&
              recentSearches.length > 0 &&
              !searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full max-w-3xl mx-auto mt-4 rounded-2xl overflow-hidden shadow-2xl bg-card text-foreground z-50"
                >
                  <div className="p-3 border-b border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      البحث الأخير
                    </h3>
                  </div>
                  <div className="max-h-[30vh] overflow-y-auto">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="w-full text-right px-4 sm:px-6 py-3 text-sm sm:text-base hover:bg-muted text-foreground transition-colors duration-200 border-b border-border last:border-b-0 flex items-center"
                        onClick={() => setSearchQuery(search)}
                      >
                        <Search className="h-4 w-4 text-muted-foreground ml-3" />
                        {search}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-3xl mx-auto mt-4 rounded-2xl overflow-hidden shadow-2xl bg-card text-foreground z-50"
              >
                <div className="p-3 border-b border-border">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    نتائج البحث ({searchResults.length})
                  </h3>
                </div>
                <div className="max-h-[50vh] overflow-y-auto">
                  {searchResults.map((item, index) => {
                    const matchingVerses = findMatchingVerses(item, searchQuery);
                    return (
                      <div
                        key={index}
                        className="w-full text-right px-4 sm:px-6 py-4 hover:bg-muted text-foreground transition-colors duration-200 border-b border-border last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <button
                            className="flex-1 text-right font-semibold"
                            onClick={() => handleItemSelect(item)}
                          >
                            {item.title}
                          </button>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => togglePlaylist(item.title)}
                                    className="p-2 rounded-full hover:bg-muted"
                                  >
                                    <PlusCircle
                                      className={`h-5 w-5 ${
                                        playlist.includes(item.title)
                                          ? "text-blue-500"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {playlist.includes(item.title)
                                    ? "إزالة من قائمة التشغيل"
                                    : "إضافة إلى قائمة التشغيل"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <button
                              onClick={() => toggleFavorite(item.title)}
                              className="p-2 rounded-full hover:bg-muted"
                            >
                              <Heart
                                className={`h-5 w-5 ${
                                  favorites.includes(item.title)
                                    ? "fill-red-500 text-red-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        {matchingVerses.length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {matchingVerses.slice(0, 2).map((verse, vIndex) => (
                              <p key={vIndex}>{verse.line}</p>
                            ))}
                            {matchingVerses.length > 2 && <p>...</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {favorites.length > 0 && !searchQuery.trim() && !showRecentSearches && (
            <div className="w-full max-w-3xl mx-auto mt-6 sm:mt-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">
                المفضلة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((title, index) => {
                  const song = songs.find((s) => s.title === title);
                  if (!song) return null;

                  return (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <button
                          className="flex-1 text-right font-semibold"
                          onClick={() => handleItemSelect(song)}
                        >
                          {title}
                        </button>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => togglePlaylist(song.title)}
                                  className="p-2 rounded-full hover:bg-muted"
                                >
                                  <PlusCircle
                                    className={`h-5 w-5 ${
                                      playlist.includes(song.title)
                                        ? "text-blue-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {playlist.includes(song.title)
                                  ? "إزالة من قائمة التشغيل"
                                  : "إضافة إلى قائمة التشغيل"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <button
                            onClick={() => toggleFavorite(title)}
                            className="p-2 rounded-full hover:bg-muted"
                          >
                            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {playlist.length > 0 && !searchQuery.trim() && !showRecentSearches && (
            <div className="w-full max-w-3xl mx-auto mt-6 sm:mt-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">
                قائمة التشغيل
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlist.map((title, index) => {
                  const song = songs.find((s) => s.title === title);
                  if (!song) return null;

                  return (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <button
                          className="flex-1 text-right font-semibold"
                          onClick={() => handleItemSelect(song)}
                        >
                          {title}
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePlaylist(title)}
                            className="p-2 rounded-full hover:bg-muted"
                          >
                            <X className="h-5 w-5 text-muted-foreground" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            {currentTheme.isCustom && currentTheme.customUrl && (
              <div className="absolute inset-0 bg-black/50 z-10" />
            )}
            {backgroundImage && (
              <img
                src={backgroundImage}
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
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center z-20"
            >
              {selectedItem ? (
                displayMode === "slides" ? (
                  formatContent(selectedItem)[currentSlide] ===
                  "SITE_ICON_SLIDE" ? (
                    <div className="text-center px-4 sm:px-8 w-full">
                      <img
                        src="/end.png"
                        alt="End Slide"
                        className="mx-auto w-full max-w-[90vw] xs:max-w-4xl sm:max-w-6xl h-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-center px-4 sm:px-8 w-full h-full flex items-center justify-center">
                      <p
                        className={`font-extrabold ${currentTextColor.class} leading-relaxed whitespace-pre-line max-w-4xl sm:max-w-6xl mx-auto responsive-text text-center font-[900]`}
                        style={{
                          fontSize: `${
                            formatContent(selectedItem)[currentSlide]
                              ? calculateDynamicFontSize(formatContent(selectedItem)[currentSlide])
                              : globalFontSize
                          }px`,
                          fontFamily: '"Noto Sans Arabic", sans-serif',
                          fontWeight: 900,
                          direction: 'rtl',
                          textAlign: 'center',
                        }}
                      >
                        {formatContent(selectedItem)[currentSlide]}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full overflow-y-auto px-4 sm:px-8 py-10 sm:py-12 flex flex-col items-center">
                    {formatContent(selectedItem).map((content, index) =>
                      content === "SITE_ICON_SLIDE" ? (
                        <div key={index} className="text-center mb-8">
                          <img
                            src="/end.png"
                            alt="End Slide"
                            className="mx-auto w-full max-w-[90vw] xs:max-w-4xl sm:max-w-6xl h-auto object-contain"
                          />
                        </div>
                      ) : (
                        <p
                          key={index}
                          className={`font-extrabold ${currentTextColor.class} leading-relaxed whitespace-pre-line mb-8 max-w-4xl sm:max-w-6xl mx-auto responsive-text text-center font-[900]`}
                          style={{
                            fontSize: `${calculateDynamicFontSize(content)}px`,
                            fontFamily: '"Noto Sans Arabic", sans-serif',
                            fontWeight: 900,
                            direction: 'rtl',
                            textAlign: 'center',
                          }}
                        >
                          {content}
                        </p>
                      )
                    )}
                  </div>
                )
              ) : (
                <div className="text-center px-4 sm:px-8 w-full h-full flex items-center justify-center">
                  <p
                    className={`font-extrabold ${currentTextColor.class} leading-relaxed whitespace-pre-line max-w-4xl sm:max-w-6xl mx-auto responsive-text text-center font-[900]`}
                    style={{
                      fontSize: `${globalFontSize}px`,
                      fontFamily: '"Noto Sans Arabic", sans-serif',
                      fontWeight: 900,
                      direction: 'rtl',
                      textAlign: 'center',
                    }}
                  >
                    لا يوجد محتوى محدد
                  </p>
                </div>
              )}
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

              <div className="relative">
                <button
                  onClick={() => setShowSettings((prev) => !prev)}
                  className="p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200"
                  aria-label="الإعدادات"
                >
                  <Settings className="h-6 w-6" />
                </button>

                {showSettings && (
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
                        onValueChange={(value) => {
                          setActiveTab(value);
                        }}
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
                            <div className="font-bold text-white text-sm">
                              الخلفية
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {[...themes, ...customThemes].map((theme) => (
                              <button
                                key={theme.name}
                                onClick={() => {
                                  setCurrentTheme(theme);
                                }}
                                className={`p-2 xs:p-3 rounded-lg ${
                                  theme.isCustom ? "bg-gray-700" : theme.background
                                } ${theme.text} text-xs xs:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
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
                            <div className="font-bold text-white text-sm">
                              لون النص
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {textColors.map((color) => (
                              <button
                                key={color.name}
                                onClick={() => {
                                  setCurrentTextColor(color);
                                }}
                                className={`p-2 xs:p-3 rounded-lg bg-gray-700 ${color.class} text-xs xs:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                              >
                                {color.name}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs xs:text-sm text-white font-semibold">
                                حجم الخط: {globalFontSize}px
                              </Label>
                            </div>
                            <Slider
                              min={24}
                              max={120}
                              step={2}
                              value={[globalFontSize]}
                              onValueChange={(value) =>
                                setGlobalFontSize(value[0])
                              }
                            />
                          </div>

                          <div className="pt-4 border-t border-gray-500">
                            <div className="flex items-center gap-2 mb-2">
                              <Copyright className="h-4 w-4 text-gray-400" />
                              <div className="font-bold text-white text-sm">
                                الشعار
                              </div>
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
                              <div className="font-bold text-white text-sm">
                                لون الشعار
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              {textColors.map((color) => (
                                <button
                                  key={color.name}
                                  onClick={() => {
                                    setWatermarkColor(color);
                                  }}
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
                                onValueChange={(value) =>
                                  setWatermarkFontSize(value[0])
                                }
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="display-mode"
                              className="text-xs xs:text-sm text-white font-semibold"
                            >
                              وضع العرض
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant={
                                  displayMode === "slides" ? "default" : "outline"
                                }
                                onClick={() => setDisplayMode("slides")}
                                className={`${
                                  displayMode === "slides"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-white border-gray-500"
                                } hover:bg-blue-700 hover:text-white transition-colors duration-200`}
                              >
                                <Columns className="h-4 w-4 mr-2" />
                                شرائح
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  displayMode === "list" ? "default" : "outline"
                                }
                                onClick={() => setDisplayMode("list")}
                                className={`${
                                  displayMode === "list"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-white border-gray-500"
                                } hover:bg-blue-700 hover:text-white transition-colors duration-200`}
                              >
                                <AlignJustify className="h-4 w-4 mr-2" />
                                قائمة
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs xs:text-sm text-white font-semibold">
                              تأثير الانتقال بين الشرائح
                            </Label>
                            <Select
                              value={slideTransition}
                              onValueChange={setSlideTransition}
                            >
                              <SelectTrigger className="w-full bg-gray-800 text-white border-gray-500">
                                <SelectValue placeholder="اختر تأثير الانتقال" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 text-white border-gray-500">
                                {transitionOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="hover:bg-gray-700"
                                  >
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="auto-advance"
                              className="text-xs xs:text-sm text-white font-semibold"
                            >
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
                                onValueChange={(value) =>
                                  setAutoAdvanceInterval(value[0])
                                }
                                className="w-full"
                              />
                            </div>
                          )}

                          <div className="pt-4 border-t border-gray-500">
                            <div className="flex items-center gap-2 mb-2">
                              <Upload className="h-4 w-4 text-gray-400" />
                              <div className="font-bold text-white text-sm">
                                صورة في الخلفية
                              </div>
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
                                    onValueChange={(value) =>
                                      setImagePositionX(value[0])
                                    }
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
                                    onValueChange={(value) =>
                                      setImagePositionY(value[0])
                                    }
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2 mt-4">
                                  <Label className="text-xs xs:text-sm text-white font-semibold">
                                    الحجم: {imageSize}%
                                  </Label>
                                  <Slider
                                    min={10}
                                    max={100}
                                    step={1}
                                    value={[imageSize]}
                                    onValueChange={(value) =>
                                      setImageSize(value[0])
                                    }
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
                )}
              </div>

              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          selectedItem && toggleFavorite(selectedItem.title)
                        }
                        className="p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200"
                        aria-label={
                          selectedItem && favorites.includes(selectedItem.title)
                            ? "إزالة من المفضلة"
                            : "إضافة إلى المفضلة"
                        }
                        disabled={!selectedItem}
                      >
                        <Heart
                          className={`h-6 w-6 ${
                            selectedItem && favorites.includes(selectedItem.title)
                              ? "fill-red-500 text-red-500"
                              : "text-white"
                          }`}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {selectedItem && favorites.includes(selectedItem.title)
                        ? "إزالة من المفضلة"
                        : "إضافة إلى المفضلة"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          selectedItem && togglePlaylist(selectedItem.title)
                        }
                        className="p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200"
                        aria-label={
                          selectedItem && playlist.includes(selectedItem.title)
                            ? "إزالة من قائمة التشغيل"
                            : "إضافة إلى قائمة التشغيل"
                        }
                        disabled={!selectedItem}
                      >
                        <PlusCircle
                          className={`h-6 w-6 ${
                            selectedItem && playlist.includes(selectedItem.title)
                              ? "text-blue-500"
                              : "text-white"
                          }`}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {selectedItem && playlist.includes(selectedItem.title)
                        ? "إزالة من قائمة التشغيل"
                        : "إضافة إلى قائمة التشغيل"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {displayMode === "slides" && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-6 z-30">
                <button
                  onClick={handlePrevSlide}
                  className={`p-3 rounded-full bg-black/50 text-white transition-colors duration-200 ${
                    currentSlide === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/20"
                  }`}
                  disabled={currentSlide === 0}
                  aria-label="الشريحة السابقة"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <span className="text-white font-semibold">
                  {currentSlide + 1} / {selectedItem ? formatContent(selectedItem).length : 1}
                </span>

                <button
                  onClick={handleNextSlide}
                  className={`p-3 rounded-full bg-black/50 text-white transition-colors duration-200 ${
                    selectedItem ? currentSlide === formatContent(selectedItem).length - 1 : true
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/20"
                  }`}
                  disabled={selectedItem ? currentSlide === formatContent(selectedItem).length - 1 : true}
                  aria-label="الشريحة التالية"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
