import { describe, expect, it } from 'vitest';
import { groupByStatus, moveWorkItem } from './workItems';
import type { WorkItem } from '../types';

const rick = { id: 'c1', name: 'Rick Sanchez', image: 'rick.png' };

function makeItem(id: string, status: WorkItem['status']): WorkItem {
  return { id, name: `Item ${id}`, status, character: rick };
}

describe('groupByStatus', () => {
  it('buckets items by status while preserving order', () => {
    const items = [makeItem('1', 'To Do'), makeItem('2', 'Doing'), makeItem('3', 'To Do')];

    const groups = groupByStatus(items);

    expect(groups['To Do'].map((i) => i.id)).toEqual(['1', '3']);
    expect(groups.Doing.map((i) => i.id)).toEqual(['2']);
    expect(groups.Done).toEqual([]);
  });
});

describe('moveWorkItem', () => {
  it('returns the same items when there is no destination (dropped outside any column)', () => {
    const items = [makeItem('1', 'To Do')];

    const result = moveWorkItem(items, { status: 'To Do', index: 0 }, null);

    expect(result).toBe(items);
  });

  it('is a no-op when dropped in the same column at the same index', () => {
    const items = [makeItem('1', 'To Do'), makeItem('2', 'To Do')];

    const result = moveWorkItem(
      items,
      { status: 'To Do', index: 0 },
      { status: 'To Do', index: 0 },
    );

    expect(result).toBe(items);
  });

  it('reorders items within the same column, shifting siblings', () => {
    const items = [makeItem('1', 'To Do'), makeItem('2', 'To Do'), makeItem('3', 'To Do')];

    const result = moveWorkItem(
      items,
      { status: 'To Do', index: 0 },
      { status: 'To Do', index: 2 },
    );

    expect(result.map((i) => i.id)).toEqual(['2', '3', '1']);
    expect(result.every((i) => i.status === 'To Do')).toBe(true);
  });

  it('moves an item to a different column and updates its status', () => {
    const items = [makeItem('1', 'To Do'), makeItem('2', 'Doing')];

    const result = moveWorkItem(
      items,
      { status: 'To Do', index: 0 },
      { status: 'Doing', index: 0 },
    );

    const moved = result.find((i) => i.id === '1');
    expect(moved?.status).toBe('Doing');
    expect(groupByStatus(result)['To Do']).toEqual([]);
    expect(groupByStatus(result).Doing.map((i) => i.id)).toEqual(['1', '2']);
  });

  it('inserts at the requested index within the destination column', () => {
    const items = [
      makeItem('1', 'To Do'),
      makeItem('2', 'Doing'),
      makeItem('3', 'Doing'),
    ];

    const result = moveWorkItem(
      items,
      { status: 'To Do', index: 0 },
      { status: 'Doing', index: 1 },
    );

    expect(groupByStatus(result).Doing.map((i) => i.id)).toEqual(['2', '1', '3']);
  });

  it('does not mutate the original items array', () => {
    const items = [makeItem('1', 'To Do'), makeItem('2', 'Doing')];
    const snapshot = JSON.parse(JSON.stringify(items));

    moveWorkItem(items, { status: 'To Do', index: 0 }, { status: 'Doing', index: 0 });

    expect(items).toEqual(snapshot);
  });
});
