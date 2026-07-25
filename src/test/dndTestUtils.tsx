import type { ReactNode } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

export function renderWithDnd(children: ReactNode) {
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test-droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
