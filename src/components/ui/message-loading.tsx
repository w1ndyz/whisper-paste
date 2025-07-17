"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/utils/tailwind";
import React from "react";

interface MessageLoadingProps {
  message?: string;
  className?: string;
}

export const MessageLoading: React.FC<MessageLoadingProps> = ({
  message = "正在处理...",
  className
}) => {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-4">
        {/* Loading spinner */}
        {/* <div className="w-16 h-16 rounded-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div> */}

        {/* Loading message */}
        <p className="text-sm text-black/70 dark:text-white/70 text-center">
          {message}
        </p>

        {/* Loading dots animation */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};