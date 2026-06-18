"use client";

import { useState } from "react";
import { HelpCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export const TestCredentials = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const pathname = usePathname();

  // Защита 1: Не показываем в продакшене (Закомментировано, чтобы было видно на Vercel)
  // if (process.env.NODE_ENV !== "development") {
  //   return null;
  // }

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
          <div className="absolute bottom-14 right-0 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-neutral-900">Test Credentials</h3>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {credentials.map((cred) => (
                <div key={cred.role} className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">{cred.role}</h4>
                  
                  <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-md border border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 font-medium">EMAIL</span>
                      <span className="text-xs text-neutral-900 font-mono">{cred.email}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(cred.email, `${cred.role}-email`)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
                      title="Copy email"
                    >
                      {copiedKey === `${cred.role}-email` ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-md border border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 font-medium">PASSWORD</span>
                      <span className="text-xs text-neutral-900 font-mono">{cred.password}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(cred.password, `${cred.role}-password`)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 rounded-md transition-colors"
                      title="Copy password"
                    >
                      {copiedKey === `${cred.role}-password` ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center h-10 w-10 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
          aria-label="Test Credentials"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

      </div>
    </div>
  );
};