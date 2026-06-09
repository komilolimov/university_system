"use client";

import { useState } from "react";
import { HelpCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export const TestCredentials = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const pathname = usePathname();

  // Защита 1: Не показываем в продакшене
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Защита 2: Показываем ТОЛЬКО на странице логина
// Защита 2: Показываем ТОЛЬКО на странице логина
if (pathname !== "/login") {
  return null;
}

  const credentials = [
    {
      role: "Student",
      email: "student@unime.it",
      password: "student123",
    },
    {
      role: "Admin",
      email: "admin@unime.it",
      password: "admin123",
    },
  ];

  const handleCopy = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopiedKey(key);
      toast.success(`Copied ${key.split("-")[1]}!`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Clipboard API failed:", err);
      toast.error("Failed to copy");
    }
  };

  return (
    // z-[9999] гарантирует, что блок будет поверх абсолютно всех элементов на странице
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      
      {/* Явный относительный контейнер для правильного позиционирования карточки */}
      <div className="relative flex flex-col items-end">
        
        {/* Popover Card */}
        {isOpen && (
         '123123'
        )}

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(isOpen)}
          className="flex items-center justify-center h-10 w-10 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
          aria-label="Test Credentials"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

      </div>
    </div>
  );
};