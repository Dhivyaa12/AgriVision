import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { CropDiagnosisForm } from '@/components/forms/crop-diagnosis-form';

export default function CropDiagnosisPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <PageHeader>
        <PageHeaderHeading className="font-headline">Crop Disease Diagnosis</PageHeaderHeading>
        <PageHeaderDescription>
          Upload a photo of an affected crop and describe the issue. Our AI will analyze it to identify diseases and suggest solutions.
        </PageHeaderDescription>
      </PageHeader>
      <div className="mt-8">
        <CropDiagnosisForm />
      </div>
    </div>
  );
}
