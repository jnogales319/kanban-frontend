import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Column } from './Column';
import type { WorkItem } from '../types';

function renderColumn(items: WorkItem[]) {
  return render(
    <DragDropContext onDragEnd={() => {}}>
      <Column status="To Do" items={items} onItemClick={() => {}} />
    </DragDropContext>,
  );
}

describe('Column', () => {
  it('shows the status heading and item count', () => {
    renderColumn([
      { id: '1', name: 'A', status: 'To Do', character: { id: 'c1', name: 'Rick Sanchez', image: 'rick.png' } },
      { id: '2', name: 'B', status: 'To Do', character: { id: 'c1', name: 'Rick Sanchez', image: 'rick.png' } },
    ]);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders items in the order given', () => {
    renderColumn([
      { id: '1', name: 'First', status: 'To Do', character: { id: 'c1', name: 'Rick Sanchez', image: 'rick.png' } },
      { id: '2', name: 'Second', status: 'To Do', character: { id: 'c1', name: 'Rick Sanchez', image: 'rick.png' } },
    ]);

    const names = screen.getAllByText(/^(First|Second)$/).map((el) => el.textContent);
    expect(names).toEqual(['First', 'Second']);
  });

  it('shows zero for an empty column', () => {
    renderColumn([]);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
