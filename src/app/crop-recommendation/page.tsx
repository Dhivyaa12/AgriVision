import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { CropRecommendationForm } from '@/components/forms/crop-recommendation-form';

export default function CropRecommendationPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">Crop Recommendation</PageHeaderHeading>
        <PageHeaderDescription>
          Provide details about your farm's conditions, and our AI will recommend the most suitable crops for you to cultivate.
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        <CropRecommendationForm />
      </div>
    </div>
  );
}
