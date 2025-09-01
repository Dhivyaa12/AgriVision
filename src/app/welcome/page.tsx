
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const texts = {
  welcome: "Welcome to AgriVision",
  tagline: "Your AI-powered assistant for smarter farming.",
  startButton: "Get Started"
};

export default function WelcomePage() {
  const router = useRouter();
  const { t } = useTranslation(texts);
  const [isExiting, setIsExiting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/dashboard');
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
        poster="https://placehold.co/1920x1080/1c2a1e/639c6e?text=Loading+Video..."
        data-ai-hint="dawn landscape nature"
      >
        <source src="https://cdn.pixabay.com/video/2020/05/19/35479-421764519_large.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>
      <div className="z-20 text-center text-white p-4 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-lg">{t('welcome')}</h1>
        <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow-md">{t('tagline')}</p>
        <Button onClick={handleStart} size="lg" className="mt-8">
          {t('startButton')}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
