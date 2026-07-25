export const STATUSES = ['To Do', 'Doing', 'Done'] as const;

export type Status = (typeof STATUSES)[number];

export interface Character {
  id: string;
  name: string;
  image: string;
}

export interface WorkItem {
  id: string;
  name: string;
  status: Status;
  character: Character;
}
