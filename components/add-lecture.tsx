"use client"

import type React from "react"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Palette,
  Type,
  Download,
  Play,
  Settings,
  Trash2,
  Bold,
  Italic,
  Underline,
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Save,
  Droplets,
  MoveHorizontal,
  RotateCcw,
  RotateCw,
  ZoomOut,
  ZoomIn,
  Layers,
  Plus,
  Copy,
  Eye,
  List,
  X,
  Maximize,
  Minimize,
  FileText,
} from "lucide-react"
import pptxgen from "pptxgenjs"
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch as SwitchComponent } from "@/components/ui/switch"

interface عنصر_صورة {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
}

interface عنصر_نص {
  id: string
  content: string
  x: number
  y: number
  width: number
  fontSize: string
  fontColor: string
  fontFamily: string
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  alignment: "left" | "center" | "right"
  zIndex: number
}

interface شريحة {
  id: string
  content: string
  fontSize: string
  fontColor: string
  backgroundColor: string
  backgroundImage?: string
  backgroundOpacity: number
  alignment: "left" | "center" | "right"
  fontFamily: string
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  lineSpacing: number
  textShadow: boolean
  watermark: string
  watermarkColor: string
  watermarkFontSize: number
  images: عنصر_صورة[]
  textElements: عنصر_نص[]
  template?: string
}

interface سمة {
  background: string
  text: string
  name: string
  isCustom?: boolean
  customUrl?: string
  gradient?: string
}

interface قالب {
  id: string
  name: string
  thumbnail: string
  backgroundColor: string
  backgroundImage?: string
  fontFamily: string
  fontColor: string
  description: string
}

// Modify the السمات array to include only the first five options
const السمات: سمة[] = [
  { name: "أسود", background: "black", text: "text-white" },
  { name: "أزرق غامق", background: "darkblue", text: "text-white" },
  { name: "أخضر غامق", background: "darkgreen", text: "text-white" },
  { name: "رمادي", background: "gray", text: "text-white" },
  {
    name: "تدرج أزرق",
    background: "custom",
    text: "text-white",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  },
]

const القوالب: قالب[] = [
  {
    id: "minimal",
    name: "بسيط",
    thumbnail: "/placeholder.svg?height=100&width=160",
    backgroundColor: "white",
    fontFamily: "Arial",
    fontColor: "black",
    description: "تصميم نظيف وبسيط مع الحد الأدنى من التشتيت",
  },
  {
    id: "corporate",
    name: "شركات",
    thumbnail: "/placeholder.svg?height=100&width=160",
    backgroundColor: "custom",
    backgroundImage: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    fontFamily: "Calibri",
    fontColor: "white",
    description: "تصميم احترافي للعروض التقديمية التجارية",
  },
  {
    id: "creative",
    name: "إبداعي",
    thumbnail: "/placeholder.svg?height=100&width=160",
    backgroundColor: "custom",
    backgroundImage: "linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)",
    fontFamily: "Verdana",
    fontColor: "white",
    description: "تصميم جريء وفني للعروض التقديمية الإبداعية",
  },
  {
    id: "academic",
    name: "أكاديمي",
    thumbnail: "/placeholder.svg?height=100&width=160",
    backgroundColor: "ivory",
    fontFamily: "Times New Roman",
    fontColor: "black",
    description: "تصميم رسمي للعروض التقديمية التعليمية",
  },
]

const ألوان_النص = [
  { name: "أبيض", value: "white" },
  { name: "أصفر", value: "yellow" },
  { name: "أخضر", value: "green" },
  { name: "أزرق", value: "blue" },
  { name: "أحمر", value: "red" },
  { name: "أسود", value: "black" },
  { name: "ذهبي", value: "gold" },
  { name: "فضي", value: "silver" },
]

const أحجام_الخط = [
  { name: "صغير جداً", value: "x-small" },
  { name: "صغير", value: "small" },
  { name: "متوسط", value: "medium" },
  { name: "كبير", value: "large" },
  { name: "كبير جداً", value: "x-large" },
]

