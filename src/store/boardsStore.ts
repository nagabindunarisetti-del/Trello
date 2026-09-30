// src/store/boardsStore.ts

export interface Board {
  id: string;
  name: string;
  starred?: boolean;
  createdAt?: string;
}

const STORAGE_KEY = "taskflow_boards";

/**
 * Get all boards from localStorage
 */
export const getBoards = (): Board[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const boards = JSON.parse(stored);

    if (!Array.isArray(boards)) {
      return [];
    }

    return boards;
  } catch (error) {
    console.error("Error loading boards:", error);
    return [];
  }
};

/**
 * Save all boards to localStorage
 */
export const saveBoards = (boards: Board[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));

    // Tell other components that boards changed
    window.dispatchEvent(new Event("boardsUpdated"));
  } catch (error) {
    console.error("Error saving boards:", error);
  }
};

/**
 * Create a new board
 */
export const createBoard = (name: string): Board => {
  const newBoard: Board = {
    id: crypto.randomUUID(),
    name: name.trim(),
    starred: false,
    createdAt: new Date().toISOString(),
  };

  const boards = getBoards();

  saveBoards([...boards, newBoard]);

  return newBoard;
};

/**
 * Update a board
 */
export const updateBoard = (
  id: string,
  updates: Partial<Board>
): Board[] => {
  const boards = getBoards();

  const updatedBoards = boards.map((board) =>
    board.id === id
      ? {
          ...board,
          ...updates,
        }
      : board
  );

  saveBoards(updatedBoards);

  return updatedBoards;
};

/**
 * Delete a board
 */
export const deleteBoard = (id: string): void => {
  const boards = getBoards();

  const updatedBoards = boards.filter(
    (board) => board.id !== id
  );

  saveBoards(updatedBoards);
};

/**
 * Get a single board
 */
export const getBoardById = (
  id: string
): Board | undefined => {
  const boards = getBoards();

  return boards.find((board) => board.id === id);
};

/**
 * Toggle starred status
 */
export const toggleBoardStar = (
  id: string
): Board[] => {
  const boards = getBoards();

  const updatedBoards = boards.map((board) =>
    board.id === id
      ? {
          ...board,
          starred: !board.starred,
        }
      : board
  );

  saveBoards(updatedBoards);

  return updatedBoards;
};