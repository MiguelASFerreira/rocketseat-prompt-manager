import type { CreatePromptDTO } from '@/core/application/prompts/create-prompt.dto';
import type { UpdatePromptDTO } from '@/core/application/prompts/update-prompt.dto';
import type { Prompt } from '@/core/domain/prompts/prompt.entity';
import type { PrismaClient } from '@/generated/prisma/client';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { data: CreatePromptDTO }) => Promise<void>
  >;
  update: jest.MockedFunction<
    (args: {
      where: { id: string };
      data: Partial<UpdatePromptDTO>;
    }) => Promise<Prompt>
  >;
  delete: jest.MockedFunction<
    (args: {
      where: { id: string };
    }) => Promise<void>
  >;
  findFirst: jest.MockedFunction<
    (args: {
      where: { title: string };
    }) => Promise<Pick<Prompt, 'id' | 'title' | 'content'> | null>
  >;
  findUnique: jest.MockedFunction<
    (args: {
      where: { id: string };
    }) => Promise<Prompt | null>
  >;
  findMany: jest.MockedFunction<
    (args: {
      orderBy?: { createdAt: 'asc' | 'desc' };
      where?: {
        OR: Array<{
          title?: { contains: string; mode: 'insensitive' };
          content?: { contains: string; mode: 'insensitive' };
        }>;
      };
    }) => Promise<Prompt[]>
  >;
};

type PrismaMock = {
  prompt: PromptDelegateMock;
};

function createMockPrisma() {
  const mock: PrismaMock = {
    prompt: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  return mock as unknown as PrismaClient & PrismaMock;
}

describe('PrismaPromptRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repository: PrismaPromptRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repository = new PrismaPromptRepository(prisma);
  });

  describe('create', () => {
    it('deve chamar o método create com os dados corretos', async () => {
      const input = {
        title: 'New Prompt',
        content: 'Some content',
      };

      await repository.create(input);

      expect(prisma.prompt.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o prompt', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'Updated Prompt',
        content: 'Updated content',
        createdAt: now,
        updatedAt: now,
      };

      prisma.prompt.update.mockResolvedValue(input);

      const result = await repository.update(input.id, {
        title: input.title,
        content: input.content,
      });

      expect(prisma.prompt.update).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
        },
      });
      expect(result).toEqual(input);
    });

    it('deve enviar apenas campos presentes (somente title)', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'Updated Prompt',
        content: '',
        createdAt: now,
        updatedAt: now,
      };

      prisma.prompt.update.mockResolvedValue(input);

      await repository.update(input.id, {
        title: input.title,
      });
      const call = prisma.prompt.update.mock.calls[0][0];

      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({
        title: input.title,
      });
      expect('content' in call.data).toBe(false);
    });

    it('deve enviar apenas campos presentes (somente content)', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: '',
        content: 'Updated content',
        createdAt: now,
        updatedAt: now,
      };
      
      prisma.prompt.update.mockResolvedValue(input);
      await repository.update(input.id, {
        content: input.content,
      });
      const call = prisma.prompt.update.mock.calls[0][0];
      
      expect(call.where).toEqual({ id: input.id });
      expect(call.data).toEqual({
        content: input.content,
      });
      expect('title' in call.data).toBe(false);
    });
  });

  describe('delete', () => {
    it('deve chamar prisma.prompt.delete com where id', async () => {
      const promptId = '1';
      
      await repository.delete(promptId);

      expect(prisma.prompt.delete).toHaveBeenCalledWith({
        where: { id: promptId },
      });
    });
  });


  describe('findByTitle', () => {
    it('deve chamar corretamente o findFirst com o title', async () => {
      const title = 'Existing Prompt';
      const input = {
        id: '1',
        title,
        content: 'Some content',
      };
      prisma.prompt.findFirst.mockResolvedValue(input);

      const result = await repository.findByTitle(title);

      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: { title },
      });
      expect(result).toEqual(input);
    });
  });

  describe('findById', () => {
    it('deve retornar um prompt quando existir', async () => {
      const now = new Date();
      const input = {
        id: '1',
        title: 'title',
        content: 'content',
        createdAt: now,
        updatedAt: now,
      };

      prisma.prompt.findUnique.mockResolvedValue(input);
      
      const result = await repository.findById(input.id);
      
      expect(prisma.prompt.findUnique).toHaveBeenCalledWith({
        where: { id: input.id },
      });
      expect(result).toEqual(input);
    });

    it('deve retornar null quando não encontrar o prompt', async () => {
      const id = '1';
      prisma.prompt.findUnique.mockResolvedValue(null);
      
      const result = await repository.findById(id);
      
      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('deve ordenar por createdAt desc e mapear os resultados', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Some content',
          createdAt: new Date(now.getTime() - 1000),
          updatedAt: new Date(now.getTime() - 500),
        },
        {
          id: '2',
          title: 'Prompt 2',
          content: 'Some content',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.findMany();

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
  });

  describe('searchMany', () => {
    it('deve buscar por termo vazio e não enviar o where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Some content',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('   ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });

    it('deve buscar por termo e popular OR no where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Some content',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany('  Prompt 1  ');

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'Prompt 1', mode: 'insensitive' } },
            { content: { contains: 'Prompt 1', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });

    it('deve aceitar termo undefined e não enviar o where', async () => {
      const now = new Date();
      const input = [
        {
          id: '1',
          title: 'Title 01',
          content: 'Content 01',
          createdAt: now,
          updatedAt: now,
        },
      ];
      prisma.prompt.findMany.mockResolvedValue(input);

      const results = await repository.searchMany(undefined);

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(results).toMatchObject(input);
    });
  });
});
