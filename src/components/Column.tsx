import { Droppable } from '@hello-pangea/dnd';
import { Badge, Button, Stack } from 'react-bootstrap';
import { WorkItemCard } from './WorkItemCard';
import styles from './Column.module.css';
import type { Status, WorkItem } from '../types';

interface ColumnProps {
  status: Status;
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
  onAddItem: (status: Status) => void;
}

export function Column({ status, items, onItemClick, onAddItem }: ColumnProps) {
  return (
    <Stack
      className={`bg-body-tertiary rounded p-2 ${styles.column}`}
      data-testid={`column-${status}`}
    >
      <div className="d-flex align-items-center justify-content-between px-1 mb-2 flex-shrink-0">
        <div className="d-flex align-items-center gap-2">
          <h2 className="h6 mb-0">{status}</h2>
          <Button
            size="sm"
            variant="outline-dark"
            onClick={() => onAddItem(status)}
            aria-label={`Add work item to ${status}`}
          >
            +
          </Button>
        </div>
        <Badge bg="secondary" pill>
          {items.length}
        </Badge>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-grow-1 overflow-auto rounded p-1 ${styles.dropzone} ${
              snapshot.isDraggingOver ? styles.dropzoneActive : ''
            }`.trim()}
          >
            {items.map((item, index) => (
              <WorkItemCard key={item.id} item={item} index={index} onClick={onItemClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Stack>
  );
}
