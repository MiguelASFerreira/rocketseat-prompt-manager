'use server';

import { prisma } from '@/lib/prisma';

import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import type { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';
import {
  createPromptSchema,
  type CreatePromptDTO,
} from '@/core/application/prompts/create-prompt.dto';
import z from 'zod';
import { CreatePromptsUseCase } from '@/core/application/prompts/create-prompts.use-case';

type SearchFormState = {
  success: boolean;
  prompts?: PromptSummary[];
  message?: string;
};

export async function createPromptAction(data: CreatePromptDTO) {
  const validated = createPromptSchema.safeParse(data);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    return {
      success: false,
      message: 'Erro de validação',
      errors: fieldErrors,
    };
  }

  try {
    const repository = new PrismaPromptRepository(prisma);
    const useCase = new CreatePromptsUseCase(repository);

    await useCase.execute(validated.data);
  } catch (error) {
    const _error = error as Error;

    if (_error.message === 'PROMPT_ALREADY_EXISTS') {
      return {
        success: false,
        message: 'Este prompt já existe',
      };
    }

    return {
      success: false,
      message: 'Falha ao criar o prompt',
    };
  }

  return {
    success: true,
    message: 'Prompt criado com sucesso!',
  };
}

export async function searchPromptAction(
  _prev: SearchFormState,
  formData: FormData
): Promise<SearchFormState> {
  const term = String(formData.get('q') ?? '').trim();
  const repository = new PrismaPromptRepository(prisma);
  const useCase = new SearchPromptsUseCase(repository);

  try {
    const results = await useCase.execute(term);

    const summaries = results.map(({ id, title, content }) => ({
      id,
      title,
      content,
    }));

    return {
      success: true,
      prompts: summaries,
    };
  } catch {
    return {
      success: false,
      message: 'Falha ao buscar prompts.',
    };
  }
}
