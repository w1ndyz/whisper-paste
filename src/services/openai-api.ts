interface OpenAIConfig {
  baseUrl: string;
  apiKey: string;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

class OpenAIService {
  private config: OpenAIConfig | null = null;

  /**
   * 设置API配置
   */
  setConfig(config: OpenAIConfig) {
    this.config = {
      baseUrl: config.baseUrl.endsWith('/') ? config.baseUrl : config.baseUrl + '/',
      apiKey: config.apiKey
    };
  }

  /**
   * 获取当前配置
   */
  getConfig(): OpenAIConfig | null {
    return this.config;
  }

  /**
   * 从localStorage加载配置
   */
  loadConfigFromStorage(): boolean {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const hasBaseUrl = settings.baseUrl && settings.baseUrl.trim() !== "";
        const hasApiKey = settings.apiKey && settings.apiKey.trim() !== "";

        if (hasBaseUrl && hasApiKey) {
          this.setConfig({
            baseUrl: settings.baseUrl,
            apiKey: settings.apiKey
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading API config from storage:', error);
      return false;
    }
  }

  /**
   * 检查配置是否有效
   */
  isConfigured(): boolean {
    return this.config !== null &&
      this.config.baseUrl.trim() !== "" &&
      this.config.apiKey.trim() !== "";
  }

  /**
   * 创建通用的API请求方法
   */
  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'API配置未完成，请先设置Base URL和API Key'
      };
    }

    try {
      const url = `${this.config!.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
          status: response.status
        };
      } else {
        return {
          success: false,
          error: `API ERROR: ${response.status} ${response.statusText}`,
          status: response.status
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `连接错误: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<APIResponse> {
    return this.makeRequest('v1/models', { method: 'GET' });
  }

  /**
   * 获取可用模型列表
   */
  async getModels(): Promise<APIResponse> {
    return this.makeRequest('v1/models', { method: 'GET' });
  }

  /**
   * 发送聊天完成请求
   */
  async createChatCompletion(messages: any[], model: string = 'gpt-3.5-turbo'): Promise<APIResponse> {
    return this.makeRequest('v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
  }

  /**
   * 语音转文字 (Whisper API)
   */
  async transcribeAudio(audioFile: File, model: string = 'whisper-1'): Promise<APIResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'API配置未完成，请先设置Base URL和API Key'
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', model);

      const url = `${this.config!.baseUrl}v1/audio/transcriptions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
          status: response.status
        };
      } else {
        return {
          success: false,
          error: `语音转文字失败: ${response.status} ${response.statusText}`,
          status: response.status
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `语音转文字错误: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }
}

// 创建单例实例
export const openAIService = new OpenAIService();

// 导出类型
export type { OpenAIConfig, APIResponse };