import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkItemModal } from './WorkItemModal';
import { searchCharacters } from '../api/rickAndMorty';
import type { WorkItem } from '../types';

vi.mock('../api/rickAndMorty', () => ({
  searchCharacters: vi.fn(),
}));

const mockedSearchCharacters = vi.mocked(searchCharacters);

const rick = { id: '1', name: 'Rick Sanchez', image: 'rick.png' };

beforeEach(() => {
  mockedSearchCharacters.mockReset();
  mockedSearchCharacters.mockResolvedValue([rick]);
});

describe('WorkItemModal', () => {
  it('shows "Add Work Item" as the title when creating', () => {
    render(<WorkItemModal show item={null} defaultStatus="To Do" onClose={() => {}} onSave={() => {}} />);
    expect(screen.getByText('Add Work Item')).toBeInTheDocument();
  });

  it('pre-selects defaultStatus when creating a new item', () => {
    render(<WorkItemModal show item={null} defaultStatus="Doing" onClose={() => {}} onSave={() => {}} />);
    expect(screen.getByDisplayValue('Doing')).toBeInTheDocument();
  });

  it('shows "Edit Work Item" and pre-fills fields when editing', () => {
    const item: WorkItem = { id: '1', name: 'Fix bug', status: 'Doing', character: rick };
    render(<WorkItemModal show item={item} defaultStatus="To Do" onClose={() => {}} onSave={() => {}} />);

    expect(screen.getByText('Edit Work Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fix bug')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doing')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rick Sanchez')).toBeInTheDocument();
  });

  it('blocks submission and does not save when name is empty', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    render(<WorkItemModal show item={null} defaultStatus="To Do" onClose={() => {}} onSave={handleSave} />);

    await user.click(screen.getByRole('button', { name: /add item/i }));

    expect(handleSave).not.toHaveBeenCalled();
    expect(document.body.querySelector('form')).toHaveClass('was-validated');
  });

  it('blocks submission and does not save when no character is selected', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    render(<WorkItemModal show item={null} defaultStatus="To Do" onClose={() => {}} onSave={handleSave} />);

    await user.type(screen.getByLabelText('Name'), 'Write tests');
    await user.click(screen.getByRole('button', { name: /add item/i }));

    expect(handleSave).not.toHaveBeenCalled();
    expect(screen.getByText('Character is required.')).toBeInTheDocument();
    expect(screen.getByLabelText('Rick and Morty Character')).toHaveAttribute('aria-invalid', 'true');
  });

  it('saves a new item with the entered name, default status, and selected character', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    render(<WorkItemModal show item={null} defaultStatus="To Do" onClose={() => {}} onSave={handleSave} />);

    await user.type(screen.getByLabelText('Name'), 'Write tests');
    await user.type(screen.getByLabelText('Rick and Morty Character'), 'rick');
    await user.click(await screen.findByText('Rick Sanchez'));
    await user.click(screen.getByRole('button', { name: /add item/i }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Write tests', status: 'To Do', character: rick }),
    );
  });

  it('saves the updated status when editing', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    const item: WorkItem = { id: '42', name: 'Fix bug', status: 'To Do', character: rick };
    render(<WorkItemModal show item={item} defaultStatus="To Do" onClose={() => {}} onSave={handleSave} />);

    await user.selectOptions(screen.getByLabelText('Status'), 'Done');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({ id: '42', status: 'Done' }));
  });

  it('searches for and attaches a character to the saved item', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    render(<WorkItemModal show item={null} defaultStatus="To Do" onClose={() => {}} onSave={handleSave} />);

    await user.type(screen.getByLabelText('Name'), 'Investigate portal bug');
    await user.type(screen.getByLabelText('Rick and Morty Character'), 'rick');

    await waitFor(() =>
      expect(mockedSearchCharacters).toHaveBeenCalledWith('rick', expect.any(AbortSignal)),
    );
    await user.click(await screen.findByText('Rick Sanchez'));

    await user.click(screen.getByRole('button', { name: /add item/i }));

    expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({ character: rick }));
  });

  it('shows an error message when character search fails', async () => {
    const user = userEvent.setup();
    mockedSearchCharacters.mockReset();
    mockedSearchCharacters.mockRejectedValueOnce(new Error('Network error'));
    render(<WorkItemModal show item={null} defaultStatus="To Do" onClose={() => {}} onSave={() => {}} />);

    await user.type(screen.getByLabelText('Rick and Morty Character'), 'rick');

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('aborts the previous character search when a new one starts', async () => {
    const user = userEvent.setup();
    render(<WorkItemModal show item={null} defaultStatus="To Do" onClose={() => {}} onSave={() => {}} />);

    await user.type(screen.getByLabelText('Rick and Morty Character'), 'r');
    await waitFor(() => expect(mockedSearchCharacters).toHaveBeenCalledTimes(1));
    const firstSignal = mockedSearchCharacters.mock.calls[0][1];

    await user.type(screen.getByLabelText('Rick and Morty Character'), 'ick');
    await waitFor(() => expect(mockedSearchCharacters).toHaveBeenCalledTimes(2));

    expect(firstSignal?.aborted).toBe(true);
  });

  it('calls onClose without saving when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    render(<WorkItemModal show item={null} defaultStatus="To Do" onClose={handleClose} onSave={handleSave} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(handleClose).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });
});
