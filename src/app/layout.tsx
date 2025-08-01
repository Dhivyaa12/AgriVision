

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
  LogOut,
  ChevronRight
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
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { Separator } from '@/components/ui/separator';
import { LanguageProvider } from '@/hooks/use-language';

export const metadata: Metadata = {
  title: 'AgriAssist',
  description: 'An AI-Powered Agricultural Assistant to help farmers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <SidebarProvider>
              <Sidebar>
                <SidebarHeader>
                  <div className="flex items-center gap-2">
                    <Leaf className="size-8 text-primary" />
                    <h1 className="text-2xl font-headline font-bold text-primary">AgriAssist</h1>
                  </div>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Link href="/" passHref>
                        <SidebarMenuButton tooltip="Dashboard">
                          <Sprout />
                          <span>Dashboard</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/crop-diagnosis" passHref>
                        <SidebarMenuButton tooltip="Crop Diagnosis">
                          <ScanSearch />
                          <span>Crop Diagnosis</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/crop-recommendation" passHref>
                        <SidebarMenuButton tooltip="Crop Recommendation">
                          <Sprout />
                          <span>Crop Recommendation</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/market-watch" passHref>
                        <SidebarMenuButton tooltip="Market Watch">
                          <LineChart />
                          <span>Market Watch</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/government-schemes" passHref>
                        <SidebarMenuButton tooltip="Government Schemes">
                          <Landmark />
                          <span>Government Schemes</span>
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
                        <span>Support</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <Link href="/settings" passHref>
                        <SidebarMenuButton>
                          <Settings />
                          <span>Settings</span>
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
                <main className="flex-1 overflow-auto p-4 md:p-6">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </LanguageProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
