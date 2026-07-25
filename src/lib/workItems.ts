import { STATUSES } from '../types';
import type { Status, WorkItem } from '../types';

export interface DragPoint {
  status: Status;
  index: number;
}

export function groupByStatus(items: WorkItem[]): Record<Status, WorkItem[]> {
  const groups = Object.fromEntries(
    STATUSES.map((status) => [status, [] as WorkItem[]]),
  ) as Record<Status, WorkItem[]>;
  for (const item of items) {
    groups[item.status].push(item);
  }
  return groups;
}

export function moveWorkItem(
  items: WorkItem[],
  source: DragPoint,
  destination: DragPoint | null,
): WorkItem[] {
  if (!destination) return items;
  if (source.status === destination.status && source.index === destination.index) {
    return items;
  }

  const groups = groupByStatus(items);

  const sourceList = [...groups[source.status]];
  const [moved] = sourceList.splice(source.index, 1);

  const destinationList =
    source.status === destination.status ? sourceList : [...groups[destination.status]];
  destinationList.splice(destination.index, 0, { ...moved, status: destination.status });

  const updatedGroups: Record<Status, WorkItem[]> = {
    ...groups,
    [source.status]: sourceList,
    [destination.status]: destinationList,
  };

  return STATUSES.flatMap((status) => updatedGroups[status]);
}

/**
 * Finds an item that just transitioned into Done, comparing against its
 * previous status. Reordering within Done, edits that don't touch status,
 * and brand-new items created directly with Done status all return null —
 * only an existing item crossing into Done counts as "newly completed".
 */
export function findNewlyCompletedItem(previous: WorkItem[], next: WorkItem[]): WorkItem | null {
  for (const item of next) {
    const before = previous.find((i) => i.id === item.id);
    if (before && before.status !== 'Done' && item.status === 'Done') {
      return item;
    }
  }
  return null;
}
