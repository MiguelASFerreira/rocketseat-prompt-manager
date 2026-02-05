import { searchPromptAction } from "@/app/actions/prompt.actions";

jest.mock('@/lib/prisma', () => ({ prisma: {} }))

const mockedSearchExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute
  }))
}))

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
  })

  describe('searchPromptsAction', () => {
    it('deve retornar sucesso com o termo de busca não vazio', async () => {
      const input = [
        { id: '1', title: 'AI Prompt 1', content: 'Content 1' },
      ]

      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({
        success: true
      }, formData);

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);

    })

    it('deve retornar sucesso e listar todos os prompts quando o termo de busca estiver vazio', async () => {
      const input = [
        { id: '1', title: 'AI Prompt 1', content: 'Content 1' },
        { id: '2', title: 'AI Prompt 2', content: 'Content 2' },
      ]

      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction({
        success: true
      }, formData);

      expect(result.success).toBeDefined();
      expect(result.prompts).toEqual(input);
    })

    it('deve retornar um erro genérico quando a busca falhar', async () => {
      mockedSearchExecute.mockRejectedValueOnce(new Error('UNKNOWN_ERROR'));

      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({
        success: true
      }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toBeUndefined();
      expect(result.message).toBe('Falha ao buscar prompts.');
    })

    it('deve aparar espaços em branco no termo de busca', async () => {
      const input = [
        { id: '1', title: 'AI Prompt 1', content: 'Content 1' },
      ]

      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();
      formData.append('q', '   AI   ');

      const result = await searchPromptAction({
        success: true
      }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('AI');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    })

    it('deve tratar ausência da query como termo vazio', async () => {
      const input = [
        { id: '1', title: 'AI Prompt 1', content: 'Content 1' },
        { id: '2', title: 'AI Prompt 2', content: 'Content 2' },
      ]

      mockedSearchExecute.mockResolvedValueOnce(input);

      const formData = new FormData();

      const result = await searchPromptAction({
        success: true
      }, formData);

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    })
  })
})