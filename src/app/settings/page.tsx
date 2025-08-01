
'use client';

import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import { useTranslation } from '@/hooks/use-translation';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
];

const texts = {
  title: "Settings",
  description: "Manage your application settings and preferences.",
  appearance: "Appearance",
  theme: "Theme",
  language: "Language",
  selectLanguage: "Select language"
};

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation(texts);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">{t('title')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('description')}
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8 grid gap-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{t('appearance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle">{t('theme')}</Label>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('language')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="language-select">{t('language')}</Label>
               <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-select" className="w-[180px]">
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
