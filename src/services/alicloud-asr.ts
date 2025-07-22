interface AliCloudConfig {
  appKey: string;
  accessToken: string;
  gateway: string;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

interface ASRResult {
  text: string;
  confidence?: number;
  timestamp?: number;
}

class AliCloudASRService {
  private config: AliCloudConfig | null = null;
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;

  /**
   * 设置阿里云ASR配置
   */
  setConfig(config: AliCloudConfig) {
    this.config = {
      appKey: config.appKey,
      accessToken: config.accessToken,
      gateway: config.gateway.endsWith('/') ? config.gateway.slice(0, -1) : config.gateway
    };
  }

  /**
   * 获取当前配置
   */
  getConfig(): AliCloudConfig | null {
    return this.config;
  }

  /**
   * 检查配置是否有效
   */
  isConfigured(): boolean {
    return this.config !== null &&
      this.config.appKey.trim() !== "" &&
      this.config.accessToken.trim() !== "" &&
      this.config.gateway.trim() !== "";
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<APIResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: '阿里云ASR配置未完成，请先设置AppKey、AccessToken和Gateway'
      };
    }

    try {
      // 创建测试WebSocket连接
      const wsUrl = `${this.config!.gateway.replace('http', 'ws')}/ws/v1`;
      const testWs = new WebSocket(wsUrl);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          testWs.close();
          resolve({
            success: false,
            error: '连接超时'
          });
        }, 5000);

        testWs.onopen = () => {
          clearTimeout(timeout);
          testWs.close();
          resolve({
            success: true,
            data: { message: '阿里云ASR连接测试成功' }
          });
        };

        testWs.onerror = (error) => {
          clearTimeout(timeout);
          resolve({
            success: false,
            error: `连接失败: ${error}`
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: `阿里云ASR连接错误: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 实时语音识别
   */
  async transcribeRealtime(
    audioFile: File, 
    onResult?: (result: ASRResult) => void
  ): Promise<APIResponse<ASRResult>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: '阿里云ASR配置未完成，请先设置AppKey、AccessToken和Gateway'
      };
    }

    try {
      const wsUrl = `${this.config!.gateway.replace('http', 'ws')}/ws/v1`;
      this.ws = new WebSocket(wsUrl);

      return new Promise((resolve, reject) => {
        let finalResult = '';
        
        this.ws!.onopen = () => {
          this.isConnected = true;
          
          // 发送开始识别指令
          const startMessage = {
            header: {
              message_id: this.generateMessageId(),
              task_id: this.generateTaskId(),
              namespace: "SpeechTranscriber",
              name: "StartTranscription",
              appkey: this.config!.appKey
            },
            payload: {
              format: "pcm",
              sample_rate: 16000,
              enable_intermediate_result: true,
              enable_punctuation_prediction: true,
              enable_inverse_text_normalization: true
            }
          };
          
          this.ws!.send(JSON.stringify(startMessage));
          
          // 发送音频数据
          this.sendAudioData(audioFile);
        };

        this.ws!.onmessage = (event) => {
          try {
            const result = JSON.parse(event.data);
            
            if (result.header.name === "TranscriptionResultChanged") {
              const text = result.payload.result;
              finalResult = text;
              
              if (onResult) {
                onResult({
                  text,
                  confidence: result.payload.confidence,
                  timestamp: Date.now()
                });
              }
            } else if (result.header.name === "TranscriptionCompleted") {
              this.isConnected = false;
              this.ws?.close();
              
              resolve({
                success: true,
                data: {
                  text: finalResult,
                  timestamp: Date.now()
                }
              });
            } else if (result.header.name === "TaskFailed") {
              this.isConnected = false;
              this.ws?.close();
              
              resolve({
                success: false,
                error: `语音识别失败: ${result.payload.error_message || '未知错误'}`
              });
            }
          } catch (parseError) {
            console.error('解析WebSocket消息失败:', parseError);
          }
        };

        this.ws!.onerror = (error) => {
          this.isConnected = false;
          resolve({
            success: false,
            error: `WebSocket连接错误: ${error}`
          });
        };

        this.ws!.onclose = () => {
          this.isConnected = false;
        };
      });
    } catch (error) {
      return {
        success: false,
        error: `阿里云ASR错误: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 发送音频数据
   */
  private async sendAudioData(audioFile: File) {
    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const chunkSize = 3200; // 每次发送3.2KB
      let offset = 0;

      const sendChunk = () => {
        if (offset >= arrayBuffer.byteLength || !this.isConnected) {
          // 发送结束标记
          const stopMessage = {
            header: {
              message_id: this.generateMessageId(),
              task_id: this.generateTaskId(),
              namespace: "SpeechTranscriber",
              name: "StopTranscription",
              appkey: this.config!.appKey
            }
          };
          this.ws?.send(JSON.stringify(stopMessage));
          return;
        }

        const chunk = arrayBuffer.slice(offset, offset + chunkSize);
        this.ws?.send(chunk);
        offset += chunkSize;

        // 模拟实时发送，每20ms发送一次
        setTimeout(sendChunk, 20);
      };

      // 开始发送
      setTimeout(sendChunk, 100);
    } catch (error) {
      console.error('发送音频数据失败:', error);
    }
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 关闭连接
   */
  disconnect() {
    if (this.ws && this.isConnected) {
      this.ws.close();
    }
    this.isConnected = false;
  }
}

// 创建单例实例
export const aliCloudASRService = new AliCloudASRService();

// 导出类型
export type { AliCloudConfig, APIResponse, ASRResult };