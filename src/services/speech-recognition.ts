import { openAIService } from './openai-api';
import { aliCloudASRService } from './alicloud-asr';
import type { ServiceProvider } from '@/stores/config-store';
import type { APIResponse } from './openai-api';

interface TranscriptionService {
  transcribeAudio(audioFile: File, model?: string): Promise<APIResponse>;
  testConnection(): Promise<APIResponse>;
  setConfig(config: any): void;
  isConfigured(): boolean;
}

class SpeechRecognitionService {
  private currentProvider: ServiceProvider = 'openai';

  /**
   * 设置当前使用的服务提供商
   */
  setProvider(provider: ServiceProvider) {
    this.currentProvider = provider;
  }

  /**
   * 获取当前服务提供商
   */
  getProvider(): ServiceProvider {
    return this.currentProvider;
  }

  /**
   * 获取当前服务实例
   */
  private getCurrentService(): TranscriptionService {
    switch (this.currentProvider) {
      case 'openai':
        return openAIService;
      case 'alicloud':
        return aliCloudASRService as unknown as TranscriptionService;
      default:
        return openAIService;
    }
  }

  /**
   * 语音转文字统一接口
   */
  async transcribeAudio(audioFile: File, model?: string): Promise<APIResponse> {
    const service = this.getCurrentService();
    
    if (!service.isConfigured()) {
      return {
        success: false,
        error: `${this.getProviderName()}配置未完成，请先配置相关参数`
      };
    }

    try {
      if (this.currentProvider === 'alicloud') {
        // 阿里云ASR使用实时识别
        return await (service as any).transcribeRealtime(audioFile);
      } else {
        // OpenAI使用文件上传识别
        return await service.transcribeAudio(audioFile, model);
      }
    } catch (error) {
      return {
        success: false,
        error: `${this.getProviderName()}语音识别失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<APIResponse> {
    const service = this.getCurrentService();
    return await service.testConnection();
  }

  /**
   * 设置服务配置
   */
  setConfig(config: any) {
    const service = this.getCurrentService();
    service.setConfig(config);
  }

  /**
   * 检查服务是否已配置
   */
  isConfigured(): boolean {
    const service = this.getCurrentService();
    return service.isConfigured();
  }

  /**
   * 获取服务商名称
   */
  private getProviderName(): string {
    switch (this.currentProvider) {
      case 'openai':
        return 'OpenAI';
      case 'alicloud':
        return '阿里云ASR';
      default:
        return '未知服务商';
    }
  }

  /**
   * 获取支持的服务商列表
   */
  static getSupportedProviders(): Array<{ value: ServiceProvider; label: string; description: string }> {
    return [
      {
        value: 'openai',
        label: 'OpenAI Whisper',
        description: '使用OpenAI的Whisper API进行语音识别'
      },
      {
        value: 'alicloud',
        label: '阿里云语音识别',
        description: '使用阿里云实时语音识别服务，延迟更低'
      }
    ];
  }

  /**
   * 获取服务商配置字段
   */
  static getProviderConfigFields(provider: ServiceProvider): Array<{ key: string; label: string; placeholder: string; type?: string }> {
    switch (provider) {
      case 'openai':
        return [
          {
            key: 'baseUrl',
            label: 'Base URL',
            placeholder: 'https://api.openai.com',
            type: 'url'
          },
          {
            key: 'apiKey',
            label: 'API Key',
            placeholder: 'enterApiKey',
            type: 'password'
          }
        ];
      case 'alicloud':
        return [
          {
            key: 'appKey',
            label: 'App Key',
            placeholder: 'enterAppKey',
            type: 'text'
          },
          {
            key: 'accessToken',
            label: 'Access Token',
            placeholder: 'enterAccessToken',
            type: 'password'
          },
          {
            key: 'gatewayUrl',
            label: 'Gateway URL',
            placeholder: 'enterGatewayUrl',
            type: 'url'
          }
        ];
      default:
        return [];
    }
  }
}

// 创建单例实例
export const speechRecognitionService = new SpeechRecognitionService();

// 导出类型和工具方法
export { SpeechRecognitionService };
export type { TranscriptionService };