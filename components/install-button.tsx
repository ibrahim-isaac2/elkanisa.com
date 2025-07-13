"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { Separator } from "@/components/ui/separator" // تم إضافة Separator
import { Smartphone, Monitor, Share2, MoreVertical, DownloadCloud, Info } from "lucide-react" // تم إضافة أيقونات جديدة

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isPwaInstalled, setIsPwaInstalled] = useState(false)
  const [showInstallInstructionsDialog, setShowInstallInstructionsDialog] = useState(false)
  const [enlargedImageSrc, setEnlargedImageSrc] = useState<string | null>(null)
  const [showImagePreviewDialog, setShowImagePreviewDialog] = useState(false)

  useEffect(() => {
    console.log("InstallButton: Component mounted.")

    // التحقق إذا كان التطبيق مثبت بالفعل
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("InstallButton: App is already installed.")
      setIsPwaInstalled(true)
      return
    }

    console.log("InstallButton: Checking for beforeinstallprompt...")
    const handler = (e: Event) => {
      console.log("InstallButton: beforeinstallprompt event fired!")
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const appInstalledHandler = () => {
      console.log("InstallButton: App was successfully installed!")
      setIsPwaInstalled(true)
      setDeferredPrompt(null)
      setShowInstallInstructionsDialog(false) // إغلاق نافذة التعليمات بعد التثبيت
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", appInstalledHandler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", appInstalledHandler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        ;(deferredPrompt as any).prompt()
        const { outcome } = await (deferredPrompt as any).userChoice
        console.log(`InstallButton: User choice outcome: ${outcome}`)
        if (outcome === "accepted") {
          console.log("InstallButton: User accepted the install prompt.")
        } else {
          console.log("InstallButton: User dismissed the install prompt.")
        }
      } catch (error) {
        console.error("InstallButton: Error during prompt:", error)
        alert("حدث خطأ أثناء التثبيت. حاول مرة أخرى.")
      } finally {
        setDeferredPrompt(null)
      }
    } else {
      // إذا لم يكن هناك deferredPrompt، اعرض نافذة التعليمات المخصصة
      setShowInstallInstructionsDialog(true)
    }
  }

  const handleImageClick = (src: string) => {
    setEnlargedImageSrc(src)
    setShowImagePreviewDialog(true)
  }

  return (
    <div>
      {isPwaInstalled ? (
        <p className="fixed top-4 left-4 text-white font-bold">التطبيق مثبت بالفعل!</p>
      ) : (
        <Button
          variant="outline"
          className="fixed top-4 left-4 gap-2 font-bold bg-transparent"
          onClick={handleInstallClick}
        >
          <Download className="w-4 h-4" />
          تثبيت
        </Button>
      )}

      {/* نافذة التعليمات المخصصة */}
      <Dialog open={showInstallInstructionsDialog} onOpenChange={setShowInstallInstructionsDialog}>
        <DialogContent className="sm:max-w-[425px] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-bold">كيفية تثبيت التطبيق</DialogTitle>
            <DialogDescription>اتبع الخطوات التالية لتثبيت التطبيق على جهازك.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-8 py-4 text-right">
            {/* خطوات التثبيت للموبايل */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-end gap-2">
                <Smartphone className="w-6 h-6 text-primary" />
                <span>التثبيت على الموبايل</span>
              </h3>
              <div className="space-y-4">
                {/* الخطوة 1 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <p className="flex-grow text-base">افتح المتصفح (مثل Chrome أو Safari) على هاتفك.</p>
                </div>
                {/* الخطوة 2 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <p className="flex-grow text-base">انتقل إلى موقعنا.</p>
                </div>
                {/* الخطوة 3 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div className="flex-shrink-0 text-primary mt-1">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <p className="flex-grow text-base">
                    إذا كنت تستخدم Safari على iOS: اضغط على أيقونة المشاركة (مربع به سهم لأعلى) في شريط التنقل السفلي.
                    <br />
                    <span className="mt-1 block">
                      <MoreVertical className="inline-block w-5 h-5 text-primary mr-1" />
                      إذا كنت تستخدم Chrome أو متصفح آخر: اضغط على الثلاث نقاط الرأسية (أو أيقونة القائمة) في الزاوية
                      العلوية اليمنى أو السفلية.
                    </span>
                  </p>
                </div>
                {/* الخطوة 4 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <p className="flex-grow text-base">اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).</p>
                </div>
                {/* الخطوة 5 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <p className="flex-grow text-base">اضغط على "إضافة" (Add) لتأكيد التثبيت.</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Image
                  src="/mobile.jpg"
                  alt="خطوات تثبيت التطبيق على الموبايل"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                  onClick={() => handleImageClick("/mobile.jpg")}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* خطوات التثبيت للكمبيوتر */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-end gap-2">
                <Monitor className="w-6 h-6 text-primary" />
                <span>التثبيت على الكمبيوتر</span>
              </h3>
              <div className="space-y-4">
                {/* الخطوة 1 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <p className="flex-grow text-base">افتح متصفح Chrome أو Edge على جهاز الكمبيوتر الخاص بك.</p>
                </div>
                {/* الخطوة 2 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <p className="flex-grow text-base">انتقل إلى موقعنا.</p>
                </div>
                {/* الخطوة 3 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div className="flex-shrink-0 text-primary mt-1">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <p className="flex-grow text-base">
                    ابحث عن أيقونة التثبيت في شريط عنوان المتصفح (عادةً ما تكون أيقونة شاشة صغيرة مع سهم لأسفل أو علامة
                    زائد).
                  </p>
                </div>
                {/* الخطوة 4 */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <p className="flex-grow text-base">اضغط على أيقونة التثبيت واتبع التعليمات لإضافة التطبيق.</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Image
                  src="/computer.jpg"
                  alt="خطوات تثبيت التطبيق على الكمبيوتر"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                  onClick={() => handleImageClick("/computer.jpg")}
                />
              </div>
            </div>

            {/* الرسالة النهائية */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-center flex items-center justify-center gap-2">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium text-base">
                لا تنسَ الاتصال بالإنترنت كل فترة لتحديث الترانيم الجديدة والمميزات الجديدة.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة معاينة الصورة المكبرة */}
      <Dialog open={showImagePreviewDialog} onOpenChange={setShowImagePreviewDialog}>
        <DialogContent className="max-w-full max-h-[95vh] w-auto h-auto p-0">
          {enlargedImageSrc && (
            <Image
              src={enlargedImageSrc || "/placeholder.svg"}
              alt="صورة مكبرة"
              layout="fill"
              objectFit="contain"
              className="rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
