
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanSearch, Sprout, LineChart, Landmark, ArrowRight, TrendingUp, Thermometer } from "lucide-react";
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
    description: "View real-time Mandi prices for various agricultural commodities across the country.",
    href: "/market-watch",
    cta: "View Prices",
  },
  marketAnalyser: {
    icon: TrendingUp,
    title: "Market Analyser",
    description: "Predict future commodity prices based on historical market data and trends.",
    href: "/market-analyser",
    cta: "Analyse Prices",
  },
  sensorAnalysis: {
    icon: Thermometer,
    title: "Sensor Analysis",
    description: "Get AI-powered analysis of farm sensor data for soil and environmental conditions.",
    href: "/sensor-analysis",
    cta: "Analyze Sensor Data",
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
    const featureKey = key as keyof typeof featuresData;
    acc[`${key}_title`] = featuresData[featureKey].title;
    acc[`${key}_description`] = featuresData[featureKey].description;
    acc[`${key}_cta`] = featuresData[featureKey].cta;
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
