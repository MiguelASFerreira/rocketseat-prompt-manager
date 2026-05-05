import { prisma } from '@/lib/prisma';
import { SidebarContent } from './sidebar-content';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import type { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { Suspense } from 'react';
import { Spinner } from '../ui/spinner';

export const Sidebar = async () => {
  const repository = new PrismaPromptRepository(prisma);
  let initialPrompts: PromptSummary[] = [];

  try {
    const prompts = await repository.findMany();
    initialPrompts = prompts.map((prompt) => ({
      ...prompt,
    }));
  } catch {
    initialPrompts = [];
  }

  return (
    <Suspense fallback={<Spinner />}>
      <SidebarContent prompts={initialPrompts} />
    </Suspense>
  );
};
