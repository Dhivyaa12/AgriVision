import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { GovernmentSchemesForm } from '@/components/forms/government-schemes-form';

export default function GovernmentSchemesPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">Government Scheme Recommender</PageHeaderHeading>
        <PageHeaderDescription>
          Find relevant government schemes for your agricultural needs. Enter your state and requirements to get started.
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        <GovernmentSchemesForm />
      </div>
    </div>
  );
}
