import { Kbd } from '@/components/ui/kbd-1';
import { ArrowDown, ArrowUp, Command } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function KeyBoardDefault() {
    const { t } = useTranslation();
    
    return (
        <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted-foreground whitespace-nowrap">
            <span>{t('pressAndHoldThe')}</span>
            <Kbd>Control ^</Kbd>
        </div>
    );
}
