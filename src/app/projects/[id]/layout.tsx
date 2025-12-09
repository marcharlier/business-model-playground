'use client';

import { ProjectProvider, useProject } from '@/lib/context/ProjectContext';

function ProjectLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#E4E4E4] pt-24 md:pt-14">
        <div className="container mx-auto py-10">
          <p>Loading project...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#E4E4E4] pt-24 md:pt-14">
      <div className="container mx-auto py-6 sm:py-10 px-4 md:px-8">
        {children}
      </div>
    </main>
  );
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <ProjectLayoutContent>{children}</ProjectLayoutContent>
    </ProjectProvider>
  );
}
