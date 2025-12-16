'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus } from 'lucide-react';
import { projectStorage } from '@/lib/storage/projectStorage';
import { coffeeShopExample } from '@/lib/examples/coffee-shop';
import { useRouter } from 'next/navigation';
import type { Currency } from '@/lib/storage/types';
import { useProjects } from '@/lib/hooks/use-projects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCard } from '@/components/project/ProjectCard';

// Prompt shortcuts configuration
interface PromptShortcut {
  label: string;
  prompt: string;
}

const PROMPT_SHORTCUTS: PromptShortcut[] = [
  {
    label: 'Coffee shop',
    prompt: 'A coffee shop selling artisan coffee specialities as well as a selection of pastries and baked goods. It\'s a small selection of high quality coffees: Espresso, Flat White, Latte. The pastries and baked goods come from a local partner. The coffee shop space is used for evening events and supper clubs.',
  },
  {
    label: 'Reading app with sound',
    prompt: 'A reading app with a unique value prop of dynamic soundscapes acompanying the reading experience for better focus and transporting the user into the story. The app has a subscription business model and also an option to purchase individual book access for non-subscribers.',
  },
];

// Canvas preview component for the hero card
// Uses CSS Grid with 10 columns (LCM of 5 and 2) for flexible row layouts
// Row 1-2: 5 equal columns (each card spans 2 cols)
// Row 3: 2 equal columns (each card spans 5 cols)
function CanvasPreview({ className }: { className?: string }) {
  return (
    <div 
      className={`grid grid-cols-10 grid-rows-3 gap-2 opacity-90 ${className ?? ''}`}
    >
      {/* Partnerships - col 1-2, row 1-2 (double height) */}
      <div className="col-start-1 col-span-2 row-start-1 row-span-2 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="text-white/20 text-xs text-center px-2">Partnerships</span>
      </div>
      
      {/* Activities - col 3-4, row 1 */}
      <div className="col-start-3 col-span-2 row-start-1 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="text-white/20 text-xs text-center px-2">Activities</span>
      </div>
      
      {/* Resources - col 3-4, row 2 */}
      <div className="col-start-3 col-span-2 row-start-2 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="text-white/20 text-xs text-center px-2">Resources</span>
      </div>
      
      {/* Value Proposition - col 5-6, row 1-2 (double height) */}
      <div className="col-start-5 col-span-2 row-start-1 row-span-2 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="text-white/20 text-xs text-center px-2">Value Proposition</span>
      </div>
      
      {/* Customer Relationships - col 7-8, row 1 */}
      <div className="col-start-7 col-span-2 row-start-1 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="text-white/20 text-xs text-center px-2">Customer Relationships</span>
      </div>
      
      {/* Channels - col 7-8, row 2 */}
      <div className="col-start-7 col-span-2 row-start-2 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="text-white/20 text-xs text-center px-2">Channels</span>
      </div>
      
      {/* Customer Segments - col 9-10, row 1-2 (double height) */}
      <div className="col-start-9 col-span-2 row-start-1 row-span-2 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="text-white/20 text-xs text-center px-2">Customer Segments</span>
      </div>
      
      {/* Cost Structure - col 1-5, row 3 */}
      <div className="col-start-1 col-span-5 row-start-3 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="hidden text-white/20 text-xs text-center px-2">Cost Structure</span>
      </div>
      
      {/* Revenue Streams - col 6-10, row 3 */}
      <div className="col-start-6 col-span-5 row-start-3 rounded-lg bg-blue-950/30 flex items-center justify-center">
        <span className="hidden text-white/20 text-xs text-center px-2">Revenue Streams</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { projects, deleteProject } = useProjects();
  const [isLoading, setIsLoading] = useState(true);
  const [businessIdea, setBusinessIdea] = useState('');
  const [currency, setCurrency] = useState<Currency>('GBP');
  const router = useRouter();
  const trimmedIdea = businessIdea.trim();
  const ideaLength = trimmedIdea.length;
  const promptStage = (() => {
    if (ideaLength >= 250) return 3; // best: 1-2 paragraphs
    if (ideaLength >= 120) return 2; // better: short paragraph
    if (ideaLength >= 10) return 1;  // good: long sentence
    return 0;
  })();
  const promptEncouragement =
    promptStage === 0
      ? `At least ${Math.max(1, 10 - ideaLength)} more characters`
      : ['','Keep writing for better result','A bit more if you can...','Perfect!'][promptStage];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteProject(projectId);
  };

  const handleCreateNewProject = () => {
    try {
      const newProject = projectStorage.createProject('My new project', currency);
      router.push(`/projects/${newProject.id}/canvas-view`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleAddExampleProject = () => {
    const newProject = projectStorage.createProject(
      coffeeShopExample.name,
      coffeeShopExample.currency
    );
    
    const revenueItems = (coffeeShopExample.revenueStreams.items || []).map(item => ({
      ...item,
      projectId: newProject.id,
      associatedCosts: item.associatedCosts.map(cost => ({
        ...cost,
        revenueStreamId: item.id,
        projectId: newProject.id
      }))
    }));
    
    const updatedProject = {
      ...newProject,
      description: coffeeShopExample.description,
      costStructure: {
        fixedRunningCosts: coffeeShopExample.costStructure.fixedRunningCosts.map(cost => ({
          ...cost,
          projectId: newProject.id
        })),
        upfrontCosts: coffeeShopExample.costStructure.upfrontCosts.map(cost => ({
          ...cost,
          projectId: newProject.id
        }))
      },
      revenueStreams: {
        items: revenueItems
      },
      partnerships: coffeeShopExample.partnerships ?? [],
      activities: coffeeShopExample.activities ?? [],
      valueProposition: coffeeShopExample.valueProposition ?? [],
      customerRelationships: coffeeShopExample.customerRelationships ?? [],
      customerSegments: coffeeShopExample.customerSegments ?? [],
      resources: coffeeShopExample.resources ?? [],
      channels: coffeeShopExample.channels ?? []
    };
    
    projectStorage.updateProject(updatedProject);
    router.push(`/projects/${newProject.id}/canvas-view`);
  };

  const handleGenerateCanvas = () => {
    if (!trimmedIdea || ideaLength < 10) {
      return;
    }
    
    try {
      // Create a blank project with a temporary name
      const newProject = projectStorage.createProject('Generating...', currency);
      // Navigate to canvas view with generation params
      const encodedPrompt = encodeURIComponent(trimmedIdea);
      router.push(`/projects/${newProject.id}/canvas-view?generating=true&prompt=${encodedPrompt}`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleFillPrompt = (prompt: string) => {
    setBusinessIdea(prompt);
    // Optionally scroll the textarea into view on mobile
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-24 md:pt-20">
      <div className="container px-2 md:px-8 max-w-7xl mx-auto py-8 sm:py-12 flex-1">
        {/* Hero Card */}
        <div className="mx-auto mb-8">
          <div className="relative rounded-2xl bg-gradient-to-b from-blue-700 to-blue-950 p-4 sm:p-12">
            {/* Canvas Preview - absolute positioned background layer */}
            <CanvasPreview className="absolute inset-x-0 top-0 h-1/4 md:h-3/4 bottom-0 mx-auto max-w-3xl my-8 sm:my-12 blur-[1px]" />
            
            {/* Content layer - positioned on top of canvas */}
            <div className="relative z-10 pt-32">
              {/* Tagline */}
              <h2 className="text-white text-xl sm:text-2xl font-semibold text-center mb-8">
                Build a business model with AI <br className="hidden md:block" />
                and explore pricing and profitability.
              </h2>
              
              {/* Input Card */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <textarea
                    value={businessIdea}
                    onChange={(e) => setBusinessIdea(e.target.value)}
                    placeholder="Describe your business idea and get a filled in Business Model Canvas. For example: 'A mobile app that connects local farmers directly with restaurants for fresh produce delivery...'"
                    className="w-full h-24 resize-none border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder:text-gray-400 text-base"
                  />
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-1 hidden md:block">
                      <div className="flex h-1.5 w-24 gap-1 overflow-hidden rounded-full bg-gray-100">
                        {[1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            className={`flex-1 transition-colors ${promptStage >= idx ? 'bg-blue-700' : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {promptEncouragement}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                        <SelectTrigger className="w-20 h-9 bg-gray-50 border-gray-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleGenerateCanvas}
                        disabled={ideaLength < 10}
                        className="gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick action pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  onClick={handleAddExampleProject}
                  className="hidden px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-medium transition-colors"
                >
                  Artisan coffee shop
                </button>
                {PROMPT_SHORTCUTS.map((shortcut) => (
                  <button
                    key={shortcut.label}
                    onClick={() => handleFillPrompt(shortcut.prompt)}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-medium transition-colors"
                  >
                    {shortcut.label}
                  </button>
                ))}
                <button
                  onClick={handleCreateNewProject}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Blank canvas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section - Only show if user has projects */}
        {!isLoading && projects.length > 0 && (
          <div className="mx-auto">
            <h2 className="text-xl font-semibold mb-4">Your projects</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...projects]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={handleDeleteProject}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
