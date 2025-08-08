'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { SensorAnalysisForm } from '@/components/forms/sensor-analysis-form';
import { useTranslation } from '@/hooks/use-translation';

const texts = {
  title: "Sensor Analysis",
  description: "Input your farm's sensor data to get an AI-powered analysis of your soil and environmental conditions.",
};


export default function SensorAnalysisPage() {
  const { t } = useTranslation(texts);
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">{t('title')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('description')}
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        <SensorAnalysisForm />
      </div>
    </div>
  );
}
