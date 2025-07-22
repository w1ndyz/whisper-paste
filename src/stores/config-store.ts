import { create } from 'zustand';
import { openAIService } from '@/services/openai-api';
import { aliCloudASRService } from '@/services/alicloud-asr';
import { speechRecognitionService } from '@/services/speech-recognition';

export type ConfigStatus = 'unconfigured' | 'testing' | 'success' | 'error';
export type ServiceProvider = 'openai' | 'alicloud';

interface ConfigState {
  // 状态
  isConfigured: boolean;
  configStatus: ConfigStatus;
  isTestingApi: boolean;
  lastError: string | null;

  // 配置数据
  serviceProvider: ServiceProvider;
  baseUrl: string;
  apiKey: string;

  // 动作
  setConfigStatus: (status: ConfigStatus) => void;
  setIsTestingApi: (testing: boolean) => void;
  setLastError: (error: string | null) => void;
  setServiceProvider: (provider: ServiceProvider) => void;
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
  serviceProvider: 'openai',
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

  // 设置服务提供商
  setServiceProvider: (provider: ServiceProvider) => {
    set({ serviceProvider: provider });
    // 同时更新语音识别服务的提供商
    speechRecognitionService.setProvider(provider);
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
        serviceProvider: settings.serviceProvider || 'openai',
        baseUrl: settings.baseUrl || '',
        apiKey: settings.apiKey || ''
      });

      // 设置语音识别服务提供商
      speechRecognitionService.setProvider(settings.serviceProvider || 'openai');

      if (!hasBaseUrl || !hasApiKey) {
        setConfigStatus('unconfigured');
        return;
      }

      // 配置存在，开始API测试
      setConfigStatus('testing');
      setIsTestingApi(true);
      setLastError(null);

      // 设置对应服务配置
      if (settings.serviceProvider === 'openai' || !settings.serviceProvider) {
        openAIService.setConfig({
          baseUrl: settings.baseUrl,
          apiKey: settings.apiKey
        });
      } else if (settings.serviceProvider === 'alicloud') {
        // 阿里云配置字段映射
        aliCloudASRService.setConfig({
          appKey: settings.baseUrl, // 临时映射，实际应该有专门字段
          accessToken: settings.apiKey,
          gateway: settings.gateway || 'https://nls-gateway.cn-shanghai.aliyuncs.com'
        });
      }

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
      // 使用统一的语音识别服务进行测试
      const result = await speechRecognitionService.testConnection();
      
      if (result.success) {
        setLastError(null);
        return true;
      } else {
        setLastError(result.error || 'API测试失败');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API测试失败';
      setLastError(errorMessage);
      return false;
    }
  },

  // 更新配置（不保存到localStorage）
  updateConfig: (baseUrl: string, apiKey: string) => {
    const { serviceProvider } = get();
    set({ baseUrl, apiKey });

    // 使用统一的语音识别服务更新配置
    if (serviceProvider === 'openai' && baseUrl && apiKey) {
      speechRecognitionService.setConfig({ baseUrl, apiKey });
    } else if (serviceProvider === 'alicloud') {
      speechRecognitionService.setConfig({
        appKey: baseUrl,
        accessToken: apiKey,
        gateway: 'https://nls-gateway.cn-shanghai.aliyuncs.com'
      });
    }
  },

  // 重置配置
  resetConfig: () => {
    set({
      isConfigured: false,
      configStatus: 'unconfigured',
      isTestingApi: false,
      lastError: null,
      serviceProvider: 'openai',
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