import type { CreatePromptDTO } from '@/core/application/prompts/create-prompt.dto';
import type { Prompt } from '@/core/domain/prompts/prompt.entity';
import type { PromptRepository } from '@/core/domain/prompts/prompt.repository';
import type { PrismaClient } from '@/generated/prisma/client';

export class PrismaPromptRepository implements PromptRepository {
  constructor(private prisma: PrismaClient) {}

  async create(prompt: CreatePromptDTO): Promise<void> {
    await this.prisma.prompt.create({
      data: {
        title: prompt.title,
        content: prompt.content,
      },
    });
  }

  async findMany(): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prompts;
  }

  async findByTitle(title: string): Promise<Prompt | null> {
    const prompt = await this.prisma.prompt.findUnique({
      where: {
        title,
      },
    });

    return prompt;
  }

  async searchMany(term?: string): Promise<Prompt[]> {
    const q = term?.trim() || '';
    const prompts = await this.prisma.prompt.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prompts;
  }
}
