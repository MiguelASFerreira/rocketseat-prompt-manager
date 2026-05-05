import { CreatePromptsUseCase } from '@/core/application/prompts/create-prompts.use-case';
import type { PromptRepository } from '@/core/domain/prompts/prompt.repository';
import { create } from 'domain';

const makeRepository = (overrides: Partial<PromptRepository>) => {
  const base = {
    create: jest.fn(async () => undefined),
  };

  return { ...base, ...overrides } as PromptRepository;
};

describe('CreatePromptUseCase', () => {
  it('deve criar um prompt quando não existir duplicidade', async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CreatePromptsUseCase(repository);
    const input = {
      title: 'New Prompt',
      content: 'This is a new prompt.',
    };

    await expect(useCase.execute(input)).resolves.toBeUndefined();
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it('deve falhar ao criar um prompt quando já existir duplicidade', async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue({
        id: '1',
        title: 'New Prompt',
        content: 'This is a new prompt.',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });
    const useCase = new CreatePromptsUseCase(repository);
    const input = {
      title: 'New Prompt',
      content: 'This is a new prompt.',
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'PROMPT_ALREADY_EXISTS'
    );
    expect(repository.create).not.toHaveBeenCalledWith(input);
  });
});
