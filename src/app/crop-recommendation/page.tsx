
'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { CropRecommendationForm } from '@/components/forms/crop-recommendation-form';
import { useTranslation } from '@/hooks/use-translation';

const texts = {
  title: "Crop Recommendation",
  description: "Provide details about your farm's conditions, and our AI will recommend the most suitable crops for you to cultivate.",
};


export default function CropRecommendationPage() {
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
        <CropRecommendationForm />
      </div>
    </div>
  );
}
