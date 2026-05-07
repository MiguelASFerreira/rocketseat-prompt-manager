import {
  PromptCard,
  type PromptCardProps,
} from '@/components/prompts/prompt-card';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  },
}));

const makeSut = ({ prompt }: PromptCardProps) => {
  return render(<PromptCard prompt={prompt} />);
};

describe('PromptCard', () => {
  const user = userEvent.setup();
  const prompt = { id: '1', title: 'title 01', content: 'content 01' };

  it('deveria renderizar o link com href corretamente', () => {
    makeSut({ prompt });
    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/${prompt.id}`);
  });

  it('deveria abrir um dialog de remoção de um prompt', async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', {
      name: /Remover Prompt/i,
    });
    await user.click(deleteButton);

    expect(screen.getByText('Remover Prompt')).toBeInTheDocument();
  });

  it('deveria remover com sucesso e exibir o toast', async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', {
      name: /Remover Prompt/i,
    });
    await user.click(deleteButton);

    const confirmButton = screen.getByRole('button', {
      name: /Confirmação remoção/i,
    });
    await user.click(confirmButton);

    expect(toast.success).toHaveBeenCalledWith('Prompt removido com sucesso!');
  });
});
