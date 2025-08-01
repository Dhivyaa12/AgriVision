
'use client';

import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
];

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">Settings</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your application settings and preferences.
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8 grid gap-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle">Theme</Label>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="language-select">Language</Label>
               <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-select" className="w-[180px]">
                  <SelectValue placeholder="Select language" />
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
