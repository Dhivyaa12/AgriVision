
'use client';
import { useState, useEffect } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { SensorDataCard } from '@/components/sensor-data-card';
import cropData from '@/lib/crop-data.json';

const texts = {
  title: "Live Sensor Analysis",
  description: "Real-time sensor data from across various regions. The data updates automatically every 30 seconds. Click 'Analyze Data' to get AI-powered insights for the current record.",
};

export default function SensorAnalysisPage() {
  const { t } = useTranslation(texts);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % cropData.length);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const currentData = cropData[currentIndex];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">{t('title')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('description')}
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        <SensorDataCard data={currentData} key={currentIndex} />
      </div>
    </div>
  );
}
