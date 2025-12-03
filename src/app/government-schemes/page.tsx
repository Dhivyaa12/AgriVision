
'use client';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { GovernmentSchemesForm } from '@/components/forms/government-schemes-form';
import { useTranslation } from '@/hooks/use-translation';


const texts = {
  title: "Government Scheme Recommender",
  description: "Find relevant government schemes for your agricultural needs. Enter your state and requirements to get started.",
};

export default function GovernmentSchemesPage() {
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
        <GovernmentSchemesForm />
      </div>
    </div>
  );
}