// Modify the عائلات_الخطوط array to include only three font types
const عائلات_الخطوط = [
  { name: "Arial", value: "Arial" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Calibri", value: "Calibri" },
]

const أبعاد_الشرائح = [
  { name: "قياسي (4:3)", width: 10, height: 7.5 },
  { name: "شاشة عريضة (16:9)", width: 13.33, height: 7.5 },
  { name: "مربع (1:1)", width: 10, height: 10 },
  { name: "A4 عمودي", width: 8.27, height: 11.69 },
  { name: "A4 أفقي", width: 11.69, height: 8.27 },
]

const الانتقالات = [
  { name: "بدون", value: "none" },
  { name: "تلاشي", value: "fade" },
  { name: "دفع", value: "push" },
  { name: "مسح", value: "wipe" },
  { name: "تكبير", value: "zoom" },
  { name: "دوران", value: "spin" },
]
const أنماط_الإطارات = [
  { name: "بدون", value: "none" },
  { name: "دائري", value: "rounded-full overflow-hidden" }, // إضافة الإطار الدائري
  { name: "حدود بسيطة", value: "border-2 border-gray-300" },
  { name: "مستدير", value: "rounded-xl overflow-hidden" },
  { name: "ظل", value: "shadow-lg" },
  { name: "بولارويد", value: "border-[12px] border-t-[12px] border-b-[40px] border-white shadow-md" },
  { name: "قديم", value: "border-4 border-amber-800 shadow-md" },
]

export default function محرر_العروض_التقديمية() {
  const [شرائح, تعيين_الشرائح] = useState<شريحة[]>([])
  const [عرض_المعاينة, تعيين_عرض_المعاينة] = useState(false)
  const [الشريحة_الحالية, تعيين_الشريحة_الحالية] = useState(0)
  const [أبعاد_الشريحة, تعيين_أبعاد_الشريحة] = useState(أبعاد_الشرائح[0])
  const [انتقال_الشريحة, تعيين_انتقال_الشريحة] = useState("none")
  const [عرض_السمات, تعيين_عرض_السمات] = useState(false)
  const [ملء_الشاشة, تعيين_ملء_الشاشة] = useState(false)
  const [التبويب_النشط, تعيين_التبويب_النشط] = useState("محتوى")
  const [عنوان_العرض, تعيين_عنوان_العرض] = useState("عرض تقديمي جديد")
  const [جاري_السحب, تعيين_جاري_السحب] = useState(false)
  const [الشريحة_المسحوبة, تعيين_الشريحة_المسحوبة] = useState<number | null>(null)
  const [العنصر_المحدد, تعيين_العنصر_المحدد] = useState<string | null>(null)
  const [إطار_الصورة_المحدد, تعيين_إطار_الصورة_المحدد] = useState("none")
  const [العروض_المحفوظة, تعيين_العروض_المحفوظة] = useState<{ id: string; title: string; date: string }[]>([])
  const [عرض_الشريط_الجانبي, تعيين_عرض_الشريط_الجانبي] = useState(300)
  const [تغيير_حجم_الشريط_الجانبي, تعيين_تغيير_حجم_الشريط_الجانبي] = useState(false)
  const [وضع_العرض, تعيين_وضع_العرض] = useState<"edit" | "grid">("edit")
  const [عرض_المحفوظات, تعيين_عرض_المحفوظات] = useState(false)
  const [عرض_حذف_العرض, تعيين_عرض_حذف_العرض] = useState<string | null>(null)
  const [عرض_تأكيد_الحذف, تعيين_عرض_تأكيد_الحذف] = useState(false)
  const [عرض_تفاصيل_العرض, تعيين_عرض_تفاصيل_العرض] = useState<string | null>(null)

  const مراجع_مدخلات_الملفات = useRef<(HTMLInputElement | null)[]>([])
  const مراجع_مدخلات_الملفات_المعاينة = useRef<(HTMLInputElement | null)[]>([])
  const مرجع_مدخل_الصورة = useRef<HTMLInputElement | null>(null)
  const مرجع_حاوية_المعاينة = useRef<HTMLDivElement>(null)
  const مرجع_المحرر = useRef<HTMLDivElement>(null)
  const مرجع_الشريط_الجانبي = useRef<HTMLDivElement>(null)

  // توليد معرف فريد للشريحة الجديدة
  const توليد_معرف = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // إنشاء شريحة فارغة جديدة
  const إنشاء_شريحة_فارغة = (): شريحة => {
    return {
      id: توليد_معرف(),
      content: "",
      fontSize: "medium",
      fontColor: "white",
      backgroundColor: "black",
      backgroundOpacity: 1,
      alignment: "center",
      fontFamily: "Arial",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      lineSpacing: 1.5,
      textShadow: false,
      watermark: "",
      watermarkColor: "white",
      watermarkFontSize: 20,
      images: [],
      textElements: [],
      template: undefined,
    }
  }

  // إضافة شريحة جديدة
  const إضافة_شريحة = () => {
    const شريحة_جديدة = إنشاء_شريحة_فارغة()
    تعيين_الشرائح([...شرائح, شريحة_جديدة])
    تعيين_الشريحة_الحالية(شرائح.length)

    toast({
      title: "تمت إضافة شريحة",
      description: "تمت إضافة شريحة جديدة بنجاح",
    })
  }

  // إزالة شريحة
  const إزالة_شريحة = (index: number) => {
    if (شرائح.length <= 1) {
      toast({
        title: "لا يمكن حذف الشريحة",
        description: "يجب أن يحتوي العرض التقديمي على شريحة واحدة على الأقل",
        variant: "destructive",
      })
      return
    }

    const شرائح_جديدة = [...شرائح]
    شرائح_جديدة.splice(index, 1)
    تعيين_الشرائح(شرائح_جديدة)

    if (الشريحة_الحالية >= شرائح_جديدة.length) {
      تعيين_الشريحة_الحالية(شرائح_جديدة.length - 1)
    }

    toast({
      title: "تم حذف الشريحة",
      description: `تم حذف الشريحة ${index + 1} بنجاح`,
    })
  }

  // نسخ شريحة
  const نسخ_شريحة = (index: number) => {
    const الشريحة_المراد_نسخها = شرائح[index]
    const شريحة_جديدة = {
      ...الشريحة_المراد_نسخها,
      id: توليد_معرف(),
      images: الشريحة_المراد_نسخها.images.map((img) => ({ ...img, id: توليد_معرف() })),
      textElements: الشريحة_المراد_نسخها.textElements.map((txt) => ({ ...txt, id: توليد_معرف() })),
    }
    const شرائح_جديدة = [...شرائح]
    شرائح_جديدة.splice(index + 1, 0, شريحة_جديدة)
    تعيين_الشرائح(شرائح_جديدة)

    toast({
      title: "تم نسخ الشريحة",
      description: `تم نسخ الشريحة ${index + 1} بنجاح`,
    })
  }

  // التعامل مع إعادة ترتيب الشرائح
  const معالجة_بدء_السحب = (index: number) => {
    تعيين_جاري_السحب(true)
    تعيين_الشريحة_المسحوبة(index)
  }

  const معالجة_السحب_فوق = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (الشريحة_المسحوبة === null || الشريحة_المسحوبة === index) return

    const شرائح_جديدة = [...شرائح]
    const العنصر_المسحوب = شرائح_جديدة[الشريحة_المسحوبة]
    شرائح_جديدة.splice(الشريحة_المسحوبة, 1)
    شرائح_جديدة.splice(index, 0, العنصر_المسحوب)

    تعيين_الشرائح(شرائح_جديدة)
    تعيين_الشريحة_المسحوبة(index)
  }

  const معالجة_نهاية_السحب = () => {
    تعيين_جاري_السحب(false)
    تعيين_الشريحة_المسحوبة(null)
  }

  // تهيئة بشريحة فارغة واحدة
  useEffect(() => {
    if (شرائح.length === 0) {
      إضافة_شريحة()
    }

    // تحميل العروض المحفوظة من localStorage
    const المحفوظة = localStorage.getItem("savedPresentations")
    if (المحفوظة) {
      تعيين_العروض_المحفوظة(JSON.parse(المحفوظة))
    }
  }, [شرائح.length])

  const معالجة_تغيير_الشريحة = (index: number, property: keyof شريحة, value: any) => {
    const شرائح_جديدة = [...شرائح]
    شرائح_جديدة[index] = { ...شرائح_جديدة[index], [property]: value }
    تعيين_الشرائح(شرائح_جديدة)
  }

  const معالجة_رفع_الخلفية = (index: number, event: ChangeEvent<HTMLInputElement>, isPreview = false) => {
    const ملف = event.target.files?.[0]
    if (ملف) {
      const أنواع_الصور_المسموحة = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]
      if (!أنواع_الصور_المسموحة.includes(ملف.type)) {
        toast({
          title: "نوع ملف غير صالح",
          description: "يرجى اختيار ملف صورة (PNG، JPG، GIF، إلخ).",
          variant: "destructive",
        })
        return
      }

      const قارئ = new FileReader()
      قارئ.onload = (e) => {
        const رابط_الصورة = e.target?.result as string
        const شرائح_جديدة = [...شرائح]
        شرائح_جديدة[index] = {
          ...شرائح_جديدة[index],
          backgroundImage: رابط_الصورة,
          backgroundColor: "custom",
        }
        تعيين_الشرائح(شرائح_جديدة)

        toast({
          title: "تم رفع الصورة",
          description: "تم تعيين الصورة كخلفية للشريحة",
        })
      }
      قارئ.readAsDataURL(ملف)
    }
  }

  const معالجة_إضافة_صورة = (event: ChangeEvent<HTMLInputElement>) => {
    const ملف = event.target.files?.[0]
    if (ملف) {
      const أنواع_الصور_المسموحة = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]
      if (!أنواع_الصور_المسموحة.includes(ملف.type)) {
        toast({
          title: "نوع ملف غير صالح",
          description: "يرجى اختيار ملف صورة (PNG، JPG، GIF، إلخ).",
          variant: "destructive",
        })
        return
      }

      const قارئ = new FileReader()
      قارئ.onload = (e) => {
        const رابط_الصورة = e.target?.result as string
        const صورة_جديدة: عنصر_صورة = {
          id: توليد_معرف(),
          src: رابط_الصورة,
          x: 50,
          y: 50,
          width: 200,
          height: 150,
          rotation: 0,
          zIndex: 1,
        }

        const شرائح_جديدة = [...شرائح]
        شرائح_جديدة[الشريحة_الحالية] = {
          ...شرائح_جديدة[الشريحة_الحالية],
          images: [...شرائح_جديدة[الشريحة_الحالية].images, صورة_جديدة],
        }
        تعيين_الشرائح(شرائح_جديدة)
        تعيين_العنصر_المحدد(صورة_جديدة.id)

        toast({
          title: "تمت إضافة الصورة",
          description: "تمت إضافة الصورة إلى الشريحة",
        })
      }
      قارئ.readAsDataURL(ملف)
    }
  }

  const معالجة_إضافة_عنصر_نصي = () => {
    const عنصر_نصي_جديد: عنصر_نص = {
      id: توليد_معرف(),
      content: "نص جديد",
      x: 50,
      y: 50,
      width: 200,
      fontSize: "medium",
      fontColor: "black",
      fontFamily: "Arial",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      alignment: "left",
      zIndex: 1,
    }

    const شرائح_جديدة = [...شرائح]
    شرائح_جديدة[الشريحة_الحالية] = {
      ...شرائح_جديدة[الشريحة_الحالية],
      textElements: [...شرائح_جديدة[الشريحة_الحالية].textElements, عنصر_نصي_جديد],
    }
    تعيين_الشرائح(شرائح_جديدة)
    تعيين_العنصر_المحدد(عنصر_نصي_جديد.id)
  }

  // First, let's add the keyboard arrow key movement function
  const معالجة_حركة_بالأسهم = (id: string, event: React.KeyboardEvent) => {
    event.preventDefault()
    const شرائح_جديدة = [...شرائح]
    const بيانات_الشريحة_الحالية = شرائح_جديدة[الشريحة_الحالية]

    // التحقق مما إذا كان صورة
    const مؤشر_الصورة = بيانات_الشريحة_الحالية.images.findIndex((img) => img.id === id)
    if (مؤشر_الصورة !== -1) {
      const صورة_محدثة = { ...بيانات_الشريحة_الحالية.images[مؤشر_الصورة] }

      // تحريك الصورة بناءً على المفتاح المضغوط
      switch (event.key) {
        case "ArrowUp":
          صورة_محدثة.y -= 10
          break
        case "ArrowDown":
          صورة_محدثة.y += 10
          break
        case "ArrowLeft":
          صورة_محدثة.x -= 10
          break
        case "ArrowRight":
          صورة_محدثة.x += 10
          break
      }

      بيانات_الشريحة_الحالية.images[مؤشر_الصورة] = صورة_محدثة
      تعيين_الشرائح(شرائح_جديدة)
    }

    // التحقق مما إذا كان عنصر نصي
    const مؤشر_النص = بيانات_الشريحة_الحالية.textElements.findIndex((txt) => txt.id === id)
    if (مؤشر_النص !== -1) {
      const نص_محدث = { ...بيانات_الشريحة_الحالية.textElements[مؤشر_النص] }

      // تحريك النص بناءً على المفتاح المضغوط
      switch (event.key) {
        case "ArrowUp":
          نص_محدث.y -= 10
          break
        case "ArrowDown":
          نص_محدث.y += 10
          break
        case "ArrowLeft":
          نص_محدث.x -= 10
          break
        case "ArrowRight":
          نص_محدث.x += 10
          break
      }

      بيانات_الشريحة_الحالية.textElements[مؤشر_النص] = نص_محدث
      تعيين_الشرائح(شرائح_جديدة)
    }
  }

  // Replace the معالجة_سحب_العنصر function with an improved version
  const معالجة_سحب_العنصر = (id: string, deltaX: number, deltaY: number) => {
    const شرائح_جديدة = [...شرائح]
    const بيانات_الشريحة_الحالية = شرائح_جديدة[الشريحة_الحالية]

    // التحقق مما إذا كان صورة
    const مؤشر_الصورة = بيانات_الشريحة_الحالية.images.findIndex((img) => img.id === id)
    if (مؤشر_الصورة !== -1) {
      // استخدام نسخة جديدة من الكائن لتجنب مشاكل التحديث
      const صورة_محدثة = { ...بيانات_الشريحة_الحالية.images[مؤشر_الصورة] }
      صورة_محدثة.x += deltaX
      صورة_محدثة.y += deltaY
      بيانات_الشريحة_الحالية.images[مؤشر_الصورة] = صورة_محدثة
      تعيين_الشرائح(شرائح_جديدة)
      return
    }

    // التحقق مما إذا كان عنصر نصي
    const مؤشر_النص = بيانات_الشريحة_الحالية.textElements.findIndex((txt) => txt.id === id)
    if (مؤشر_النص !== -1) {
      const نص_محدث = { ...بيانات_الشريحة_الحالية.textElements[مؤشر_النص] }
      نص_محدث.x += deltaX
      نص_محدث.y += deltaY
      بيانات_الشريحة_الحالية.textElements[مؤشر_النص] = نص_محدث
      تعيين_الشرائح(شرائح_جديدة)
    }
  }

  // Now fix the image movement function
  const معالجة_حركة_الصورة_المتقدمة = (id: string, event: React.MouseEvent | React.TouchEvent, isTouch = false) => {
    event.stopPropagation()

    // Get initial position
    let startX: number, startY: number
    if (isTouch) {
      const touch = (event as React.TouchEvent).touches[0]
      startX = touch.clientX
      startY = touch.clientY
    } else {
      startX = (event as React.MouseEvent).clientX
      startY = (event as React.MouseEvent).clientY
    }

    // Get the image element
    const شرائح_جديدة = [...شرائح]
    const بيانات_الشريحة_الحالية = شرائح_جديدة[الشريحة_الحالية]
    const مؤشر_الصورة = بيانات_الشريحة_الحالية.images.findIndex((img) => img.id === id)

    if (مؤشر_الصورة === -1) return

    // Initial position of the image
    const initialX = بيانات_الشريحة_الحالية.images[مؤشر_الصورة].x
    const initialY = بيانات_الشريحة_الحالية.images[مؤشر_الصورة].y

    // Create a visual indicator for dragging
    const dragIndicator = document.createElement("div")
    dragIndicator.style.position = "absolute"
    dragIndicator.style.border = "2px dashed #3b82f6"
    dragIndicator.style.backgroundColor = "rgba(59, 130, 246, 0.1)"
    dragIndicator.style.width = `${بيانات_الشريحة_الحالية.images[مؤشر_الصورة].width}px`
    dragIndicator.style.height = `${بيانات_الشريحة_الحالية.images[مؤشر_الصورة].height}px`
    dragIndicator.style.top = `${initialY}px`
    dragIndicator.style.left = `${initialX}px`
    dragIndicator.style.zIndex = "9999"
    dragIndicator.style.pointerEvents = "none"
    dragIndicator.style.transform = `rotate(${بيانات_الشريحة_الحالية.images[مؤشر_الصورة].rotation}deg)`

    // Add the indicator to the editor
    const editorElement = مرجع_المحرر.current
    if (editorElement) {
      editorElement.appendChild(dragIndicator)
    }

    // Handle mouse/touch move
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number
      if (moveEvent instanceof TouchEvent) {
        clientX = moveEvent.touches[0].clientX
        clientY = moveEvent.touches[0].clientY
      } else {
        clientX = moveEvent.clientX
        clientY = moveEvent.clientY
      }

      const deltaX = clientX - startX
      const deltaY = clientY - startY

      // Update the indicator position
      dragIndicator.style.top = `${initialY + deltaY}px`
      dragIndicator.style.left = `${initialX + deltaX}px`
    }

    // Handle mouse/touch end
    const handleEnd = (endEvent: MouseEvent | TouchEvent) => {
      // Remove event listeners
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("touchmove", handleMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchend", handleEnd)

      // Get final position
      let clientX: number, clientY: number
      if (endEvent instanceof TouchEvent) {
        if (endEvent.changedTouches.length === 0) return
        clientX = endEvent.changedTouches[0].clientX
        clientY = endEvent.changedTouches[0].clientY
      } else {
        clientX = endEvent.clientX
        clientY = endEvent.clientY
      }

      const deltaX = clientX - startX
      const deltaY = clientY - startY

      // Update the actual image position
      const صورة_محدثة = { ...بيانات_الشريحة_الحالية.images[مؤشر_الصورة] }
      صورة_محدثة.x = initialX + deltaX
      صورة_محدثة.y = initialY + deltaY
      بيانات_الشريحة_الحالية.images[مؤشر_الصورة] = صورة_محدثة
      تعيين_الشرائح(شرائح_جديدة)

      // Remove the indicator
      if (editorElement && dragIndicator.parentNode === editorElement) {
        editorElement.removeChild(dragIndicator)
      }
    }

    // Add event listeners
    document.addEventListener("mousemove", handleMove)
    document.addEventListener("touchmove", handleMove)
    document.addEventListener("mouseup", handleEnd)
    document.addEventListener("touchend", handleEnd)
  }

  const معالجة_تغيير_حجم_العنصر = (id: string, width: number, height: number) => {
    const شرائح_جديدة = [...شرائح]
    const بيانات_الشريحة_الحالية = شرائح_جديدة[الشريحة_الحالية]

    // التحقق مما إذا كان صورة
    const مؤشر_الصورة = بيانات_الشريحة_الحالية.images.findIndex((img) => img.id === id)
    if (مؤشر_الصورة !== -1) {
      بيانات_الشريحة_الحالية.images[مؤشر_الصورة].width = width
      بيانات_الشريحة_الحالية.images[مؤشر_الصورة].height = height
      تعيين_الشرائح(شرائح_جديدة)
      return
    }

    // التحقق مما إذا كان عنصر نصي
    const مؤشر_النص = بيانات_الشريحة_الحالية.textElements.findIndex((txt) => txt.id === id)
    if (مؤشر_النص !== -1) {
      بيانات_الشريحة_الحالية.textElements[مؤشر_النص].width = width
      تعيين_الشرائح(شرائح_جديدة)
    }
  }

  const معالجة_تدوير_العنصر = (id: string, rotation: number) => {
    const شرائح_جديدة = [...شرائح]
    const بيانات_الشريحة_الحالية = شرائح_جديدة[الشريحة_الحالية]

    // التحقق مما إذا كان صورة
    const مؤشر_الصورة = بيانات_الشريحة_الحالية.images.findIndex((img) => img.id === id)
    if (مؤشر_الصورة !== -1) {
      بيانات_الشريحة_الحالية.images[مؤشر_الصورة].rotation = rotation
      تعيين_الشرائح(شرائح_جديدة)
    }
  }

  const معالجة_تغيير_عنصر_نصي = (id: string, property: keyof عنصر_نص, value: any) => {
    const شرائح_جديدة = [...شرائح]
    const بيانات_الشريحة_الحالية = شرائح_جديدة[الشريحة_الحالية]

    const مؤشر_النص = بيانات_الشريحة_الحالية.textElements.findIndex((txt) => txt.id === id)
    if (مؤشر_النص !== -1) {
      بيانات_الشريحة_الحالية.textElements[مؤشر_النص] = {
        ...بيانات_الشريحة_الحالية.textElements[مؤشر_النص],
        [property]: value,
      }
      تعيين_الشرائح(شرائح_جديدة)
    }
  }

  const حذف_العنصر = (id: string) => {
    const شرائح_جديدة = [...شرائح]
    const بيانات_الشريحة_الحالية = شرائح_جديدة[الشريحة_الحالية]

    // التحقق مما إذا كان صورة
    const مؤشر_الصورة = بيانات_الشريحة_الحالية.images.findIndex((img) => img.id === id)
    if (مؤشر_الصورة !== -1) {
      بيانات_الشريحة_الحالية.images.splice(مؤشر_الصورة, 1)
      تعيين_الشرائح(شرائح_جديدة)
      تعيين_العنصر_المحدد(null)
      return
    }

    // التحقق مما إذا كان عنصر نصي
    const مؤشر_النص = بيانات_الشريحة_الحالية.textElements.findIndex((txt) => txt.id === id)
    if (مؤشر_النص !== -1) {
      بيانات_الشريحة_الحالية.textElements.splice(مؤشر_النص, 1)
      تعيين_الشرائح(شرائح_جديدة)
      تعيين_العنصر_المحدد(null)
    }
  }

  const تغيير_الخلفية = (index: number, background: string, gradient?: string) => {
    const شرائح_جديدة = [...شرائح]
    شرائح_جديدة[index] = {
      ...شرائح_جديدة[index],
      backgroundColor: background,
      backgroundImage: background === "custom" ? gradient || شرائح_جديدة[index].backgroundImage : undefined,
    }
    تعيين_الشرائح(شرائح_جديدة)
  }

  const تطبيق_القالب = (templateId: string) => {
    const قالب = القوالب.find((t) => t.id === templateId)
    if (!قالب) return

    const شرائح_جديدة = [...شرائح]
    شرائح_جديدة[الشريحة_الحالية] = {
      ...شرائح_جديدة[الشريحة_الحالية],
      backgroundColor: قالب.backgroundColor,
      backgroundImage: قالب.backgroundImage,
      fontFamily: قالب.fontFamily,
      fontColor: قالب.fontColor,
      template: templateId,
    }
    تعيين_الشرائح(شرائح_جديدة)

    toast({
      title: "تم تطبيق القالب",
      description: `تم تطبيق قالب "${قالب.name}" على الشريحة الحالية`,
    })
  }

  const الحصول_على_حجم_الخط = (size: string) => {
    switch (size) {
      case "x-small":
        return "text-base"
      case "small":
        return "text-lg"
      case "medium":
        return "text-2xl"
      case "large":
        return "text-4xl"
      case "x-large":
        return "text-6xl"
      default:
        return "text-2xl"
    }
  }

  const الحصول_على_حجم_خط_PPTX = (size: string) => {
    switch (size) {
      case "x-small":
        return 14
      case "small":
        return 18
      case "medium":
        return 28
      case "large":
        return 40
      case "x-large":
        return 54
      default:
        return 28
    }
  }

  // Modify the حفظ_كملف_باوربوينت function to properly handle text colors
  const حفظ_كملف_باوربوينت = () => {
    try {
      const pptx = new pptxgen();
      
      // تحديد أبعاد الشريحة بالبوصة (القيم النموذجية لـ 16:9)
      pptx.defineSlideMaster({
        title: "MASTER_SLIDE",
        width: أبعاد_الشريحة.width,  // استخدام width مباشرة (بالبوصة)
        height: أبعاد_الشريحة.height, // استخدام height مباشرة (بالبوصة)
      });


      شرائح.forEach((شريحة) => {
        const pptSlide = pptx.addSlide({ masterName: "MASTER_SLIDE" })

        // تحويل اللون إلى صيغة HEX المناسبة لـ PowerPoint
        const تحويل_اللون_إلى_هيكس = (color: string) => {
          // إذا كان اللون بالفعل بصيغة HEX
          if (color.startsWith("#")) return color.substring(1)

          // قاموس الألوان الأساسية
          const الألوان_الأساسية: Record<string, string> = {
            white: "FFFFFF",
            black: "000000",
            red: "FF0000",
            green: "008000",
            blue: "0000FF",
            yellow: "FFFF00",
            purple: "800080",
            gray: "808080",
            silver: "C0C0C0",
            gold: "FFD700",
            darkblue: "00008B",
            darkgreen: "006400",
          }

          return الألوان_الأساسية[color] || "FFFFFF" // إرجاع اللون الأبيض كقيمة افتراضية
        }

        // إضافة المحتوى الرئيسي مع تحديد اللون بشكل صريح
        pptSlide.addText(شريحة.content, {
          x: 0.5,
          y: 0.5,
          w: "90%",
          h: "90%",
          fontSize: الحصول_على_حجم_خط_PPTX(شريحة.fontSize),
          color: تحويل_اللون_إلى_هيكس(شريحة.fontColor),
          align: شريحة.alignment,
          valign: "middle",
          fontFace: شريحة.fontFamily,
          bold: شريحة.isBold,
          italic: شريحة.isItalic,
          underline: شريحة.isUnderline,
          lineSpacing: شريحة.lineSpacing * 24,
          shadow: شريحة.textShadow ? { type: "outer", color: "000000", blur: 3, offset: 3, angle: 45 } : undefined,
        })

        // إضافة الخلفية
        if (شريحة.backgroundColor === "custom" && شريحة.backgroundImage) {
          if (شريحة.backgroundImage.startsWith("data:image")) {
            pptSlide.background = { data: شريحة.backgroundImage, opacity: شريحة.backgroundOpacity }
          } else {
            // بالنسبة لخلفيات التدرج
            pptSlide.background = { color: "000000" }
            pptSlide.addShape(pptx.ShapeType.rectangle, {
              x: 0,
              y: 0,
              w: "100%",
              h: "100%",
              fill: { color: "000000" },
              line: { color: "transparent" },
            })
          }
        } else {
          pptSlide.background = { color: تحويل_اللون_إلى_هيكس(شريحة.backgroundColor) }
        }

        // إضافة العلامة المائية
        if (شريحة.watermark) {
          pptSlide.addText(شريحة.watermark, {
            x: "80%",
            y: "5%",
            w: "15%",
            h: "10%",
            fontSize: شريحة.watermarkFontSize,
            color: تحويل_اللون_إلى_هيكس(شريحة.watermarkColor),
            align: "right",
            valign: "top",
            opacity: 0.5,
          })
        }

        // إضافة الصور
        شريحة.images.forEach((img) => {
          if (img.src.startsWith("data:image")) {
            pptSlide.addImage({
              data: img.src,
              x: img.x / 100,
              y: img.y / 100,
              w: img.width / 100,
              h: img.height / 100,
              rotate: img.rotation,
            })
          }
        })

        // إضافة عناصر النص مع تحديد اللون بشكل صريح
        شريحة.textElements.forEach((txt) => {
          pptSlide.addText(txt.content, {
            x: txt.x / 100,
            y: txt.y / 100,
            w: txt.width / 100,
            fontSize: الحصول_على_حجم_خط_PPTX(txt.fontSize),
            color: تحويل_اللون_إلى_هيكس(txt.fontColor),
            align: txt.alignment,
            fontFace: txt.fontFamily,
            bold: txt.isBold,
            italic: txt.isItalic,
            underline: txt.isUnderline,
          })
        })

        // إضافة انتقال الشريحة
        if (انتقال_الشريحة !== "none") {
          pptSlide.slideTransition = { type: انتقال_الشريحة }
        }
      })

      // تعيين خصائص المستند للحفاظ على التنسيق
      pptx.author = "محرر العروض التقديمية"
      pptx.subject = عنوان_العرض
      pptx.company = "محرر العروض التقديمية"
      pptx.revision = "1"

      // إضافة خصائص إضافية للحفاظ على التنسيق
      pptx.title = عنوان_العرض
      pptx.theme = {
        headFontFace: عائلات_الخطوط[0].value,
        bodyFontFace: عائلات_الخطوط[0].value,
      }

      pptx.writeFile(`${عنوان_العرض || "presentation"}.pptx`)

      toast({
        title: "تم الحفظ بنجاح",
        description: `تم حفظ العرض التقديمي كملف باوربوينت "${عنوان_العرض || "presentation"}.pptx"`,
      })
    } catch (error) {
      console.error("خطأ في الحفظ كملف باوربوينت:", error)
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ العرض التقديمي كملف باوربوينت",
        variant: "destructive",
      })
    }
  }

  const تبديل_ملء_الشاشة = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          تعيين_ملء_الشاشة(true)
        })
        .catch((err) => {
          console.error("خطأ في محاولة تفعيل وضع ملء الشاشة:", err)
          toast({
            title: "خطأ في ملء الشاشة",
            description: "غير قادر على تنشيط وضع ملء الشاشة",
            variant: "destructive",
          })
        })
    } else {
      document
        .exitFullscreen()
        .then(() => {
          تعيين_ملء_الشاشة(false)
        })
        .catch((err) => {
          console.error("خطأ في محاولة الخروج من وضع ملء الشاشة:", err)
        })
    }
  }

  useEffect(() => {
    const معالجة_ضغط_المفتاح = (event: KeyboardEvent) => {
      if (!عرض_المعاينة || !شرائح.length) return

      if (event.key === "ArrowRight") {
        تعيين_الشريحة_الحالية((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (event.key === "ArrowLeft") {
        تعيين_الشريحة_الحالية((prev) => (prev < شرائح.length - 1 ? prev + 1 : prev))
      } else if (event.key === "Escape") {
        تعيين_عرض_المعاينة(false)
        تعيين_عرض_السمات(false)
        if (document.fullscreenElement) {
          document.exitFullscreen().then(() => {
            تعيين_ملء_الشاشة(false)
          })
        }
      } else if (event.key === "f" || event.key === "F") {
        تبديل_ملء_الشاشة()
      }
    }

    window.addEventListener("keydown", معالجة_ضغط_المفتاح)
    return () => window.removeEventListener("keydown", معالجة_ضغط_المفتاح)
  }, [عرض_المعاينة, شرائح.length])

  // معالجة أحداث تغيير ملء الشاشة
  useEffect(() => {
    const معالجة_تغيير_ملء_الشاشة = () => {
      تعيين_ملء_الشاشة(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", معالجة_تغيير_ملء_الشاشة)
    return () => document.removeEventListener("fullscreenchange", معالجة_تغيير_ملء_الشاشة)
  }, [])

  // معالجة تغيير حجم الشريط الجانبي
  useEffect(() => {
    const معالجة_تحريك_الماوس = (e: MouseEvent) => {
      if (تغيير_حجم_الشريط_الجانبي && مرجع_الشريط_الجانبي.current) {
        const العرض_الجديد = e.clientX
        if (العرض_الجديد >= 200 && العرض_الجديد <= 500) {
          تعيين_عرض_الشريط_الجانبي(العرض_الجديد)
        }
      }
    }

    const معالجة_رفع_الماوس = () => {
      تعيين_تغيير_حجم_الشريط_الجانبي(false)
    }

    if (تغيير_حجم_الشريط_الجانبي) {
      document.addEventListener("mousemove", معالجة_تحريك_الماوس)
      document.addEventListener("mouseup", معالجة_رفع_الماوس)
    }

    return () => {
      document.removeEventListener("mousemove", معالجة_تحريك_الماوس)
      document.removeEventListener("mouseup", معالجة_رفع_الماوس)
    }
  }, [تغيير_حجم_الشريط_الجانبي])

  const الحصول_على_نمط_خلفية_الشريحة = (شريحة: شريحة) => {
    if (شريحة.backgroundColor === "custom") {
      if (شريحة.backgroundImage?.startsWith("data:image")) {
        return {
          backgroundImage: `url(${شريحة.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: شريحة.backgroundOpacity,
        }
      } else if (شريحة.backgroundImage) {
        // بالنسبة لخلفيات التدرج
        return {
          background: شريحة.backgroundImage,
        }
      }
    }
    return { backgroundColor: شريحة.backgroundColor }
  }

  const متغيرات_الشريحة = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const إعدادات_انتقال_الشريحة = {
    type: انتقال_الشريحة === "fade" ? "tween" : "spring",
    stiffness: 300,
    damping: 30,
  }

  // إضافة hook لاكتشاف حجم الشاشة
  const [حجم_الشاشة, تعيين_حجم_الشاشة] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    const معالجة_تغيير_الحجم = () => {
      تعيين_حجم_الشاشة({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", معالجة_تغيير_الحجم)
    معالجة_تغيير_الحجم() // تعيين القيمة الأولية

    return () => window.removeEventListener("resize", معالجة_تغيير_الحجم)
  }, [])

  // تعديل عرض الشريط الجانبي بناءً على حجم الشاشة
  useEffect(() => {
    if (حجم_الشاشة.width < 768) {
      // على الموبايل، نجعل الشريط الجانبي يأخذ العرض الكامل
      تعيين_عرض_الشريط_الجانبي(حجم_الشاشة.width)
    } else if (عرض_الشريط_الجانبي > 500 || عرض_الشريط_الجانبي < 200) {
      // إعادة تعيين عرض الشريط الجانبي إلى القيمة الافتراضية إذا كان خارج النطاق
      تعيين_عرض_الشريط_الجانبي(300)
    }
  }, [حجم_الشاشة.width])

  // عرض المعاينة بملء الشاشة
  if (عرض_المعاينة) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50" ref={مرجع_حاوية_المعاينة}>
        <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              onClick={() => تعيين_عرض_المعاينة(false)}
            >
              <X className="h-4 w-4 mr-1" />
              إغلاق
            </Button>
            <span className="text-white font-bold">{عنوان_العرض}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              onClick={() => تعيين_الشريحة_الحالية((prev) => (prev > 0 ? prev - 1 : prev))}
              disabled={الشريحة_الحالية === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              السابق
            </Button>
            <span className="text-white text-sm">
              {الشريحة_الحالية + 1} / {شرائح.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              onClick={() => تعيين_الشريحة_الحالية((prev) => (prev < شرائح.length - 1 ? prev + 1 : prev))}
              disabled={الشريحة_الحالية === شرائح.length - 1}
            >
              التالي
              <ArrowRight className="h-4 w-4 mr-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              onClick={تبديل_ملء_الشاشة}
            >
              {ملء_الشاشة ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
              onClick={حفظ_كملف_باوربوينت}
            >
              <Download className="h-4 w-4 mr-1" />
              تنزيل
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-950 overflow-hidden">
          <div
            className="w-full max-w-5xl aspect-video relative"
            style={الحصول_على_نمط_خلفية_الشريحة(شرائح[الشريحة_الحالية])}
          >
            {/* محتوى الشريحة الرئيسي */}
            <p
              className={`${الحصول_على_حجم_الخط(شرائح[الشريحة_الحالية]?.fontSize)} whitespace-pre-line absolute inset-0 flex items-center justify-center p-4 sm:p-8`}
              style={{
                color: شرائح[الشريحة_الحالية]?.fontColor,
                textAlign: شرائح[الشريحة_الحالية]?.alignment,
                fontFamily: شرائح[الشريحة_الحالية]?.fontFamily,
                fontWeight: شرائح[الشريحة_الحالية]?.isBold ? "bold" : "normal",
                fontStyle: شرائح[الشريحة_الحالية]?.isItalic ? "italic" : "normal",
                textDecoration: شرائح[الشريحة_الحالية]?.isUnderline ? "underline" : "none",
                lineHeight: شرائح[الشريحة_الحالية]?.lineSpacing,
                textShadow: شرائح[الشريحة_الحالية]?.textShadow ? "2px 2px 4px rgba(0, 0, 0, 0.5)" : "none",
              }}
            >
              {شرائح[الشريحة_الحالية]?.content || ""}
            </p>

            {/* الصور */}
            {شرائح[الشريحة_الحالية]?.images.map((img) => (
              <div
                key={img.id}
                className={`absolute ${إطار_الصورة_المحدد}`}
                style={{
                  top: `${img.y}px`,
                  left: `${img.x}px`,
                  width: `${img.width}px`,
                  height: `${img.height}px`,
                  transform: `rotate(${img.rotation}deg)`,
                  zIndex: img.zIndex,
                }}
              >
                <img src={img.src || "/placeholder.svg"} alt="عنصر الشريحة" className="w-full h-full object-cover" />
              </div>
            ))}

            {/* عناصر النص */}
            {شرائح[الشريحة_الحالية]?.textElements.map((txt) => (
              <div
                key={txt.id}
                className="absolute p-2"
                style={{
                  top: `${txt.y}px`,
                  left: `${txt.x}px`,
                  width: `${txt.width}px`,
                  zIndex: txt.zIndex,
                }}
              >
                <p
                  className={`${الحصول_على_حجم_الخط(txt.fontSize)}`}
                  style={{
                    color: txt.fontColor,
                    textAlign: txt.alignment,
                    fontFamily: txt.fontFamily,
                    fontWeight: txt.isBold ? "bold" : "normal",
                    fontStyle: txt.isItalic ? "italic" : "normal",
                    textDecoration: txt.isUnderline ? "underline" : "none",
                  }}
                >
                  {txt.content}
                </p>
              </div>
            ))}

            {/* العلامة المائية */}
            {شرائح[الشريحة_الحالية]?.watermark && (
              <div
                className="absolute bottom-4 right-4 text-gray-500 text-sm"
                style={{
                  fontFamily: "Arial",
                  opacity: 0.7,
                  fontSize: `${شرائح[الشريحة_الحالية]?.watermarkFontSize}px`,
                  color: شرائح[الشريحة_الحالية]?.watermarkColor,
                }}
              >
                {شرائح[الشريحة_الحالية]?.watermark}
              </div>
            )}
          </div>
        </div>
        <div className="p-2 bg-gray-900 border-t border-gray-800 flex justify-center">
          <div className="flex gap-1 overflow-x-auto max-w-full p-1">
            {شرائح.map((شريحة, index) => (
              <div
                key={شريحة.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  index === الشريحة_الحالية ? "ring-2 ring-blue-500 scale-105" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => تعيين_الشريحة_الحالية(index)}
              >
                <div className="w-24 h-16 overflow-hidden" style={الحصول_على_نمط_خلفية_الشريحة(شريحة)}>
                  <div className="w-full h-full flex items-center justify-center text-xs">
                    <p
                      className="line-clamp-2 text-center p-1"
                      style={{
                        color: شريحة.fontColor,
                        fontWeight: شريحة.isBold ? "bold" : "normal",
                        fontStyle: شريحة.isItalic ? "italic" : "normal",
                        textDecoration: شريحة.isUnderline ? "underline" : "none",
                      }}
                    >
                      {شريحة.content || "شريحة فارغة"}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl-sm">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Implement the save presentation function
  const حفظ_العرض_التقديمي = async () => {
    try {
      // Generate a unique ID for the presentation
      const presentationId = توليد_معرف()

      // Get the current date
      const currentDate = new Date()
      const formattedDate = currentDate.toLocaleDateString()

      // Save the presentation data to localStorage
      localStorage.setItem(
        `presentation_${presentationId}`,
        JSON.stringify({
          title: عنوان_العرض,
          slides: شرائح,
        }),
      )

      // Update the list of saved presentations
      const updatedPresentations = [...العروض_المحفوظة, { id: presentationId, title: عنوان_العرض, date: formattedDate }]
      تعيين_العروض_المحفوظة(updatedPresentations)
      localStorage.setItem("savedPresentations", JSON.stringify(updatedPresentations))

      toast({
        title: "تم الحفظ بنجاح",
        description: `تم حفظ العرض التقديمي "${عنوان_العرض}"`,
      })
    } catch (error) {
      console.error("خطأ في حفظ العرض التقديمي:", error)
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ العرض التقديمي",
        variant: "destructive",
      })
    }
  }

  // Implement the load presentation function
  const تحميل_العرض_التقديمي = (presentationId: string) => {
    try {
      // Get the presentation data from localStorage
      const presentationData = localStorage.getItem(`presentation_${presentationId}`)

      if (presentationData) {
        const parsedData = JSON.parse(presentationData)

        // Update the state with the loaded presentation data
        تعيين_عنوان_العرض(parsedData.title)
        تعيين_الشرائح(parsedData.slides)

        toast({
          title: "تم التحميل بنجاح",
          description: `تم تحميل العرض التقديمي "${parsedData.title}"`,
        })
      } else {
        toast({
          title: "لم يتم العثور على العرض التقديمي",
          description: "لم يتم العثور على العرض التقديمي المحدد",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("خطأ في تحميل العرض التقديمي:", error)
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل العرض التقديمي",
        variant: "destructive",
      })
    }

    تعيين_عرض_المحفوظات(false)
  }

  // Implement the delete presentation function
  const حذف_العرض_التقديمي = (presentationId: string) => {
    try {
      // Remove the presentation data from localStorage
      localStorage.removeItem(`presentation_${presentationId}`)

      // Update the list of saved presentations
      const updatedPresentations = العروض_المحفوظة.filter((presentation) => presentation.id !== presentationId)
      تعيين_العروض_المحفوظة(updatedPresentations)
      localStorage.setItem("savedPresentations", JSON.stringify(updatedPresentations))

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف العرض التقديمي",
      })
    } catch (error) {
      console.error("خطأ في حذف العرض التقديمي:", error)
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف العرض التقديمي",
        variant: "destructive",
      })
    }

    تعيين_عرض_حذف_العرض(null)
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl w-full">
      <CardHeader className="border-b border-gray-700">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">محرر العروض التقديمية</CardTitle>
            <CardDescription className="text-gray-300">إنشاء وتخصيص شرائح العرض التقديمي الخاص بك</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={عنوان_العرض}
              onChange={(e) => تعيين_عنوان_العرض(e.target.value)}
              placeholder="عنوان العرض التقديمي"
              className="max-w-[200px] bg-gray-800 border-gray-700 text-white"
            />
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                      onClick={حفظ_العرض_التقديمي}
                    >
                      <Save className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>حفظ العرض التقديمي</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                      onClick={حفظ_كملف_باوربوينت}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تصدير كملف باوربوينت</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        تعيين_عرض_المعاينة(true)
                        تعيين_عرض_السمات(false)
                      }}
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>عرض</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                      onClick={() => تعيين_عرض_المحفوظات(true)}
                    >
                      <Layers className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>العروض المحفوظة</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Add new slide button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={إضافة_شريحة}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>إضافة شريحة</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[calc(100vh-150px)]">
          {/* منطقة المحتوى الرئيسية */}
          <div className="flex-1 overflow-auto bg-gray-900">
            {وضع_العرض === "edit" ? (
              <div className="p-2 sm:p-4">
                {شرائح.length > 0 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-md overflow-hidden">
                      <Tabs value={التبويب_النشط} onValueChange={تعيين_التبويب_النشط} className="w-full">
                        <TabsList className="w-full bg-gray-900 p-0 h-12 overflow-x-auto flex-nowrap">
                          <TabsTrigger
                            value="محتوى"
                            className="flex-1 h-full data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-none border-r border-gray-700"
                          >
                            <Type className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">المحتوى</span>
                          </TabsTrigger>
                          {/* Rename the "تصميم" tab to "Design" and combine design elements and elements */}
                          <TabsTrigger
                            value="تصميم"
                            className="flex-1 h-full data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-none border-r border-gray-700"
                          >
                            <Palette className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Design</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="متقدم"
                            className="flex-1 h-full data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-none"
                          >
                            <Settings className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">متقدم</span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="محتوى" className="p-2 sm:p-4 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white">محتوى الشريحة</Label>
                            <Textarea
                              value={شرائح[الشريحة_الحالية]?.content || ""}
                              onChange={(e) => معالجة_تغيير_الشريحة(الشريحة_الحالية, "content", e.target.value)}
                              placeholder="أدخل محتوى الشريحة هنا..."
                              className="min-h-[150px] sm:min-h-[200px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 resize-y"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2 p-2 bg-gray-700 rounded-md">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={شرائح[الشريحة_الحالية]?.isBold ? "default" : "outline"}
                                    size="icon"
                                    onClick={() =>
                                      معالجة_تغيير_الشريحة(الشريحة_الحالية, "isBold", !شرائح[الشريحة_الحالية]?.isBold)
                                    }
                                    className={
                                      شرائح[الشريحة_الحالية]?.isBold ? "bg-blue-600" : "bg-gray-800 border-gray-600"
                                    }
                                  >
                                    <Bold className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>غامق</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={شرائح[الشريحة_الحالية]?.isItalic ? "default" : "outline"}
                                    size="icon"
                                    onClick={() =>
                                      معالجة_تغيير_الشريحة(
                                        الشريحة_الحالية,
                                        "isItalic",
                                        !شرائح[الشريحة_الحالية]?.isItalic,
                                      )
                                    }
                                    className={
                                      شرائح[الشريحة_الحالية]?.isItalic ? "bg-blue-600" : "bg-gray-800 border-gray-600"
                                    }
                                  >
                                    <Italic className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>مائل</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={شرائح[الشريحة_الحالية]?.isUnderline ? "default" : "outline"}
                                    size="icon"
                                    onClick={() =>
                                      معالجة_تغيير_الشريحة(
                                        الشريحة_الحالية,
                                        "isUnderline",
                                        !شرائح[الشريحة_الحالية]?.isUnderline,
                                      )
                                    }
                                    className={
                                      شرائح[الشريحة_الحالية]?.isUnderline
                                        ? "bg-blue-600"
                                        : "bg-gray-800 border-gray-600"
                                    }
                                  >
                                    <Underline className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>تسطير</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <div className="h-6 w-px bg-gray-600 mx-1"></div>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={شرائح[الشريحة_الحالية]?.alignment === "left" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => معالجة_تغيير_الشريحة(الشريحة_الحالية, "alignment", "left")}
                                    className={
                                      شرائح[الشريحة_الحالية]?.alignment === "left"
                                        ? "bg-blue-600"
                                        : "bg-gray-800 border-gray-600"
                                    }
                                  >
                                    <AlignLeft className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>محاذاة لليسار</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={شرائح[الشريحة_الحالية]?.alignment === "center" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => معالجة_تغيير_الشريحة(الشريحة_الحالية, "alignment", "center")}
                                    className={
                                      شرائح[الشريحة_الحالية]?.alignment === "center"
                                        ? "bg-blue-600"
                                        : "bg-gray-800 border-gray-600"
                                    }
                                  >
                                    <AlignCenter className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>توسيط</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={شرائح[الشريحة_الحالية]?.alignment === "right" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => معالجة_تغيير_الشريحة(الشريحة_الحالية, "alignment", "right")}
                                    className={
                                      شرائح[الشريحة_الحالية]?.alignment === "right"
                                        ? "bg-blue-600"
                                        : "bg-gray-800 border-gray-600"
                                    }
                                  >
                                    <AlignRight className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>محاذاة لليمين</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TabsContent>

                        {/* Then, modify the TabsContent for "تصميم" to include both design and elements sections */}
                        <TabsContent value="تصميم" className="p-2 sm:p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white">حجم الخط</Label>
                              <Select
                                value={شرائح[الشريحة_الحالية]?.fontSize}
                                onValueChange={(value) => معالجة_تغيير_الشريحة(الشريحة_الحالية, "fontSize", value)}
                              >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue placeholder="اختر الحجم" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {أحجام_الخط.map((size) => (
                                    <SelectItem key={size.value} value={size.value} className="focus:bg-gray-700">
                                      {size.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-white">عائلة الخط</Label>
                              <Select
                                value={شرائح[الشريحة_الحالية]?.fontFamily}
                                onValueChange={(value) => معالجة_تغيير_الشريحة(الشريحة_الحالية, "fontFamily", value)}
                              >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue placeholder="اختر الخط" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {عائلات_الخطوط.map((font) => (
                                    <SelectItem key={font.value} value={font.value} className="focus:bg-gray-700">
                                      {font.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-white">لون الخط</Label>
                              <Select
                                value={شرائح[الشريحة_الحالية]?.fontColor}
                                onValueChange={(value) => معالجة_تغيير_الشريحة(الشريحة_الحالية, "fontColor", value)}
                              >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue placeholder="اختر اللون" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {ألوان_النص.map((color) => (
                                    <SelectItem key={color.value} value={color.value} className="focus:bg-gray-700">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: color.value }}
                                        ></div>
                                        {color.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-white">لون الخلفية</Label>
                              <Select
                                value={شرائح[الشريحة_الحالية]?.backgroundColor}
                                onValueChange={(value) => {
                                  const theme = السمات.find((t) => t.background === value)
                                  if (theme && theme.gradient) {
                                    تغيير_الخلفية(الشريحة_الحالية, "custom", theme.gradient)
                                  } else {
                                    تغيير_الخلفية(الشريحة_الحالية, value)
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue placeholder="اختر الخلفية" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {السمات.map((theme) => (
                                    <SelectItem key={theme.name} value={theme.background} className="focus:bg-gray-700">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full"
                                          style={
                                            theme.gradient
                                              ? { background: theme.gradient }
                                              : { backgroundColor: theme.background }
                                          }
                                        ></div>
                                        {theme.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  {شرائح[الشريحة_الحالية]?.backgroundImage &&
                                    شرائح[الشريحة_الحالية]?.backgroundImage.startsWith("data:image") && (
                                      <SelectItem value="custom" className="focus:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
                                            <ImageIcon className="h-3 w-3 text-white" />
                                          </div>
                                          صورة مخصصة
                                        </div>
                                      </SelectItem>
                                    )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              رفع خلفية مخصصة
                            </Label>
                            <Button
                              onClick={() => مراجع_مدخلات_الملفات.current[الشريحة_الحالية]?.click()}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Upload className="h-5 w-5 mr-2" />
                              رفع صورة خلفية
                            </Button>
                            <input
                              type="file"
                              ref={(el) => (مراجع_مدخلات_الملفات.current[الشريحة_الحالية] = el)}
                              accept="image/*"
                              onChange={(e) => معالجة_رفع_الخلفية(الشريحة_الحالية, e)}
                              className="hidden"
                            />
                          </div>

                          {شرائح[الشريحة_الحالية]?.backgroundColor === "custom" &&
                            شرائح[الشريحة_الحالية]?.backgroundImage?.startsWith("data:image") && (
                              <div className="space-y-2">
                                <Label className="text-white flex items-center gap-2">
                                  <Droplets className="h-4 w-4" />
                                  شفافية الخلفية
                                </Label>
                                <div className="flex items-center gap-4">
                                  <Slider
                                    value={[شرائح[الشريحة_الحالية]?.backgroundOpacity * 100]}
                                    onValueChange={(value) =>
                                      معالجة_تغيير_الشريحة(الشريحة_الحالية, "backgroundOpacity", value[0] / 100)
                                    }
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="flex-1"
                                  />
                                  <div className="w-12 text-center text-white bg-gray-700 rounded-md py-1">
                                    {Math.round(شرائح[الشريحة_الحالية]?.backgroundOpacity * 100)}%
                                  </div>
                                </div>
                              </div>
                            )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-white flex items-center gap-2">
                                <MoveHorizontal className="h-4 w-4" />
                                تباعد الأسطر
                              </Label>
                              <span className="text-white bg-gray-700 rounded-md px-2 py-1 text-sm">
                                {شرائح[الشريحة_الحالية]?.lineSpacing.toFixed(1)}
                              </span>
                            </div>
                            <Slider
                              value={[شرائح[الشريحة_الحالية]?.lineSpacing]}
                              onValueChange={(value) => معالجة_تغيير_الشريحة(الشريحة_الحالية, "lineSpacing", value[0])}
                              min={1}
                              max={3}
                              step={0.1}
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <SwitchComponent
                              checked={شرائح[الشريحة_الحالية]?.textShadow}
                              onCheckedChange={(value) => معالجة_تغيير_الشريحة(الشريحة_الحالية, "textShadow", value)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <Label className="text-white mr-2">ظل النص</Label>
                          </div>

                          {/* Add the image upload functionality from the elements section to the design section */}
                          <Separator className="bg-gray-700" />
                          {/* In the TabsContent value="عناصر" section, remove the Button for adding text */}
                          {/* Replace the flex flex-wrap gap-2 div with: */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => مرجع_مدخل_الصورة.current?.click()}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              إضافة صورة
                            </Button>
                            <input
                              type="file"
                              ref={مرجع_مدخل_الصورة}
                              accept="image/*"
                              onChange={معالجة_إضافة_صورة}
                              className="hidden"
                            />
                          </div>

                          <Separator className="bg-gray-700" />

                          {العنصر_المحدد && (
                            <div className="space-y-4 bg-gray-700 p-4 rounded-lg">
                              <div className="flex justify-between items-center">
                                <h3 className="text-white font-medium">خصائص العنصر</h3>
                                <Button variant="destructive" size="sm" onClick={() => حذف_العنصر(العنصر_المحدد)}>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  حذف
                                </Button>
                              </div>

                              {/* عناصر التحكم الخاصة بالصورة */}
                              {شرائح[الشريحة_الحالية]?.images.find((img) => img.id === العنصر_المحدد) && (
                                <>
                                  <div className="space-y-2">
                                    <Label className="text-white">نمط الإطار</Label>
                                    <Select value={إطار_الصورة_المحدد} onValueChange={تعيين_إطار_الصورة_المحدد}>
                                      <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                                        <SelectValue placeholder="اختر نمط الإطار" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        {أنماط_الإطارات.map((style) => (
                                          <SelectItem
                                            key={style.value}
                                            value={style.value}
                                            className="focus:bg-gray-700"
                                          >
                                            {style.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-white">الدوران</Label>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="bg-gray-600 border-gray-500 text-white"
                                          onClick={() => {
                                            const img = شرائح[الشريحة_الحالية]?.images.find(
                                              (img) => img.id === العنصر_المحدد,
                                            )
                                            if (img) {
                                              معالجة_تدوير_العنصر(العنصر_المحدد, (img.rotation - 15) % 360)
                                            }
                                          }}
                                        >
                                          <RotateCcw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="bg-gray-600 border-gray-500 text-white"
                                          onClick={() => {
                                            const img = شرائح[الشريحة_الحالية]?.images.find(
                                              (img) => img.id === العنصر_المحدد,
                                            )
                                            if (img) {
                                              معالجة_تدوير_العنصر(العنصر_المحدد, (img.rotation + 15) % 360)
                                            }
                                          }}
                                        >
                                          <RotateCw className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-white">الحجم</Label>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="bg-gray-600 border-gray-500 text-white"
                                          onClick={() => {
                                            const img = شرائح[الشريحة_الحالية]?.images.find(
                                              (img) => img.id === العنصر_المحدد,
                                            )
                                            if (img) {
                                              معالجة_تغيير_حجم_العنصر(العنصر_المحدد, img.width * 0.9, img.height * 0.9)
                                            }
                                          }}
                                        >
                                          <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="bg-gray-600 border-gray-500 text-white"
                                          onClick={() => {
                                            const img = شرائح[الشريحة_الحالية]?.images.find(
                                              (img) => img.id === العنصر_المحدد,
                                            )
                                            if (img) {
                                              معالجة_تغيير_حجم_العنصر(العنصر_المحدد, img.width * 1.1, img.height * 1.1)
                                            }
                                          }}
                                        >
                                          <ZoomIn className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* عناصر التحكم الخاصة بعنصر النص */}
                              {شرائح[الشريحة_الحالية]?.textElements.find((txt) => txt.id === العنصر_المحدد) && (
                                <>
                                  <div className="space-y-2">
                                    <Label className="text-white">محتوى النص</Label>
                                    <Textarea
                                      value={
                                        شرائح[الشريحة_الحالية]?.textElements.find((txt) => txt.id === العنصر_المحدد)
                                          ?.content || ""
                                      }
                                      onChange={(e) => معالجة_تغيير_عنصر_نصي(العنصر_المحدد, "content", e.target.value)}
                                      className="bg-gray-600 border-gray-500 text-white"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-white">حجم الخط</Label>
                                      <Select
                                        value={
                                          شرائح[الشريحة_الحالية]?.textElements.find((txt) => txt.id === العنصر_المحدد)
                                            ?.fontSize || "medium"
                                        }
                                        onValueChange={(value) =>
                                          معالجة_تغيير_عنصر_نصي(العنصر_المحدد, "fontSize", value)
                                        }
                                      >
                                        <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                                          <SelectValue placeholder="اختر الحجم" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                          {أحجام_الخط.map((size) => (
                                            <SelectItem
                                              key={size.value}
                                              value={size.value}
                                              className="focus:bg-gray-700"
                                            >
                                              {size.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-white">لون الخط</Label>
                                      <Select
                                        value={
                                          شرائح[الشريحة_الحالية]?.textElements.find((txt) => txt.id === العنصر_المحدد)
                                            ?.fontColor || "black"
                                        }
                                        onValueChange={(value) =>
                                          معالجة_تغيير_عنصر_نصي(العنصر_المحدد, "fontColor", value)
                                        }
                                      >
                                        <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                                          <SelectValue placeholder="اختر اللون" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                          {ألوان_النص.map((color) => (
                                            <SelectItem
                                              key={color.value}
                                              value={color.value}
                                              className="focus:bg-gray-700"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className="w-4 h-4 rounded-full"
                                                  style={{ backgroundColor: color.value }}
                                                ></div>
                                                {color.name}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`bg-gray-600 border-gray-500 text-white ${
                                        شرائح[الشريحة_الحالية]?.textElements.find((txt) => txt.id === العنصر_المحدد)
                                          ?.isBold
                                          ? "bg-blue-600"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        const txt = شرائح[الشريحة_الحالية]?.textElements.find(
                                          (txt) => txt.id === العنصر_المحدد,
                                        )
                                        if (txt) {
                                          معالجة_تغيير_عنصر_نصي(العنصر_المحدد, "isBold", !txt.isBold)
                                        }
                                      }}
                                    >
                                      <Bold className="h-4 w-4 mr-1" />
                                      غامق
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`bg-gray-600 border-gray-500 text-white ${
                                        شرائح[الشريحة_الحالية]?.textElements.find((txt) => txt.id === العنصر_المحدد)
                                          ?.isItalic
                                          ? "bg-blue-600"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        const txt = شرائح[الشريحة_الحالية]?.textElements.find(
                                          (txt) => txt.id === العنصر_المحدد,
                                        )
                                        if (txt) {
                                          معالجة_تغيير_عنصر_نصي(العنصر_المحدد, "isItalic", !txt.isItalic)
                                        }
                                      }}
                                    >
                                      <Italic className="h-4 w-4 mr-1" />
                                      مائل
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`bg-gray-600 border-gray-500 text-white ${
                                        شرائح[الشريحة_الحالية]?.textElements.find((txt) => txt.id === العنصر_المحدد)
                                          ?.isUnderline
                                          ? "bg-blue-600"
                                          : ""
                                      }`}
                                      onClick={() => {
                                        const txt = شرائح[الشريحة_الحالية]?.textElements.find(
                                          (txt) => txt.id === العنصر_المحدد,
                                        )
                                        if (txt) {
                                          معالجة_تغيير_عنصر_نصي(العنصر_المحدد, "isUnderline", !txt.isUnderline)
                                        }
                                      }}
                                    >
                                      <Underline className="h-4 w-4 mr-1" />
                                      تسطير
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          <div className="mt-4">
                            <h3 className="text-white font-medium mb-2">العناصر على الشريحة</h3>
                            <div className="space-y-2">
                              {شرائح[الشريحة_الحالية]?.images.length === 0 &&
                                شرائح[الشريحة_الحالية]?.textElements.length === 0 && (
                                  <p className="text-gray-400 text-sm">
                                    لا توجد عناصر على هذه الشريحة. أضف صور أو عناصر نصية من الأعلى.
                                  </p>
                                )}

                              {شرائح[الشريحة_الحالية]?.images.map((img) => (
                                <div
                                  key={img.id}
                                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                                    العنصر_المحدد === img.id ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                                  }`}
                                  onClick={() => تعيين_العنصر_المحدد(img.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-800 rounded overflow-hidden">
                                      <img
                                        src={img.src || "/placeholder.svg"}
                                        alt="عنصر"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="text-white">صورة</span>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:bg-gray-500"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      حذف_العنصر(img.id)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}

                              {شرائح[الشريحة_الحالية]?.textElements.map((txt) => (
                                <div
                                  key={txt.id}
                                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                                    العنصر_المحدد === txt.id ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                                  }`}
                                  onClick={() => تعيين_العنصر_المحدد(txt.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Type className="h-5 w-5 text-white" />
                                    <span className="text-white line-clamp-1">{txt.content}</span>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:bg-gray-500"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      حذف_العنصر(txt.id)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="متقدم" className="p-2 sm:p-4 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              علامة مائية
                            </Label>
                            <Input
                              value={شرائح[الشريحة_الحالية]?.watermark}
                              onChange={(e) => معالجة_تغيير_الشريحة(الشريحة_الحالية, "watermark", e.target.value)}
                              placeholder="أدخل نص العلامة المائية"
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white">لون العلامة المائية</Label>
                              <Select
                                value={شرائح[الشريحة_الحالية]?.watermarkColor}
                                onValueChange={(value) =>
                                  معالجة_تغيير_الشريحة(الشريحة_الحالية, "watermarkColor", value)
                                }
                              >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue placeholder="اختر اللون" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {ألوان_النص.map((color) => (
                                    <SelectItem key={color.value} value={color.value} className="focus:bg-gray-700">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: color.value }}
                                        ></div>
                                        {color.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-white">حجم خط العلامة المائية</Label>
                                <span className="text-white bg-gray-700 rounded-md px-2 py-1 text-sm">
                                  {شرائح[الشريحة_الحالية]?.watermarkFontSize}px
                                </span>
                              </div>
                              <Slider
                                value={[شرائح[الشريحة_الحالية]?.watermarkFontSize]}
                                onValueChange={(value) =>
                                  معالجة_تغيير_الشريحة(الشريحة_الحالية, "watermarkFontSize", value[0])
                                }
                                min={12}
                                max={48}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>

                          <Separator className="bg-gray-700" />

                          {/* Remove the hyperlink insertion feature: */}
                          {/* In the "عناصر تفاعلية" section, remove or modify: */}
                          {/* Remove the entire "عناصر تفاعلية" div */}
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* منطقة المعاينة */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-md overflow-hidden">
                      <div className="p-2 sm:p-4 bg-gray-900 border-b border-gray-700">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2">
                          <h3 className="font-bold text-white text-sm sm:text-base">معاينة الشريحة</h3>
                          <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1"
                              onClick={() => تعيين_الشريحة_الحالية((prev) => (prev > 0 ? prev - 1 : prev))}
                              disabled={الشريحة_الحالية === 0}
                            >
                              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              السابق
                            </Button>
                            <span className="text-white text-xs sm:text-sm">
                              {الشريحة_الحالية + 1} / {شرائح.length}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1"
                              onClick={() =>
                                تعيين_الشريحة_الحالية((prev) => (prev < شرائح.length - 1 ? prev + 1 : prev))
                              }
                              disabled={الشريحة_الحالية === شرائح.length - 1}
                            >
                              التالي
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1"
                              onClick={() => نسخ_شريحة(الشريحة_الحالية)}
                            >
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              نسخ
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1"
                              onClick={() => إزالة_شريحة(الشريحة_الحالية)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div
                        ref={مرجع_المحرر}
                        className="aspect-video w-full relative overflow-hidden"
                        style={الحصول_على_نمط_خلفية_الشريحة(شرائح[الشريحة_الحالية])}
                      >
                        {/* محتوى الشريحة الرئيسي */}
                        <p
                          className={`${الحصول_على_حجم_الخط(شرائح[الشريحة_الحالية]?.fontSize)} whitespace-pre-line absolute inset-0 flex items-center justify-center p-4 sm:p-8`}
                          style={{
                            color: شرائح[الشريحة_الحالية]?.fontColor,
                            textAlign: شرائح[الشريحة_الحالية]?.alignment,
                            fontFamily: شرائح[الشريحة_الحالية]?.fontFamily,
                            fontWeight: شرائح[الشريحة_الحالية]?.isBold ? "bold" : "normal",
                            fontStyle: شرائح[الشريحة_الحالية]?.isItalic ? "italic" : "normal",
                            textDecoration: شرائح[الشريحة_الحالية]?.isUnderline ? "underline" : "none",
                            lineHeight: شرائح[الشريحة_الحالية]?.lineSpacing,
                            textShadow: شرائح[الشريحة_الحالية]?.textShadow ? "2px 2px 4px rgba(0, 0, 0, 0.5)" : "none",
                          }}
                        >
                          {شرائح[الشريحة_الحالية]?.content || "أدخل محتوى الشريحة..."}
                        </p>

                        {/* الصور */}
                        {شرائح[الشريحة_الحالية]?.images.map((img) => (
                          <div
                            key={img.id}
                            className={`absolute cursor-move ${إطار_الصورة_المحدد} ${العنصر_المحدد === img.id ? "ring-2 ring-blue-500" : ""}`}
                            style={{
                              top: `${img.y}px`,
                              left: `${img.x}px`,
                              width: `${img.width}px`,
                              height: `${img.height}px`,
                              transform: `rotate(${img.rotation}deg)`,
                              zIndex: img.zIndex,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              تعيين_العنصر_المحدد(img.id)
                            }}
                            // Now update the image div in the editor to use this new function
                            // Replace the onMouseDown and onTouchStart handlers in the image div with:
                            onMouseDown={(e) => معالجة_حركة_الصورة_المتقدمة(img.id, e)}
                            onTouchStart={(e) => معالجة_حركة_الصورة_المتقدمة(img.id, e, true)}
                          >
                            <img
                              src={img.src || "/placeholder.svg"}
                              alt="عنصر الشريحة"
                              className="w-full h-full object-cover"
                            />

                            {/* مقابض تغيير الحجم */}
                            {العنصر_المحدد === img.id && (
                              <>
                                <div
                                  className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full cursor-se-resize"
                                  onMouseDown={(e) => {
                                    e.stopPropagation()
                                    const startX = e.clientX
                                    const startY = e.clientY
                                    const startWidth = img.width
                                    const startHeight = img.height

                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                      const deltaX = moveEvent.clientX - startX
                                      const deltaY = moveEvent.clientY - startY
                                      const aspectRatio = startWidth / startHeight
                                      const newWidth = Math.max(50, startWidth + deltaX)
                                      const newHeight = Math.max(50, newWidth / aspectRatio)
                                      معالجة_تغيير_حجم_العنصر(img.id, newWidth, newHeight)
                                    }

                                    const handleMouseUp = () => {
                                      document.removeEventListener("mousemove", handleMouseMove)
                                      document.removeEventListener("mouseup", handleMouseUp)
                                    }

                                    document.addEventListener("mousemove", handleMouseMove)
                                    document.addEventListener("mouseup", handleMouseUp)
                                  }}
                                  onTouchStart={(e) => {
                                    e.stopPropagation()
                                    const touch = e.touches[0]
                                    const startX = touch.clientX
                                    const startY = touch.clientY
                                    const startWidth = img.width
                                    const startHeight = img.height

                                    const handleTouchMove = (moveEvent: TouchEvent) => {
                                      const touch = moveEvent.touches[0]
                                      const deltaX = touch.clientX - startX
                                      const deltaY = touch.clientY - startY
                                      const aspectRatio = startWidth / startHeight
                                      const newWidth = Math.max(50, startWidth + deltaX)
                                      const newHeight = Math.max(50, newWidth / aspectRatio)
                                      معالجة_تغيير_حجم_العنصر(img.id, newWidth, newHeight)
                                    }

                                    const handleTouchEnd = () => {
                                      document.removeEventListener("touchmove", handleTouchMove)
                                      document.removeEventListener("touchend", handleTouchEnd)
                                    }

                                    document.addEventListener("touchmove", handleTouchMove)
                                    document.addEventListener("touchend", handleTouchEnd)
                                  }}
                                />
                              </>
                            )}
                          </div>
                        ))}

                        {/* عناصر النص */}
                        {شرائح[الشريحة_الحالية]?.textElements.map((txt) => (
                          <div
                            key={txt.id}
                            className={`absolute cursor-move p-2 ${العنصر_المحدد === txt.id ? "ring-2 ring-blue-500" : ""}`}
                            style={{
                              top: `${txt.y}px`,
                              left: `${txt.x}px`,
                              width: `${txt.width}px`,
                              zIndex: txt.zIndex,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              تعيين_العنصر_المحدد(txt.id)
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              const startX = e.clientX
                              const startY = e.clientY

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = moveEvent.clientX - startX
                                const deltaY = moveEvent.clientY - startY
                                معالجة_سحب_العنصر(txt.id, deltaX, deltaY)
                              }

                              const handleMouseUp = () => {
                                document.removeEventListener("mousemove", handleMouseMove)
                                document.removeEventListener("mouseup", handleMouseUp)
                              }

                              document.addEventListener("mousemove", handleMouseMove)
                              document.addEventListener("mouseup", handleMouseUp)
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation()
                              const touch = e.touches[0]
                              const startX = touch.clientX
                              const startY = touch.clientY

                              const handleTouchMove = (moveEvent: TouchEvent) => {
                                const touch = moveEvent.touches[0]
                                const deltaX = touch.clientX - startX
                                const deltaY = touch.clientY - startY
                                معالجة_سحب_العنصر(txt.id, deltaX, deltaY)
                              }

                              const handleTouchEnd = () => {
                                document.removeEventListener("touchmove", handleTouchMove)
                                document.removeEventListener("touchend", handleTouchEnd)
                              }

                              document.addEventListener("touchmove", handleTouchMove)
                              document.addEventListener("touchend", handleTouchEnd)
                            }}
                            onKeyDown={(e) => {
                              if (
                                العنصر_المحدد === txt.id &&
                                (e.key === "ArrowUp" ||
                                  e.key === "ArrowDown" ||
                                  e.key === "ArrowLeft" ||
                                  e.key === "ArrowRight")
                              ) {
                                معالجة_حركة_بالأسهم(txt.id, e)
                              }
                            }}
                            tabIndex={0}
                          >
                            <p
                              className={`${الحصول_على_حجم_الخط(txt.fontSize)}`}
                              style={{
                                color: txt.fontColor,
                                textAlign: txt.alignment,
                                fontFamily: txt.fontFamily,
                                fontWeight: txt.isBold ? "bold" : "normal",
                                fontStyle: txt.isItalic ? "italic" : "normal",
                                textDecoration: txt.isUnderline ? "underline" : "none",
                              }}
                            >
                              {txt.content}
                            </p>

                            {/* مقابض تغيير الحجم */}
                            {العنصر_المحدد === txt.id && (
                              <>
                                <div
                                  className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full cursor-se-resize"
                                  onMouseDown={(e) => {
                                    e.stopPropagation()
                                    const startX = e.clientX
                                    const startY = e.clientY
                                    const startWidth = txt.width

                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                      const deltaX = moveEvent.clientX - startX
                                      const newWidth = Math.max(50, startWidth + deltaX)
                                      معالجة_تغيير_حجم_العنصر(txt.id, newWidth, txt.height)
                                    }

                                    const handleMouseUp = () => {
                                      document.removeEventListener("mousemove", handleMouseMove)
                                      document.removeEventListener("mouseup", handleMouseUp)
                                    }

                                    document.addEventListener("mousemove", handleMouseMove)
                                    document.addEventListener("mouseup", handleMouseUp)
                                  }}
                                  onTouchStart={(e) => {
                                    e.stopPropagation()
                                    const touch = e.touches[0]
                                    const startX = touch.clientX
                                    const startY = touch.clientY
                                    const startWidth = txt.width

                                    const handleTouchMove = (moveEvent: TouchEvent) => {
                                      const touch = moveEvent.touches[0]
                                      const deltaX = touch.clientX - startX
                                      const newWidth = Math.max(50, startWidth + deltaX)
                                      معالجة_تغيير_حجم_العنصر(txt.id, newWidth, txt.height)
                                    }

                                    const handleTouchEnd = () => {
                                      document.removeEventListener("touchmove", handleTouchMove)
                                      document.removeEventListener("touchend", handleTouchEnd)
                                    }

                                    document.addEventListener("touchmove", handleTouchMove)
                                    document.addEventListener("touchend", handleTouchEnd)
                                  }}
                                />
                              </>
                            )}
                          </div>
                        ))}

                        {/* العلامة المائية */}
                        {شرائح[الشريحة_الحالية]?.watermark && (
                          <div
                            className="absolute bottom-4 right-4 text-gray-500 text-sm"
                            style={{
                              fontFamily: "Arial",
                              opacity: 0.7,
                              fontSize: `${شرائح[الشريحة_الحالية]?.watermarkFontSize}px`,
                              color: شرائح[الشريحة_الحالية]?.watermarkColor,
                            }}
                          >
                            {شرائح[الشريحة_الحالية]?.watermark}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {شرائح.map((شريحة, index) => (
                  <div
                    key={شريحة.id}
                    className={`relative rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      index === الشريحة_الحالية
                        ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                        : "border-gray-700"
                    }`}
                    onClick={() => تعيين_الشريحة_الحالية(index)}
                  >
                    <div
                      className="aspect-video w-full flex items-center justify-center p-2 text-xs"
                      style={الحصول_على_نمط_خلفية_الشريحة(شريحة)}
                    >
                      <p
                        className="line-clamp-3 text-center"
                        style={{
                          color: شريحة.fontColor,
                          fontWeight: شريحة.isBold ? "bold" : "normal",
                          fontStyle: شريحة.isItalic ? "italic" : "normal",
                          textDecoration: شريحة.isUnderline ? "underline" : "none",
                        }}
                      >
                        {شريحة.content || "شريحة فارغة"}
                      </p>

                      {/* عرض صور مصغرة للصور */}
                      {شريحة.images.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {شريحة.images.map(
                            (img, imgIndex) =>
                              imgIndex < 3 && (
                                <div
                                  key={img.id}
                                  className="absolute w-8 h-8 bg-gray-200 rounded-sm overflow-hidden border border-gray-400"
                                  style={{
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    margin: "auto",
                                  }}
                                />
                              ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* مربع حوار العروض المحفوظة */}
      <Dialog open={عرض_المحفوظات} onOpenChange={تعيين_عرض_المحفوظات}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">العروض التقديمية المحفوظة</DialogTitle>
          </DialogHeader>
          {العروض_المحفوظة.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">لا توجد عروض تقديمية محفوظة</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => تعيين_عرض_المحفوظات(false)}>
                إنشاء عرض تقديمي جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800">
                    <TableHead className="text-white">العنوان</TableHead>
                    <TableHead className="text-white">التاريخ</TableHead>
                    <TableHead className="text-white text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {العروض_المحفوظة.map((عرض) => (
                    <TableRow key={عرض.id} className="border-gray-700 hover:bg-gray-800">
                      <TableCell className="font-medium text-white">{عرض.title}</TableCell>
                      <TableCell className="text-gray-300">{عرض.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                            onClick={() => تحميل_العرض_التقديمي(عرض.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            فتح
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                            onClick={() => تعيين_عرض_تفاصيل_العرض(عرض.id)}
                          >
                            <List className="h-4 w-4 mr-1" />
                            تفاصيل
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => تعيين_عرض_حذف_العرض(عرض.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد الحذف */}
      <Dialog open={!!عرض_حذف_العرض} onOpenChange={(open) => !open && تعيين_عرض_حذف_العرض(null)}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="py-4">هل أنت متأكد من رغبتك في حذف هذا العرض التقديمي؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => تعيين_عرض_حذف_العرض(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (عرض_حذف_العرض) {
                  حذف_العرض_التقديمي(عرض_حذف_العرض)
                }
              }}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تفاصيل العرض */}
      <Dialog open={!!عرض_تفاصيل_العرض} onOpenChange={(open) => !open && تعيين_عرض_تفاصيل_العرض(null)}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">تفاصيل العرض التقديمي</DialogTitle>
          </DialogHeader>
          {عرض_تفاصيل_العرض && (
            <div className="py-4 space-y-4">
              {العروض_المحفوظة.find((عرض) => عرض.id === عرض_تفاصيل_العرض) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">العنوان</h3>
                      <p className="text-white">{العروض_المحفوظة.find((عرض) => عرض.id === عرض_تفاصيل_العرض)?.title}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">تاريخ الإنشاء</h3>
                      <p className="text-white">{العروض_المحفوظة.find((عرض) => عرض.id === عرض_تفاصيل_العرض)?.date}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">معاينة</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(() => {
                        try {
                          const بيانات_العرض = localStorage.getItem(`presentation_${عرض_تفاصيل_العرض}`)
                          if (بيانات_العرض) {
                            const البيانات_المحللة = JSON.parse(بيانات_العرض)
                            return البيانات_المحللة.slides.slice(0, 3).map((شريحة: شريحة, index: number) => (
                              <div
                                key={index}
                                className="aspect-video bg-gray-800 rounded overflow-hidden border border-gray-700"
                                style={
                                  شريحة.backgroundColor === "custom" && شريحة.backgroundImage
                                    ? { backgroundImage: `url(${شريحة.backgroundImage})`, backgroundSize: "cover" }
                                    : { backgroundColor: شريحة.backgroundColor }
                                }
                              >
                                <div className="w-full h-full flex items-center justify-center p-2">
                                  <p
                                    className="text-xs line-clamp-3 text-center"
                                    style={{
                                      color: شريحة.fontColor,
                                      fontWeight: شريحة.isBold ? "bold" : "normal",
                                      fontStyle: شريحة.isItalic ? "italic" : "normal",
                                    }}
                                  >
                                    {شريحة.content || "شريحة فارغة"}
                                  </p>
                                </div>
                              </div>
                            ))
                          }
                        } catch (error) {
                          return <p className="text-red-500">خطأ في تحميل المعاينة</p>
                        }
                        return null
                      })()}
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => تعيين_عرض_تفاصيل_العرض(null)}>
                  إغلاق
                </Button>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    if (عرض_تفاصيل_العرض) {
                      تحميل_العرض_التقديمي(عرض_تفاصيل_العرض)
                      تعيين_عرض_تفاصيل_العرض(null)
                    }
                  }}
                >
                  فتح العرض
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
