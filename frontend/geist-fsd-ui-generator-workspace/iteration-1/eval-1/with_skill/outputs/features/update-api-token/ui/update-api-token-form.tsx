"use client"

import * as React from "react"
import { useTransition, useState } from "react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { updateTokenAction } from "../api/update-token-action"

export function UpdateApiTokenForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      setMessage(null);
      const result = await updateTokenAction(formData);
      
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: "API token successfully updated." });
      }
    });
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 font-geistSans">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold leading-none tracking-tight text-neutral-900 dark:text-neutral-50">
          Personal API Token
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Manage your personal access token for programmatic API authentication. Keep this secure.
        </p>
      </div>

      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor="token" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-900 dark:text-neutral-50"
          >
            New Token
          </label>
          <Input 
            id="token"
            name="token"
            type="password" 
            placeholder="pk_live_..." 
            required 
            disabled={isPending}
            className="font-geistMono"
          />
        </div>

        {message && (
          <div className={`text-sm font-medium ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-neutral-50"}`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Token"}
          </Button>
        </div>
      </form>
    </div>
  )
}
