export interface CardItem {
  id: number;
  title: string;
}

export interface ListItem {
  id: number;
  title: string;
  cards: CardItem[];

  // List actions
  color?: string;
  pinned?: boolean;
  watching?: boolean;
}

export interface BoardItem {
  id: number;
  title: string;
  background: string;
  starred: boolean;
  lists: ListItem[];
}