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
      <div className="h-full bg-[#E4E4E4] pt-24 md:pt-14 flex flex-col">
        <div className="container mx-auto py-10 flex-1 min-h-0">
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="h-full bg-[#E4E4E4] pt-24 md:pt-20 flex flex-col">
      <div className="container flex-1 min-h-0 px-4 md:px-8">
        {children}
      </div>
    </div>
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
