"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Palette,
  Mic,
  Type,
  Copyright,
  Upload,
  Settings,
  Info,
  Heart,
  Download,
  AlignJustify,
  Columns,
  Book,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/app/ThemeContext";

// تعريفات الانواع المخصصة لـ SpeechRecognition
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

// تعريفات انواع البيانات لملف bible.json
interface BibleVerse {
  number: number;
  text: string;
}

interface BibleChapter {
  number: number;
  verses: BibleVerse[];
}

interface BibleBook {
  name: string;
  chapters: BibleChapter[];
}

interface BibleSection {
  name: string;
  books: BibleBook[];
}

type BibleData = BibleSection[];

type Theme = {
  background: string;
  text: string;
  name: string;
  isCustom?: boolean;
  customUrl?: string;
};

type SearchResult = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

type ChallengeType = "completeVerse" | "identifyBook";

interface Challenge {
  type: ChallengeType;
  question: string;
  correctAnswer: string;
  options: string[];
}

const themes: Theme[] = [
  { name: "افتراضي", background: "bg-black", text: "text-white" },
  { name: "ازرق داكن", background: "bg-gradient-to-br from-blue-800 to-blue-950", text: "text-white" },
  { name: "اخضر داكن", background: "bg-gradient-to-br from-emerald-800 to-green-950", text: "text-white" },
  { name: "ارجواني داكن", background: "bg-gradient-to-br from-purple-800 to-purple-950", text: "text-white" },
  { name: "فاتح", background: "bg-gradient-to-br from-gray-100 to-white", text: "text-black" },
  { name: "بني فاتح", background: "bg-gradient-to-br from-amber-50 to-amber-100", text: "text-amber-900" },
  { name: "رمادي داكن", background: "bg-gradient-to-br from-gray-700 to-gray-900", text: "text-white" },
  { name: "احمر داكن", background: "bg-gradient-to-br from-red-800 to-red-950", text: "text-white" },
  { name: "برتقالي داكن", background: "bg-gradient-to-br from-orange-800 to-orange-950", text: "text-white" },
  { name: "اصفر فاتح", background: "bg-gradient-to-br from-yellow-50 to-yellow-200", text: "text-yellow-900" },
];

const textColors = [
  { name: "ابيض", class: "text-white" },
  { name: "اسود", class: "text-black" },
  { name: "احمر", class: "text-red-500" },
  { name: "اخضر", class: "text-green-500" },
  { name: "ازرق", class: "text-blue-500" },
  { name: "اصفر", class: "text-yellow-500" },
  { name: "برتقالي", class: "text-orange-500" },
  { name: "بنفسجي", class: "text-purple-500" },
];

// تعريف الاختصارات لاسماء الاسفار
const bookAbbreviations: { [key: string]: string } = {
  // العهد القديم
  "تك": "تكوين",
  "خر": "خروج",
  "لا": "لاويين",
  "عد": "عدد",
  "تث": "تثنية",
  "يش": "يشوع",
  "قض": "قضاة",
  "را": "راعوث",
  "1 صم": "صموئيل الاول",
  "2 صم": "صموئيل الثاني",
  "1 مل": "ملوك الاول",
  "2 مل": "ملوك الثاني",
  "1 اخ": "اخبار الايام الاول",
  "2 اخ": "اخبار الايام الثاني",
  "عز": "عزرا",
  "نح": "نحميا",
  "اس": "استير",
  "اي": "ايوب",
  "مز": "مزامير",
  "ام": "امثال",
  "جا": "جامعة",
  "نش": "نشيد الانشاد",
  "اش": "اشعياء",
  "ار": "ارميا",
  "مرا": "مراثي ارميا",
  "حز": "حزقيال",
  "دا": "دانيال",
  "هو": "هوشع",
  "يوئ": "يوئيل",
  "عا": "عاموس",
  "عو": "عوبديا",
  "يون": "يونان",
  "مي": "ميخا",
  "نا": "ناحوم",
  "حب": "حبقوق",
  "صف": "صفنيا",
  "حج": "حجي",
  "زك": "زكريا",
  "مل": "ملاخي",
  // العهد الجديد
  "مت": "متى",
  "مر": "مرقس",
  "لو": "لوقا",
  "يو": "يوحنا",
  "اع": "اعمال الرسل",
  "رو": "رومية",
  "1 كو": "كورنثوس الاولى",
  "2 كو": "كورنثوس الثانية",
  "غل": "غلاطية",
  "اف": "افسس",
  "في": "فيلبي",
  "كو": "كولوسي",
  "1 تس": "تسالونيكي الاولى",
  "2 تس": "تسالونيكي الثانية",
  "1 تي": "تيموثاوس الاولى",
  "2 تي": "تيموثاوس الثانية",
  "تي": "تيطس",
  "فيم": "فيلمون",
  "عب": "عبرانيين",
  "يع": "يعقوب",
  "1 بط": "بطرس الاولى",
  "2 بط": "بطرس الثانية",
  "1 يو": "يوحنا الاولى",
  "2 يو": "يوحنا الثانية",
  "3 يو": "يوحنا الثالثة",
  "يه": "يهوذا",
  "رؤ": "رؤيا يوحنا",
};

