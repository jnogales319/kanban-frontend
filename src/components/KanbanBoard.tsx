import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import { groupByStatus, moveWorkItem } from '../lib/workItems';
import styles from './KanbanBoard.module.css';
import { STATUSES } from '../types';
import type { Status, WorkItem } from '../types';

interface KanbanBoardProps {
  items: WorkItem[];
  onItemsChange: (items: WorkItem[]) => void;
  onItemClick: (item: WorkItem) => void;
}

export function KanbanBoard({ items, onItemsChange, onItemClick }: KanbanBoardProps) {
  const itemsByStatus = groupByStatus(items);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    onItemsChange(
      moveWorkItem(
        items,
        { status: source.droppableId as Status, index: source.index },
        destination ? { status: destination.droppableId as Status, index: destination.index } : null,
      ),
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={`d-flex gap-3 flex-grow-1 ${styles.board}`}>
        {STATUSES.map((status) => (
          <Column key={status} status={status} items={itemsByStatus[status]} onItemClick={onItemClick} />
        ))}
      </div>
    </DragDropContext>
  );
}
