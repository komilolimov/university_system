"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          // Базовый дизайн (Vercel/Linear глубокий тёмный режим)
          toast:
            "group toast group-[.toaster]:bg-[#0A0A0A] group-[.toaster]:text-neutral-100 group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl font-sans tracking-tight rounded-md",
          
          // Типографика описания (используем моноширинный для контраста или просто серый)
          description: "group-[.toast]:text-neutral-400 text-xs mt-1.5",
          
          // Кнопки
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black font-medium rounded-md px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-neutral-800 group-[.toast]:text-neutral-300 font-medium rounded-md",
          
          // Специфичные состояния с тонкими акцентами
          success: 
            "group-[.toaster]:border-emerald-500/20 group-[.toaster]:bg-[#051F11]",
          error: 
            "group-[.toaster]:border-red-500/20 group-[.toaster]:bg-[#2C0A0A]",
          info:
            "group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-[#0A162C]",
        },
      }}
      {...props}
    />
  );
};