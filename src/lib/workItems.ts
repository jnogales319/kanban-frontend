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
