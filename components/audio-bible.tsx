"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mic, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "@/app/ThemeContext"

interface BibleBook {
  name: string
  testament: "OT" | "NT"
  chapters: number
  audioPrefix: string
}

export default function AudioBible() {
  const { theme, toggleTheme } = useTheme()
  const [books, setBooks] = useState<BibleBook[]>([])
  const [selectedLetter, setSelectedLetter] = useState("")
  const [filteredBooks, setFilteredBooks] = useState<BibleBook[]>([])
  const [selectedBook, setSelectedBook] = useState("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const allBooks: BibleBook[] = [
      { name: "تكوين", testament: "OT", chapters: 50, audioPrefix: "01_Genesis" },
      { name: "خروج", testament: "OT", chapters: 40, audioPrefix: "02_Exodus" },
      { name: "لاويين", testament: "OT", chapters: 27, audioPrefix: "03_Leviticus" },
      { name: "عدد", testament: "OT", chapters: 36, audioPrefix: "04_Numbers" },
      { name: "تثنية", testament: "OT", chapters: 34, audioPrefix: "05_Deuteronomy" },
      { name: "يشوع", testament: "OT", chapters: 24, audioPrefix: "06_Joshua" },
      { name: "قضاة", testament: "OT", chapters: 21, audioPrefix: "07_Judges" },
      { name: "راعوث", testament: "OT", chapters: 4, audioPrefix: "08_Ruth" },
      { name: "صموئيل الأول", testament: "OT", chapters: 31, audioPrefix: "09_1Samuel" },
      { name: "صموئيل الثاني", testament: "OT", chapters: 24, audioPrefix: "10_2Samuel" },
      { name: "ملوك الأول", testament: "OT", chapters: 22, audioPrefix: "11_1Kings" },
      { name: "ملوك الثاني", testament: "OT", chapters: 25, audioPrefix: "12_2Kings" },
      { name: "أخبار الأيام الأول", testament: "OT", chapters: 29, audioPrefix: "13_1Chronicles" },
      { name: "أخبار الأيام الثاني", testament: "OT", chapters: 36, audioPrefix: "14_2Chronicles" },
      { name: "عزرا", testament: "OT", chapters: 10, audioPrefix: "15_Ezra" },
      { name: "نحميا", testament: "OT", chapters: 13, audioPrefix: "16_Nehemiah" },
      { name: "أستير", testament: "OT", chapters: 10, audioPrefix: "17_Esther" },
      { name: "أيوب", testament: "OT", chapters: 42, audioPrefix: "18_Job" },
      { name: "مزامير", testament: "OT", chapters: 150, audioPrefix: "19_Psalms" },
      { name: "أمثال", testament: "OT", chapters: 31, audioPrefix: "20_Proverbs" },
      { name: "جامعة", testament: "OT", chapters: 12, audioPrefix: "21_Ecclesiastes" },
      { name: "نشيد الأنشاد", testament: "OT", chapters: 8, audioPrefix: "22_Canticles" },
      { name: "إشعياء", testament: "OT", chapters: 66, audioPrefix: "23_Isaiah" },
      { name: "إرميا", testament: "OT", chapters: 52, audioPrefix: "24_Jeremiah" },
      { name: "مراثي إرميا", testament: "OT", chapters: 5, audioPrefix: "25_Lamentations" },
      { name: "حزقيال", testament: "OT", chapters: 48, audioPrefix: "26_Ezekiel" },
      { name: "دانيال", testament: "OT", chapters: 12, audioPrefix: "27_Daniel" },
      { name: "هوشع", testament: "OT", chapters: 14, audioPrefix: "28_Hosea" },
      { name: "يوئيل", testament: "OT", chapters: 3, audioPrefix: "29_Joel" },
      { name: "عاموس", testament: "OT", chapters: 9, audioPrefix: "30_Amos" },
      { name: "عوبديا", testament: "OT", chapters: 1, audioPrefix: "31_Obadiah" },
      { name: "يونان", testament: "OT", chapters: 4, audioPrefix: "32_Jonah" },
      { name: "ميخا", testament: "OT", chapters: 7, audioPrefix: "33_Micah" },
      { name: "ناحوم", testament: "OT", chapters: 3, audioPrefix: "34_Nahum" },
      { name: "حبقوق", testament: "OT", chapters: 3, audioPrefix: "35_Habakkuk" },
      { name: "صفنيا", testament: "OT", chapters: 3, audioPrefix: "36_Zephaniah" },
      { name: "حجي", testament: "OT", chapters: 2, audioPrefix: "37_Haggai" },
      { name: "زكريا", testament: "OT", chapters: 14, audioPrefix: "38_Zechariah" },
      { name: "ملاخي", testament: "OT", chapters: 4, audioPrefix: "39_Malachi" },
      { name: "متى", testament: "NT", chapters: 28, audioPrefix: "40_Matthew" },
      { name: "مرقس", testament: "NT", chapters: 16, audioPrefix: "41_Mark" },
      { name: "لوقا", testament: "NT", chapters: 24, audioPrefix: "42_Luke" },
      { name: "يوحنا", testament: "NT", chapters: 21, audioPrefix: "43_John" },
      { name: "أعمال الرسل", testament: "NT", chapters: 28, audioPrefix: "44_Acts" },
      { name: "رومية", testament: "NT", chapters: 16, audioPrefix: "45_Romans" },
      { name: "كورنثوس الأولى", testament: "NT", chapters: 16, audioPrefix: "46_1Corinthians" },
      { name: "كورنثوس الثانية", testament: "NT", chapters: 13, audioPrefix: "47_2Corinthians" },
      { name: "غلاطية", testament: "NT", chapters: 6, audioPrefix: "48_Galatians" },
      { name: "أفسس", testament: "NT", chapters: 6, audioPrefix: "49_Ephesians" },
      { name: "فيلبي", testament: "NT", chapters: 4, audioPrefix: "50_Philippians" },
      { name: "كولوسي", testament: "NT", chapters: 4, audioPrefix: "51_Colossians" },
      { name: "تسالونيكي الأولى", testament: "NT", chapters: 5, audioPrefix: "52_1Thessalonians" },
      { name: "تسالونيكي الثانية", testament: "NT", chapters: 3, audioPrefix: "53_2Thessalonians" },
      { name: "تيموثاوس الأولى", testament: "NT", chapters: 6, audioPrefix: "54_1Timothy" },
      { name: "تيموثاوس الثانية", testament: "NT", chapters: 4, audioPrefix: "55_2Timothy" },
      { name: "تيطس", testament: "NT", chapters: 3, audioPrefix: "56_Titus" },
      { name: "فليمون", testament: "NT", chapters: 1, audioPrefix: "57_Philemon" },
      { name: "العبرانيين", testament: "NT", chapters: 13, audioPrefix: "58_Hebrews" },
      { name: "يعقوب", testament: "NT", chapters: 5, audioPrefix: "59_James" },
      { name: "بطرس الأولى", testament: "NT", chapters: 5, audioPrefix: "60_1Peter" },
      { name: "بطرس الثانية", testament: "NT", chapters: 3, audioPrefix: "61_2Peter" },
      { name: "يوحنا الأولى", testament: "NT", chapters: 5, audioPrefix: "62_1John" },
      { name: "يوحنا الثانية", testament: "NT", chapters: 1, audioPrefix: "63_2John" },
      { name: "يوحنا الثالثة", testament: "NT", chapters: 1, audioPrefix: "64_3John" },
      { name: "يهوذا", testament: "NT", chapters: 1, audioPrefix: "65_Jude" },
      { name: "رؤيا يوحنا", testament: "NT", chapters: 22, audioPrefix: "66_Revelation" },
    ]

    setBooks(allBooks)
  }, [])

  useEffect(() => {
    setSelectedBook("")
    setSelectedChapter("")
    setAudioUrl("")
  }, [selectedLetter])

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      const bookObj = books.find((b) => b.name === selectedBook)
      if (!bookObj) return

      // لو السفر هو "مزامير"، استخدم 3 أرقام (001-150)، غير كده استخدم 2 (01-99)
      const paddedChapter =
        selectedBook === "مزامير"
          ? selectedChapter.padStart(3, "0")
          : selectedChapter.padStart(2, "0")
      
      const newAudioUrl = `${process.env.NEXT_PUBLIC_R2_URL2}/${bookObj.audioPrefix}_${paddedChapter}.mp3`
      setAudioUrl(newAudioUrl)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.load()
      }
    }
  }, [selectedBook, selectedChapter, books])

  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter)
    const filtered = books.filter((book) => book.name.startsWith(letter))
    setFilteredBooks(filtered)
    setSelectedBook("")
    setSelectedChapter("")
    setSearchQuery("")
  }

  const handleBookSelection = (bookName: string) => {
    setSelectedLetter("")
    setSelectedBook(bookName)
    setFilteredBooks(books.filter((book) => book.name === bookName))
    setSelectedChapter("")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.trim()) {
      const results = books.filter((book) =>
        book.name.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredBooks(results)
      setSelectedLetter("")
    } else {
      setFilteredBooks([])
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setFilteredBooks([])
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const startVoiceRecognition = () => {
    // تعريف نوع مخصص للنتيجة
    interface SpeechRecognitionResult {
      transcript: string
    }

    // تعريف نوع مخصص للحدث
    interface SpeechRecognitionEvent {
      results: SpeechRecognitionResult[][]
    }

    // تعريف نوع مخصص لخطأ الحدث
    interface SpeechRecognitionErrorEvent {
      error: string
    }

    // تعريف نوع مخصص لـ SpeechRecognition
    interface SpeechRecognition {
      new (): SpeechRecognition
      lang: string
      continuous: boolean
      interimResults: boolean
      onresult: (event: SpeechRecognitionEvent) => void
      onerror: (event: SpeechRecognitionErrorEvent) => void
      onend: () => void
      start: () => void
    }

    // تحقق من وجود webkitSpeechRecognition
    const SpeechRecognition = (window as any).webkitSpeechRecognition as SpeechRecognition | undefined

    if (!SpeechRecognition) {
      alert("عذرًا، متصفحك لا يدعم ميزة البحث الصوتي")
      return
    }

    setIsListening(true)
    const recognition = new SpeechRecognition()
    recognition.lang = "ar-SA"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      const matchedBook = books.find((book) =>
        book.name.toLowerCase().includes(transcript.toLowerCase())
      )
      if (matchedBook) {
        handleBookSelection(matchedBook.name)
      } else {
        alert("لم يتم العثور على سفر بهذا الاسم")
      }
      setIsListening(false)
    }
    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error)
      setIsListening(false)
    }
    recognition.onend = () => {
      setIsListening(false)
    }
    recognition.start()
  }

  const letters = Array.from(new Set(books.map((book) => book.name.charAt(0)))).sort()

  const chapters = selectedBook
    ? Array.from(
        { length: books.find((b) => b.name === selectedBook)?.chapters || 0 },
        (_, i) => (i + 1).toString()
      )
    : []

  return (
    <div
      className={cn(
        "relative min-h-screen p-2 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6 transition-colors duration-300 bg-background",
        theme === "dark" ? "dark" : "",
        "rtl"
      )}
    >
      <div className="flex justify-between items-center">
        <h1
          className={cn(
            "text-xl sm:text-2xl md:text-3xl font-bold text-center transition-colors duration-300",
            theme === "dark" ? "text-white" : "text-black"
          )}
        >
          الكتاب المقدس (مسموع)
        </h1>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full"
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="relative max-w-md mx-auto w-full">
        <div className="flex items-center">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="ابحث عن سفر..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={cn(
              "pl-8 sm:pl-10 pr-8 sm:pr-10 py-3 sm:py-4 text-sm sm:text-base rounded-xl border-2",
              theme === "dark" ? "border-white" : "border-black",
              "bg-card text-foreground shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ring focus:border-",
              theme === "dark" ? "white" : "black",
              "backdrop-blur-sm hover:shadow-2xl font-bold"
            )}
            dir="rtl"
            onKeyDown={(e) => e.key === "Enter" && searchQuery.trim() !== ""}
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-1 top-1/2 transform -translate-y-1/2",
              isListening && "text-red-500 animate-pulse"
            )}
            onClick={startVoiceRecognition}
          >
            <Mic className="h-4 sm:h-5 w-4 sm:w-5" />
          </Button>
          {searchQuery ? (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={clearSearch}
            >
              <X className="h-4 sm:h-5 w-4 sm:w-5" />
            </Button>
          ) : (
            <Search className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
          )}
        </div>
        {isListening && (
          <div className="absolute -bottom-4 sm:-bottom-6 right-0 left-0 text-center text-xs sm:text-sm text-blue-500">
            جاري الاستماع... تحدث الآن
          </div>
        )}
      </div>

      <div className="pt-2 sm:pt-4 max-w-4xl mx-auto w-full">
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-base sm:text-lg block mb-1 sm:mb-2 text-center font-bold">اختر حرفًا</Label>
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
            {letters.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                onClick={() => handleLetterSelection(letter)}
                className={cn(
                  "w-14 sm:w-16 h-10 sm:h-12 rounded-lg text-base sm:text-lg font-bold flex items-center justify-center shadow-md transition-all duration-300",
                  selectedLetter === letter
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-card hover:bg-accent text-foreground border-2 border-border",
                  "hover:rotate-2 hover:shadow-lg"
                )}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>

        {filteredBooks.length > 0 && (
          <div className="pt-3 sm:pt-4">
            <Label className="text-base sm:text-lg block mb-1 sm:mb-2 text-center font-bold">اختر السفر</Label>
            <div className="space-y-2 max-w-3xl mx-auto">
              {filteredBooks.map((book) => (
                <div key={book.name} className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-full text-sm sm:text-base justify-between group font-bold px-2 sm:px-4 py-2 sm:py-3 truncate max-w-full"
                    onClick={() => handleBookSelection(book.name)}
                  >
                    <span className="truncate">{book.name}</span>
                    <span className="h-3 sm:h-4 w-3 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      ▶
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && filteredBooks.length === 0 && (
          <p className="text-center text-muted-foreground font-bold text-sm sm:text-base">لا توجد نتائج للبحث</p>
        )}

        {selectedBook && (
          <div className="pt-3 sm:pt-4">
            <Label className="text-base sm:text-lg block mb-1 sm:mb-2 text-center font-bold">اختر الإصحاح</Label>
            <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
              {chapters.map((chapter) => (
                <Button
                  key={chapter}
                  variant={selectedChapter === chapter ? "default" : "outline"}
                  onClick={() => setSelectedChapter(chapter)}
                  className={cn(
                    "w-12 sm:w-14 h-12 sm:h-14 rounded-full text-base sm:text-lg font-bold flex items-center justify-center transition-all duration-300",
                    selectedChapter === chapter
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-card hover:bg-accent text-foreground border-2 border-border",
                    "hover:shadow-lg hover:scale-105"
                  )}
                >
                  {chapter}
                </Button>
              ))}
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="mt-3 sm:mt-4 max-w-3xl mx-auto w-full">
            <audio ref={audioRef} controls className="w-full rounded-xl shadow-xl">
              <source src={audioUrl} type="audio/mpeg" />
              المتصفح لا يدعم تشغيل الصوتيات
            </audio>
          </div>
        )}
      </div>
    </div>
  )
}