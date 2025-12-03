
'use client';
import { useState } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { SensorDataCard } from '@/components/sensor-data-card';
import cropData from '@/lib/crop-data.json';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const texts = {
  title: "Live Sensor Analysis",
  description: "Real-time sensor data from across various regions. Click 'Analyze Data' to get AI-powered insights for the current record, or 'Next Record' to cycle through the data.",
  nextRecord: "Next Record",
};

export default function SensorAnalysisPage() {
  const { t } = useTranslation(texts);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextRecord = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cropData.length);
  };
  
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
      <div className="mt-4 flex justify-end">
          <Button onClick={handleNextRecord}>
            {t('nextRecord')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
      </div>
    </div>
  );
}
