import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster, BackgroundGlow } from "@/shared/ui";
import { TestCredentials } from "@/widgets/dev-tools";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
    >
      <body className="font-sans antialiased h-full">
        <BackgroundGlow />
        <div className="relative z-10 w-full h-full min-h-screen flex flex-col">
          {children}
        </div>
        <Toaster position="top-center" closeButton  />
        <TestCredentials />
      </body>
    </html>
  );
}