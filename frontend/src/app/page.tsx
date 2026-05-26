import Link from "next/link";
import { BackgroundGlow } from "@/shared/ui";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <BackgroundGlow />
      
      <div className="z-10 flex flex-col items-center text-center px-4">
        <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 mb-8">
          ✨ Introducing University System 2.0
        </div>
        
        <h1 className="text-5xl sm:text-7xl tracking-tighter font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 to-neutral-500">
          University Management<br />Reimagined.
        </h1>
        
        <p className="mt-6 text-lg text-neutral-500 max-w-[600px] text-center font-medium">
          An advanced, strictly typed educational platform. Manage your institution with speed and precision.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link 
            href="/login" 
            className="bg-neutral-900 text-white hover:bg-neutral-800 h-10 px-6 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
          >
            Sign In
          </Link>
         
        </div>
      </div>
    </main>
  );
}