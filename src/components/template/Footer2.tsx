import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Footer2Props {
  onCancel: () => void;
  onSave: () => void;
}

export default function Footer2({ onCancel, onSave }: Footer2Props) {
  const { t } = useTranslation();
  
  return (
    <div className="fixed bottom-2 right-2 flex gap-2">
      <Button variant="outline" size="sm" onClick={onCancel}>
        {t('cancel')}
      </Button>
      <Button size="sm" onClick={onSave}>
        {t('saveChanges')}
      </Button>
    </div>
  );
}