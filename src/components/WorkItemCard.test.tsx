import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkItemCard } from './WorkItemCard';
import { renderWithDnd } from '../test/dndTestUtils';
import type { WorkItem } from '../types';

const item: WorkItem = {
  id: '1',
  name: 'Fix login bug',
  status: 'To Do',
  character: { id: '1', name: 'Rick Sanchez', image: 'rick.png' },
};

describe('WorkItemCard', () => {
  it('renders the item name and its assigned character', () => {
    const { container } = render(
      renderWithDnd(<WorkItemCard item={item} index={0} onClick={() => {}} />),
    );

    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', 'rick.png');
  });

  it('calls onClick with the item when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(renderWithDnd(<WorkItemCard item={item} index={0} onClick={handleClick} />));
    await user.click(screen.getByText('Fix login bug'));

    expect(handleClick).toHaveBeenCalledWith(item);
  });

  it('calls onClick when Enter is pressed while the card is focused', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(renderWithDnd(<WorkItemCard item={item} index={0} onClick={handleClick} />));
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledWith(item);
  });
});
