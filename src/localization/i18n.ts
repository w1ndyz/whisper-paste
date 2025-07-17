import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "zh", // Set default language to Chinese
  resources: {
    zh: {
      translation: {
        // App Name
        appName: "WhisperPaste",

        // Page Titles
        titleHomePage: "主页",
        titleSecondPage: "设置页面",

        // HomePage Messages
        processingAudio: "正在处理语音，请稍候...",
        speechToTextSuccess: "语音转文字成功",
        copiedToClipboard: "已复制到剪切板",
        speechToTextFailed: "语音转文字失败",
        cannotRecognizeSpeech: "无法识别语音内容",
        processingFailed: "处理失败",
        audioProcessingError: "语音处理过程中发生错误",
        needApiConfig: "需要配置API设置",
        configureApiFirst: "请先配置Base URL和API Key才能使用录音功能",
        configureApiCorrect: "请先配置正确的Base URL和API Key才能使用录音功能",

        // SecondPage - Settings
        advancedSettings: "高级设置",
        baseUrl: "Base URL",
        apiKey: "API Key",
        enterApiKey: "输入您的API密钥",
        connectivity: "连通性",
        testingApi: "测试中...",
        testApiConnection: "⚡️测试API连接",

        // History Settings
        historySettings: "历史记录",
        saveHistory: "保存历史记录",
        autoCleanTime: "自动清理时间",
        days7: "7 天",
        days30: "30 天",
        days90: "90 天",
        never: "永不",

        // Privacy Settings
        privacy: "隐私",
        autoUpdate: "自动更新",

        // Appearance Settings
        appearance: "外观",
        theme: "主题",
        language: "语言",
        lightTheme: "浅色",
        darkTheme: "深色",
        systemTheme: "跟随系统",
        chinese: "中文",
        english: "English",

        // API Test Messages
        fillBaseUrlAndApiKey: "请先填写Base URL和API Key",
        success: "success",
        error: "error",

        // Footer Status
        unconfigured: "未配置",
        testing: "测试中",
        ready: "就绪",
        connectionFailed: "连接失败",

        // Footer Buttons
        cancel: "取消",
        saveChanges: "保存更改",
        aiAssistant: "AI助手",
        settings: "设置",

        // Keyboard Instructions
        pressAndHoldThe: "按住",
      },
    },
    en: {
      translation: {
        // App Name
        appName: "WhisperPaste",

        // Page Titles
        titleHomePage: "Home Page",
        titleSecondPage: "Settings Page",

        // HomePage Messages
        processingAudio: "Processing audio, please wait...",
        speechToTextSuccess: "Speech to text successful",
        copiedToClipboard: "Copied to clipboard",
        speechToTextFailed: "Speech to text failed",
        cannotRecognizeSpeech: "Cannot recognize speech content",
        processingFailed: "Processing failed",
        audioProcessingError: "Error occurred during audio processing",
        needApiConfig: "API configuration required",
        configureApiFirst: "Please configure Base URL and API Key first to use recording function",
        configureApiCorrect: "Please configure correct Base URL and API Key first to use recording function",

        // SecondPage - Settings
        advancedSettings: "Advanced Settings",
        baseUrl: "Base URL",
        apiKey: "API Key",
        enterApiKey: "Enter your API key",
        connectivity: "Connectivity",
        testingApi: "Testing...",
        testApiConnection: "⚡️Test API Connection",

        // History Settings
        historySettings: "History Settings",
        saveHistory: "Save History",
        autoCleanTime: "Auto Clean Time",
        days7: "7 days",
        days30: "30 days",
        days90: "90 days",
        never: "Never",

        // Privacy Settings
        privacy: "Privacy",
        autoUpdate: "Auto Update",

        // Appearance Settings
        appearance: "Appearance",
        theme: "Theme",
        language: "Language",
        lightTheme: "Light",
        darkTheme: "Dark",
        systemTheme: "Follow System",
        chinese: "中文",
        english: "English",

        // API Test Messages
        fillBaseUrlAndApiKey: "Please fill in Base URL and API Key first",
        success: "success",
        error: "error",

        // Footer Status
        unconfigured: "Unconfigured",
        testing: "Testing",
        ready: "Ready",
        connectionFailed: "Connection Failed",

        // Footer Buttons
        cancel: "Cancel",
        saveChanges: "Save Changes",
        aiAssistant: "AI Assistant",
        settings: "Settings",

        // Keyboard Instructions
        pressAndHoldThe: "Press and hold the",
      },
    },
  },
});
