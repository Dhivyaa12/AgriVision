
'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { CropDiagnosisForm } from '@/components/forms/crop-diagnosis-form';
import { useTranslation } from '@/hooks/use-translation';

const texts = {
  title: "Crop Disease Diagnosis",
  description: "Upload a photo of an affected crop and describe the issue. Our AI will analyze it to identify diseases and suggest solutions.",
};

export default function CropDiagnosisPage() {
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
        <CropDiagnosisForm />
      </div>
    </div>
  );
}
