import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { searchCharacters } from './api/rickAndMorty';

vi.mock('./api/rickAndMorty', () => ({
  searchCharacters: vi.fn(),
}));

const rick = { id: '1', name: 'Rick Sanchez', image: 'rick.png' };

beforeEach(() => {
  vi.mocked(searchCharacters).mockReset();
  vi.mocked(searchCharacters).mockResolvedValue([rick]);
});

function column(status: 'To Do' | 'Doing' | 'Done') {
  return within(screen.getByTestId(`column-${status}`));
}

async function addWorkItem(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: /add work item/i }));
  await user.type(screen.getByLabelText('Name'), name);
  await user.type(screen.getByLabelText('Rick and Morty Character'), 'rick');
  await user.click(await screen.findByText('Rick Sanchez'));
  await user.click(screen.getByRole('button', { name: /add item/i }));
  await waitForElementToBeRemoved(() => screen.queryByText('Add Work Item'));
}

describe('App', () => {
  it('adds a new work item to the To Do column', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addWorkItem(user, 'Prepare demo');

    expect(column('To Do').getByText('Prepare demo')).toBeInTheDocument();
    expect(column('To Do').getByText('1')).toBeInTheDocument();
    expect(column('Doing').getByText('0')).toBeInTheDocument();
    expect(column('Done').getByText('0')).toBeInTheDocument();
  });

  it('moves an item to the Done column when its status is edited', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addWorkItem(user, 'Ship feature');

    await user.click(screen.getByText('Ship feature'));
    await user.selectOptions(screen.getByLabelText('Status'), 'Done');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(column('Done').getByText('Ship feature')).toBeInTheDocument();
    expect(column('Done').getByText('1')).toBeInTheDocument();
    expect(column('To Do').getByText('0')).toBeInTheDocument();
  });

  it('preserves an item across edits that do not change its status', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addWorkItem(user, 'Original name');

    await user.click(screen.getByText('Original name'));
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Renamed item');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(column('To Do').getByText('Renamed item')).toBeInTheDocument();
    expect(column('To Do').getByText('1')).toBeInTheDocument();
  });
});
