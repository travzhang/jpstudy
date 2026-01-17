"use client";

import { useEffect, useState } from "react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // 注册 Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => {
          console.log("Service Worker 注册成功:", registration);
          
          // 检查更新
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // 新版本已安装，提示用户刷新
                  console.log("Service Worker 新版本已安装，请刷新页面");
                }
              });
            }
          });
          
          // 定期检查更新
          setInterval(() => {
            registration.update();
          }, 60000); // 每分钟检查一次
        })
        .catch((error) => {
          console.error("Service Worker 注册失败:", error);
        });
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 检查是否已安装
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("用户接受了安装提示");
    } else {
      console.log("用户拒绝了安装提示");
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={handleInstallClick}
        className="bg-[#FF2442] text-white px-6 py-3 rounded-lg shadow-lg font-medium hover:bg-[#e01e3a] transition-colors flex items-center gap-2"
      >
        <span>📱</span>
        <span>安装应用</span>
      </button>
    </div>
  );
}
