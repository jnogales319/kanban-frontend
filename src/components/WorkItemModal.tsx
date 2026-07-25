import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { searchCharacters } from '../api/rickAndMorty';
import './WorkItemModal.module.css';
import avatarStyles from '../styles/CharacterAvatar.module.css';
import { STATUSES } from '../types';
import type { Character, Status, WorkItem } from '../types';

interface WorkItemModalProps {
  show: boolean;
  item: WorkItem | null;
  onClose: () => void;
  onSave: (item: WorkItem) => void;
}

export function WorkItemModal({ show, item, onClose, onSave }: WorkItemModalProps) {
  const isEditing = item !== null;

  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('To Do');
  const [selectedCharacter, setSelectedCharacter] = useState<Character[]>([]);
  const [characterOptions, setCharacterOptions] = useState<Character[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (show) {
      setName(item?.name ?? '');
      setStatus(item?.status ?? 'To Do');
      setSelectedCharacter(item?.character ? [item.character] : []);
      setCharacterOptions(item?.character ? [item.character] : []);
      setSearchError(null);
      setValidated(false);
    }
    return () => {
      searchAbortRef.current?.abort();
    };
  }, [show, item]);

  const handleSearch = async (query: string) => {
    // Cancel any still-in-flight search so its response can't arrive after
    // (and overwrite the results of) a more recent one.
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchCharacters(query, controller.signal);
      setCharacterOptions(results);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setSearchError(err instanceof Error ? err.message : 'Failed to search characters');
    } finally {
      if (searchAbortRef.current === controller) {
        setIsSearching(false);
      }
    }
  };

  const characterMissing = validated && selectedCharacter.length === 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity() || selectedCharacter.length === 0) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    onSave({
      id: item?.id ?? crypto.randomUUID(),
      name: name.trim(),
      status,
      character: selectedCharacter[0],
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered aria-labelledby="workItemModalTitle">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title id="workItemModalTitle">
            {isEditing ? 'Edit Work Item' : 'Add Work Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="workItemName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Fix login bug"
              aria-describedby="workItemNameFeedback"
            />
            <Form.Control.Feedback type="invalid" id="workItemNameFeedback">
              Name is required.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="workItemStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="workItemCharacterInput">
            <Form.Label>Rick and Morty Character</Form.Label>
            {searchError && <Alert variant="danger">{searchError}</Alert>}
            <AsyncTypeahead
              id="workItemCharacter"
              inputProps={{
                id: 'workItemCharacterInput',
                className: characterMissing ? 'is-invalid' : undefined,
                'aria-invalid': characterMissing,
                'aria-describedby': characterMissing ? 'workItemCharacterFeedback' : undefined,
              }}
              labelKey="name"
              minLength={1}
              delay={300}
              isLoading={isSearching}
              onSearch={handleSearch}
              options={characterOptions}
              selected={selectedCharacter}
              onChange={(selected) => setSelectedCharacter(selected as Character[])}
              filterBy={() => true}
              clearButton
              placeholder="Search for a character…"
              renderMenuItemChildren={(option) => {
                const character = option as Character;
                return (
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={character.image}
                      alt=""
                      className={`${avatarStyles.avatar} ${avatarStyles.small}`}
                    />
                    <span>{character.name}</span>
                  </div>
                );
              }}
            />
            {characterMissing && (
              <Form.Control.Feedback type="invalid" id="workItemCharacterFeedback" className="d-block">
                Character is required.
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
