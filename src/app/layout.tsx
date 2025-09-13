
'use client';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Leaf,
  Sprout,
  ScanSearch,
  Landmark,
  LineChart,
  Settings,
  LifeBuoy,
  TrendingUp,
  Thermometer,
  LayoutDashboard,
} from "lucide-react"

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { UserNav } from '@/components/user-nav';
import { Separator } from '@/components/ui/separator';
import { LanguageProvider } from '@/hooks/use-language';
import { useTranslation } from '@/hooks/use-translation';
import { usePathname } from 'next/navigation';
import { UserProvider } from '@/hooks/use-user';
import { useEffect, useState } from 'react';


const texts = {
  dashboard: "Dashboard",
  cropDiagnosis: "Crop Diagnosis",
  cropRecommendation: "Crop Recommendation",
  marketAnalyser: "Market Analyser",
  marketWatch: "Market Watch",
  sensorAnalysis: "Sensor Analysis",
  governmentSchemes: "Government Schemes",
  support: "Support",
  settings: "Settings",
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(texts);
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const noSidebarRoutes = ['/welcome', '/', '/login'];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  if (!isClient) {
    return null;
  }

  if (!showSidebar) {
    return (
       <div className="animate-fade-in">
        {children}
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-headline font-bold text-primary">AgriVision</h1>
              <p className="text-xs text-muted-foreground">Smarter Farming</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard" passHref>
                <SidebarMenuButton tooltip={t('dashboard')}>
                  <LayoutDashboard />
                  <span>{t('dashboard')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/sensor-analysis" passHref>
                <SidebarMenuButton tooltip={t('sensorAnalysis')}>
                  <Thermometer />
                  <span>{t('sensorAnalysis')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/crop-diagnosis" passHref>
                <SidebarMenuButton tooltip={t('cropDiagnosis')}>
                  <ScanSearch />
                  <span>{t('cropDiagnosis')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/crop-recommendation" passHref>
                <SidebarMenuButton tooltip={t('cropRecommendation')}>
                  <Sprout />
                  <span>{t('cropRecommendation')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/market-watch" passHref>
                <SidebarMenuButton tooltip={t('marketWatch')}>
                  <LineChart />
                  <span>{t('marketWatch')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/market-analyser" passHref>
                <SidebarMenuButton tooltip={t('marketAnalyser')}>
                  <TrendingUp />
                  <span>{t('marketAnalyser')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/government-schemes" passHref>
                <SidebarMenuButton tooltip={t('governmentSchemes')}>
                  <Landmark />
                  <span>{t('governmentSchemes')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <LifeBuoy />
                <span>{t('support')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/settings" passHref>
                <SidebarMenuButton>
                  <Settings />
                  <span>{t('settings')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/50 backdrop-blur-sm px-6 sticky top-0 z-10">
          <SidebarTrigger />
          <UserNav />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 animate-fade-in-up">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <title>AgriVision</title>
        <meta name="description" content="An AI-Powered Agricultural Assistant to help farmers." />
      </head>
      <body className={cn('font-body antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <UserProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </UserProvider>
          </LanguageProvider>
          {isClient && <Toaster />}
        </ThemeProvider>
      </body>
    </html>
  );
}
