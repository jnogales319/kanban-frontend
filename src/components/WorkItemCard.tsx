import { Draggable } from '@hello-pangea/dnd';
import type { KeyboardEvent } from 'react';
import { Card } from 'react-bootstrap';
import styles from './WorkItemCard.module.css';
import avatarStyles from '../styles/CharacterAvatar.module.css';
import type { WorkItem } from '../types';

interface WorkItemCardProps {
  item: WorkItem;
  index: number;
  onClick: (item: WorkItem) => void;
}

export function WorkItemCard({ item, index, onClick }: WorkItemCardProps) {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Space is reserved by @hello-pangea/dnd's keyboard sensor to lift/drop the card.
    if (event.key === 'Enter') {
      onClick(item);
    }
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(item)}
          onKeyDown={handleKeyDown}
          className={`mb-2 shadow-sm ${styles.card}`}
          role="button"
          bg={snapshot.isDragging ? 'light' : undefined}
        >
          <Card.Body className="d-flex align-items-center gap-2 py-2">
            <img
              src={item.character.image}
              alt=""
              className={`${avatarStyles.avatar} ${avatarStyles.large}`}
            />
            <div className={styles.details}>
              <div className="fw-semibold">{item.name}</div>
              <div className="text-muted small">{item.character.name}</div>
            </div>
          </Card.Body>
        </Card>
      )}
    </Draggable>
  );
}
