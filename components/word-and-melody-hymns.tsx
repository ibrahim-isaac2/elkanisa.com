"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Maximize,
  Minimize,
  Search,
  Heart,
  Download,
  Share2,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Mic,
  Bookmark,
  RefreshCw,
  X,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/app/ThemeContext"

// Custom TypeScript interfaces for SpeechRecognition
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
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognition | undefined;
  }
}

function decodeHymnName(encodedName: string): string {
  try {
    return decodeURIComponent(encodedName)
  } catch {
    return encodedName
  }
}

export default function WordAndMelodyHymns() {
  const { theme, toggleTheme } = useTheme()
  const [selectedLetter, setSelectedLetter] = useState("")
  const [hymns, setHymns] = useState<string[]>([])
  const [filteredHymns, setFilteredHymns] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [currentHymnName, setCurrentHymnName] = useState<string>("")
  const [isMuted, setIsMuted] = useState(false)
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [playlists, setPlaylists] = useState<{ id: string; name: string; hymns: string[] }[]>([])
  const [currentPlaylist, setCurrentPlaylist] = useState<string | null>(null)
  const [openPlaylist, setOpenPlaylist] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch hymns from JSON with error handling and trim whitespace
  useEffect(() => {
    const fetchHymnsFromJson = async () => {
      try {
        const response = await fetch("/hymns.json")
        if (!response.ok) {
          throw new Error("فشل في تحميل ملف JSON: " + response.statusText)
        }
        const data = await response.json()
        if (Array.isArray(data.hymns)) {
          const trimmedHymns = data.hymns.map((hymn: string) => hymn.trim())
          setHymns(trimmedHymns)
        } else {
          throw new Error("ملف JSON لا يحتوي على مصفوفة صالحة تحت مفتاح 'hymns'")
        }
      } catch (error: any) {
        console.error("Error fetching hymns from JSON:", error)
        setVideoError("فشل في جلب قائمة الترانيم من ملف JSON: " + error.message)
        setHymns([]) // Set empty array to avoid errors
      }
    }

    fetchHymnsFromJson()

    // Load local settings
    const savedFavorites = localStorage.getItem("hymnFavorites")
    if (savedFavorites) {
      const favoritesList = JSON.parse(savedFavorites).map((hymn: string) => decodeHymnName(hymn))
      setFavorites(favoritesList)
    }

    const savedRecent = localStorage.getItem("recentlyPlayed")
    if (savedRecent) {
      const recentList = JSON.parse(savedRecent).map((hymn: string) => decodeHymnName(hymn))
      setRecentlyPlayed(recentList)
    }

    const savedPlaylists = localStorage.getItem("hymnPlaylists")
    if (savedPlaylists) {
      const parsedPlaylists = JSON.parse(savedPlaylists)
      const decodedPlaylists = parsedPlaylists.map((playlist: any) => ({
        ...playlist,
        hymns: playlist.hymns.map((hymn: string) => decodeHymnName(hymn)),
      }))
      setPlaylists(decodedPlaylists)
    }

    const savedAutoPlay = localStorage.getItem("autoPlay") === "true"
    setAutoPlay(savedAutoPlay)
  }, [])

  // Update video when videoFile or playbackSpeed changes
  useEffect(() => {
    if (videoRef.current && videoFile) {
      videoRef.current.load()
      setVideoError(null)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.playbackRate = playbackSpeed
        }
      }, 100)
    }
  }, [videoFile, playbackSpeed])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("hymnFavorites", JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed))
  }, [recentlyPlayed])

  useEffect(() => {
    localStorage.setItem("hymnPlaylists", JSON.stringify(playlists))
  }, [playlists])

  useEffect(() => {
    localStorage.setItem("autoPlay", String(autoPlay))
  }, [autoPlay])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Autoplay next video when current video ends
  useEffect(() => {
    const handleVideoEnded = () => {
      if (autoPlay && filteredHymns.length > 0) {
        const currentIndex = filteredHymns.findIndex((h) => h === currentHymnName)
        if (currentIndex < filteredHymns.length - 1) {
          handleVideoSelection(filteredHymns[currentIndex + 1])
        }
      }
    }
    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener("ended", handleVideoEnded)
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("ended", handleVideoEnded)
      }
    }
  }, [autoPlay, filteredHymns, currentHymnName])

  // Select letter to filter hymns
  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter)
    const filtered = hymns.filter((hymn) => hymn.charAt(0) === letter)
    setFilteredHymns(filtered)
    setVideoFile(null)
    setSearchQuery("")
  }

  // Determine video type based on extension
  const getVideoType = (hymn: string) => {
    const extension = hymn.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "mp4":
        return "video/mp4"
      case "webm":
        return "video/webm"
      case "ogg":
        return "video/ogg"
      case "wmv":
        return "video/x-ms-wmv"
      case "3gp":
        return "video/3gpp"
      case "avi":
        return "video/x-msvideo"
      case "mov":
        return "video/quicktime"
      case "mkv":
        return "video/x-matroska"
      case "flv":
        return "video/x-flv"
      case "mpeg":
      case "mpg":
        return "video/mpeg"
      case "m4v":
        return "video/mp4"
      case "ts":
        return "video/mp2t"
      case "vob":
        return "video/mpeg"
      default:
        return "video/mp4"
    }
  }

  // Format hymn name
  const formatHymnName = (hymn: string) => {
    return hymn.replace(/\.[^/.]+$/, "").replace(/_/g, " ")
  }

  // Select video from Cloudflare R2
  const handleVideoSelection = async (hymn: string) => {
    try {
      const videoUrl = `${process.env.NEXT_PUBLIC_R2_URL}/${hymn}`
      setVideoFile(videoUrl)
      const hymnName = formatHymnName(hymn)
      setCurrentHymnName(hymnName)
      setRecentlyPlayed((prev) => {
        const newRecent = [hymn, ...prev.filter((h) => h !== hymn)].slice(0, 10)
        return newRecent
      })
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } catch (error: any) {
      console.error("Error fetching video from R2:", error)
      setVideoError("حدث خطأ أثناء جلب الفيديو من Cloudflare R2: " + error.message)
    }
  }

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      videoRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // Add/remove from favorites
  const toggleFavorite = (hymn: string) => {
    setFavorites((prev) => {
      const decodedHymn = decodeHymnName(hymn)
      if (prev.includes(decodedHymn)) {
        return prev.filter((h) => h !== decodedHymn)
      } else {
        return [...prev, decodedHymn]
      }
    })
  }

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  // Handle video error
  const handleVideoError = () => {
    setVideoError(
      "عذرًا، هذا الفيديو غير متوفر أو غير مدعوم في متصفحك. جرب صيغة أخرى مثل MP4."
    )
  }

  // Search for hymn
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.trim()) {
      const results = hymns.filter((hymn) =>
        formatHymnName(hymn).toLowerCase().includes(query.toLowerCase())
      )
      setFilteredHymns(results)
      setSelectedLetter("")
    } else {
      setFilteredHymns([])
    }
  }

  // Download video
  const downloadVideo = () => {
    if (!videoFile) return
    const link = document.createElement("a")
    link.href = videoFile
    link.download = currentHymnName || "ترنيمة"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Share hymn
  const shareHymn = async () => {
    if (!currentHymnName) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentHymnName,
          text: `استمع إلى ترنيمة: ${currentHymnName}`,
          url: videoFile || window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      navigator.clipboard
        .writeText(videoFile || window.location.href)
        .then(() => alert("تم نسخ الرابط"))
        .catch((err) => console.error("Error copying link:", err))
    }
  }

  // Voice recognition
  const startVoiceRecognition = () => {
    if (typeof window === "undefined" || !window.webkitSpeechRecognition) {
      alert("عذرًا، متصفحك لا يدعم ميزة البحث الصوتي")
      return
    }
    setIsListening(true)
    const recognition = new window.webkitSpeechRecognition() as SpeechRecognition
    recognition.lang = "ar-SA"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      const results = hymns.filter((hymn) =>
        formatHymnName(hymn).toLowerCase().includes(transcript.toLowerCase())
      )
      setFilteredHymns(results)
      setSelectedLetter("")
      setIsListening(false)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      setIsListening(false)
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setFilteredHymns([])
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Add to playlist
  const addToPlaylist = (playlistId: string) => {
    if (!videoFile) return
    const hymnFileName = currentHymnName
    if (!hymnFileName) return
    const decodedHymnName = decodeHymnName(hymnFileName)
    setPlaylists((prev) => {
      return prev.map((playlist) => {
        if (playlist.id === playlistId) {
          if (!playlist.hymns.includes(decodedHymnName)) {
            return { ...playlist, hymns: [...playlist.hymns, decodedHymnName] }
          }
        }
        return playlist
      })
    })
    alert(
      `تمت إضافة "${formatHymnName(decodedHymnName)}" إلى قائمة "${playlists.find((p) => p.id === playlistId)?.name}"`
    )
    const closeButtons = document.querySelectorAll('[data-state="open"] button[aria-label="Close"]')
    if (closeButtons.length > 0) {
      (closeButtons[0] as HTMLButtonElement).click()
    }
  }

  // Create new playlist
  const createPlaylist = (name: string) => {
    if (!name.trim()) return
    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      hymns: [],
    }
    setPlaylists((prev) => [...prev, newPlaylist])
    if (videoFile) {
      const hymnFileName = currentHymnName
      if (hymnFileName) {
        setTimeout(() => addToPlaylist(newPlaylist.id), 100)
      }
    }
  }

  // Load playlist
  const loadPlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId)
    if (!playlist || playlist.hymns.length === 0) {
      alert("هذه القائمة فارغة")
      return
    }
    setCurrentPlaylist(playlistId)
    setFilteredHymns(playlist.hymns)
    setSelectedLetter("")
    setSearchQuery("")
  }

  // Remove from playlist
  const removeFromPlaylist = (playlistId: string, hymnName: string) => {
    const decodedHymnName = decodeHymnName(hymnName)
    setPlaylists((prev) => {
      return prev.map((playlist) => {
        if (playlist.id === playlistId) {
          return { ...playlist, hymns: playlist.hymns.filter((h) => h !== decodedHymnName) }
        }
        return playlist
      })
    })
  }

  // Delete playlist
  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId))
    if (currentPlaylist === playlistId) {
      setCurrentPlaylist(null)
    }
  }

  // Shuffle playlist
  const shufflePlaylist = () => {
    if (filteredHymns.length <= 1) return
    const shuffled: string[] = [...filteredHymns]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1))
      const temp: string = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }
    setFilteredHymns(shuffled)
  }

  // Toggle playlist visibility
  const togglePlaylist = (playlistId: string) => {
    setOpenPlaylist(openPlaylist === playlistId ? null : playlistId)
  }

  // Extract first letters with empty state handling
  const letters =
    hymns && Array.isArray(hymns)
      ? Array.from(new Set(hymns.map((hymn) => hymn.charAt(0)))).sort()
      : []

  return (
    <div
      className={`relative min-h-screen p-2 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6 transition-colors duration-300 ${
        theme === "dark" ? "dark bg-background" : "bg-background"
      }`}
    >
      <div className="flex justify-between items-center">
        <h1 className={cn("text-xl sm:text-2xl md:text-3xl font-bold text-center transition-colors duration-300", theme === "dark" ? "text-white" : "text-black")}>
          ترانيم الكلمة واللحن
        </h1>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="rounded-full"
                >
                  <Settings className="h-4 sm:h-5 w-4 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>الإعدادات</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <HelpCircle className="h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>عن التطبيق</DialogTitle>
                <DialogDescription>
                  تطبيق ترانيم الكلمة واللحن يتيح لك البحث عن الترانيم ومشاهدتها وإضافتها للمفضلة وإنشاء قوائم تشغيل خاصة بك.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <h4 className="font-bold">المميزات:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>البحث النصي والصوتي عن الترانيم</li>
                  <li>إضافة الترانيم للمفضلة</li>
                  <li>إنشاء قوائم تشغيل مخصصة</li>
                  <li>تنزيل الترانيم ومشاركتها</li>
                  <li>عرض كلمات الترانيم</li>
                  <li>التحكم في سرعة التشغيل</li>
                  <li>التشغيل التلقائي</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showSettings && (
        <div className="mx-auto w-full max-w-md">
          <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg">الإعدادات</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                <X className="h-3 sm:h-4 w-3 sm:w-4" />
              </Button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay" className="font-bold text-xs sm:text-sm">
                  التشغيل التلقائي
                </Label>
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={autoPlay}
                  onChange={() => setAutoPlay(!autoPlay)}
                  className="toggle"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="playback-speed" className="font-bold text-xs sm:text-sm">
                    سرعة التشغيل: {playbackSpeed}x
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-md mx-auto w-full" ref={searchInputRef}>
        <div className="flex items-center">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="ابحث عن ترنيمة..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={`pl-8 sm:pl-10 pr-8 sm:pr-10 py-3 sm:py-4 text-sm sm:text-base rounded-xl border-2 ${
              theme === "dark" ? "border-white" : "border-black"
            } bg-card text-foreground shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ring focus:border-${
              theme === "dark" ? "white" : "black"
            } backdrop-blur-sm hover:shadow-2xl`}
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
            <Search
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground"
            />
          )}
        </div>
        {isListening && (
          <div className="absolute -bottom-4 sm:-bottom-6 right-0 left-0 text-center text-xs sm:text-sm text-blue-500">
            جاري الاستماع... تحدث الآن
          </div>
        )}
      </div>

      <Tabs defaultValue="browse" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-2 sm:mb-4">
          <TabsTrigger value="browse" className="text-xs sm:text-sm">تصفح</TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs sm:text-sm">المفضلة</TabsTrigger>
          <TabsTrigger value="recent" className="text-xs sm:text-sm">الأخيرة</TabsTrigger>
          <TabsTrigger value="playlists" className="text-xs sm:text-sm">القوائم</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-3 sm:space-y-4">
          <div className="pt-3 sm:pt-4">
            <Label className="text-base sm:text-lg block mb-1 sm:mb-2 text-center font-bold">اختر حرفًا</Label>
            <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
              {letters.map((letter) => (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "default" : "outline"}
                  onClick={() => handleLetterSelection(letter)}
                  className={cn(
                    "w-14 sm:w-16 h-10 sm:h-12 rounded-lg text-base sm:text-lg font-bold flex items-center justify-center shadow-lg transition-all duration-300",
                    selectedLetter === letter
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                      : "bg-card hover:bg-accent text-foreground border-2 border-border",
                    "hover:rotate-3 hover:shadow-xl"
                  )}
                >
                  {letter}
                </Button>
              ))}
            </div>
          </div>
          {filteredHymns.length > 0 && (
            <div className="pt-3 sm:pt-4">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <Label className="text-base sm:text-lg font-bold">
                  {searchQuery
                    ? "نتائج البحث"
                    : currentPlaylist
                    ? playlists.find((p) => p.id === currentPlaylist)?.name
                    : "اختر الترنيمة"}
                </Label>
                {filteredHymns.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shufflePlaylist}
                    className="flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <RefreshCw className="h-3 w-3" />
                    عشوائي
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-w-3xl mx-auto">
                {filteredHymns.map((hymn) => (
                  <div key={hymn} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm sm:text-base justify-between group font-bold px-2 sm:px-4 py-2 sm:py-3 truncate max-w-full"
                      onClick={() => handleVideoSelection(hymn)}
                    >
                      <span className="truncate">{formatHymnName(hymn)}</span>
                      <Play className="h-3 sm:h-4 w-3 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(hymn)}
                      className={cn(
                        "flex-shrink-0",
                        favorites.includes(hymn) ? "text-red-500" : "text-gray-400"
                      )}
                    >
                      <Heart
                        className="h-4 sm:h-5 w-4 sm:w-5"
                        fill={favorites.includes(hymn) ? "currentColor" : "none"}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {searchQuery && filteredHymns.length === 0 && (
            <p className="text-center text-muted-foreground font-bold text-sm sm:text-base">لا توجد نتائج للبحث</p>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <div className="pt-3 sm:pt-4">
            <Label className="text-base sm:text-lg block mb-1 sm:mb-2 text-center font-bold">الترانيم المفضلة</Label>
            {favorites.length > 0 ? (
              <div className="space-y-2">
                {favorites.map((hymn) => (
                  <div key={hymn} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm sm:text-base justify-between group font-bold px-2 sm:px-4 py-2 sm:py-3 truncate max-w-full"
                      onClick={() => handleVideoSelection(hymn)}
                    >
                      <span className="truncate">{formatHymnName(hymn)}</span>
                      <Play className="h-3 sm:h-4 w-3 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(hymn)}
                      className="text-red-500 flex-shrink-0"
                    >
                      <Heart className="h-4 sm:h-5 w-4 sm:w-5" fill="currentColor" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground font-bold py-4 sm:py-8 text-sm sm:text-base">
                لم تقم بإضافة أي ترانيم للمفضلة بعد
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="pt-3 sm:pt-4">
            <Label className="text-base sm:text-lg block mb-1 sm:mb-2 text-center font-bold">الترانيم المشغلة مؤخرًا</Label>
            {recentlyPlayed.length > 0 ? (
              <div className="space-y-2">
                {recentlyPlayed.map((hymn) => (
                  <div key={hymn} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm sm:text-base justify-between group font-bold px-2 sm:px-4 py-2 sm:py-3 truncate max-w-full"
                      onClick={() => handleVideoSelection(hymn)}
                    >
                      <span className="truncate">{formatHymnName(hymn)}</span>
                      <Play className="h-3 sm:h-4 w-3 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(hymn)}
                      className={cn(
                        "flex-shrink-0",
                        favorites.includes(hymn) ? "text-red-500" : "text-gray-400"
                      )}
                    >
                      <Heart
                        className="h-4 sm:h-5 w-4 sm:w-5"
                        fill={favorites.includes(hymn) ? "currentColor" : "none"}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground font-bold py-4 sm:py-8 text-sm sm:text-base">
                لم تقم بتشغيل أي ترانيم بعد
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="playlists">
          <div className="pt-3 sm:pt-4">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <Label className="text-base sm:text-lg font-bold">قوائم التشغيل</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    إنشاء قائمة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء قائمة تشغيل جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="playlist-name" className="font-bold text-sm sm:text-base">
                        اسم القائمة
                      </Label>
                      <Input id="playlist-name" placeholder="أدخل اسم القائمة" className="text-sm sm:text-base" />
                    </div>
                    <Button
                      onClick={() => {
                        const input = document.getElementById("playlist-name") as HTMLInputElement
                        if (input && input.value.trim()) {
                          createPlaylist(input.value.trim())
                          input.value = ""
                        }
                      }}
                      className="text-sm sm:text-base"
                    >
                      إنشاء
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {playlists.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {playlists.map((playlist) => (
                  <div key={playlist.id} className="p-2 sm:p-3">
                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                      <button
                        onClick={() => togglePlaylist(playlist.id)}
                        className="flex items-center gap-2 font-bold text-sm sm:text-base focus:outline-none"
                      >
                        <ChevronDown
                          className={cn(
                            "h-3 sm:h-4 w-3 sm:w-4 transition-transform",
                            openPlaylist === playlist.id && "rotate-180"
                          )}
                        />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{playlist.name}</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs sm:text-sm">{playlist.hymns.length} ترنيمة</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePlaylist(playlist.id)}
                          className="text-red-500 h-6 sm:h-7 w-6 sm:w-7"
                        >
                          <X className="h-3 sm:h-4 w-3 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    {openPlaylist === playlist.id && playlist.hymns.length > 0 && (
                      <div className="space-y-2 mt-1 sm:mt-2">
                        {playlist.hymns.map((hymn) => (
                          <div key={hymn} className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              className="w-full text-sm sm:text-base justify-between group font-bold px-2 sm:px-4 py-2 sm:py-3 truncate max-w-full"
                              onClick={() => handleVideoSelection(hymn)}
                            >
                              <span className="truncate">{formatHymnName(decodeHymnName(hymn))}</span>
                              <Play className="h-3 sm:h-4 w-3 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromPlaylist(playlist.id, hymn)}
                              className="text-red-500 h-6 sm:h-7 w-6 sm:w-7"
                            >
                              <X className="h-3 sm:h-4 w-3 sm:w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-1 sm:mt-2 text-xs sm:text-sm"
                          onClick={() => loadPlaylist(playlist.id)}
                        >
                          <Play className="h-3 sm:h-4 w-3 sm:w-4 mr-2" />
                          تشغيل القائمة
                        </Button>
                      </div>
                    )}
                    {openPlaylist === playlist.id && playlist.hymns.length === 0 && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 font-bold">
                        لا توجد ترانيم في هذه القائمة
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground font-bold py-4 sm:py-8 text-sm sm:text-base">
                لم تقم بإنشاء أي قوائم تشغيل بعد
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {videoFile && (
        <div
          ref={containerRef}
          className={cn(
            "relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl",
            theme === "dark" ? "bg-card" : "bg-card"
          )}
        >
          <div>
            <div className="p-2 sm:p-3 flex justify-between items-center border-b">
              <h3 className="font-bold text-sm sm:text-base truncate">{currentHymnName}</h3>
              <div className="flex gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Bookmark className="h-4 sm:h-5 w-4 sm:w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة إلى قائمة تشغيل</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {playlists.length > 0 ? (
                        <div className="space-y-2">
                          {playlists.map((playlist) => (
                            <Button
                              key={playlist.id}
                              variant="outline"
                              className="w-full justify-start text-sm sm:text-base"
                              onClick={() => addToPlaylist(playlist.id)}
                            >
                              {playlist.name}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground text-sm sm:text-base">لا توجد قوائم تشغيل</p>
                      )}
                      <div className="pt-2 border-t">
                        <Button
                          variant="outline"
                          className="w-full text-sm sm:text-base"
                          onClick={() => {
                            const name = prompt("أدخل اسم القائمة الجديدة")
                            if (name?.trim()) {
                              createPlaylist(name.trim())
                            }
                          }}
                        >
                          إنشاء قائمة جديدة
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(currentHymnName)}
                  className={favorites.includes(decodeHymnName(currentHymnName)) ? "text-red-500" : ""}
                >
                  <Heart
                    className="h-4 sm:h-5 w-4 sm:w-5"
                    fill={favorites.includes(decodeHymnName(currentHymnName)) ? "currentColor" : "none"}
                  />
                </Button>
                <Button variant="ghost" size="icon" onClick={downloadVideo}>
                  <Download className="h-4 sm:h-5 w-4 sm:w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={shareHymn}>
                  <Share2 className="h-4 sm:h-5 w-4 sm:w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                key={videoFile}
                controls
                className="w-full h-auto max-h-[300px] sm:max-h-[350px]"
                onError={handleVideoError}
                controlsList="nodownload"
                poster="/placeholder.svg?height=350&width=600"
              >
                <source src={videoFile} type={getVideoType(currentHymnName)} />
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <p className="text-white text-center p-4 text-sm sm:text-base">{videoError}</p>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black bg-opacity-50 text-white border-none hover:bg-black hover:bg-opacity-70"
                  onClick={toggleFullScreen}
                >
                  {isFullScreen ? <Minimize className="h-3 sm:h-4 w-3 sm:w-4" /> : <Maximize className="h-3 sm:h-4 w-3 sm:w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black bg-opacity-50 text-white border-none hover:bg-black hover:bg-opacity-70"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-3 sm:h-4 w-3 sm:w-4" /> : <Volume2 className="h-3 sm:h-4 w-3 sm:w-4" />}
                </Button>
              </div>
            </div>
            <div className="p-2 sm:p-3 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentIndex = filteredHymns.findIndex((h) => h === currentHymnName)
                  if (currentIndex > 0) {
                    handleVideoSelection(filteredHymns[currentIndex - 1])
                  }
                }}
                disabled={
                  !filteredHymns.length ||
                  filteredHymns.findIndex((h) => h === currentHymnName) <= 0
                }
                className="text-xs sm:text-sm"
              >
                <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
                السابق
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs sm:text-sm">{playbackSpeed}x</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
                    const currentIndex = speeds.indexOf(playbackSpeed)
                    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
                    setPlaybackSpeed(nextSpeed)
                    if (videoRef.current) {
                      videoRef.current.playbackRate = nextSpeed
                    }
                  }}
                  className="text-xs sm:text-sm"
                >
                  تغيير السرعة
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentIndex = filteredHymns.findIndex((h) => h === currentHymnName)
                  if (currentIndex < filteredHymns.length - 1) {
                    handleVideoSelection(filteredHymns[currentIndex + 1])
                  }
                }}
                disabled={
                  !filteredHymns.length ||
                  filteredHymns.findIndex((h) => h === currentHymnName) >= filteredHymns.length - 1
                }
                className="text-xs sm:text-sm"
              >
                التالي
                <ChevronLeft className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}