import {
  SidebarContent,
  type SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const initialPrompts = [
  {
    id: '1',
    title: 'Prompt 1',
    content: 'Conteúdo do Prompt 1',
  },
];

const makeSut = (
  { prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps
) => {
  render(<SidebarContent prompts={prompts} />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();

  describe('base', () => {
    it('deveria renderizar o botão para criar um novo prompt', () => {
      makeSut();

      expect(screen.getByRole('complementary')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Novo Prompt' })).toBeVisible();
    });

    it('deveria renderizar a lista de prompts', () => {
      const input = [
        { id: '1', title: 'Prompt 1', content: 'Conteúdo do Prompt 1' },
        { id: '2', title: 'Prompt 2', content: 'Conteúdo do Prompt 2' },
      ];
      makeSut({ prompts: input });

      expect(screen.getByText(initialPrompts[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole('paragraph')).toHaveLength(input.length);
    });
  });

  describe('Colapsar / Expandir', () => {
    it('deveria iniciar expandida e exibir o botão minimizar', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      expect(collapseButton).toBeVisible();

      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
    });

    it('deveria contrair e mostrar o botão de expandir', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).toBeInTheDocument();

      expect(collapseButton).not.toBeInTheDocument();
    });
  });

  describe('Novo Prompt', () => {
    it('deveria navegar o usuário para a página de novo prompt', async () => {
      makeSut();

      const newButton = screen.getByRole('button', { name: 'Novo Prompt' });

      await user.click(newButton);

      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });
});
