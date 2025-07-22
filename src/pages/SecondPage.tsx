import React, { useState, useEffect } from "react";
import Footer2 from "@/components/template/Footer2";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrangeToggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { setTheme } from "@/helpers/theme_helpers";
import { ThemeMode } from "@/types/theme-mode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useConfigStore, type ServiceProvider } from "@/stores/config-store";
import { SpeechRecognitionService } from "@/services/speech-recognition";

export default function SecondPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State for settings
  const [serviceProvider, setServiceProviderState] = useState<ServiceProvider>("openai");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saveHistory, setSaveHistory] = useState(true);
  const [autoCleanTime, setAutoCleanTime] = useState("30");
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [theme, setThemeState] = useState("system");
  const [language, setLanguage] = useState("zh");

  // API test states
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<'success' | 'error' | null>(null);
  const [apiTestMessage, setApiTestMessage] = useState("");

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setServiceProviderState(settings.serviceProvider || "openai");
        setBaseUrl(settings.baseUrl || "");
        setApiKey(settings.apiKey || "");
        setSaveHistory(settings.saveHistory ?? true);
        setAutoCleanTime(settings.autoCleanTime || "30");
        setAutoUpdate(settings.autoUpdate ?? true);
        setThemeState(settings.theme || "system");
        setLanguage(settings.language || "zh");
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    // 设置当前语言
    setLanguage(i18n.language || "zh");
  }, [i18n.language]);

  const handleSave = async () => {
    // Save settings to localStorage
    const settings = {
      serviceProvider,
      baseUrl,
      apiKey,
      saveHistory,
      autoCleanTime,
      autoUpdate,
      theme,
      language
    };

    localStorage.setItem('appSettings', JSON.stringify(settings));
    console.log("Settings saved");

    // 应用主题变化
    await setTheme(theme as ThemeMode);

    // 应用语言变化
    await i18n.changeLanguage(language);

    // Navigate back to home page after saving
    navigate({ to: "/" });
  };

  const handleThemeChange = (newTheme: string) => {
    setThemeState(newTheme);
    // 不立即应用主题变化，等保存时再应用
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // 不立即应用语言变化，等保存时再应用
  };

  // 使用全局配置状态
  const { testApiConnection, updateConfig, setServiceProvider } = useConfigStore();

  // 处理服务商变更
  const handleServiceProviderChange = (provider: ServiceProvider) => {
    setServiceProviderState(provider);
    setServiceProvider(provider);

    // 清除之前的配置字段
    setBaseUrl("");
    setApiKey("");

    // 重置API测试状态
    setApiTestResult(null);
    setApiTestMessage("");
  };

  // 获取当前服务商的配置字段
  const getConfigFields = () => {
    return SpeechRecognitionService.getProviderConfigFields(serviceProvider);
  };

  // 获取支持的服务商列表
  const supportedProviders = SpeechRecognitionService.getSupportedProviders();

  const handleTestApi = async () => {
    if (!baseUrl || !apiKey) {
      setApiTestResult('error');
      setApiTestMessage(t('fillBaseUrlAndApiKey'));
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);
    setApiTestMessage('');

    // 更新全局配置（临时测试）
    updateConfig(baseUrl, apiKey);

    // 使用全局状态管理的API测试
    const success = await testApiConnection();

    if (success) {
      setApiTestResult('success');
      setApiTestMessage(t('success'));
    } else {
      setApiTestResult('error');
      setApiTestMessage(t('error'));
    }

    setIsTestingApi(false);
  };

  const handleCancel = () => {
    // Navigate back to home page without saving
    navigate({ to: "/" });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 p-4 overflow-y-auto relative">
        <div className="max-w-md mx-auto space-y-4" style={{ minHeight: '100%', position: 'relative' }}>
          {/* 语音识别服务选择 */}
          <div>
            <h2 className="text-sm font-medium mb-3 text-muted-foreground">{t('speechRecognitionService')}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-provider" className="text-xs font-medium">{t('serviceProvider')}</Label>
                <Select value={serviceProvider} onValueChange={handleServiceProviderChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={t('serviceProvider')}>
                      {t(supportedProviders.find(p => p.value === serviceProvider)?.label || '')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {supportedProviders.map((provider) => (
                      <SelectItem
                        key={provider.value}
                        value={provider.value}
                        className="py-3"
                      >
                        <div className="flex flex-col items-start w-full space-y-1">
                          <span className="font-medium text-sm">
                            {t(provider.label)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t(provider.description)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 动态配置字段 */}
              {getConfigFields().map((field, index) => {
                // 处理特殊情况：阿里云的第三个字段
                const isThirdField = index === 2 && serviceProvider === 'alicloud';
                const currentValue = isThirdField ? 'https://nls-gateway.cn-shanghai.aliyuncs.com' :
                  (index === 0 ? baseUrl : apiKey);

                return (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-xs font-medium">{t(field.key) || field.label}</Label>
                    <Input
                      id={field.key}
                      type={field.type || 'text'}
                      placeholder={t(field.placeholder) || field.placeholder}
                      value={currentValue}
                      onChange={(e) => {
                        if (index === 0) setBaseUrl(e.target.value);
                        else if (index === 1) setApiKey(e.target.value);
                        // 第三个字段（Gateway URL）暂时不允许修改，使用默认值
                      }}
                      disabled={isThirdField} // 第三个字段暂时禁用
                      className="h-9 text-sm"
                    />
                  </div>
                );
              })}

              {/* API测试 */}
              <div className="space-y-2">
                <Label htmlFor="status-test" className="text-xs font-medium">{t('connectivity')}</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    onClick={handleTestApi}
                    disabled={isTestingApi || !baseUrl || !apiKey}
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs flex-shrink-0"
                  >
                    {isTestingApi ? t('testingApi') : t('testApiConnection')}
                  </Button>

                  {apiTestResult && (
                    <Badge
                      variant={apiTestResult === 'success' ? 'outline' : 'destructive'}
                      className="text-xs max-w-full break-words"
                    >
                      {apiTestResult === 'success' ? '✅ ' : '❌ '}
                      {apiTestMessage}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>


          <Separator />

          {/* 历史记录 */}
          <div>
            <h2 className="text-sm font-medium mb-2 text-muted-foreground">{t('historySettings')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{t('saveHistory')}</Label>
                <OrangeToggle
                  checked={saveHistory}
                  onChange={(e) => setSaveHistory(e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">{t('autoCleanTime')}</Label>
                <Select value={autoCleanTime} onValueChange={setAutoCleanTime}>
                  <SelectTrigger className="w-25 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">{t('days7')}</SelectItem>
                    <SelectItem value="30">{t('days30')}</SelectItem>
                    <SelectItem value="90">{t('days90')}</SelectItem>
                    <SelectItem value="never">{t('never')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* 隐私 */}
          <div>
            <h2 className="text-sm font-medium mb-2 text-muted-foreground">{t('privacy')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{t('autoUpdate')}</Label>
                <OrangeToggle
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 外观 */}
          <div>
            <h2 className="text-sm font-medium mb-2 text-muted-foreground">{t('appearance')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{t('theme')}</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-25 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('lightTheme')}</SelectItem>
                    <SelectItem value="dark">{t('darkTheme')}</SelectItem>
                    <SelectItem value="system">{t('systemTheme')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs">{t('language')}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-25 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">{t('chinese')}</SelectItem>
                    <SelectItem value="en">{t('english')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer2 onCancel={handleCancel} onSave={handleSave} />
    </div>
  );
}