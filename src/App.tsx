import { useState } from 'react';
import { Button, Container, Stack } from 'react-bootstrap';
import { KanbanBoard } from './components/KanbanBoard';
import { WorkItemModal } from './components/WorkItemModal';
import styles from './App.module.css';
import type { WorkItem } from './types';

function App() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (item: WorkItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSave = (item: WorkItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
    setShowModal(false);
  };

  return (
    <Container as="main" fluid className={`py-4 ${styles.page}`}>
      <Stack
        direction="horizontal"
        className="justify-content-between align-items-center mb-4 flex-shrink-0"
      >
        <h1 className="h2 mb-0">Kanban Board</h1>
        <Button onClick={openCreateModal}>+ Add Work Item</Button>
      </Stack>

      <KanbanBoard items={items} onItemsChange={setItems} onItemClick={openEditModal} />

      <WorkItemModal show={showModal} item={editingItem} onClose={closeModal} onSave={handleSave} />
    </Container>
  );
}

export default App;
