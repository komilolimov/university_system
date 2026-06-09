import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard", 
  "/students", 
  "/courses", 
  "/employees", 
  "/enrollments",
  "student-programs",
];
const authRoutes = ["/login", "/register"];

// 🛡️ 1. СЛОВАРЬ ЗАГОЛОВКОВ БЕЗОПАСНОСТИ
const securityHeaders = {
  // Защита от XSS: разрешаем скрипты/стили только с нашего домена
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:;",
  // Защита от Clickjacking (запрет встраивать сайт в iframe на чужих ресурсах)
  "X-Frame-Options": "DENY",
  // Запрет браузеру "угадывать" типы файлов (блокирует подмену MIME-типов)
  "X-Content-Type-Options": "nosniff",
  // Контроль того, сколько информации передается при переходе по внешним ссылкам
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Принудительный HTTPS на целый год
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Запрет доступа к камере, микрофону и геолокации
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;
  
  // 🛡️ 2. БАЗОВАЯ ЗАЩИТА ОТ БОТОВ И СКРЕЙПЕРОВ
  // Если у запроса вообще нет User-Agent (типично для скриптов)
  const userAgent = request.headers.get("user-agent");
  if (!userAgent) {
    return new NextResponse("Forbidden Access: Bot detected", { status: 403 });
  }

  // 🛡️ 3. ЗАЩИТА ОТ CSRF (Кросс-сайтовая подделка запросов)
  // Если это POST/PUT/DELETE, проверяем, что запрос пришел именно с нашего домена
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Если источник указан, но не совпадает с нашим хостом — это атака
    if (origin && host && !origin.includes(host)) {
      console.warn(`[Security] Заблокирован подозрительный запрос с origin: ${origin}`);
      return new NextResponse("Forbidden: Invalid Origin", { status: 403 });
    }
  }

  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  const isServerAction = request.headers.has("next-action");

  // 🛡️ 4. ПРАВИЛА АВТОРИЗАЦИИ С УЛУЧШЕННЫМ UX
  if (isProtectedRoute && !token && !isServerAction) {
    // Если кто-то пытается зайти без токена, отправляем на логин,
    // но запоминаем, куда он хотел попасть, чтобы вернуть его туда после входа
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 🛡️ 5. ПРИМЕНЕНИЕ ЗАГОЛОВКОВ К ОТВЕТУ
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  // Отрабатываем на всех страницах, кроме статики, картинок и прямого обращения к API
  // API должно защищаться на стороне FastAPI
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};