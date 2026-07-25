import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DragDropContext } from '@hello-pangea/dnd';
import { Column } from './Column';
import type { Status, WorkItem } from '../types';

const rick = { id: 'c1', name: 'Rick Sanchez', image: 'rick.png' };

function renderColumn(items: WorkItem[], onAddItem: (status: Status) => void = () => {}) {
  return render(
    <DragDropContext onDragEnd={() => {}}>
      <Column status="To Do" items={items} onItemClick={() => {}} onAddItem={onAddItem} />
    </DragDropContext>,
  );
}

describe('Column', () => {
  it('shows the status heading and item count', () => {
    renderColumn([
      { id: '1', name: 'A', status: 'To Do', character: rick },
      { id: '2', name: 'B', status: 'To Do', character: rick },
    ]);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders items in the order given', () => {
    renderColumn([
      { id: '1', name: 'First', status: 'To Do', character: rick },
      { id: '2', name: 'Second', status: 'To Do', character: rick },
    ]);

    const names = screen.getAllByText(/^(First|Second)$/).map((el) => el.textContent);
    expect(names).toEqual(['First', 'Second']);
  });

  it('shows zero for an empty column', () => {
    renderColumn([]);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('calls onAddItem with its own status when the add button is clicked', async () => {
    const user = userEvent.setup();
    const handleAddItem = vi.fn();
    renderColumn([], handleAddItem);

    await user.click(screen.getByRole('button', { name: 'Add work item to To Do' }));

    expect(handleAddItem).toHaveBeenCalledWith('To Do');
  });

  it('makes the card list independently scrollable instead of growing the page', () => {
    const { container } = renderColumn([{ id: '1', name: 'A', status: 'To Do', character: rick }]);

    const dropzone = container.querySelector('[data-rfd-droppable-id="To Do"]');
    expect(dropzone).toHaveClass('overflow-auto');
  });

  it('does not force the column to a fixed height, letting it grow with its content', () => {
    renderColumn([{ id: '1', name: 'A', status: 'To Do', character: rick }]);
    expect(screen.getByTestId('column-To Do')).not.toHaveClass('h-100');
  });
});