export default function TextBible() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .arabic-text {
        font-family: 'Noto Sans Arabic', sans-serif;
        font-weight: 900;
        text-align: center;
        direction: rtl;
        word-spacing: 0.1em;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: 'liga' on, 'calt' on;
        text-rendering: optimizeLegibility;
      }
    `;
    document.head.appendChild(style);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&display=swap";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(style);
      document.head.removeChild(link);
    };
  }, []);

  const [bibleData, setBibleData] = useState<BibleData | null>(null);
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [chapterText, setChapterText] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [currentTextColor, setCurrentTextColor] = useState(textColors[0]);
  const [globalFontSize, setGlobalFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const savedFontSize = localStorage.getItem("globalFontSize");
      return savedFontSize ? parseInt(savedFontSize, 10) : 48;
    }
    return 48;
  });
  const [watermark, setWatermark] = useState("");
  const [watermarkColor, setWatermarkColor] = useState(textColors[0]);
  const [watermarkFontSize, setWatermarkFontSize] = useState(20);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentBibleSearches, setRecentBibleSearches] = useState<string[]>([]);
  const [favoriteBibleChapters, setFavoriteBibleChapters] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<"slides" | "list">("slides");
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoAdvanceInterval, setAutoAdvanceInterval] = useState(10);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);
  const [imageSize, setImageSize] = useState(50);
  const [searchMode, setSearchMode] = useState<"books" | "verses">("books");
  const [verseSearchResults, setVerseSearchResults] = useState<SearchResult[]>([]);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [score, setScore] = useState(() => {
    if (typeof window !== "undefined") {
      const savedScore = localStorage.getItem("bibleChallengeScore");
      return savedScore ? parseInt(savedScore, 10) : 0;
    }
    return 0;
  });
  const [bookMap, setBookMap] = useState<{ [key: string]: BibleBook }>({});

  // Precompute maps for abbreviations for performance optimization
  const bookToAbbrKeysMap = useMemo(() => {
    const map: { [bookFullName: string]: string[] } = {};
    for (const abbrKey in bookAbbreviations) {
        const fullBookName = bookAbbreviations[abbrKey];
        if (!map[fullBookName]) {
            map[fullBookName] = [];
        }
        map[fullBookName].push(abbrKey);
    }
    return map;
  }, []); // bookAbbreviations is a global const, so this runs once

  const lowerAbbrToOriginalBookNameMap = useMemo(() => {
    const map: { [lcAbbr: string]: string } = {};
    for (const abbrKey in bookAbbreviations) {
        map[abbrKey.toLowerCase()] = bookAbbreviations[abbrKey];
    }
    return map;
  }, []); // bookAbbreviations is a global const, so this runs once

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

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
    const setInitialFontSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setGlobalFontSize((prev) => {
          const savedFontSize = localStorage.getItem("globalFontSize");
          return savedFontSize ? parseInt(savedFontSize, 10) : 36;
        });
      } else if (width >= 640 && width < 1024) {
        setGlobalFontSize((prev) => {
          const savedFontSize = localStorage.getItem("globalFontSize");
          return savedFontSize ? parseInt(savedFontSize, 10) : 48;
        });
      } else {
        setGlobalFontSize((prev) => {
          const savedFontSize = localStorage.getItem("globalFontSize");
          return savedFontSize ? parseInt(savedFontSize, 10) : 64;
        });
      }
    };

    setInitialFontSize();
    window.addEventListener("resize", setInitialFontSize);
    return () => window.removeEventListener("resize", setInitialFontSize);
  }, []);

  useEffect(() => {
    fetch("/bible.json", {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((rawData: BibleData) => {
        // Process data: trim book names throughout the structure
        const processedData = rawData.map(section => ({
          ...section,
          books: section.books.map(book => ({
            ...book,
            name: book.name.trim(), // Trim book name
            // chapters: book.chapters.map(ch => ({ // Assuming chapters and verses don't need trimming for now
            //   ...ch,
            //   verses: ch.verses.map(v => ({...v, text: v.text.trim() })) 
            // }))
          }))
        }));
        setBibleData(processedData); // Store the fully processed data

        const allBooksFromProcessedData = processedData.flatMap((section) => section.books);
        const uniqueBookNames = Array.from(new Set(allBooksFromProcessedData.map((book) => book.name))); // Names are already trimmed
        setBooks(uniqueBookNames);
        setFilteredBooks(uniqueBookNames);

        const bookMapTemp: { [key: string]: BibleBook } = {};
        allBooksFromProcessedData.forEach((book) => { // book.name is already trimmed
          bookMapTemp[book.name] = book; // book itself is from processedData, so its 'name' is trimmed
        });
        setBookMap(bookMapTemp);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading Bible data:", err);
        setError("فشل تحميل بيانات الكتاب المقدس.");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedBook && bibleData) {
      const bookData = bookMap[selectedBook];
      if (bookData) {
        const chapters = bookData.chapters.map((chapter) => chapter.number);
        setChapters(chapters.sort((a, b) => a - b));
        setSelectedChapter("");
        setChapterText([]);
        setCurrentSlide(0);
        setShowFullScreen(false);
      }
    }
  }, [selectedBook, bibleData, bookMap]);

  useEffect(() => {
    if (selectedBook && selectedChapter && bibleData) {
      const bookData = bookMap[selectedBook];
      if (bookData) {
        const chapterNumber = parseInt(selectedChapter);
        const chapterData = bookData.chapters.find(
          (chapter) => chapter.number === chapterNumber
        );
        if (chapterData) {
          const verses = chapterData.verses.map(
            (verse) => `${selectedBook} ${chapterNumber}:${verse.number}\n${verse.text}`
          );
          setChapterText(verses);
          setCurrentSlide(0);
          setShowFullScreen(true);
          document.documentElement.requestFullscreen().catch((err) =>
            console.warn("Error enabling fullscreen:", err)
          );
        } else {
          setError("لم يتم العثور على نص الاصحاح المحدد.");
        }
      }
    }
  }, [selectedBook, selectedChapter, bibleData, bookMap]);

  useEffect(() => {
    if (searchMode === "books") {
      const query = searchQuery.toLowerCase().trim();
      if (query === "") {
        setFilteredBooks(books);
        setShowSearchDropdown(false);
      } else {
        const results = books.filter(bookName => {
          const lowerBookName = bookName.toLowerCase();

          // Condition 1: Query is part of the full book name
          if (lowerBookName.includes(query)) {
            return true;
          }

          // Condition 2: Query is part of an abbreviation for this book
          // This can be optimized later with a precomputed map
          for (const abbrKey in bookAbbreviations) {
            if (bookAbbreviations[abbrKey] === bookName && abbrKey.toLowerCase().includes(query)) {
              return true;
            }
          }
          
          // Condition 3: Query is a number ("1", "2", "3") and matches numbered books
          if (/^[1-3]$/.test(query)) { // Query is "1", "2", or "3"
            // Check full book names containing "الاول", "الثاني", "الثالث"
            if (query === "1" && (lowerBookName.includes("الاول") || lowerBookName.includes("الأول"))) return true;
            if (query === "2" && (lowerBookName.includes("الثاني") || lowerBookName.includes("الثانية"))) return true;
            if (query === "3" && (lowerBookName.includes("الثالث") || lowerBookName.includes("الثالثة"))) return true;

            // Also check if an abbreviation for this book *starts with* the number query + space
            // This can be optimized later with a precomputed map
            for (const abbrKey in bookAbbreviations) {
              if (bookAbbreviations[abbrKey] === bookName && abbrKey.startsWith(query + " ")) {
                return true;
              }
            }
          }
          return false;
        });
        setFilteredBooks(results);
        setShowSearchDropdown(query !== "" && results.length > 0);
      }
    } else { // searchMode === "verses"
      setShowSearchDropdown(false); // No dropdown for verse search
    }
  }, [searchQuery, books, searchMode, bookAbbreviations]); // Added bookAbbreviations to dependencies, though it's const, for correctness if it were dynamic. Better to create maps outside with useMemo.

  const handleSearchBookSelect = (book: string) => {
    setSelectedBook(book);
    setSearchQuery("");
    setShowSearchDropdown(false);
    if (searchQuery) {
      addToRecentBibleSearches(searchQuery);
    }
  };

  // دالة لتحليل استعلام البحث (اختصار السفر + رقم الاصحاح)
 const parseBookChapter = (query: string) => {
  const parts = query.trim().split(/\s+/);
  if (parts.length < 2) return null;

  let bookAbbr = '';
  let chapter = '';
  for (let i = 0; i < parts.length; i++) {
    bookAbbr = parts.slice(0, i + 1).join(" ");
    if (bookAbbreviations[bookAbbr]) {
      chapter = parts.slice(i + 1).join(" ");
      break;
    }
  }

  if (!bookAbbreviations[bookAbbr] || !/^\d+$/.test(chapter)) {
    return null;
  }

  return { book: bookAbbreviations[bookAbbr], chapter: parseInt(chapter) };
};

  // دالة لمعالجة البحث المباشر عند الضغط على Enter
  const handleBooksSearch = () => {
  const parsed = parseBookChapter(searchQuery);
  if (parsed) {
    const { book, chapter } = parsed;
    const bookData = bookMap[book];
    if (bookData) {
      const chapterData = bookData.chapters.find((ch) => ch.number === chapter);
      if (chapterData) {
        const verses = chapterData.verses.map(
          (verse) => `${book} ${chapter}:${verse.number}\n${verse.text}`
        );
        setSelectedBook(book);
        setSelectedChapter(chapter.toString());
        setChapterText(verses);
        setCurrentSlide(0);
        setShowFullScreen(true);
        document.documentElement.requestFullscreen().catch((err) =>
          console.warn("Error enabling fullscreen:", err)
        );
        setSearchQuery("");
        setShowSearchDropdown(false);
        addToRecentBibleSearches(searchQuery);
      } else {
        setError(`الاصحاح ${chapter} غير موجود في ${book}.`);
      }
    } else {
      setError(`السفر "${book}" غير موجود.`);
    }
  } else {
    setError("يرجى إدخال اختصار صحيح مثل 'مت 2' أو '1 يو 3'.");
  }
};

  // Function to handle selection of a verse from search results
  const handleVerseResultSelect = useCallback((result: SearchResult) => {
    setSelectedBook(result.book);
    setSelectedChapter(result.chapter.toString());
    // This will trigger the useEffect to load the chapter and display it in fullscreen.
    // The favorite button will then have the correct selectedBook and selectedChapter.
    setVerseSearchResults([]); // Clear the list of verse search results
    // Consider clearing searchQuery as well if appropriate for UX
    // setSearchQuery(""); 
  }, [setSelectedBook, setSelectedChapter, setVerseSearchResults]);

  const removeArabicDiacritics = (text: string): string => {    return text
      .normalize("NFD")
      .replace(/[\u0610-\u061A\u064B-\u065F]/g, "")
      .normalize("NFC");
  };

  const handleVerseSearch = () => {
    if (!bibleData || !searchQuery.trim()) return;
    const query = removeArabicDiacritics(searchQuery.toLowerCase().trim());
    const results: SearchResult[] = [];
    const startTime = performance.now();

    // استخدام flatMap لتسريع البحث
    const allVerses = bibleData
      .flatMap((section) => section.books)
      .flatMap((book) => book.chapters.map((chapter) => ({ book, chapter })))
      .flatMap(({ book, chapter }) =>
        chapter.verses.map((verse) => ({
          book: book.name,
          chapter: chapter.number,
          verse: verse.number,
          text: verse.text,
        }))
      );

    allVerses.forEach((verse) => {
      const verseText = removeArabicDiacritics(verse.text.toLowerCase());
      if (verseText.includes(query)) {
        results.push(verse);
      }
    });

    const endTime = performance.now();
    console.log(`Verse search took ${(endTime - startTime).toFixed(2)}ms`);

    setVerseSearchResults(results);
    setShowSearchDropdown(true);
    addToRecentBibleSearches(searchQuery);
  };

  const handleVoiceSearch = () => {
    if (!recognition) {
      setVoiceError("متصفحك لا يدعم البحث الصوتي. جرب Chrome او Edge.");
      return;
    }
    if (!navigator.onLine) {
      setVoiceError("تحتاج الى الاتصال بالانترنت لاستخدام البحث الصوتي.");
      return;
    }
    setVoiceError(null);
    setIsListening((prev) => !prev);
    if (!isListening) {
      try {
        recognition.start();
      } catch (err) {
        console.error("خطا اثناء بدء التسجيل:", err);
        setVoiceError("فشل بدء التسجيل. تاكد من اعدادات الميكروفون.");
        setIsListening(false);
        return;
      }
      recognition.onresult = (event) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          addToRecentBibleSearches(transcript);
          if (searchMode === "verses") {
            handleVerseSearch();
          } else {
            handleBooksSearch();
          }
        } else {
          setVoiceError("لم يتم التعرف على اي كلام. حاول التحدث بصوت اعلى.");
        }
        setIsListening(false);
      };
      recognition.onerror = (event) => {
        setIsListening(false);
        let errorMessage = "حدث خطا اثناء البحث الصوتي: ";
        switch (event.error) {
          case "no-speech":
            errorMessage += "لم يتم التعرف على اي صوت.";
            break;
          case "audio-capture":
            errorMessage += "فشل التقاط الصوت. تاكد من الميكروفون.";
            break;
          case "not-allowed":
            errorMessage += "لم يتم منح اذن الميكروفون.";
            break;
          case "network":
            errorMessage += "فشل الاتصال بالخادم.";
            break;
          default:
            errorMessage += event.error;
        }
        setVoiceError(errorMessage);
      };
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
    }
  };

  useEffect(() => {
    return () => {
      if (recognition && isListening) recognition.stop();
    };
  }, [isListening, recognition]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSearches = localStorage.getItem("recentBibleSearches");
      if (savedSearches) setRecentBibleSearches(JSON.parse(savedSearches));
      const savedFavorites = localStorage.getItem("favoriteBibleChapters");
      if (savedFavorites) setFavoriteBibleChapters(JSON.parse(savedFavorites));
    }
  }, []);

  const addToRecentBibleSearches = (query: string) => {
    if (!query.trim()) return;
    setRecentBibleSearches((prev) => {
      const newSearches = [query, ...prev.filter((s) => s !== query)].slice(0, 5);
      if (typeof window !== "undefined") {
        localStorage.setItem("recentBibleSearches", JSON.stringify(newSearches));
      }
      return newSearches;
    });
  };

  const nextSlide = useCallback(() => {
    if (currentSlide < chapterText.length - 1) setCurrentSlide(currentSlide + 1);
  }, [currentSlide, chapterText]);

  const previousSlide = useCallback(() => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
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
    if (deltaX > swipeThreshold) nextSlide();
    else if (deltaX < -swipeThreshold) previousSlide();
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const exitFullScreen = useCallback(() => {
    setShowFullScreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) =>
        console.warn("Error exiting fullscreen:", err)
      );
    }
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const handleUploadBackground = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        alert("يرجى اختيار ملف صورة (مثل PNG، JPG، GIF، الخ).");
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
        alert("يرجى اختيار ملف صورة (مثل PNG، JPG، GIF، الخ).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setBackgroundImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!showFullScreen || !chapterText.length) return;
      if (event.key === "ArrowRight" || event.key === "ArrowUp") previousSlide();
      else if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextSlide();
      else if (event.key === "Escape") exitFullScreen();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showFullScreen, currentSlide, chapterText, exitFullScreen, nextSlide, previousSlide]);

  useEffect(() => {
    if (showFullScreen && autoAdvance && chapterText.length > 0) {
      if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = setInterval(() => {
        if (currentSlide < chapterText.length - 1) {
          setCurrentSlide((prev) => prev + 1);
        } else {
          clearInterval(autoAdvanceTimerRef.current!);
          autoAdvanceTimerRef.current = null;
        }
      }, autoAdvanceInterval * 1000);
      return () => {
        if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
      };
    }
  }, [showFullScreen, autoAdvance, autoAdvanceInterval, currentSlide, chapterText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFavorite = useCallback((bookChapter: string) => {
    setFavoriteBibleChapters((prev) => {
      const newFavorites = prev.includes(bookChapter)
        ? prev.filter((fav) => fav !== bookChapter)
        : [...prev, bookChapter];
      if (typeof window !== "undefined") {
        localStorage.setItem("favoriteBibleChapters", JSON.stringify(newFavorites));
      }
      return newFavorites;
    });
  }, []);

  const saveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("globalFontSize", globalFontSize.toString());
    }
    setShowSettings(false);
  };

  const calculateDynamicFontSize = (text: string) => {
    const textLength = text.length;
    const baseFontSize = globalFontSize;
    const minFontSize = 20;
    const maxFontSize = 96;
    if (textLength < 50) return Math.min(baseFontSize * 1.2, maxFontSize);
    else if (textLength > 200) return Math.max(baseFontSize * 0.8, minFontSize);
    return baseFontSize;
  };

  const generateChallenge = useCallback(() => {
    if (!bibleData) return;
    const challengeTypes: ChallengeType[] = ["completeVerse", "identifyBook"];
    const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    let question = "";
    let correctAnswer = "";
    let options: string[] = [];
    if (randomType === "completeVerse") {
      const allVerses = bibleData.flatMap((section) =>
        section.books.flatMap((book) =>
          book.chapters.flatMap((chapter) => chapter.verses)
        )
      );
      const randomVerse = allVerses[Math.floor(Math.random() * allVerses.length)];
      const words = randomVerse.text.split(" ");
      if (words.length < 4) return;
      const hiddenIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
      const hiddenWord = words[hiddenIndex];
      words[hiddenIndex] = "_____";
      question = words.join(" ");
      correctAnswer = hiddenWord;
      options = [hiddenWord];
      while (options.length < 4) {
        const randomWord =
          allVerses[Math.floor(Math.random() * allVerses.length)].text.split(" ")[
            Math.floor(Math.random() * 5)
          ];
        if (!options.includes(randomWord) && randomWord !== hiddenWord) {
          options.push(randomWord);
        }
      }
      options.sort(() => Math.random() - 0.5);
    } else if (randomType === "identifyBook") {
      const allBooks = bibleData.flatMap((section) => section.books);
      const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
      const randomChapter =
        randomBook.chapters[Math.floor(Math.random() * randomBook.chapters.length)];
      const randomVerse =
        randomChapter.verses[Math.floor(Math.random() * randomChapter.verses.length)];
      const verseSnippet = randomVerse.text.split(" ").slice(0, 5).join(" ") + "...";
      question = `في اي سفر تجد هذه الآية: "${verseSnippet}"؟`;
      correctAnswer = randomBook.name;
      options = [randomBook.name];
      while (options.length < 4) {
        const randomBookName = allBooks[Math.floor(Math.random() * allBooks.length)].name;
        if (!options.includes(randomBookName)) options.push(randomBookName);
      }
      options.sort(() => Math.random() - 0.5);
    }
    setChallenge({ type: randomType, question, correctAnswer, options });
  }, [bibleData]);

  const handleChallengeAnswer = (answer: string) => {
    if (!challenge) return;
    const isCorrect = answer === challenge.correctAnswer;
    const newScore = isCorrect ? score + 10 : score - 5;
    setScore(newScore);
    if (typeof window !== "undefined") {
      localStorage.setItem("bibleChallengeScore", newScore.toString());
    }
    alert(isCorrect ? "اجابة صحيحة! +10 نقاط" : "اجابة خاطئة. -5 نقاط");
    generateChallenge();
  };

  useEffect(() => {
    if (showChallenge && !challenge) generateChallenge();
  }, [showChallenge, challenge, generateChallenge]);

  return (
    <div className={`relative min-h-screen bg-background ${theme === "dark" ? "dark" : ""}`}>
      {!showFullScreen ? (
        <div className="p-4 sm:p-6 w-full">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 text-foreground">
              الكتاب المقدس
            </h1>
            <p className="text-muted-foreground text-center max-w-md text-sm sm:text-base font-semibold">
              ابحث في الكتاب المقدس وعرض النصوص بطريقة احترافية
            </p>
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground">جاري التحميل...</p>
          ) : error ? (
            <p className="text-center text-destructive font-semibold">{error}</p>
          ) : (
            <>
              <div className="relative w-full max-w-3xl mx-auto mb-4 sm:mb-6" ref={searchRef}>
                <div className="absolute inset-0 bg-black rounded-2xl blur-xl opacity-20 -z-10"></div>

                <div className="flex justify-end gap-4 mb-2">
                  <button
                    onClick={() => setSearchMode("books")}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full ${
                      searchMode === "books"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    } transition-colors duration-200`}
                    aria-label="بحث في الاسفار"
                  >
                    <Book className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">بحث في الاسفار</span>
                  </button>
                  <button
                    onClick={() => setSearchMode("verses")}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full ${
                      searchMode === "verses"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    } transition-colors duration-200`}
                    aria-label="بحث في الآيات"
                  >
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">بحث في الآيات</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full">
                  <div className="relative flex-1 flex items-center">
                    <Input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setError(null);
                        if (e.target.value.trim()) {
                          setShowRecentSearches(false);
                          setShowChallenge(false);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          if (searchMode === "verses") handleVerseSearch();
                          else if (searchMode === "books") handleBooksSearch();
                        }
                      }}
                      onFocus={() => {
                        if (!searchQuery.trim() && recentBibleSearches.length > 0)
                          setShowRecentSearches(true);
                      }}
                      placeholder={
                        searchMode === "books"
                          ? "    ابحث مثل 'مت 2' او '1 يو 3'"
                          : "ابحث في الآيات..."
                      }
                      className={`w-full pr-4 py-3 sm:py-4 text-sm sm:text-base rounded-xl border-2 ${
                        theme === "dark" ? "border-white" : "border-black"
                      } bg-card text-foreground shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ring focus:border-${
                        theme === "dark" ? "white" : "black"
                      } backdrop-blur-sm hover:shadow-2xl pl-16 sm:pl-20`}
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={handleVoiceSearch}
                        className={`p-2 rounded-full hover:bg-muted transition-colors duration-200 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center ${
                          isListening ? "bg-destructive text-destructive-foreground" : ""
                        }`}
                      >
                        <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-muted transition-colors duration-200 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center"
                      >
                        {theme === "dark" ? "☀️" : "🌙"}
                      </button>
                    </div>
                  </div>
                  {searchMode === "verses" && (
                    <Button
                      onClick={handleVerseSearch}
                      className="p-2 rounded-xl bg-primary text-primary-foreground transition-colors duration-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                      aria-label="بحث"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </Button>
                  )}
                </div>
                <AnimatePresence>
                  {showSearchDropdown && searchMode === "books" && filteredBooks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute w-full mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50"
                    >
                      {filteredBooks.map((book) => (
                        <button
                          key={book}
                          onClick={() => handleSearchBookSelect(book)}
                          className="w-full text-right px-4 sm:px-6 py-3 text-sm sm:text-base hover:bg-muted text-foreground transition-colors duration-200 border-b border-border last:border-b-0"
                        >
                          {book}
                        </button>
                      ))}
                    </motion.div>
                  )}
                  {showSearchDropdown && searchMode === "verses" && verseSearchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute w-full mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50"
                    >
                      {verseSearchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const bookData = bookMap[result.book];
                            if (bookData) {
                              const chapterData = bookData.chapters.find(
                                (ch) => ch.number === result.chapter
                              );
                              if (chapterData) {
                                const verses = chapterData.verses.map(
                                  (verse) =>
                                    `${result.book} ${result.chapter}:${verse.number}\n${verse.text}`
                                );
                                setSelectedBook(result.book);
                                setSelectedChapter(result.chapter.toString());
                                setChapterText(verses);
                                setCurrentSlide(result.verse - 1);
                                setShowFullScreen(true);
                                document.documentElement.requestFullscreen().catch((err) =>
                                  console.warn("Error enabling fullscreen:", err)
                                );
                                setShowSearchDropdown(false);
                              }
                            }
                          }}
                          className="w-full text-right px-4 py-3 text-sm hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          {`${result.book} ${result.chapter}:${result.verse} - ${result.text.substring(
                            0,
                            50
                          )}...`}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {showSearchDropdown &&
                  searchMode === "books" &&
                  filteredBooks.length === 0 &&
                  searchQuery && (
                    <div className="absolute w-full mt-2 bg-card border border-border rounded-xl shadow-2xl p-2 text-right text-destructive z-50">
                      لا توجد اسفار مطابقة
                    </div>
                  )}
                {showSearchDropdown &&
                  searchMode === "verses" &&
                  verseSearchResults.length === 0 &&
                  searchQuery && (
                    <div className="absolute w-full mt-2 bg-card border border-border rounded-xl shadow-2xl p-2 text-right text-destructive z-50">
                      لا توجد آيات مطابقة
                    </div>
                  )}
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
                {showRecentSearches && recentBibleSearches.length > 0 && !searchQuery.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full max-w-3xl mx-auto mt-4 rounded-2xl overflow-hidden shadow-2xl bg-card text-foreground z-50"
                  >
                    <div className="p-3 border-b border-border">
                      <h3 className="text-sm font-medium text-muted-foreground">البحث الاخير</h3>
                    </div>
                    <div className="max-h-[30vh] overflow-y-auto">
                      {recentBibleSearches.map((search, index) => (
                        <button
                          key={index}
                          className="w-full text-right px-4 sm:px-6 py-3 text-sm sm:text-base hover:bg-muted text-foreground transition-colors duration-200 border-b border-border last:border-b-0 flex items-center"
                          onClick={() => setSearchQuery(search)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-muted-foreground ml-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          {search}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 w-full max-w-3xl mx-auto">
                <Select value={selectedBook} onValueChange={(v) => setSelectedBook(v)}>
                  <SelectTrigger
                    className={`bg-card text-foreground border-2 ${
                      theme === "dark" ? "border-white" : "border-black"
                    } rounded-xl shadow-xl focus:ring-4 focus:ring-ring focus:border-${
                      theme === "dark" ? "white" : "black"
                    } text-sm sm:text-base py-4 sm:py-5`}
                  >
                    <SelectValue placeholder="اختر السفر" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                    {books.map((book) => (
                      <SelectItem
                        key={book}
                        value={book}
                        className="text-right px-4 sm:px-6 py-3 text-sm sm:text-base text-foreground hover:bg-muted transition-colors duration-200 border-b border-border last:border-b-0 focus:bg-muted"
                      >
                        {book}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedChapter}
                  onValueChange={(v) => setSelectedChapter(v)}
                  disabled={!selectedBook}
                >
                  <SelectTrigger
                    className={`bg-card text-foreground border-2 ${
                      theme === "dark" ? "border-white" : "border-black"
                    } rounded-xl shadow-xl focus:ring-4 focus:ring-ring focus:border-${
                      theme === "dark" ? "white" : "black"
                    } text-sm sm:text-base py-4 sm:py-5`}
                  >
                    <SelectValue placeholder="اختر الاصحاح" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                    {chapters.map((chapter) => (
                      <SelectItem
                        key={chapter}
                        value={chapter.toString()}
                        className="text-right px-4 sm:px-6 py-3 text-sm sm:text-base text-foreground hover:bg-muted transition-colors duration-200 border-b border-border last:border-b-0 focus:bg-muted"
                      >
                        الاصحاح {chapter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {favoriteBibleChapters.length > 0 && !searchQuery.trim() && !showRecentSearches && !showChallenge && (
                <div className="w-full max-w-3xl mx-auto mt-6 sm:mt-8">
                  <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">المفضلة</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteBibleChapters.map((fav, index) => {
                      const [book, chapter] = fav.split(":");
                      return (
                        <Card key={index} className="overflow-hidden hover:shadow-md transition-all">
                          <CardContent className="p-4 flex justify-between items-center">
                            <button
                              className="flex-1 text-right font-semibold text-foreground"
                              onClick={() => {
                                setSelectedBook(book);
                                setSelectedChapter(chapter);
                              }}
                            >
                              {book} {chapter}
                            </button>
                            <button
                              onClick={() => toggleFavorite(fav)}
                              className="ml-2 p-2 rounded-full hover:bg-muted"
                            >
                              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                            </button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {!searchQuery.trim() && !showRecentSearches && (
                <div className="w-full max-w-3xl mx-auto mt-6 sm:mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      تحدي الكتاب المقدس
                    </h2>
                    <Button
                      onClick={() => {
                        setShowChallenge(true);
                        generateChallenge();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      ابدا التحدي
                    </Button>
                  </div>
                  {showChallenge && challenge && (
                    <Card className="p-4">
                      <CardContent>
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold">النقاط: {score}</h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {challenge.type === "completeVerse" ? "اكمل الآية:" : "في اي سفر؟"}
                          </p>
                          <p className="text-base font-semibold mt-2">{challenge.question}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {challenge.options.map((option, index) => (
                            <Button
                              key={index}
                              onClick={() => handleChallengeAnswer(option)}
                              className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                        <Button
                          onClick={generateChallenge}
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          تحدي جديد
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative w-full h-full flex items-center justify-center z-20"
            >
              {chapterText.length > 0 ? (
                displayMode === "slides" ? (
                  <div className="text-center px-4 sm:px-8 w-full h-full flex items-center justify-center">
                    <p
                      className={`font-extrabold ${currentTextColor.class} leading-relaxed whitespace-pre-line arabic-text max-w-4xl sm:max-w-6xl mx-auto responsive-text text-center font-[900]`}
                      style={{
                        fontSize: `${
                          chapterText[currentSlide]
                            ? calculateDynamicFontSize(chapterText[currentSlide])
                            : globalFontSize
                        }px`,
                        lineHeight: `${lineSpacing}`,
                        fontFamily: '"Noto Sans Arabic", sans-serif',
                        fontWeight: 900,
                      }}
                    >
                      {chapterText[currentSlide]}
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full overflow-y-auto px-4 sm:px-8 py-10 sm:py-12 flex flex-col items-center">
                    {chapterText.map((text, index) => (
                      <p
                        key={index}
                        className={`font-extrabold ${currentTextColor.class} leading-relaxed whitespace-pre-line arabic-text mb-8 max-w-4xl sm:max-w-6xl mx-auto responsive-text text-center font-[900]`}
                        style={{
                          fontSize: `${calculateDynamicFontSize(text)}px`,
                          lineHeight: `${lineSpacing}`,
                          fontFamily: '"Noto Sans Arabic", sans-serif',
                          fontWeight: 900,
                        }}
                      >
                        {text}
                      </p>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center px-4 sm:px-8 w-full h-full flex items-center justify-center">
                  <p
                    className={`font-extrabold ${currentTextColor.class} leading-relaxed whitespace-pre-line arabic-text max-w-4xl sm:max-w-6xl mx-auto responsive-text text-center font-[900]`}
                    style={{
                      fontSize: `${globalFontSize}px`,
                      lineHeight: `${lineSpacing}`,
                      fontFamily: '"Noto Sans Arabic", sans-serif',
                      fontWeight: 900,
                    }}
                  >
                    لا يوجد محتوى لعرضه
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
                aria-label="اغلاق"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSettings((prev) => !prev)}
                  className="p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200"
                  aria-label="الاعدادات"
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
                        onValueChange={(value) => setActiveTab(value)}
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
                              اضافة خلفية مخصصة
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
                              <Label className="text-xs xs:text-sm text-white font-semibold">
                                حجم الخط: {globalFontSize}px
                              </Label>
                            </div>
                            <Slider
                              min={20}
                              max={96}
                              step={2}
                              value={[globalFontSize]}
                              onValueChange={(value) => setGlobalFontSize(value[0])}
                            />
                          </div>

                          <div className="space-y-2 mt-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs xs:text-sm text-white font-semibold">
                                المسافة بين السطور: {lineSpacing.toFixed(1)}
                              </Label>
                            </div>
                            <Slider
                              min={1.2}
                              max={3}
                              step={0.1}
                              value={[lineSpacing]}
                              onValueChange={(value) => setLineSpacing(value[0])}
                            />
                          </div>

                          <div className="pt-4 border-t border-gray-500">
                            <div className="flex items-center gap-2 mb-2">
                              <Copyright className="h-4 w-4 text-gray-400" />
                              <div className="font-bold text-white text-sm">الشعار</div>
                            </div>
                            <Input
                              type="text"
                              value={watermark}
                              onChange={(e) => setWatermark(e.target.value)}
                              placeholder="ادخل نص الشعار هنا"
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
                            <Label
                              htmlFor="display-mode"
                              className="text-xs xs:text-sm text-white font-semibold"
                            >
                              وضع العرض
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant={displayMode === "slides" ? "default" : "outline"}
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
                                variant={displayMode === "list" ? "default" : "outline"}
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
                                onValueChange={(value) => setAutoAdvanceInterval(value[0])}
                              />
                            </div>
                          )}

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
                                    الموضع الافقي: {imagePositionX}%
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
                                  <Label className="text-xs xs:text-sm text-white font-semibold">
                                    الحجم: {imageSize}%
                                  </Label>
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
                                  ازالة الصورة
                                </Button>
                              </>
                            )}
                          </div>

                          <div className="pt-4 border-t border-gray-500">
                            <div className="flex items-center gap-2 mb-4">
                              <Info className="h-4 w-4 text-gray-400" />
                              <div className="font-bold text-white text-sm">معلومات</div>
                            </div>
                            <div className="text-xs xs:text-sm text-gray-400 space-y-2">
                              <p>استخدم مفاتيح الاسهم للتنقل بين الشرائح</p>
                              <p>اضغط ESC للخروج من وضع ملء الشاشة</p>
                              <p>اسحب يمينًا او يسارًا على الموبايل للتنقل</p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                      <Button
                        className="w-full mt-6 text-xs xs:text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                        onClick={saveSettings}
                      >
                        حفظ الاعدادات
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
                        onClick={() => toggleFavorite(`${selectedBook}:${selectedChapter}`)}
                        className="p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200"
                        aria-label={
                          favoriteBibleChapters.includes(`${selectedBook}:${selectedChapter}`)
                            ? "ازالة من المفضلة"
                            : "اضافة الى المفضلة"
                        }
                        disabled={!selectedBook || !selectedChapter}
                      >
                        <Heart
                          className={`h-6 w-6 ${
                            favoriteBibleChapters.includes(`${selectedBook}:${selectedChapter}`)
                              ? "fill-red-500 text-red-500"
                              : "text-white"
                          }`}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {favoriteBibleChapters.includes(`${selectedBook}:${selectedChapter}`)
                        ? "ازالة من المفضلة"
                        : "اضافة الى المفضلة"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          const content = chapterText.join("\n\n");
                          const blob = new Blob([content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${selectedBook}_${selectedChapter}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors duration-200"
                        aria-label="تنزيل"
                        disabled={chapterText.length === 0}
                      >
                        <Download className="h-6 w-6" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>تنزيل النص</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {displayMode === "slides" && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-6 z-30">
                <button
                  onClick={previousSlide}
                  className={`p-3 rounded-full bg-black/50 text-white transition-colors duration-200 ${
                    currentSlide === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20"
                  }`}
                  disabled={currentSlide === 0}
                  aria-label="الشريحة السابقة"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <span className="text-white font-semibold">
                  {chapterText.length > 0 ? `${currentSlide + 1} / ${chapterText.length}` : "0 / 0"}
                </span>

                <button
                  onClick={nextSlide}
                  className={`p-3 rounded-full bg-black/50 text-white transition-colors duration-200 ${
                    currentSlide === chapterText.length - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/20"
                  }`}
                  disabled={currentSlide === chapterText.length - 1}
                  aria-label="الشريحة التالية"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card p-6 rounded-xl shadow-2xl max-w-md">
            <h3 className="text-xl font-bold text-destructive mb-4">خطا</h3>
            <p className="text-foreground">{error}</p>
            <Button
              className="mt-4 w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => setError(null)}
            >
              اغلاق
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
