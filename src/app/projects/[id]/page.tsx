import { redirect } from 'next/navigation';

export default async function ProjectRedirect({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  redirect(`/projects/${resolvedParams.id}/upfront-costs`);
} 