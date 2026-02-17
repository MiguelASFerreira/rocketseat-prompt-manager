import {
  createPromptAction,
  searchPromptAction,
} from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

jest.mock('@/core/application/prompts/create-prompts.use-case', () => ({
  CreatePromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedCreateExecute,
  })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
  });

  describe('createPromptAction', () => {
    it('deve criar um prompt com sucesso', async () => {
      const data = {
        title: 'New Prompt',
        content: 'Some content',
      };

      const result = await createPromptAction(data);

      expect(result.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso!');
    });

    it('deve retornar erro de validação quando os campos forem vazios', async () => {
      const data = {
        title: '',
        content: '',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toBeDefined();
    });

    it('deve retornar erro quando o prompt já existir', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));

      const data = {
        title: 'Existing Prompt',
        content: 'Some content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Este prompt já existe');
    });

    it('deve retornar erro genérico quando a criação falhar', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKNOWN_ERROR'));
      const data = {
        title: 'New Prompt',
        content: 'Some content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Falha ao criar o prompt');
    });
  });

  describe('searchPromptsAction', () => {
    it('deve retornar sucesso com o termo de busca não vazio', async () => {
      const input = [{ id: '1', title: 'AI Prompt 1', content: 'Content 1' }];

      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction(
        {
          success: true,
        },
        formData
      );

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('deve retornar sucesso e listar todos os prompts quando o termo de busca estiver vazio', async () => {
      const input = [
        { id: '1', title: 'AI Prompt 1', content: 'Content 1' },
        { id: '2', title: 'AI Prompt 2', content: 'Content 2' },
      ];

      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction(
        {
          success: true,
        },
        formData
      );

      expect(result.success).toBeDefined();
      expect(result.prompts).toEqual(input);
    });

    it('deve retornar um erro genérico quando a busca falhar', async () => {
      mockedSearchExecute.mockRejectedValueOnce(new Error('UNKNOWN_ERROR'));

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction(
        {
          success: true,
        },
        formData
      );

      expect(result.success).toBe(false);
      expect(result.prompts).toBeUndefined();
      expect(result.message).toBe('Falha ao buscar prompts.');
    });

    it('deve aparar espaços em branco no termo de busca', async () => {
      const input = [{ id: '1', title: 'AI Prompt 1', content: 'Content 1' }];

      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', '   AI   ');

      const result = await searchPromptAction(
        {
          success: true,
        },
        formData
      );

      expect(mockedSearchExecute).toHaveBeenCalledWith('AI');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('deve tratar ausência da query como termo vazio', async () => {
      const input = [
        { id: '1', title: 'AI Prompt 1', content: 'Content 1' },
        { id: '2', title: 'AI Prompt 2', content: 'Content 2' },
      ];

      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();

      const result = await searchPromptAction(
        {
          success: true,
        },
        formData
      );

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
});
