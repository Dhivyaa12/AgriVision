import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanSearch, Sprout, LineChart, Landmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: ScanSearch,
    title: "Crop Diagnosis",
    description: "Upload an image of your crop to diagnose diseases and get expert-recommended remedies.",
    href: "/crop-diagnosis",
    cta: "Diagnose Crop",
  },
  {
    icon: Sprout,
    title: "Crop Recommendation",
    description: "Get personalized crop recommendations based on your soil, weather, and location.",
    href: "/crop-recommendation",
    cta: "Get Recommendation",
  },
  {
    icon: LineChart,
    title: "Market Watch",
    description: "Stay updated with the latest Mandi prices for various crops and make informed selling decisions.",
    href: "/market-watch",
    cta: "View Prices",
  },
  {
    icon: Landmark,
    title: "Government Schemes",
    description: "Discover central and state government schemes that can benefit your farming activities.",
    href: "/government-schemes",
    cta: "Find Schemes",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome to AgriVision</h1>
        <p className="text-muted-foreground">Your AI-powered assistant for smarter farming.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-headline font-semibold">{feature.title}</CardTitle>
                <Icon className="h-6 w-6 text-muted-foreground" />
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
