"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, id, type, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={id} className="text-sm font-medium text-neutral-900">
          {label}
        </label>
        <div className="relative w-full">
          <input
            {...props}
            id={id}
            ref={ref}
            type={inputType}
            className={`w-full h-9 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 ring-1 ring-neutral-200 focus:ring-2 focus:ring-black focus:outline-none transition-shadow rounded-md shadow-sm ${
              isPassword ? "pr-10" : ""
            } ${className}`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => {
                setShowPassword((prev) => !prev)
                console.log('Клик по глазу! Текущее состояние showPassword:', showPassword);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none select-none flex items-center justify-center cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";