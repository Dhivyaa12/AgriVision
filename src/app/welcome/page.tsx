
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const texts = {
  welcome: "Welcome to AgriVision",
  tagline: "Your AI-powered assistant for smarter farming.",
  startButton: "Get Started",
  signupButton: "Sign Up"
};

export default function WelcomePage() {
  const router = useRouter();
  const { t } = useTranslation(texts);
  const [isExiting, setIsExiting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigate = (path: string, query?: any) => {
    setIsExiting(true);
    setTimeout(() => {
      router.push(path + (query ? `?${new URLSearchParams(query)}` : ''));
    }, 500); // Match the duration of the fade-out animation
  };

  if (!isClient) {
    return null; // Don't render anything on the server
  }

  return (
    <div className={cn(
        "relative flex h-screen w-screen items-center justify-center overflow-hidden transition-opacity duration-500",
        isExiting ? 'opacity-0' : 'opacity-100'
    )}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 min-h-full min-w-full object-cover z-0"
        data-ai-hint="dawn landscape nature"
      >
        <source src="/videos/Agrivision.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>
      <div className="z-20 text-center text-white p-4 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-lg">{t('welcome')}</h1>
        <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow-md">{t('tagline')}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => handleNavigate('/login')} size="lg">
                {t('startButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
             <Button onClick={() => handleNavigate('/login', { tab: 'signup' })} size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                {t('signupButton')}
                <UserPlus className="ml-2 h-5 w-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}
