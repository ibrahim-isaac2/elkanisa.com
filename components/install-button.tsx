'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    console.log("InstallButton: Component mounted.");

    // Check if the app is already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log("InstallButton: App is already installed and running in standalone mode.");
      setIsPwaInstalled(true);
      return;
    }

    console.log("InstallButton: Checking for beforeinstallprompt...");
    const handler = (e: Event) => {
      console.log("InstallButton: beforeinstallprompt event fired!");
      e.preventDefault();
      setDeferredPrompt(e);
      setIsSupported(true);
    };

    // Handler for appinstalled event
    const appInstalledHandler = () => {
      console.log("InstallButton: App was successfully installed!");
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
      setIsSupported(false);
    };

    // Check if the browser supports beforeinstallprompt
    if ("BeforeInstallPromptEvent" in window) {
      console.log("InstallButton: beforeinstallprompt event is supported.");
      window.addEventListener("beforeinstallprompt", handler);
    } else {
      console.log("InstallButton: beforeinstallprompt event not supported in this browser.");
      setIsSupported(true); // Show button but handle unsupported case in click
    }

    // Listen for appinstalled event to confirm installation
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("InstallButton: No deferred prompt available.");
      // Detect browser and device for tailored instructions
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      let message = "التثبيت غير متاح حاليًا. يرجى التحقق من اتصالك بالإنترنت وحاول مرة أخرى.";
      
      if (!("BeforeInstallPromptEvent" in window)) {
        if (isIOS && isSafari) {
          message = "لتثبيت التطبيق على iOS، اضغط على أيقونة المشاركة في Safari ثم اختر 'إضافة إلى الشاشة الرئيسية'.";
        } else {
          message = "هذا المتصفح لا يدعم التثبيت التلقائي. جرب استخدام متصفح Chrome أو Edge.";
        }
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
      alert("حدث خطأ أثناء محاولة التثبيت. حاول مرة أخرى لاحقًا.");
    } finally {
      setDeferredPrompt(null);
    }
  };

  return (
    <div>
      {isPwaInstalled ? (
        <p className="fixed top-4 left-4 text-white">
          التطبيق مثبت بالفعل!
        </p>
      ) : (
        <Button
          variant="outline"
          className="fixed top-4 left-4 gap-2"
          onClick={handleInstallClick}
        >
          <Download className="w-4 h-4" />
          تثبيت
        </Button>
      )}
    </div>
  );
}
