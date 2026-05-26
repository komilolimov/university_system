"use client";

import React, { useState } from "react";
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
      // Пытаемся использовать современный API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback для HTTP/локальной сети
        const textArea = document.createElement("textarea");
        textArea.value = text;
        // Прячем элемент с экрана
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
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-10 w-10 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
        aria-label="Test Credentials"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-white border border-neutral-200 rounded-xl shadow-xl p-4 transition-all duration-200 ease-in-out">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                Test Credentials
              </h3>
              <p className="text-xs text-neutral-500">
                Click any value below to copy it.
              </p>
            </div>

            <div className="h-px bg-neutral-100 my-1" />

            <div className="flex flex-col gap-4">
              {credentials.map((cred) => (
                <div key={cred.role} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {cred.role}
                  </span>
                  <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2.5 flex flex-col gap-1 text-xs">
                    {/* Email Row */}
                    <div
                      onClick={() => handleCopy(cred.email, `${cred.role}-email`)}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-neutral-100 cursor-pointer transition-colors group"
                    >
                      <span className="text-neutral-500">Email:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-neutral-900 text-[11px]">
                          {cred.email}
                        </code>
                        {copiedKey === `${cred.role}-email` ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>

                    {/* Password Row */}
                    <div
                      onClick={() => handleCopy(cred.password, `${cred.role}-password`)}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-neutral-100 cursor-pointer transition-colors group"
                    >
                      <span className="text-neutral-500">Password:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-neutral-900 text-[11px]">
                          {cred.password}
                        </code>
                        {copiedKey === `${cred.role}-password` ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};