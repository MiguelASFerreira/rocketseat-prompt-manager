import { prisma } from '@/lib/prisma';
import { SidebarContent } from './sidebar-content';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import type { PromptSummary } from '@/core/domain/prompts/prompt.entity';

export const Sidebar = async () => {
  const repository = new PrismaPromptRepository(prisma);
  let initialPrompts: PromptSummary[] = []

  try {
    const prompts = await repository.findMany()
    initialPrompts = prompts.map((prompt) => ({
      ...prompt
    }))
  } catch {
    initialPrompts = []
  }

  return <SidebarContent prompts={initialPrompts} />;
};
