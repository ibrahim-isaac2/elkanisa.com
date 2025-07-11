'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    console.log("InstallButton: Component mounted.");

    // التحقق إذا كان التطبيق مثبت بالفعل
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log("InstallButton: App is already installed.");
      setIsPwaInstalled(true);
      return;
    }

    console.log("InstallButton: Checking for beforeinstallprompt...");
    const handler = (e: Event) => {
      console.log("InstallButton: beforeinstallprompt event fired!");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const appInstalledHandler = () => {
      console.log("InstallButton: App was successfully installed!");
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("InstallButton: No deferred prompt available.");
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      let message = "اضغط على الثلاث نقاط في المتصفح واختر 'إضافة إلى الشاشة الرئيسية'.";
      
      if (isIOS && isSafari) {
        message = "اضغط على أيقونة المشاركة في Safari ثم اختر 'إضافة إلى الشاشة الرئيسية'.";
      } else if (!("BeforeInstallPromptEvent" in window)) {
        message = "هذا المتصفح لا يدعم التثبيت التلقائي. جرب Chrome أو Edge.";
      }
      
      alert(message);
      return;
    }

    try {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      console.log(`InstallButton: User choice outcome: ${outcome}`);
      if (outcome === "accepted") {
        console.log("InstallButton: User accepted the install prompt.");
      } else {
        console.log("InstallButton: User dismissed the install prompt.");
      }
    } catch (error) {
      console.error("InstallButton: Error during prompt:", error);
      alert("حدث خطأ أثناء التثبيت. حاول مرة أخرى.");
    } finally {
      setDeferredPrompt(null);
    }
  };

  return (
    <div>
      {isPwaInstalled ? (
        <p className="fixed top-4 left-4 text-white font-bold">
          التطبيق مثبت بالفعل!
        </p>
      ) : (
        <Button
          variant="outline"
          className="fixed top-4 left-4 gap-2 font-bold"
          onClick={handleInstallClick}
        >
          <Download className="w-4 h-4" />
          تثبيت
        </Button>
      )}
    </div>
  );
}
