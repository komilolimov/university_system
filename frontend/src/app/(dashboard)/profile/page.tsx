import React from "react";
import { getJwtPayload } from "@/shared/auth/jwt";
import { Shield, Mail, Calendar } from "lucide-react";

export default async function ProfilePage() {
  const payload = await getJwtPayload();
  const role = payload?.role || "Student";
  const email = payload?.email || "user@unime.it";
  const name = payload?.name || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <main className="fsd-container mx-auto my-8 max-w-2xl flex flex-col gap-8 px-6 font-sans select-none">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-900">
          User Profile
        </h1>
        <p className="text-neutral-500 font-medium">
          Manage your account credentials and system settings.
        </p>
      </header>

      <div className="bg-white border border-neutral-200/60 shadow-sm rounded-xl p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xl font-semibold text-neutral-600 uppercase">
            {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">{name}</h2>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">{role} Account</span>
          </div>
        </div>

        <div className="h-px bg-neutral-100" />

        <div className="flex flex-col gap-4 text-sm">
          {/* Email row */}
          <div className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-neutral-50 transition-colors">
            <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-neutral-500 font-medium">Email Address</span>
              <span className="font-mono text-neutral-900 text-xs">{email}</span>
            </div>
          </div>

          {/* Role row */}
          <div className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-neutral-50 transition-colors">
            <Shield className="h-4 w-4 text-neutral-400 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-neutral-500 font-medium">System Role</span>
              <span className="font-medium text-neutral-900">{role}</span>
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-neutral-50 transition-colors">
            <Calendar className="h-4 w-4 text-neutral-400 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-neutral-500 font-medium">Session Status</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
