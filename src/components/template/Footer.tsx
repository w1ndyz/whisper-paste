import React from "react";
import { Settings, WandSparkles, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "../ui/status-badge";
import { useNavigate } from "@tanstack/react-router";
import { useConfigStore, useConfigWatcher } from "@/stores/config-store";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // 使用全局配置状态
  const { configStatus, isConfigured } = useConfigStore();
  
  // 启用配置监听器
  useConfigWatcher();

  const handleSettingsClick = () => {
    navigate({ to: "/second-page" });
  };

  return (
    <footer>
      {/* StatusBadge in bottom-left */}
      <div className="fixed bottom-4 left-4">
        <StatusBadge
          leftIcon={
            configStatus === 'testing' ? Loader2 :
              configStatus === 'success' ? CheckCircle :
                XCircle
          }
          leftLabel={""}
          rightLabel={
            configStatus === 'unconfigured' ? t('unconfigured') :
              configStatus === 'testing' ? t('testing') :
                configStatus === 'success' ? t('ready') :
                  t('connectionFailed')
          }
          status={
            configStatus === 'success' ? "success" :
              configStatus === 'testing' ? "default" :
                "error"
          }
          className={configStatus === 'testing' ? "animate-in" : ""}
        />
      </div>

      {/* Buttons in bottom-right */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        <button
          className="flex items-center justify-center w-8 h-8 bg-background/80 hover:bg-background border border-border rounded-lg shadow-sm backdrop-blur-sm transition-colors"
          title={t('aiAssistant')}
        >
          <WandSparkles className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 bg-background/80 hover:bg-background border border-border rounded-lg shadow-sm backdrop-blur-sm transition-colors"
          title={t('settings')}
          onClick={handleSettingsClick}
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </footer>
  );
}
