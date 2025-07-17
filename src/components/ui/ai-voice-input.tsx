"use client";

import { Mic } from "lucide-react";
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "@/utils/tailwind";
import React from "react";

interface AIVoiceInputProps {
  onStart?: () => boolean | void;
  onStop?: (duration: number, audioBlob?: Blob) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  isRecording?: boolean;
}

export interface AIVoiceInputRef {
  startRecording: () => void;
  stopRecording: () => void;
}

export const AIVoiceInput = forwardRef<AIVoiceInputRef, AIVoiceInputProps>(({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  isRecording
}: AIVoiceInputProps, ref) => {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);
  
  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const hasStoppedRef = useRef<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    startRecording: () => {
      setSubmitted(true);
    },
    stopRecording: () => {
      setSubmitted(false);
    }
  }), []);

  // 同步外部录音状态
  useEffect(() => {
    if (isRecording !== undefined) {
      setSubmitted(isRecording);
    }
  }, [isRecording]);

  // Start audio recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Prevent multiple calls to onStop
        if (hasStoppedRef.current) {
          return;
        }
        hasStoppedRef.current = true;
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onStop?.(time, audioBlob);
        setTime(0);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setSubmitted(false);
    }
  };

  // Stop audio recording
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Handle recording state changes
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (submitted) {
      const result = onStart?.();
      // 如果onStart返回false，则不开始录音
      if (result === false) {
        setSubmitted(false);
        return;
      }
      
      // Start actual audio recording
      startAudioRecording();
      
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      // Stop audio recording when submitted becomes false
      stopAudioRecording();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [submitted]); // Only depend on submitted to avoid infinite loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else if (!submitted) {
      // 开始录音时，先调用onStart检查配置
      const result = onStart?.();
      if (result !== false) {
        setSubmitted(true);
      }
    } else {
      // 停止录音
      setSubmitted(false);
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            submitted
              ? "bg-none"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={handleClick}
        >
          {submitted ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                submitted
                  ? "bg-red-500 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                submitted && isClient
                  ? {
                    height: `${20 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.05}s`,
                  }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {submitted ? "Listening..." : ""}
        </p>
      </div>
    </div>
  );
});