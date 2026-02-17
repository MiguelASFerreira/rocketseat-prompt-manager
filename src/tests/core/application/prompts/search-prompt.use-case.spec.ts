import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import type { Prompt } from '@/core/domain/prompts/prompt.entity';
import type { PromptRepository } from '@/core/domain/prompts/prompt.repository';

describe('SearchPromptsUseCase', () => {
  const input: Prompt[] = [
    {
      id: '1',
      title: 'AI Prompt 1',
      content: 'Content 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'AI Prompt 2',
      content: 'Content 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const repository: PromptRepository = {
    create: async () => Promise.resolve(),
    findMany: async () => input,
    findByTitle: async () => null,
    searchMany: async (term) =>
      input.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(term.toLocaleLowerCase()) ||
          prompt.content.toLowerCase().includes(term.toLocaleLowerCase())
      ),
  };

  it('deve retornar todos os prompts quando o termo de busca estiver vazio', async () => {
    const useCase = new SearchPromptsUseCase(repository);

    const results = await useCase.execute('');

    expect(results).toHaveLength(2);
  });

  it('deve filtrar a lista de prompts pelo termo pesquisado', async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const query = 'Prompt 2';

    const results = await useCase.execute(query);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('deve aplicar trim em buscas com termo com espaços em branco e retornar toda a lista de prompts', async () => {
    const findMany = jest.fn().mockResolvedValueOnce(input);
    const searchMany = jest.fn().mockResolvedValueOnce([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = '    ';

    const results = await useCase.execute(query);

    expect(results).toHaveLength(2);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });

  it('deve buscar termo com espaços em branco, tatando com trim', async () => {
    const firstElement = input.slice(0, 1);

    const findMany = jest.fn().mockResolvedValueOnce(input);
    const searchMany = jest.fn().mockResolvedValueOnce(firstElement);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = '  Prompt 1  ';

    const results = await useCase.execute(query);

    expect(results).toMatchObject(firstElement);
    expect(searchMany).toHaveBeenCalledWith(query.trim());
    expect(findMany).not.toHaveBeenCalled();
  });

  it('deve lidar com termo undefined ou null e retornar a lista completa de prompts', async () => {
    const firstElement = input.slice(0, 1);

    const findMany = jest.fn().mockResolvedValueOnce(input);
    const searchMany = jest.fn().mockResolvedValueOnce(firstElement);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = undefined as unknown as string;

    const results = await useCase.execute(query);

    expect(results).toMatchObject(input);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });
});
