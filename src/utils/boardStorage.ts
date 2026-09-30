import type { BoardItem } from "../types/board";

const STORAGE_KEY = "trello_boards";

const defaultBoards: BoardItem[] = [
  {
    id: 1,
    title: "My Trello Board",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    starred: true,

    lists: [
      {
        id: 101,
        title: "To Do",
        cards: [
          {
            id: 1001,
            title: "Create project",
          },
          {
            id: 1002,
            title: "Design dashboard",
          },
        ],
      },
      {
        id: 102,
        title: "In Progress",
        cards: [
          {
            id: 1003,
            title: "Create login page",
          },
        ],
      },
      {
        id: 103,
        title: "Done",
        cards: [
          {
            id: 1004,
            title: "Create React project",
          },
        ],
      },
    ],
  },

  {
    id: 2,
    title: "Python Project",
    background: "linear-gradient(135deg, #11998e, #38ef7d)",
    starred: false,

    lists: [
      {
        id: 201,
        title: "To Do",
        cards: [
          {
            id: 2001,
            title: "Create Python API",
          },
          {
            id: 2002,
            title: "Connect database",
          },
        ],
      },
      {
        id: 202,
        title: "In Progress",
        cards: [],
      },
      {
        id: 203,
        title: "Completed",
        cards: [],
      },
    ],
  },
];

export function getBoards(): BoardItem[] {
  const savedBoards = localStorage.getItem(STORAGE_KEY);

  if (!savedBoards) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultBoards)
    );

    return defaultBoards;
  }

  try {
    return JSON.parse(savedBoards) as BoardItem[];
  } catch {
    return defaultBoards;
  }
}

export function saveBoards(boards: BoardItem[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(boards)
  );
}

export function getBoardById(
  id: number
): BoardItem | undefined {
  const boards = getBoards();

  return boards.find(
    (board) => board.id === id
  );
}