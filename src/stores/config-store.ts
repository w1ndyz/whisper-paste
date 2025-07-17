import { create } from 'zustand';
import { openAIService } from '@/services/openai-api';

export type ConfigStatus = 'unconfigured' | 'testing' | 'success' | 'error';

interface ConfigState {
  // 状态
  isConfigured: boolean;
  configStatus: ConfigStatus;
  isTestingApi: boolean;
  lastError: string | null;

  // 配置数据
  baseUrl: string;
  apiKey: string;

  // 动作
  setConfigStatus: (status: ConfigStatus) => void;
  setIsTestingApi: (testing: boolean) => void;
  setLastError: (error: string | null) => void;
  loadConfigFromStorage: () => Promise<void>;
  testApiConnection: () => Promise<boolean>;
  updateConfig: (baseUrl: string, apiKey: string) => void;
  resetConfig: () => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  // 初始状态
  isConfigured: false,
  configStatus: 'unconfigured',
  isTestingApi: false,
  lastError: null,
  baseUrl: '',
  apiKey: '',

  // 设置配置状态
  setConfigStatus: (status: ConfigStatus) => {
    set({
      configStatus: status,
      isConfigured: status === 'success'
    });
  },

  // 设置测试状态
  setIsTestingApi: (testing: boolean) => {
    set({ isTestingApi: testing });
  },

  // 设置错误信息
  setLastError: (error: string | null) => {
    set({ lastError: error });
  },

  // 从localStorage加载配置并测试
  loadConfigFromStorage: async () => {
    const { setConfigStatus, setIsTestingApi, setLastError, testApiConnection } = get();

    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (!savedSettings) {
        setConfigStatus('unconfigured');
        set({ baseUrl: '', apiKey: '' });
        return;
      }

      const settings = JSON.parse(savedSettings);
      const hasBaseUrl = settings.baseUrl && settings.baseUrl.trim() !== "";
      const hasApiKey = settings.apiKey && settings.apiKey.trim() !== "";

      // 更新本地状态
      set({
        baseUrl: settings.baseUrl || '',
        apiKey: settings.apiKey || ''
      });

      if (!hasBaseUrl || !hasApiKey) {
        setConfigStatus('unconfigured');
        return;
      }

      // 配置存在，开始API测试
      setConfigStatus('testing');
      setIsTestingApi(true);
      setLastError(null);

      // 设置OpenAI服务配置
      openAIService.setConfig({
        baseUrl: settings.baseUrl,
        apiKey: settings.apiKey
      });

      // 测试API连接
      const success = await testApiConnection();

      if (success) {
        setConfigStatus('success');
      } else {
        setConfigStatus('error');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      setConfigStatus('error');
      setLastError(error instanceof Error ? error.message : '配置加载失败');
    } finally {
      setIsTestingApi(false);
    }
  },

  // 测试API连接
  testApiConnection: async () => {
    const { setLastError } = get();

    try {
      const result = await openAIService.testConnection();

      if (result.success) {
        setLastError(null);
        return true;
      } else {
        setLastError(result.error || 'API Failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API Failed';
      setLastError(errorMessage);
      return false;
    }
  },

  // 更新配置（不保存到localStorage）
  updateConfig: (baseUrl: string, apiKey: string) => {
    set({ baseUrl, apiKey });

    // 更新OpenAI服务配置
    if (baseUrl && apiKey) {
      openAIService.setConfig({ baseUrl, apiKey });
    }
  },

  // 重置配置
  resetConfig: () => {
    set({
      isConfigured: false,
      configStatus: 'unconfigured',
      isTestingApi: false,
      lastError: null,
      baseUrl: '',
      apiKey: ''
    });
  }
}));

// 创建一个hook来监听localStorage变化
export const useConfigWatcher = () => {
  const loadConfigFromStorage = useConfigStore(state => state.loadConfigFromStorage);

  React.useEffect(() => {
    // 初始加载
    loadConfigFromStorage();

    // 监听localStorage变化
    const handleStorageChange = () => {
      loadConfigFromStorage();
    };

    // 监听窗口焦点变化
    const handleFocus = () => {
      loadConfigFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadConfigFromStorage]);
};

// 导入React用于useEffect
import React from 'react';