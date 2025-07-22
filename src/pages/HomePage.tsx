import React, { useState, useEffect, useRef, useCallback } from "react";
import Footer from "@/components/template/Footer";
import { AIVoiceInput, AIVoiceInputRef } from "@/components/ui/ai-voice-input";
import { MessageLoading } from "@/components/ui/message-loading";
import KeyBoardDefault from "@/components/KeyBoard";
import Toaster, { ToasterRef } from "@/components/ui/toast";
import { useConfigStore } from "@/stores/config-store";
import { speechRecognitionService } from "@/services/speech-recognition";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  const [recordings, setRecordings] = useState<{ duration: number; timestamp: Date }[]>([]);
  const [isControlPressed, setIsControlPressed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const voiceInputRef = useRef<AIVoiceInputRef>(null);

  // 使用全局配置状态
  const { isConfigured } = useConfigStore();

  // Refs to track current state values for event handlers
  const isControlPressedRef = useRef(isControlPressed);
  const isRecordingRef = useRef(isRecording);
  const isConfiguredRef = useRef(isConfigured);
  const toasterRef = useRef<ToasterRef>(null);


  // Update refs when state changes
  useEffect(() => {
    isControlPressedRef.current = isControlPressed;
  }, [isControlPressed]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    isConfiguredRef.current = isConfigured;
  }, [isConfigured]);

  // 配置状态现在由全局状态管理，不需要本地检查

  const handleStop = async (duration: number, audioBlob?: Blob) => {
    setRecordings(prev => [...prev.slice(-4), { duration, timestamp: new Date() }]);
    setIsRecording(false);

    // 如果有音频数据，进行语音转文字
    if (audioBlob) {
      try {
        // 开始处理音频，显示loading组件
        setIsProcessingAudio(true);

        // 将Blob转换为File对象
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

        // 调用统一的语音识别服务进行语音转文字
        const result = await speechRecognitionService.transcribeAudio(audioFile);

        if (result.success && result.data?.text) {
          const transcribedText = result.data.text.trim();

          // 复制到剪切板
          try {
            await navigator.clipboard.writeText(transcribedText);

            // 显示成功提示，包含转录的文字预览
            const preview = transcribedText.length > 50
              ? transcribedText.substring(0, 50) + '...'
              : transcribedText;

            toasterRef.current?.show({
              title: t('speechToTextSuccess'),
              message: `${t('copiedToClipboard')}: "${preview}"`,
              variant: 'success',
              duration: 3000,
              position: 'top-center'
            });

            console.log('Transcribed text:', transcribedText);
          } catch (clipboardError) {
            console.error('Failed to copy to clipboard:', clipboardError);

            // 如果复制失败，仍然显示转录结果
            toasterRef.current?.show({
              title: t('speechToTextSuccess'),
              message: `${t('copiedToClipboard')}: "${transcribedText}"`,
              variant: 'success',
              duration: 5000,
              position: 'top-center'
            });
          }
        } else {
          // 显示转录失败的错误信息
          toasterRef.current?.show({
            title: t('speechToTextFailed'),
            message: result.error || t('cannotRecognizeSpeech'),
            variant: 'error',
            duration: 4000,
            position: 'top-center'
          });
          console.error('Transcription failed:', result.error);
        }
      } catch (error) {
        console.error('Error during transcription:', error);
        toasterRef.current?.show({
          title: t('processingFailed'),
          message: t('audioProcessingError'),
          variant: 'error',
          duration: 3000,
          position: 'top-center'
        });
      } finally {
        // 无论成功还是失败，都要重置处理状态
        setIsProcessingAudio(false);
      }
    }
  };

  const handleStart = () => {
    // Check configuration before starting recording
    if (!isConfigured) {
      console.log('Cannot start recording: Configuration not complete');
      toasterRef.current?.show({
        title: t('needApiConfig'),
        message: t('configureApiFirst'),
        variant: 'warning',
        duration: 3000,
        position: 'top-center'
      });
      return false; // 返回false表示不允许开始录音
    }
    console.log('Recording started');
    setIsRecording(true);
    return true; // 返回true表示允许开始录音
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    console.log('Key down event:', {
      key: event.key,
      ctrlKey: event.ctrlKey,
      isControlPressed: isControlPressedRef.current,
      isRecording: isRecordingRef.current,
      isConfigured: isConfiguredRef.current
    });

    if (event.ctrlKey && !isControlPressedRef.current && !isRecordingRef.current) {
      event.preventDefault();
      console.log('Starting recording via Ctrl key');

      // Check configuration before starting recording
      if (!isConfiguredRef.current) {
        console.log('Cannot start recording: Configuration not complete');
        toasterRef.current?.show({
          title: t('needApiConfig'),
          message: t('configureApiCorrect'),
          variant: 'warning',
          duration: 3000,
          position: 'top-center'
        });
        // 不设置isControlPressed为true，这样下次按Control键时还能触发
        return;
      }

      // 只有在配置完成时才设置Control按下状态
      setIsControlPressed(true);
      console.log('Recording started');
      setIsRecording(true);
    }
  }, [t]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    console.log('Key up event:', {
      key: event.key,
      ctrlKey: event.ctrlKey,
      isControlPressed: isControlPressedRef.current,
      isRecording: isRecordingRef.current
    });

    if (!event.ctrlKey && isControlPressedRef.current && isRecordingRef.current) {
      event.preventDefault();
      console.log('Stopping recording via Ctrl key release');
      setIsControlPressed(false);
      setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDownEvent = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    const handleKeyUpEvent = (event: KeyboardEvent) => {
      handleKeyUp(event);
    };

    // 添加到 document 而不是 window，确保能够捕获到键盘事件
    document.addEventListener('keydown', handleKeyDownEvent);
    document.addEventListener('keyup', handleKeyUpEvent);

    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent);
      document.removeEventListener('keyup', handleKeyUpEvent);
    };
  }, [handleKeyDown, handleKeyUp]);

  // 调试：添加配置状态的显示（已移除，避免过多日志）
  // useEffect(() => {
  //   console.log('Configuration status:', isConfigured);
  // }, [isConfigured]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <Toaster ref={toasterRef} defaultPosition="top-center" />
        {isProcessingAudio ? (
          <MessageLoading message={t('processingAudio')} />
        ) : (
          <><AIVoiceInput
              onStart={handleStart}
              onStop={handleStop}
              isRecording={isRecording} /><KeyBoardDefault /></>
        )}
       
        <Footer />
      </div>
    </div>
  );
}