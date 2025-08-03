
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanSearch, Sprout, LineChart, Landmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";

const featuresData = {
  cropDiagnosis: {
    icon: ScanSearch,
    title: "Crop Diagnosis",
    description: "Upload an image of your crop to diagnose diseases and get expert-recommended remedies.",
    href: "/crop-diagnosis",
    cta: "Diagnose Crop",
  },
  cropRecommendation: {
    icon: Sprout,
    title: "Crop Recommendation",
    description: "Get personalized crop recommendations based on your soil, weather, and location.",
    href: "/crop-recommendation",
    cta: "Get Recommendation",
  },
  marketWatch: {
    icon: LineChart,
    title: "Market Watch",
    description: "Stay updated with the latest Mandi prices for various crops and make informed selling decisions.",
    href: "/market-watch",
    cta: "View Prices",
  },
  governmentSchemes: {
    icon: Landmark,
    title: "Government Schemes",
    description: "Discover central and state government schemes that can benefit your farming activities.",
    href: "/government-schemes",
    cta: "Find Schemes",
  },
};

const texts = {
  welcome: "Welcome to AgriVision",
  tagline: "Your AI-powered assistant for smarter farming.",
  ...Object.keys(featuresData).reduce((acc, key) => {
    acc[`${key}_title`] = featuresData[key as keyof typeof featuresData].title;
    acc[`${key}_description`] = featuresData[key as keyof typeof featuresData].description;
    acc[`${key}_cta`] = featuresData[key as keyof typeof featuresData].cta;
    return acc;
  }, {} as { [key: string]: string })
};


export default function DashboardPage() {
  const { t } = useTranslation(texts);
  
  const features = Object.keys(featuresData).map(key => {
    const featureKey = key as keyof typeof featuresData;
    return {
      ...featuresData[featureKey],
      title: t(`${key}_title`),
      description: t(`${key}_description`),
      cta: t(`${key}_cta`),
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('welcome')}</h1>
        <p className="text-muted-foreground">{t('tagline')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-headline font-semibold">{feature.title}</CardTitle>
                <Icon className="h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <p className="text-muted-foreground flex-grow">{feature.description}</p>
                <Link href={feature.href} passHref className="mt-4">
                  <Button className="w-full">
                    {feature.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

       <Card className="relative overflow-hidden group h-[400px]">
          <Image
            src="https://placehold.co/1200x400.png"
            alt="Farmer in field"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 group-hover:scale-105"
            data-ai-hint="farmer field technology"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-2xl font-headline font-bold text-white">Empowering the pillars of our nation.</h3>
              <p className="text-white/90 mt-2">Bringing cutting-edge technology to the heart of agriculture.</p>
          </div>
      </Card>

    </div>
  );
}
