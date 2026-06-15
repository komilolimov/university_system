import React from "react";
import { Sidebar } from "@/widgets/sidebar";
import { Menu } from "lucide-react"; // Добавим иконку меню для мобилок
import { SessionProvider } from "@/entities/session";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen w-full overflow-hidden bg-transparent font-sans">
        
        {/* Десктопный сайдбар */}
        <Sidebar />
        
        {/* Главная область контента */}
        <div className="flex flex-col flex-1 w-full overflow-hidden relative">
          
          {/* Мобильный хэдер (виден только на маленьких экранах) */}
          <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-neutral-200">
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">
              University System
            </span>
            <button className="text-neutral-500 hover:text-neutral-900 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </header>

          {/* Исправленный скролл:
            Заменили min-h-screen на h-full, чтобы он четко вписывался в родителя. 
          */}
          <main className="flex-1 overflow-y-auto h-full p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}