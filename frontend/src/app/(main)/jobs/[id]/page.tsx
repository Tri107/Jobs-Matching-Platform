import { JobDetail } from '@/features/jobs/components/JobDetail';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <JobDetail jobId={id} />
    </div>
  );
}
