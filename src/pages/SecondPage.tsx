import React, { useState, useEffect } from "react";
import Footer2 from "@/components/template/Footer2";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinimalToggle, OrangeToggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { setTheme } from "@/helpers/theme_helpers";
import { ThemeMode } from "@/types/theme-mode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useConfigStore } from "@/stores/config-store";

export default function SecondPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State for settings
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
  const { testApiConnection, updateConfig } = useConfigStore();

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
        <div className="max-w-lg mx-auto space-y-4" style={{ minHeight: '100%', position: 'relative' }}>
          {/* 高级设置 */}
          <div>
            <h2 className="text-sm font-medium mb-2 text-muted-foreground">{t('advancedSettings')}</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="base-url" className="text-xs">{t('baseUrl')}</Label>
                <Input
                  id="base-url"
                  placeholder="https://api.openai.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="api-key" className="text-xs">{t('apiKey')}</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder={t('enterApiKey')}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* API测试 */}
              <div className="space-y-2">
                <Label htmlFor="status-test" className="text-xs">{t('connectivity')}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleTestApi}
                    disabled={isTestingApi || !baseUrl || !apiKey}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                  >
                    {isTestingApi ? t('testingApi') : t('testApiConnection')}
                  </Button>

                  {apiTestResult && (
                    <Badge
                      variant={apiTestResult === 'success' ? 'outline' : 'destructive'}
                      className="text-xs"
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