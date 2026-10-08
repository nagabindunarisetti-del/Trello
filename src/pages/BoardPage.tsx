import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent, ReactNode } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Modal,
  Popover,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ChatIcon from "@mui/icons-material/Chat";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import LinkIcon from "@mui/icons-material/Link";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PersonIcon from "@mui/icons-material/Person";

import PostAddIcon from "@mui/icons-material/PostAdd";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";
import SubjectIcon from "@mui/icons-material/Subject";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { useNavigate, useParams } from "react-router-dom";

import { getBoards, saveBoards } from "../utils/boardStorage";
import type { BoardItem } from "../types/board";

type LabelItem = { id: string; name: string; color: string };

type ChecklistItem = { id: number; text: string; done: boolean };

type Checklist = { id: number; title: string; items: ChecklistItem[] };

/* An attachment is either a pasted link or an uploaded file.
   Uploaded files are stored as a data URL so they survive a refresh. */
type AttachmentItem = {
  id: number;
  name: string;
  url: string;
  kind?: "link" | "file";
  mime?: string;
  size?: number;
};

type CommentItem = { id: number; text: string; time: number };

type ActivityItem = { id: number; text: string; time: number; detail: boolean };

type CardItem = {
  id: number;
  title: string;
  color?: string; 
  description?: string;
  labels?: LabelItem[];
  members?: string[];
  startDate?: string; 
  dueDate?: string; 
  completed?: boolean;
  checklists?: Checklist[];
  attachments?: AttachmentItem[];
  comments?: CommentItem[];
  activity?: ActivityItem[];
  watching?: boolean;
  archived?: boolean;
  createdAt?: number;
};

type ListItem = {
  id: number;
  title: string;
  cards: CardItem[];
  color?: string;
  pinned?: boolean;
  watching?: boolean;
};

type PopoverKind =
  | "add"
  | "labels"
  | "members"
  | "cover"
  | "dates"
  | "move"
  | "checklist"
  | "attachment"
  | "more";

type FeedEntry = {
  key: string;
  time: number;
  text: string;
  commentId?: number;
};

type PopoverState = {
  kind: PopoverKind;
  anchor: HTMLElement;
  cardId: number;
};


type UndoSnapshot = { board: BoardItem; message: string };

const CURRENT_USER = "Naga Bindu Narisetti";

/* Uploaded files are kept in browser storage, so keep each one small. */
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const LIST_COLORS = [
  "#0F766E",
  "#B7791F",
  "#C2410C",
  "#DC2626",
  "#7C3AED",
  "#2563EB",
  "#0891B2",
  "#4D7C0F",
  "#BE185D",
  "#64748B",
];

const DEFAULT_CARD_COLOR = "#0E1012";

const CARD_COLORS = [
  "#0E1012", 
  "#164B35", 
  "#533F04", 
  "#5F3811", 
  "#5D1F1A", 
  "#352C63", 
  "#09326C", 
  "#164555", 
  "#50253F", 
  "#454F59", 
];

const LABEL_PALETTE = [
  "#4BCE97",
  "#F5CD47",
  "#FEA362",
  "#F87168",
  "#9F8FEF",
  "#579DFF",
  "#60C6D2",
  "#F797D2",
];

const DEFAULT_LABELS: LabelItem[] = [
  { id: "d-green", name: "Done", color: LABEL_PALETTE[0] },
  { id: "d-yellow", name: "Important", color: LABEL_PALETTE[1] },
  { id: "d-orange", name: "Warning", color: LABEL_PALETTE[2] },
  { id: "d-red", name: "Urgent", color: LABEL_PALETTE[3] },
  { id: "d-purple", name: "Idea", color: LABEL_PALETTE[4] },
  { id: "d-blue", name: "Info", color: LABEL_PALETTE[5] },
];

const CARD_TEXT = "#FFFFFF";
const CARD_MUTED = "#F1F5F9";
const FOCUS_BLUE = "#579DFF";
const PANEL_BG = "#16181B";

const DEFAULT_BOARD_BACKGROUND =
  "linear-gradient(160deg, #3B2A6B 0%, #7A4A8C 55%, #A24F87 100%)";

const darkButtonSx = {
  textTransform: "none",
  color: "#FFFFFF",
  backgroundColor: "rgba(255,255,255,0.16)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: 1.5,
  fontWeight: 700,
  fontSize: 14,
  px: 1.5,
  minHeight: 38,
  "&:hover": { backgroundColor: "rgba(255,255,255,0.26)" },
} satisfies SxProps<Theme>;

const primaryButtonSx = {
  minHeight: 32,
  px: 1.5,
  borderRadius: 1.5,
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "none",
  color: "#101204",
  backgroundColor: FOCUS_BLUE,
  "&:hover": { backgroundColor: "#85B8FF", boxShadow: "none" },
  "&.Mui-disabled": {
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.35)",
  },
} satisfies SxProps<Theme>;

const ghostButtonSx = {
  minHeight: 32,
  px: 1.25,
  borderRadius: 1.5,
  textTransform: "none",
  fontWeight: 600,
  color: CARD_TEXT,
  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
} satisfies SxProps<Theme>;

const fieldRootSx = {
  color: CARD_TEXT,
  backgroundColor: DEFAULT_CARD_COLOR,
  borderRadius: 1.5,
  fontSize: 14,
  alignItems: "flex-start",
  "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
  "&:hover fieldset": { borderColor: FOCUS_BLUE },
  "&.Mui-focused fieldset": { borderColor: FOCUS_BLUE, borderWidth: 2 },
};

const darkFieldSx = {
  "& .MuiOutlinedInput-root": fieldRootSx,
  "& input::placeholder, & textarea::placeholder": {
    color: CARD_MUTED,
    opacity: 1,
  },
  "& input[type='date']": { colorScheme: "dark" },
} satisfies SxProps<Theme>;

/* ---- card dialog (white side): dark, high-contrast text ---- */
const L_TEXT = "#0B1220";
const L_MUTED = "#334155";

const lightButtonSx = {
  textTransform: "none",
  color: L_TEXT,
  backgroundColor: "#F1F2F4",
  border: "1px solid #B6C2CF",
  borderRadius: 1.5,
  fontWeight: 700,
  fontSize: 14,
  px: 1.5,
  minHeight: 38,
  "&:hover": { backgroundColor: "#DCDFE4" },
} satisfies SxProps<Theme>;

const lightGhostButtonSx = {
  minHeight: 32,
  px: 1.25,
  borderRadius: 1.5,
  textTransform: "none",
  fontWeight: 700,
  color: L_TEXT,
  "&:hover": { backgroundColor: "rgba(9,30,66,0.08)" },
} satisfies SxProps<Theme>;

const lightFieldRootSx = {
  color: L_TEXT,
  backgroundColor: "#FFFFFF",
  borderRadius: 1.5,
  fontSize: 14,
  alignItems: "flex-start",
  "& fieldset": { borderColor: "#8590A2" },
  "&:hover fieldset": { borderColor: FOCUS_BLUE },
  "&.Mui-focused fieldset": { borderColor: FOCUS_BLUE, borderWidth: 2 },
};

const lightFieldSx = {
  "& .MuiOutlinedInput-root": lightFieldRootSx,
  "& input::placeholder, & textarea::placeholder": {
    color: L_MUTED,
    opacity: 1,
  },
} satisfies SxProps<Theme>;

const uid = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);

const resolveCardColor = (color?: string) =>
  !color ||
  color.toUpperCase() === "#FFFFFF" ||
  color.toUpperCase() === "#22272B"
    ? DEFAULT_CARD_COLOR
    : color;

const hasCover = (color?: string) =>
  resolveCardColor(color) !== DEFAULT_CARD_COLOR;

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mixHex = (
  hex: string,
  target: [number, number, number],
  amount: number
) => {
  const [r, g, b] = hexToRgb(hex);
  const mixed = [r, g, b].map((channel, i) =>
    Math.round(channel + (target[i] - channel) * amount)
  );
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
};

const getListTheme = (color?: string) => {
  if (!color) {
    return {
      bg: "#101204",
      title: "#FFFFFF",
      accent: CARD_MUTED,
      hover: "rgba(255,255,255,0.12)",
    };
  }

  return {
    bg: mixHex(color, [0, 0, 0], 0.6),
    title: mixHex(color, [255, 255, 255], 0.7),
    accent: mixHex(color, [255, 255, 255], 0.6),
    hover: "rgba(255,255,255,0.14)",
  };
};

const getLists = (b: BoardItem): ListItem[] =>
  ((b.lists as unknown as ListItem[]) || []).map((list) => ({
    ...list,
    cards: list.cards || [],
  }));

const withLists = (b: BoardItem, lists: ListItem[]): BoardItem => ({
  ...b,
  lists: lists as unknown as BoardItem["lists"],
});

const withLog = (card: CardItem, text: string, detail = true): CardItem => ({
  ...card,
  activity: [
    ...(card.activity || []),
    { id: uid(), text, time: Date.now(), detail },
  ],
});

const createdAtOf = (card: CardItem) =>
  card.createdAt ?? (card.id < 1e14 ? card.id : Math.floor(card.id / 1000));

const formatDateTime = (time: number) =>
  new Date(time).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const formatDay = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const dateRangeLabel = (card: CardItem) => {
  if (card.startDate && card.dueDate) {
    return `${formatDay(card.startDate)} - ${formatDay(card.dueDate)}`;
  }
  if (card.dueDate) return formatDay(card.dueDate);
  if (card.startDate) return `Starts ${formatDay(card.startDate)}`;
  return "";
};

const dueTone = (card: CardItem) => {
  if (!card.dueDate && !card.startDate) return null;
  if (!card.dueDate) return { bg: "rgba(255,255,255,0.12)", fg: CARD_TEXT };
  if (card.completed) return { bg: "#4BCE97", fg: "#1D2125" };

  const due = new Date(`${card.dueDate}T23:59:59`).getTime();
  const now = Date.now();

  if (due < now) return { bg: "#F87168", fg: "#1D2125" };
  if (due - now < 24 * 60 * 60 * 1000) return { bg: "#F5CD47", fg: "#1D2125" };
  return { bg: "rgba(255,255,255,0.12)", fg: CARD_TEXT };
};

const initialsOf = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const AVATAR_COLORS = ["#5E4DB2", "#1D7F8C", "#B65C02", "#AE2E24", "#206A83"];

const avatarColorFor = (name: string) => {
  if (name === CURRENT_USER) return "#5E4DB2";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const normalizeUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

const formatSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });


const cardMatchesQuery = (card: CardItem, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    card.title.toLowerCase().includes(q) ||
    (card.description || "").toLowerCase().includes(q) ||
    (card.labels || []).some((label) => label.name.toLowerCase().includes(q)) ||
    (card.members || []).some((name) => name.toLowerCase().includes(q))
  );
};


function MemberAvatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <Tooltip title={name}>
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          fontWeight: 700,
          bgcolor: avatarColorFor(name),
          color: "#fff",
        }}
      >
        {initialsOf(name)}
      </Avatar>
    </Tooltip>
  );
}

function SectionHead({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.25 }}>
      <Box sx={{ color: L_MUTED, display: "flex" }}>{icon}</Box>
      <Typography
        sx={{ flex: 1, fontSize: 16, fontWeight: 700, color: L_TEXT }}
      >
        {title}
      </Typography>
      {action}
    </Box>
  );
}

function PopHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        pt: 1.25,
        pb: 0.75,
      }}
    >
      <Box sx={{ width: 28 }} />
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: CARD_MUTED }}>
        {title}
      </Typography>
      <IconButton
        size="small"
        onClick={onClose}
        sx={{ color: CARD_MUTED, width: 28, height: 28 }}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}


function BoardPage() {
  const navigate = useNavigate();
  const { id } = useParams();

 
  const [board, setBoard] = useState<BoardItem | null>(null);
  const boardRef = useRef<BoardItem | null>(null);


  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(null);

  const [listMenuAnchor, setListMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [collapsedLists, setCollapsedLists] = useState<number[]>([]);
  const [renamingListId, setRenamingListId] = useState<number | null>(null);
  const [listTitleDraft, setListTitleDraft] = useState("");
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const [addingCardToList, setAddingCardToList] = useState<number | null>(
    null
  );
  const [newCardTitle, setNewCardTitle] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "card" | "list";
    id: number;
  } | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [snack, setSnack] = useState("");

  const [quickEdit, setQuickEdit] = useState<{
    cardId: number;
    rect: { top: number; left: number; width: number };
  } | null>(null);
  const [quickTitle, setQuickTitle] = useState("");


  const [openCardId, setOpenCardId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [addingItemTo, setAddingItemTo] = useState<number | null>(null);
  const [itemDraft, setItemDraft] = useState("");

  
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState(LABEL_PALETTE[0]);
  const [memberName, setMemberName] = useState("");
  const [startDraft, setStartDraft] = useState("");
  const [dueDraft, setDueDraft] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("Checklist");
  const [attachUrl, setAttachUrl] = useState("");
  const [attachName, setAttachName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const boards = getBoards();
    const found =
      boards.find((item) => String(item.id) === String(id)) || null;

    boardRef.current = found;
    setBoard(found);

    const cardParam = new URLSearchParams(window.location.search).get("card");
    if (found && cardParam) setOpenCardId(Number(cardParam));
  }, [id]);


  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === "Escape" && !typing) {
        setQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  
  const commit = (fn: (current: ListItem[]) => ListItem[]) => {
    const current = boardRef.current;
    if (!current) return;

    const next = withLists(current, fn(getLists(current)));
    boardRef.current = next;
    setBoard(next);

    saveBoards(
      getBoards().map((item) => (item.id === next.id ? next : item))
    );
  };

  const updateCard = (cardId: number, fn: (card: CardItem) => CardItem) =>
    commit((lists) =>
      lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) => (card.id === cardId ? fn(card) : card)),
      }))
    );

  const lists: ListItem[] = board ? getLists(board) : [];

  const findCard = (cardId: number | null) => {
    if (cardId === null) return null;
    for (const list of lists) {
      const card = list.cards.find((item) => item.id === cardId);
      if (card) return { list, card };
    }
    return null;
  };

  const selectedList = lists.find((list) => list.id === selectedListId);

  /* everybody who is on any card (used by the members popover) */
  const memberPool = Array.from(
    new Set([
      CURRENT_USER,
      ...lists.flatMap((list) =>
        list.cards.flatMap((card) => card.members || [])
      ),
    ])
  );

  /* custom labels created on any card, so they stay selectable after being replaced */
  const customLabelPool: LabelItem[] = (() => {
    const seen = new Set<string>(DEFAULT_LABELS.map((label) => label.id));
    const result: LabelItem[] = [];

    lists.forEach((list) =>
      list.cards.forEach((card) =>
        (card.labels || []).forEach((label) => {
          if (!seen.has(label.id)) {
            seen.add(label.id);
            result.push(label);
          }
        })
      )
    );

    return result;
  })();

  const notify = (message: string) => setSnack(message);

  const snapshotForUndo = (message: string) => {
    if (boardRef.current) {
      setUndoSnapshot({ board: boardRef.current, message });
    }
  };

  const undoLastAction = () => {
    if (!undoSnapshot) return;
    boardRef.current = undoSnapshot.board;
    setBoard(undoSnapshot.board);
    saveBoards(
      getBoards().map((item) =>
        item.id === undoSnapshot.board.id ? undoSnapshot.board : item
      )
    );
    setUndoSnapshot(null);
    setSnack("");
  };


  const onDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

   
    if (type === "LIST") {
      commit((current) => {
        const next = [...current];
        const [moved] = next.splice(source.index, 1);
        next.splice(destination.index, 0, moved);
        return next;
      });
      return;
    }

    const cardId = Number(draggableId.replace("card-", ""));
    const fromListId = Number(source.droppableId.replace("list-", ""));
    const toListId = Number(destination.droppableId.replace("list-", ""));
    const fromListTitle = lists.find((list) => list.id === fromListId)?.title;

    commit((current) => {
      const moved = current
        .flatMap((list) => list.cards)
        .find((card) => card.id === cardId);
      if (!moved) return current;

      const withoutMoved = current.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId),
      }));

      return withoutMoved.map((list) => {
        if (list.id !== toListId) return list;

        /* destination.index only counts the cards that are currently
           visible (not archived, and matching the active search) */
        const visible = list.cards.filter(
          (card) => !card.archived && cardMatchesQuery(card, query)
        );
        const anchor = visible[destination.index];
        const cards = [...list.cards];
        const insertAt = anchor
          ? cards.findIndex((card) => card.id === anchor.id)
          : cards.length;

        const cardToInsert =
          fromListId !== toListId
            ? withLog(
                moved,
                `moved this card from ${fromListTitle} to ${list.title}`
              )
            : moved;

        cards.splice(insertAt, 0, cardToInsert);
        return { ...list, cards };
      });
    });
  };


  const toggleCollapse = (listId: number) =>
    setCollapsedLists((prev) =>
      prev.includes(listId)
        ? prev.filter((item) => item !== listId)
        : [...prev, listId]
    );

  const handleAddList = () => {
    const title = newListTitle.trim();
    if (!title) return;

    commit((current) => [...current, { id: uid(), title, cards: [] }]);
    setNewListTitle("");
  };

  const handleCancelAddList = () => {
    setAddingList(false);
    setNewListTitle("");
  };

  const startRenameList = (list: ListItem) => {
    setRenamingListId(list.id);
    setListTitleDraft(list.title);
  };

  const saveRenameList = () => {
    const title = listTitleDraft.trim();

    if (renamingListId !== null && title) {
      commit((current) =>
        current.map((list) =>
          list.id === renamingListId ? { ...list, title } : list
        )
      );
    }

    setRenamingListId(null);
    setListTitleDraft("");
  };

  const handleOpenListMenu = (
    event: MouseEvent<HTMLElement>,
    listId: number
  ) => {
    event.stopPropagation();
    setListMenuAnchor(event.currentTarget);
    setSelectedListId(listId);
  };

  const handleCloseListMenu = () => {
    setListMenuAnchor(null);
    setSelectedListId(null);
  };

  const handleCopyList = () => {
    if (selectedListId === null) return;

    commit((current) => {
      const index = current.findIndex((list) => list.id === selectedListId);
      if (index < 0) return current;

      const original = current[index];
      const copied: ListItem = {
        ...original,
        id: uid(),
        title: `${original.title} copy`,
        cards: original.cards.map((card) => ({
          ...card,
          id: uid(),
          createdAt: Date.now(),
          comments: [],
          activity: [],
        })),
      };

      const next = [...current];
      next.splice(index + 1, 0, copied);
      return next;
    });

    handleCloseListMenu();
  };

  const handleMoveList = (direction: -1 | 1) => {
    if (selectedListId === null) return;

    commit((current) => {
      const index = current.findIndex((list) => list.id === selectedListId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

    handleCloseListMenu();
  };

  const handleToggleListFlag = (flag: "pinned" | "watching") => {
    if (selectedListId === null) return;

    commit((current) =>
      current.map((list) =>
        list.id === selectedListId ? { ...list, [flag]: !list[flag] } : list
      )
    );

    handleCloseListMenu();
  };

  const handleChangeListColor = (color: string) => {
    if (selectedListId === null) return;

    commit((current) =>
      current.map((list) =>
        list.id === selectedListId ? { ...list, color } : list
      )
    );

    handleCloseListMenu();
  };

  const handleRemoveListColor = () => {
    if (selectedListId === null) return;

    commit((current) =>
      current.map((list) => {
        if (list.id !== selectedListId) return list;
        const updated = { ...list };
        delete updated.color;
        return updated;
      })
    );

    handleCloseListMenu();
  };

  const handleSortListByName = () => {
    if (selectedListId === null) return;

    commit((current) =>
      current.map((list) =>
        list.id === selectedListId
          ? {
              ...list,
              cards: [...list.cards].sort((a, b) =>
                a.title.localeCompare(b.title)
              ),
            }
          : list
      )
    );

    handleCloseListMenu();
  };

  const handleArchiveAllCardsInList = () => {
    if (selectedListId === null) return;

    commit((current) =>
      current.map((list) =>
        list.id === selectedListId
          ? { ...list, cards: list.cards.map((card) => ({ ...card, archived: true })) }
          : list
      )
    );

    notify("All cards archived");
    handleCloseListMenu();
  };

  const handleDeleteList = () => {
    if (selectedListId === null) return;
    snapshotForUndo("List deleted");
    setDeleteTarget({ type: "list", id: selectedListId });
    setListMenuAnchor(null);
  };

  const handleStartAddCard = (listId: number) => {
    setAddingCardToList(listId);
    setNewCardTitle("");
    handleCloseListMenu();
  };

  const handleAddCard = (listId: number) => {
    const title = newCardTitle.trim();
    if (!title) return;

    const newCard: CardItem = {
      id: uid(),
      title,
      createdAt: Date.now(),
    };

    commit((current) =>
      current.map((list) =>
        list.id === listId
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      )
    );

    setNewCardTitle("");
    /* form stays open so several cards can be added quickly */
  };

  const handleCancelAddCard = () => {
    setAddingCardToList(null);
    setNewCardTitle("");
  };

  const copyCard = (cardId: number) => {
    commit((current) =>
      current.map((list) => {
        const index = list.cards.findIndex((card) => card.id === cardId);
        if (index < 0) return list;

        const source = list.cards[index];
        const copy: CardItem = {
          ...source,
          id: uid(),
          title: `${source.title} copy`,
          createdAt: Date.now(),
          comments: [],
          activity: [],
        };

        const cards = [...list.cards];
        cards.splice(index + 1, 0, copy);
        return { ...list, cards };
      })
    );
    notify("Card copied");
  };

  const copyCardLink = async (cardId: number) => {
    const link = `${window.location.origin}${window.location.pathname}?card=${cardId}`;
    try {
      await navigator.clipboard.writeText(link);
      notify("Link copied to clipboard");
    } catch {
      notify(link);
    }
  };

  const archiveCard = (cardId: number) => {
    snapshotForUndo("Card archived");
    updateCard(cardId, (card) => ({ ...card, archived: true }));
    notify("Card archived");
  };

  const restoreCard = (cardId: number) =>
    updateCard(cardId, (card) => ({ ...card, archived: false }));

  const moveCard = (cardId: number, destListId: number) => {
    const found = findCard(cardId);
    const destination = lists.find((list) => list.id === destListId);
    if (!found || !destination || found.list.id === destListId) return;

    const moved = withLog(
      found.card,
      `moved this card from ${found.list.title} to ${destination.title}`
    );

    commit((current) =>
      current.map((list) => {
        if (list.id === found.list.id) {
          return { ...list, cards: list.cards.filter((c) => c.id !== cardId) };
        }
        if (list.id === destListId) {
          return { ...list, cards: [...list.cards, moved] };
        }
        return list;
      })
    );

    notify(`Moved to ${destination.title}`);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "card") {
      snapshotForUndo("Card deleted");
      commit((current) =>
        current.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== deleteTarget.id),
        }))
      );
      if (openCardId === deleteTarget.id) setOpenCardId(null);
      notify("Card deleted");
    } else {
      commit((current) =>
        current.filter((list) => list.id !== deleteTarget.id)
      );
      notify("List deleted");
    }

    setDeleteTarget(null);
  };


  const resetModalUi = () => {
    setEditingTitle(false);
    setEditingDesc(false);
    setShowDetails(false);
    setCommentOpen(false);
    setCommentDraft("");
    setAddingItemTo(null);
    setItemDraft("");
  };

  const openCardModal = (cardId: number) => {
    resetModalUi();
    setOpenCardId(cardId);
  };

  const closeCardModal = () => {
    setPopover(null);
    setOpenCardId(null);
  };

  const toggleComplete = (card: CardItem) =>
    updateCard(card.id, (c) =>
      withLog(
        { ...c, completed: !c.completed },
        `marked this card ${c.completed ? "incomplete" : "complete"}`
      )
    );

  const toggleWatch = (card: CardItem) => {
    updateCard(card.id, (c) => ({ ...c, watching: !c.watching }));
    notify(card.watching ? "Stopped watching card" : "Watching card");
  };

  const saveTitle = (card: CardItem) => {
    const title = titleDraft.trim();
    if (title && title !== card.title) {
      updateCard(card.id, (c) => ({ ...c, title }));
    }
    setEditingTitle(false);
  };

  const saveDescription = (card: CardItem) => {
    updateCard(card.id, (c) => ({ ...c, description: descDraft.trim() }));
    setEditingDesc(false);
  };

  const addComment = (card: CardItem) => {
    const text = commentDraft.trim();
    if (!text) return;

    updateCard(card.id, (c) => ({
      ...c,
      comments: [...(c.comments || []), { id: uid(), text, time: Date.now() }],
    }));
    setCommentDraft("");
    setCommentOpen(false);
  };

  const deleteComment = (cardId: number, commentId: number) =>
    updateCard(cardId, (c) => ({
      ...c,
      comments: (c.comments || []).filter((item) => item.id !== commentId),
    }));

  /* labels
     A card holds ONE label. Clicking another label replaces the current one.
     Clicking the label that is already on the card removes it. */
  const selectLabel = (cardId: number, label: LabelItem) =>
    updateCard(cardId, (c) => {
      const current = c.labels || [];
      const name = label.name || "unnamed";
      const isOnlyLabel = current.length === 1 && current[0].id === label.id;

      if (isOnlyLabel) {
        return withLog({ ...c, labels: [] }, `removed the ${name} label`);
      }

      return withLog(
        { ...c, labels: [label] },
        current.length > 0
          ? `changed the label to ${name}`
          : `added the ${name} label`
      );
    });

  const createLabel = (cardId: number) => {
    const name = labelName.trim();
    if (!name) return;

    selectLabel(cardId, { id: `c-${uid()}`, name, color: labelColor });
    setLabelName("");
  };

  /* members */
  const toggleMember = (cardId: number, name: string) =>
    updateCard(cardId, (c) => {
      const current = c.members || [];
      const has = current.includes(name);

      return withLog(
        {
          ...c,
          members: has
            ? current.filter((item) => item !== name)
            : [...current, name],
        },
        `${has ? "removed" : "added"} ${name} ${has ? "from" : "to"} this card`
      );
    });

  const addMemberByName = (cardId: number) => {
    const name = memberName.trim();
    if (!name) return;

    const current = findCard(cardId)?.card.members || [];
    if (!current.includes(name)) toggleMember(cardId, name);
    setMemberName("");
  };

  /* dates */
  const saveDates = (cardId: number) => {
    updateCard(cardId, (c) =>
      withLog(
        {
          ...c,
          startDate: startDraft || undefined,
          dueDate: dueDraft || undefined,
        },
        "updated the dates on this card"
      )
    );
    setPopover(null);
  };

  const removeDates = (cardId: number) => {
    updateCard(cardId, (c) => {
      const updated = { ...c };
      delete updated.startDate;
      delete updated.dueDate;
      return withLog(updated, "removed the dates from this card");
    });
    setPopover(null);
  };

  /* cover */
  const changeCover = (cardId: number, color: string) =>
    updateCard(cardId, (c) => ({ ...c, color }));

  const removeCover = (cardId: number) =>
    updateCard(cardId, (c) => {
      const updated = { ...c };
      delete updated.color;
      return updated;
    });

  /* checklists */
  const addChecklist = (cardId: number) => {
    const title = checklistTitle.trim() || "Checklist";

    updateCard(cardId, (c) =>
      withLog(
        {
          ...c,
          checklists: [
            ...(c.checklists || []),
            { id: uid(), title, items: [] },
          ],
        },
        `added ${title} to this card`
      )
    );
    setPopover(null);
  };

  const updateChecklist = (
    cardId: number,
    checklistId: number,
    fn: (list: Checklist) => Checklist
  ) =>
    updateCard(cardId, (c) => ({
      ...c,
      checklists: (c.checklists || []).map((list) =>
        list.id === checklistId ? fn(list) : list
      ),
    }));

  const deleteChecklist = (cardId: number, checklistId: number) =>
    updateCard(cardId, (c) => ({
      ...c,
      checklists: (c.checklists || []).filter(
        (list) => list.id !== checklistId
      ),
    }));

  const addChecklistItem = (cardId: number, checklistId: number) => {
    const text = itemDraft.trim();
    if (!text) return;

    updateChecklist(cardId, checklistId, (list) => ({
      ...list,
      items: [...list.items, { id: uid(), text, done: false }],
    }));
    setItemDraft("");
  };

  /* attachments */

  /* attach a pasted link */
  const addAttachment = (cardId: number) => {
    const raw = attachUrl.trim();
    if (!raw) return;

    const url = normalizeUrl(raw);
    const name = attachName.trim() || url;

    updateCard(cardId, (c) =>
      withLog(
        {
          ...c,
          attachments: [
            ...(c.attachments || []),
            { id: uid(), name, url, kind: "link" },
          ],
        },
        `attached ${name} to this card`
      )
    );
    setPopover(null);
  };

  /* attach one or more files from the user's computer */
  const addFiles = async (cardId: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const tooBig = files.filter((file) => file.size > MAX_FILE_SIZE);
    const accepted = files.filter((file) => file.size <= MAX_FILE_SIZE);

    if (tooBig.length > 0) {
      notify(
        `${tooBig.map((file) => file.name).join(", ")} is larger than ${formatSize(
          MAX_FILE_SIZE
        )} and was skipped`
      );
    }
    if (accepted.length === 0) return;

    setUploading(true);

    try {
      const items: AttachmentItem[] = await Promise.all(
        accepted.map(async (file, index) => ({
          id: uid() + index,
          name: file.name,
          url: await readFileAsDataUrl(file),
          kind: "file" as const,
          mime: file.type,
          size: file.size,
        }))
      );

      updateCard(cardId, (c) =>
        withLog(
          { ...c, attachments: [...(c.attachments || []), ...items] },
          `attached ${items.map((item) => item.name).join(", ")} to this card`
        )
      );

      setPopover(null);
    } catch {
      notify("Could not attach the file. Browser storage may be full.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (cardId: number, event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    void addFiles(cardId, input.files);
    /* reset so the same file can be picked again */
    input.value = "";
  };

  const deleteAttachment = (cardId: number, attachmentId: number) =>
    updateCard(cardId, (c) => ({
      ...c,
      attachments: (c.attachments || []).filter(
        (item) => item.id !== attachmentId
      ),
    }));

  /* ============================================================
   *  POPOVER / QUICK EDIT CONTROL
   * ============================================================ */

  const openPopover = (
    kind: PopoverKind,
    anchor: HTMLElement,
    cardId: number
  ) => {
    const card = findCard(cardId)?.card;

    setLabelName("");
    setLabelColor(LABEL_PALETTE[0]);
    setMemberName("");
    setStartDraft(card?.startDate || "");
    setDueDraft(card?.dueDate || "");
    setChecklistTitle("Checklist");
    setAttachUrl("");
    setAttachName("");

    setPopover({ kind, anchor, cardId });
  };

  const openQuickEdit = (event: MouseEvent<HTMLElement>, card: CardItem) => {
    event.stopPropagation();

    const root = (event.currentTarget as HTMLElement).closest(
      "[data-card-root]"
    ) as HTMLElement | null;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    setQuickEdit({
      cardId: card.id,
      rect: { top: rect.top, left: rect.left, width: rect.width },
    });
    setQuickTitle(card.title);
  };

  const closeQuickEdit = (save = true) => {
    if (save && quickEdit) {
      const title = quickTitle.trim();
      const original = findCard(quickEdit.cardId)?.card.title;

      if (title && title !== original) {
        updateCard(quickEdit.cardId, (c) => ({ ...c, title }));
      }
    }
    setQuickEdit(null);
  };

  /* ============================================================
   *  RENDER HELPERS
   * ============================================================ */

  const renderBadges = (card: CardItem) => {
    const tone = dueTone(card);
    const checklistTotal = (card.checklists || []).reduce(
      (sum, list) => sum + list.items.length,
      0
    );
    const checklistDone = (card.checklists || []).reduce(
      (sum, list) => sum + list.items.filter((item) => item.done).length,
      0
    );
    const commentCount = (card.comments || []).length;
    const attachmentCount = (card.attachments || []).length;

    const badgeSx = {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      color: CARD_MUTED,
      fontSize: 12,
    };

    const items: ReactNode[] = [];

    if (tone) {
      items.push(
        <Box
          key="due"
          sx={{
            ...badgeSx,
            px: 0.75,
            py: 0.15,
            borderRadius: 1,
            backgroundColor: tone.bg,
            color: tone.fg,
            fontWeight: 600,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 14 }} />
          {dateRangeLabel(card)}
        </Box>
      );
    }

    if (card.watching) {
      items.push(
        <Box key="watch" sx={badgeSx}>
          <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
        </Box>
      );
    }

    if (card.description) {
      items.push(
        <Box key="desc" sx={badgeSx}>
          <SubjectIcon sx={{ fontSize: 15 }} />
        </Box>
      );
    }

    if (commentCount > 0) {
      items.push(
        <Box key="comments" sx={badgeSx}>
          <ChatIcon sx={{ fontSize: 14 }} />
          {commentCount}
        </Box>
      );
    }

    if (attachmentCount > 0) {
      items.push(
        <Box key="attach" sx={badgeSx}>
          <AttachFileIcon sx={{ fontSize: 14 }} />
          {attachmentCount}
        </Box>
      );
    }

    if (checklistTotal > 0) {
      items.push(
        <Box
          key="check"
          sx={{
            ...badgeSx,
            ...(checklistDone === checklistTotal
              ? { color: "#4BCE97" }
              : null),
          }}
        >
          <CheckBoxOutlinedIcon sx={{ fontSize: 14 }} />
          {checklistDone}/{checklistTotal}
        </Box>
      );
    }

    return items;
  };

  const renderLabelPills = (card: CardItem) =>
    (card.labels || []).length > 0 && (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.75 }}>
        {(card.labels || []).map((label) => (
          <Box
            key={label.id}
            sx={{
              minWidth: 36,
              height: label.name ? 18 : 8,
              px: label.name ? 0.75 : 0,
              borderRadius: 1,
              backgroundColor: label.color,
              color: "#1D2125",
              fontSize: 11.5,
              fontWeight: 700,
              lineHeight: "18px",
            }}
          >
            {label.name}
          </Box>
        ))}
      </Box>
    );

  /* ---------- popover bodies ---------- */
  const renderPopoverBody = () => {
    if (!popover) return null;

    const found = findCard(popover.cardId);
    if (!found) return null;

    const { card } = found;
    const close = () => setPopover(null);

    const rowSx = {
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      px: 1.5,
      height: 38,
      borderRadius: 1.5,
      cursor: "pointer",
      color: CARD_TEXT,
      fontSize: 14,
      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
    };

    switch (popover.kind) {
      case "add": {
        const options: {
          kind: PopoverKind;
          label: string;
          icon: ReactNode;
        }[] = [
          { kind: "labels", label: "Labels", icon: <LabelOutlinedIcon /> },
          { kind: "dates", label: "Dates", icon: <AccessTimeIcon /> },
          {
            kind: "checklist",
            label: "Checklist",
            icon: <CheckBoxOutlinedIcon />,
          },
          { kind: "members", label: "Members", icon: <PersonIcon /> },
          {
            kind: "attachment",
            label: "Attachment",
            icon: <AttachFileIcon />,
          },
        ];

        return (
          <>
            <PopHeader title="Add to card" onClose={close} />
            <Box sx={{ px: 1, pb: 1.5 }}>
              {options.map((option) => (
                <Box
                  key={option.kind}
                  sx={rowSx}
                  onClick={() =>
                    openPopover(option.kind, popover.anchor, popover.cardId)
                  }
                >
                  <Box sx={{ display: "flex", color: CARD_MUTED }}>
                    {option.icon}
                  </Box>
                  {option.label}
                </Box>
              ))}
            </Box>
          </>
        );
      }

      case "labels": {
        const cardLabels = card.labels || [];
        const allLabels = [...DEFAULT_LABELS, ...customLabelPool];

        return (
          <>
            <PopHeader title="Labels" onClose={close} />
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              <Typography sx={{ fontSize: 12, color: CARD_MUTED, mb: 1, px: 0.5 }}>
                Pick one label. Choosing another replaces it.
              </Typography>

              {allLabels.map((label) => {
                const on = cardLabels.some((item) => item.id === label.id);

                return (
                  <Box
                    key={label.id}
                    onClick={() => selectLabel(card.id, label)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1.5,
                      height: 34,
                      mb: 0.75,
                      borderRadius: 1,
                      cursor: "pointer",
                      backgroundColor: label.color,
                      color: "#1D2125",
                      fontSize: 14,
                      fontWeight: 700,
                      "&:hover": { filter: "brightness(1.1)" },
                    }}
                  >
                    {label.name}
                    {on && <CheckIcon sx={{ fontSize: 18 }} />}
                  </Box>
                );
              })}

              <Divider sx={{ my: 1.25, borderColor: "rgba(255,255,255,0.12)" }} />

              <Typography
                sx={{ fontSize: 12.5, fontWeight: 700, color: CARD_MUTED, mb: 0.75 }}
              >
                Create a new label
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Label name"
                value={labelName}
                onChange={(event) => setLabelName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") createLabel(card.id);
                }}
                sx={darkFieldSx}
              />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, my: 1.25 }}>
                {LABEL_PALETTE.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setLabelColor(color)}
                    sx={{
                      width: 30,
                      height: 24,
                      borderRadius: 1,
                      backgroundColor: color,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      outline:
                        labelColor === color ? `2px solid ${FOCUS_BLUE}` : "none",
                      outlineOffset: 1,
                    }}
                  >
                    {labelColor === color && (
                      <CheckIcon sx={{ fontSize: 16, color: "#1D2125" }} />
                    )}
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                disabled={!labelName.trim()}
                onClick={() => createLabel(card.id)}
                sx={primaryButtonSx}
              >
                Create
              </Button>
            </Box>
          </>
        );
      }

      case "members": {
        const cardMembers = card.members || [];

        return (
          <>
            <PopHeader title="Members" onClose={close} />
            <Box sx={{ px: 1, pb: 1.5 }}>
              {memberPool.map((name) => (
                <Box
                  key={name}
                  sx={rowSx}
                  onClick={() => toggleMember(card.id, name)}
                >
                  <MemberAvatar name={name} size={26} />
                  <Box sx={{ flex: 1 }}>{name}</Box>
                  {cardMembers.includes(name) && (
                    <CheckIcon sx={{ fontSize: 18 }} />
                  )}
                </Box>
              ))}

              <Box sx={{ px: 0.5, pt: 1.25 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a member by name"
                  value={memberName}
                  onChange={(event) => setMemberName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addMemberByName(card.id);
                  }}
                  sx={darkFieldSx}
                />
                <Button
                  variant="contained"
                  disabled={!memberName.trim()}
                  onClick={() => addMemberByName(card.id)}
                  sx={{ ...primaryButtonSx, mt: 1 }}
                >
                  Add member
                </Button>
              </Box>
            </Box>
          </>
        );
      }

      case "cover":
        return (
          <>
            <PopHeader title="Cover" onClose={close} />
            <Box sx={{ px: 2, pb: 2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 0.75,
                }}
              >
                {CARD_COLORS.map((color) => {
                  const active = resolveCardColor(card.color) === color;

                  return (
                    <Box
                      key={color}
                      onClick={() => changeCover(card.id, color)}
                      sx={{
                        height: 36,
                        borderRadius: 1.5,
                        backgroundColor: color,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: active
                          ? `3px solid ${FOCUS_BLUE}`
                          : "1px solid rgba(255,255,255,0.25)",
                        "&:hover": { transform: "scale(1.04)" },
                      }}
                    >
                      {active && <CheckIcon sx={{ fontSize: 18, color: "#fff" }} />}
                    </Box>
                  );
                })}
              </Box>

              <Button
                fullWidth
                disabled={!card.color}
                onClick={() => removeCover(card.id)}
                sx={{ ...darkButtonSx, mt: 1.5 }}
              >
                Remove cover
              </Button>
            </Box>
          </>
        );

      case "dates":
        return (
          <>
            <PopHeader title="Dates" onClose={close} />
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography
                sx={{ fontSize: 12.5, fontWeight: 700, color: CARD_MUTED, mb: 0.5 }}
              >
                Start date
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={startDraft}
                onChange={(event) => setStartDraft(event.target.value)}
                sx={darkFieldSx}
              />

              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: CARD_MUTED,
                  mt: 1.5,
                  mb: 0.5,
                }}
              >
                Due date
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={dueDraft}
                onChange={(event) => setDueDraft(event.target.value)}
                sx={darkFieldSx}
              />

              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  disabled={!startDraft && !dueDraft}
                  onClick={() => saveDates(card.id)}
                  sx={primaryButtonSx}
                >
                  Save
                </Button>
                <Button
                  disabled={!card.startDate && !card.dueDate}
                  onClick={() => removeDates(card.id)}
                  sx={ghostButtonSx}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          </>
        );

      case "move":
        return (
          <>
            <PopHeader title="Move card" onClose={close} />
            <Box sx={{ px: 1, pb: 1.5 }}>
              {lists.map((list) => (
                <Box
                  key={list.id}
                  sx={rowSx}
                  onClick={() => {
                    moveCard(card.id, list.id);
                    close();
                  }}
                >
                  <Box sx={{ flex: 1 }}>{list.title}</Box>
                  {list.id === found.list.id && (
                    <Typography sx={{ fontSize: 12, color: CARD_MUTED }}>
                      current
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </>
        );

      case "checklist":
        return (
          <>
            <PopHeader title="Add checklist" onClose={close} />
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography
                sx={{ fontSize: 12.5, fontWeight: 700, color: CARD_MUTED, mb: 0.5 }}
              >
                Title
              </Typography>
              <TextField
                autoFocus
                fullWidth
                size="small"
                value={checklistTitle}
                onChange={(event) => setChecklistTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addChecklist(card.id);
                }}
                sx={darkFieldSx}
              />
              <Button
                variant="contained"
                onClick={() => addChecklist(card.id)}
                sx={{ ...primaryButtonSx, mt: 1.5 }}
              >
                Add
              </Button>
            </Box>
          </>
        );

      case "attachment":
        return (
          <>
            <PopHeader title="Attach" onClose={close} />
            <Box sx={{ px: 2, pb: 2 }}>
              {/* ----- upload from computer ----- */}
              <Typography
                sx={{ fontSize: 12.5, fontWeight: 700, color: CARD_MUTED, mb: 0.75 }}
              >
                Attach a file from your computer
              </Typography>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(event) => handleFileInput(card.id, event)}
              />

              <Button
                fullWidth
                startIcon={<UploadFileIcon />}
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                sx={darkButtonSx}
              >
                {uploading ? "Uploading…" : "Choose a file"}
              </Button>

              <Typography sx={{ fontSize: 12, color: CARD_MUTED, mt: 0.75 }}>
                Documents, images, PDFs and more. Up to {formatSize(MAX_FILE_SIZE)} each.
              </Typography>

              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

              {/* ----- paste a link ----- */}
              <Typography
                sx={{ fontSize: 12.5, fontWeight: 700, color: CARD_MUTED, mb: 0.5 }}
              >
                Or paste a link
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Paste a link here…"
                value={attachUrl}
                onChange={(event) => setAttachUrl(event.target.value)}
                sx={darkFieldSx}
              />

              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: CARD_MUTED,
                  mt: 1.5,
                  mb: 0.5,
                }}
              >
                Display text (optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={attachName}
                onChange={(event) => setAttachName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addAttachment(card.id);
                }}
                sx={darkFieldSx}
              />

              <Button
                variant="contained"
                disabled={!attachUrl.trim()}
                onClick={() => addAttachment(card.id)}
                sx={{ ...primaryButtonSx, mt: 1.5 }}
              >
                Attach link
              </Button>
            </Box>
          </>
        );

      case "more":
        return (
          <>
            <PopHeader title="Card actions" onClose={close} />
            <Box sx={{ px: 1, pb: 1.5 }}>
              <Box
                sx={rowSx}
                onClick={() => {
                  copyCard(card.id);
                  close();
                }}
              >
                <ContentCopyIcon sx={{ fontSize: 18, color: CARD_MUTED }} />
                Copy card
              </Box>
              <Box
                sx={rowSx}
                onClick={() => {
                  copyCardLink(card.id);
                  close();
                }}
              >
                <LinkIcon sx={{ fontSize: 18, color: CARD_MUTED }} />
                Copy link
              </Box>
              <Box
                sx={rowSx}
                onClick={() => {
                  archiveCard(card.id);
                  close();
                  closeCardModal();
                }}
              >
                <ArchiveOutlinedIcon sx={{ fontSize: 18, color: CARD_MUTED }} />
                Archive
              </Box>
              <Divider sx={{ my: 0.75, borderColor: "rgba(255,255,255,0.12)" }} />
              <Box
                sx={{ ...rowSx, color: "#F87168" }}
                onClick={() => {
                  close();
                  snapshotForUndo("Card deleted");
                  setDeleteTarget({ type: "card", id: card.id });
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
                Delete
              </Box>
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  /* ---------- quick edit actions (the Trello style menu) ---------- */
  const quickCard = quickEdit ? findCard(quickEdit.cardId)?.card : undefined;

  const quickActions: {
    label: string;
    icon: ReactNode;
    run: (event: MouseEvent<HTMLElement>) => void;
  }[] = quickEdit
    ? [
        {
          label: "Open card",
          icon: <CreditCardOutlinedIcon fontSize="small" />,
          run: () => {
            closeQuickEdit();
            openCardModal(quickEdit.cardId);
          },
        },
        {
          label: "Edit labels",
          icon: <LabelOutlinedIcon fontSize="small" />,
          run: (event) =>
            openPopover("labels", event.currentTarget, quickEdit.cardId),
        },
        {
          label: "Change members",
          icon: <PersonIcon fontSize="small" />,
          run: (event) =>
            openPopover("members", event.currentTarget, quickEdit.cardId),
        },
        {
          label: "Change cover",
          icon: <ImageOutlinedIcon fontSize="small" />,
          run: (event) =>
            openPopover("cover", event.currentTarget, quickEdit.cardId),
        },
        {
          label: "Edit dates",
          icon: <AccessTimeIcon fontSize="small" />,
          run: (event) =>
            openPopover("dates", event.currentTarget, quickEdit.cardId),
        },
        {
          label: "Move",
          icon: <ArrowForwardIcon fontSize="small" />,
          run: (event) =>
            openPopover("move", event.currentTarget, quickEdit.cardId),
        },
        {
          label: "Copy card",
          icon: <ContentCopyIcon fontSize="small" />,
          run: () => {
            copyCard(quickEdit.cardId);
            closeQuickEdit();
          },
        },
        {
          label: "Copy link",
          icon: <LinkIcon fontSize="small" />,
          run: () => {
            copyCardLink(quickEdit.cardId);
            closeQuickEdit();
          },
        },
        {
          label: "Archive",
          icon: <ArchiveOutlinedIcon fontSize="small" />,
          run: () => {
            archiveCard(quickEdit.cardId);
            closeQuickEdit(false);
          },
        },
      ]
    : [];

  const QUICK_MENU_WIDTH = 220;
  const QUICK_ITEM_HEIGHT = 46;

  /* ---------- card detail modal data ---------- */
  const openData = findCard(openCardId);
  const openCard = openData?.card;

  const feed: FeedEntry[] = (() => {
    if (!openData) return [];

    const { card, list } = openData;

    const entries: FeedEntry[] = [
      {
        key: "created",
        time: createdAtOf(card),
        text: `added this card to ${list.title}`,
      },
      ...(card.comments || []).map((comment) => ({
        key: `c-${comment.id}`,
        time: comment.time,
        text: comment.text,
        commentId: comment.id,
      })),
      ...(card.activity || [])
        .filter((item) => showDetails || !item.detail)
        .map((item) => ({
          key: `a-${item.id}`,
          time: item.time,
          text: item.text,
        })),
    ];

    return entries.sort((a, b) => b.time - a.time);
  })();

  const archivedCards = lists.flatMap((list) =>
    list.cards
      .filter((card) => card.archived)
      .map((card) => ({ card, listTitle: list.title }))
  );

  const totalCardCount = lists.reduce((sum, list) => sum + list.cards.length, 0);
  const isFiltering = query.trim().length > 0;

  /* ============================================================
   *  EARLY RETURN
   * ============================================================ */

  if (!board) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F4F5F7",
          color: "#172B4D",
        }}
      >
        <Typography fontWeight={600}>Board not found</Typography>
      </Box>
    );
  }

  /* ============================================================
   *  JSX
   * ============================================================ */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: board.background || DEFAULT_BOARD_BACKGROUND,
        overflow: "hidden",
      }}
    >
      {/* ========================= HEADER ========================= */}
      <Box
        sx={{
          flexShrink: 0,
          minHeight: 60,
          px: { xs: 1.5, md: 2 },
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          color: "#fff",
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Tooltip title="Back">
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "#fff",
              width: 38,
              height: 38,
              borderRadius: 2,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
          {board.title}
        </Typography>

        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 10,
            background: "rgba(255,255,255,0.16)",
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {lists.length} lists
          </Typography>
        </Box>

        <TextField
          inputRef={searchInputRef}
          size="small"
          placeholder="Search cards…  (press /)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setQuery("")}>
                  <CloseIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }} />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
          sx={{
            ml: 1,
            width: 220,
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 2,
              height: 36,
              fontSize: 13.5,
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.5)" },
            },
            "& input::placeholder": { color: "rgba(255,255,255,0.65)", opacity: 1 },
          }}
        />

        <Box sx={{ flex: 1 }} />

        <Button
          startIcon={<ArchiveOutlinedIcon />}
          onClick={() => setArchiveOpen(true)}
          sx={{
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
          }}
        >
          Archived{archivedCards.length > 0 ? ` (${archivedCards.length})` : ""}
        </Button>
      </Box>

      {/* ========================= BOARD CONTENT ========================= */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowX: "auto",
          overflowY: "hidden",
          px: 1.5,
          py: 1.5,
          "&::-webkit-scrollbar": { height: 10, width: 10 },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255,255,255,0.10)",
            borderRadius: 10,
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.35)",
            borderRadius: 10,
          },
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="LIST">
            {(boardDrop) => (
              <Box
                ref={boardDrop.innerRef}
                {...boardDrop.droppableProps}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  height: "100%",
                  minWidth: "max-content",
                }}
              >
                {lists.map((list, listIndex) => {
                  const collapsed = collapsedLists.includes(list.id);
                  const cards = list.cards.filter(
                    (card) => !card.archived && cardMatchesQuery(card, query)
                  );
                  const theme = getListTheme(list.color);

                  return (
                    <Draggable
                      key={list.id}
                      draggableId={`list-${list.id}`}
                      index={listIndex}
                      isDragDisabled={isFiltering}
                    >
                      {(dragList, listSnap) => (
                        <Box
                          ref={dragList.innerRef}
                          {...dragList.draggableProps}
                          sx={{
                            opacity: listSnap.isDragging ? 0.92 : 1,
                          }}
                        >
                          {/* ---------- collapsed list (thin vertical strip) ---------- */}
                          {collapsed ? (
                            <Box
                              {...dragList.dragHandleProps}
                              onClick={() => toggleCollapse(list.id)}
                              sx={{
                                width: 48,
                                minWidth: 48,
                                py: 1.25,
                                borderRadius: 3,
                                cursor: "pointer",
                                background: theme.bg,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1.5,
                                color: "#fff",
                                "&:hover": { filter: "brightness(1.15)" },
                              }}
                            >
                              <UnfoldLessIcon
                                sx={{ fontSize: 18, transform: "rotate(90deg)" }}
                              />
                              <Typography
                                sx={{
                                  writingMode: "vertical-rl",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {list.title}
                              </Typography>
                              <Typography sx={{ fontSize: 13, color: theme.accent }}>
                                {cards.length}
                              </Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: 272,
                                minWidth: 272,
                                maxWidth: 272,
                                maxHeight: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 3,
                                background: theme.bg,
                                boxShadow:
                                  "0 1px 1px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.5)",
                                color: CARD_TEXT,
                              }}
                            >
                              {/* ---------- LIST HEADER ---------- */}
                              <Box
                                {...dragList.dragHandleProps}
                                sx={{
                                  px: 1.5,
                                  pt: 1.25,
                                  pb: 0.75,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  flexShrink: 0,
                                  cursor: "grab",
                                }}
                              >
                                {renamingListId === list.id ? (
                                  <TextField
                                    autoFocus
                                    fullWidth
                                    size="small"
                                    value={listTitleDraft}
                                    onChange={(event) =>
                                      setListTitleDraft(event.target.value)
                                    }
                                    onBlur={saveRenameList}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") saveRenameList();
                                      if (event.key === "Escape") {
                                        setRenamingListId(null);
                                        setListTitleDraft("");
                                      }
                                    }}
                                    onClick={(event) => event.stopPropagation()}
                                    sx={{
                                      ...darkFieldSx,
                                      "& .MuiOutlinedInput-root": {
                                        ...fieldRootSx,
                                        fontWeight: 700,
                                        alignItems: "center",
                                      },
                                    }}
                                  />
                                ) : (
                                  <>
                                    <Typography
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        startRenameList(list);
                                      }}
                                      sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: theme.title,
                                        cursor: "text",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {list.title}
                                    </Typography>

                                    {list.pinned && (
                                      <PushPinIcon
                                        sx={{ fontSize: 15, color: theme.accent }}
                                      />
                                    )}
                                    {list.watching && (
                                      <VisibilityIcon
                                        sx={{ fontSize: 16, color: theme.accent }}
                                      />
                                    )}

                                    <Typography
                                      sx={{ fontSize: 14, color: theme.accent, mr: 0.25 }}
                                    >
                                      {cards.length}
                                      {isFiltering ? `/${list.cards.length}` : ""}
                                    </Typography>

                                    <Tooltip title="Collapse list">
                                      <IconButton
                                        size="small"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          toggleCollapse(list.id);
                                        }}
                                        sx={{
                                          width: 30,
                                          height: 30,
                                          color: theme.accent,
                                          "&:hover": {
                                            color: theme.title,
                                            backgroundColor: theme.hover,
                                          },
                                        }}
                                      >
                                        <UnfoldLessIcon
                                          sx={{ fontSize: 18, transform: "rotate(90deg)" }}
                                        />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="List actions">
                                      <IconButton
                                        size="small"
                                        onClick={(event) =>
                                          handleOpenListMenu(event, list.id)
                                        }
                                        sx={{
                                          width: 30,
                                          height: 30,
                                          color: theme.accent,
                                          "&:hover": {
                                            color: theme.title,
                                            backgroundColor: theme.hover,
                                          },
                                        }}
                                      >
                                        <MoreHorizIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>

                              {/* ---------- CARDS ---------- */}
                              <Droppable droppableId={`list-${list.id}`} type="CARD">
                                {(cardDrop, cardDropSnap) => (
                                  <Box
                                    ref={cardDrop.innerRef}
                                    {...cardDrop.droppableProps}
                                    sx={{
                                      flex: 1,
                                      minHeight: 12,
                                      overflowY: "auto",
                                      px: 1,
                                      py: 0.25,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 1,
                                      backgroundColor: cardDropSnap.isDraggingOver
                                        ? "rgba(255,255,255,0.06)"
                                        : "transparent",
                                      transition: "background-color .12s ease",
                                      "&::-webkit-scrollbar": { width: 8 },
                                      "&::-webkit-scrollbar-thumb": {
                                        background: "rgba(255,255,255,0.22)",
                                        borderRadius: 8,
                                      },
                                    }}
                                  >
                                    {cards.map((card, cardIndex) => {
                                      const badges = renderBadges(card);
                                      const members = card.members || [];

                                      return (
                                        <Draggable
                                          key={card.id}
                                          draggableId={`card-${card.id}`}
                                          index={cardIndex}
                                          isDragDisabled={isFiltering}
                                        >
                                          {(dragCard, cardSnap) => (
                                            <Box
                                              ref={dragCard.innerRef}
                                              {...dragCard.draggableProps}
                                              {...dragCard.dragHandleProps}
                                              data-card-root
                                              onClick={() => openCardModal(card.id)}
                                              style={dragCard.draggableProps.style}
                                              sx={{
                                                position: "relative",
                                                flexShrink: 0,
                                                minHeight: 44,
                                                boxSizing: "border-box",
                                                px: 1.5,
                                                py: 1,
                                                borderRadius: 2,
                                                cursor: "pointer",
                                                backgroundColor: resolveCardColor(
                                                  card.color
                                                ),
                                                boxShadow: cardSnap.isDragging
                                                  ? "0 8px 20px rgba(0,0,0,0.5)"
                                                  : "0 1px 1px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.4)",
                                                transition:
                                                  "box-shadow .12s ease, filter .12s ease",
                                                "&:hover": {
                                                  filter: "brightness(1.12)",
                                                  boxShadow:
                                                    "0 0 0 2px rgba(87,157,255,0.55)",
                                                },
                                                "& .card-actions": {
                                                  opacity: 0,
                                                  transition: "opacity .12s ease",
                                                },
                                                "&:hover .card-actions": { opacity: 1 },
                                              }}
                                            >
                                              {renderLabelPills(card)}

                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "flex-start",
                                                  gap: 0.75,
                                                }}
                                              >
                                                {card.completed && (
                                                  <CheckCircleIcon
                                                    sx={{
                                                      fontSize: 17,
                                                      color: "#4BCE97",
                                                      mt: "3px",
                                                    }}
                                                  />
                                                )}
                                                <Typography
                                                  sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    fontSize: 14.5,
                                                    lineHeight: 1.45,
                                                    color: CARD_TEXT,
                                                    wordBreak: "break-word",
                                                  }}
                                                >
                                                  {card.title}
                                                </Typography>
                                              </Box>

                                              {(badges.length > 0 ||
                                                members.length > 0) && (
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: 1,
                                                    mt: 0.75,
                                                  }}
                                                >
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      flexWrap: "wrap",
                                                      gap: 1,
                                                    }}
                                                  >
                                                    {badges}
                                                  </Box>

                                                  <Box sx={{ display: "flex", gap: 0.5 }}>
                                                    {members.map((name) => (
                                                      <MemberAvatar
                                                        key={name}
                                                        name={name}
                                                        size={26}
                                                      />
                                                    ))}
                                                  </Box>
                                                </Box>
                                              )}

                                              {/* only Edit + Delete on hover */}
                                              <Box
                                                className="card-actions"
                                                sx={{
                                                  position: "absolute",
                                                  top: 6,
                                                  right: 6,
                                                  display: "flex",
                                                  alignItems: "center",
                                                  borderRadius: 1.5,
                                                  backgroundColor: resolveCardColor(
                                                    card.color
                                                  ),
                                                }}
                                              >
                                                <Tooltip title="Edit card">
                                                  <IconButton
                                                    size="small"
                                                    onClick={(event) =>
                                                      openQuickEdit(event, card)
                                                    }
                                                    sx={{
                                                      width: 26,
                                                      height: 26,
                                                      color: CARD_MUTED,
                                                      "&:hover": {
                                                        color: "#fff",
                                                        backgroundColor:
                                                          "rgba(255,255,255,0.14)",
                                                      },
                                                    }}
                                                  >
                                                    <EditOutlinedIcon
                                                      sx={{ fontSize: 16 }}
                                                    />
                                                  </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete card">
                                                  <IconButton
                                                    size="small"
                                                    onClick={(event) => {
                                                      event.stopPropagation();
                                                      snapshotForUndo("Card deleted");
                                                      setDeleteTarget({
                                                        type: "card",
                                                        id: card.id,
                                                      });
                                                    }}
                                                    sx={{
                                                      width: 26,
                                                      height: 26,
                                                      color: "#F87168",
                                                      "&:hover": {
                                                        backgroundColor:
                                                          "rgba(248,113,104,0.16)",
                                                      },
                                                    }}
                                                  >
                                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                                  </IconButton>
                                                </Tooltip>
                                              </Box>
                                            </Box>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                    {cardDrop.placeholder}
                                  </Box>
                                )}
                              </Droppable>

                              {/* ---------- ADD CARD ---------- */}
                              <Box sx={{ px: 1, pt: 0.75, pb: 1, flexShrink: 0 }}>
                                {addingCardToList === list.id ? (
                                  <Box>
                                    <TextField
                                      autoFocus
                                      fullWidth
                                      multiline
                                      minRows={2}
                                      placeholder="Enter a title for this card…"
                                      value={newCardTitle}
                                      onChange={(event) =>
                                        setNewCardTitle(event.target.value)
                                      }
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" && !event.shiftKey) {
                                          event.preventDefault();
                                          handleAddCard(list.id);
                                        }
                                        if (event.key === "Escape")
                                          handleCancelAddCard();
                                      }}
                                      sx={darkFieldSx}
                                    />

                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.75,
                                        mt: 1,
                                      }}
                                    >
                                      <Button
                                        variant="contained"
                                        onClick={() => handleAddCard(list.id)}
                                        disabled={!newCardTitle.trim()}
                                        sx={primaryButtonSx}
                                      >
                                        Add card
                                      </Button>

                                      <Button
                                        onClick={handleCancelAddCard}
                                        sx={ghostButtonSx}
                                      >
                                        Cancel
                                      </Button>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Button
                                      fullWidth
                                      startIcon={<AddIcon />}
                                      onClick={() => handleStartAddCard(list.id)}
                                      sx={{
                                        minHeight: 36,
                                        justifyContent: "flex-start",
                                        color: theme.accent,
                                        fontSize: 14.5,
                                        fontWeight: 600,
                                        textTransform: "none",
                                        px: 1,
                                        borderRadius: 1.75,
                                        "&:hover": {
                                          backgroundColor: theme.hover,
                                          color: theme.title,
                                        },
                                      }}
                                    >
                                      Add a card
                                    </Button>

                                    <Tooltip title="Add card">
                                      <IconButton
                                        onClick={() => handleStartAddCard(list.id)}
                                        sx={{
                                          width: 36,
                                          height: 36,
                                          borderRadius: 1.75,
                                          color: theme.accent,
                                          "&:hover": {
                                            backgroundColor: theme.hover,
                                            color: theme.title,
                                          },
                                        }}
                                      >
                                        <PostAddIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Draggable>
                  );
                })}
                {boardDrop.placeholder}

                {/* ========================= ADD LIST ========================= */}
                {addingList ? (
                  <Box
                    sx={{
                      width: 272,
                      minWidth: 272,
                      p: 1,
                      borderRadius: 3,
                      background: "#101204",
                      flexShrink: 0,
                    }}
                  >
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      placeholder="Enter list name…"
                      value={newListTitle}
                      onChange={(event) => setNewListTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleAddList();
                        if (event.key === "Escape") handleCancelAddList();
                      }}
                      sx={{
                        ...darkFieldSx,
                        "& .MuiOutlinedInput-root": {
                          ...fieldRootSx,
                          alignItems: "center",
                          fontWeight: 600,
                        },
                      }}
                    />

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleAddList}
                        disabled={!newListTitle.trim()}
                        sx={primaryButtonSx}
                      >
                        Add list
                      </Button>

                      <IconButton
                        onClick={handleCancelAddList}
                        sx={{ color: CARD_TEXT, width: 32, height: 32 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setAddingList(true)}
                    sx={{
                      width: 272,
                      minWidth: 272,
                      height: 44,
                      flexShrink: 0,
                      justifyContent: "flex-start",
                      px: 1.75,
                      borderRadius: 3,
                      backgroundColor: "rgba(255,255,255,0.24)",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 600,
                      textTransform: "none",
                      backdropFilter: "blur(6px)",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.32)" },
                    }}
                  >
                    Add another list
                  </Button>
                )}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>

      {/* ========================= LIST ACTIONS MENU ========================= */}
      <Menu
        anchorEl={listMenuAnchor}
        open={Boolean(listMenuAnchor)}
        onClose={handleCloseListMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 330,
              maxHeight: "80vh",
              mt: 0.75,
              borderRadius: 2,
              border: "1px solid #E2E8F0",
              boxShadow: "0 14px 35px rgba(15,23,42,0.20)",
              overflowY: "auto",
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.35,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#172B4D" }}>
            List actions
          </Typography>

          <IconButton
            size="small"
            onClick={handleCloseListMenu}
            sx={{
              color: "#64748B",
              borderRadius: 1.5,
              "&:hover": { backgroundColor: "#F1F5F9" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            if (selectedListId !== null) handleStartAddCard(selectedListId);
          }}
        >
          <AddIcon sx={{ mr: 1.5, color: "#64748B" }} />
          Add card
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedList) startRenameList(selectedList);
            handleCloseListMenu();
          }}
        >
          <EditOutlinedIcon sx={{ mr: 1.5, color: "#64748B" }} />
          Rename list
        </MenuItem>

        <MenuItem onClick={handleCopyList}>
          <ContentCopyIcon sx={{ mr: 1.5, color: "#64748B" }} />
          Copy list
        </MenuItem>

        <MenuItem onClick={() => handleMoveList(-1)}>
          <DriveFileMoveOutlinedIcon sx={{ mr: 1.5, color: "#64748B" }} />
          Move list left
        </MenuItem>

        <MenuItem onClick={() => handleMoveList(1)}>
          <DriveFileMoveOutlinedIcon
            sx={{ mr: 1.5, color: "#64748B", transform: "scaleX(-1)" }}
          />
          Move list right
        </MenuItem>

        <MenuItem onClick={handleSortListByName}>
          <SubjectIcon sx={{ mr: 1.5, color: "#64748B" }} />
          Sort by card name
        </MenuItem>

        <MenuItem onClick={handleArchiveAllCardsInList}>
          <ArchiveOutlinedIcon sx={{ mr: 1.5, color: "#64748B" }} />
          Archive all cards in this list
        </MenuItem>

        <MenuItem onClick={() => handleToggleListFlag("pinned")}>
          <PushPinOutlinedIcon sx={{ mr: 1.5, color: "#64748B" }} />
          {selectedList?.pinned ? "Unpin list" : "Pin list"}
        </MenuItem>

        <MenuItem onClick={() => handleToggleListFlag("watching")}>
          <VisibilityOutlinedIcon sx={{ mr: 1.5, color: "#64748B" }} />
          {selectedList?.watching ? "Unwatch" : "Watch"}
        </MenuItem>

        <Divider />

        <Box sx={{ px: 2, pt: 1.5, pb: 1.25 }}>
          <Typography
            sx={{ fontSize: 13, fontWeight: 800, color: "#64748B", mb: 1 }}
          >
            Change list color
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 0.75,
            }}
          >
            {LIST_COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => handleChangeListColor(color)}
                sx={{
                  height: 34,
                  borderRadius: 1.5,
                  backgroundColor: color,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border:
                    selectedList?.color === color
                      ? "3px solid #172B4D"
                      : "2px solid transparent",
                  boxShadow:
                    selectedList?.color === color ? "0 0 0 1px #fff inset" : "none",
                  "&:hover": { transform: "scale(1.03)" },
                }}
              >
                {selectedList?.color === color && (
                  <CheckIcon sx={{ color: "#fff", fontSize: 18 }} />
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <MenuItem
          disabled={!selectedList?.color}
          onClick={handleRemoveListColor}
        >
          Remove color
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleDeleteList}
          sx={{ color: "#DC2626", fontWeight: 700 }}
        >
          <DeleteIcon sx={{ mr: 1.5 }} />
          Delete list
        </MenuItem>
      </Menu>

      {/* ========================= QUICK EDIT (pencil on card) ========================= */}
      <Modal open={Boolean(quickEdit && quickCard)} onClose={() => closeQuickEdit()}>
        <Box
          onClick={() => closeQuickEdit()}
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.62)",
            outline: "none",
          }}
        >
          {quickEdit && quickCard && (
            <>
              {/* the card being edited */}
              <Box
                onClick={(event) => event.stopPropagation()}
                sx={{
                  position: "absolute",
                  top: quickEdit.rect.top,
                  left: quickEdit.rect.left,
                  width: quickEdit.rect.width,
                }}
              >
                <Box
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    backgroundColor: resolveCardColor(quickCard.color),
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  {renderLabelPills(quickCard)}

                  <TextField
                    autoFocus
                    fullWidth
                    multiline
                    minRows={2}
                    value={quickTitle}
                    onChange={(event) => setQuickTitle(event.target.value)}
                    onFocus={(event) => event.target.select()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        closeQuickEdit();
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        p: 0,
                        color: CARD_TEXT,
                        fontSize: 14.5,
                        "& fieldset": { border: "none" },
                      },
                    }}
                  />

                  {(quickCard.members || []).length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {(quickCard.members || []).map((name) => (
                        <MemberAvatar key={name} name={name} size={26} />
                      ))}
                    </Box>
                  )}
                </Box>

                <Button
                  variant="contained"
                  onClick={() => closeQuickEdit()}
                  disabled={!quickTitle.trim()}
                  sx={{ ...primaryButtonSx, mt: 1, minHeight: 34, px: 2 }}
                >
                  Save
                </Button>
              </Box>

              {/* the action buttons next to it */}
              <Box
                onClick={(event) => event.stopPropagation()}
                sx={{
                  position: "absolute",
                  top: Math.max(
                    8,
                    Math.min(
                      quickEdit.rect.top,
                      window.innerHeight - quickActions.length * QUICK_ITEM_HEIGHT - 8
                    )
                  ),
                  left:
                    quickEdit.rect.left +
                      quickEdit.rect.width +
                      8 +
                      QUICK_MENU_WIDTH >
                    window.innerWidth
                      ? Math.max(8, quickEdit.rect.left - QUICK_MENU_WIDTH - 8)
                      : quickEdit.rect.left + quickEdit.rect.width + 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.75,
                }}
              >
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    startIcon={action.icon}
                    onClick={action.run}
                    sx={{
                      ...darkButtonSx,
                      backgroundColor: "#2B2F33",
                      minHeight: 40,
                      justifyContent: "flex-start",
                      "&:hover": { backgroundColor: "#3B4046" },
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* ========================= CARD DETAIL MODAL ========================= */}
      <Dialog
        open={Boolean(openData)}
        onClose={closeCardModal}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "min(1100px, 96vw)",
            height: "min(760px, 92vh)",
            m: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 3,
            background: "#FFFFFF !important",
            backgroundColor: "#FFFFFF !important",
            color: `${L_TEXT} !important`,
            backgroundImage: "none",
          },
        }}
      >
        {openData && openCard && (
          <>
            {/* ---------- top bar ---------- */}
            <Box
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: hasCover(openCard.color)
                  ? resolveCardColor(openCard.color)
                  : "transparent",
              }}
            >
              <Button
                endIcon={<ExpandMoreIcon />}
                onClick={(event) =>
                  openPopover("move", event.currentTarget, openCard.id)
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  minHeight: 34,
                  px: 1.25,
                  borderRadius: 1.5,
                  color: "#1D2125",
                  backgroundColor: openData.list.color
                    ? mixHex(openData.list.color, [255, 255, 255], 0.55)
                    : "#F5CD47",
                  "&:hover": { filter: "brightness(1.08)" },
                }}
              >
                {openData.list.title}
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Tooltip title="Change cover">
                  <IconButton
                    onClick={(event) =>
                      openPopover("cover", event.currentTarget, openCard.id)
                    }
                    sx={{ color: (hasCover(openCard.color) ? "#FFFFFF" : L_TEXT) }}
                  >
                    <ImageOutlinedIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title={openCard.watching ? "Stop watching" : "Watch"}>
                  <IconButton
                    onClick={() => toggleWatch(openCard)}
                    sx={{ color: openCard.watching ? FOCUS_BLUE : (hasCover(openCard.color) ? "#FFFFFF" : L_TEXT) }}
                  >
                    {openCard.watching ? (
                      <VisibilityIcon />
                    ) : (
                      <VisibilityOutlinedIcon />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="More actions">
                  <IconButton
                    onClick={(event) =>
                      openPopover("more", event.currentTarget, openCard.id)
                    }
                    sx={{ color: (hasCover(openCard.color) ? "#FFFFFF" : L_TEXT) }}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Close">
                  <IconButton onClick={closeCardModal} sx={{ color: (hasCover(openCard.color) ? "#FFFFFF" : L_TEXT) }}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* ---------- body ---------- */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                overflowY: { xs: "auto", md: "hidden" },
              }}
            >
              {/* ===== LEFT: details ===== */}
              <Box
                sx={{
                  flex: 1.25,
                  minWidth: 0,
                  overflowY: { md: "auto" },
                  px: 3,
                  py: 2.5,
                }}
              >
                {/* title */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <IconButton
                    onClick={() => toggleComplete(openCard)}
                    sx={{
                      p: 0.25,
                      color: openCard.completed ? "#4BCE97" : L_MUTED,
                    }}
                  >
                    {openCard.completed ? (
                      <CheckCircleIcon sx={{ fontSize: 28 }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: 28 }} />
                    )}
                  </IconButton>

                  {editingTitle ? (
                    <TextField
                      autoFocus
                      fullWidth
                      multiline
                      value={titleDraft}
                      onChange={(event) => setTitleDraft(event.target.value)}
                      onBlur={() => saveTitle(openCard)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          saveTitle(openCard);
                        }
                        if (event.key === "Escape") setEditingTitle(false);
                      }}
                      sx={{
                        ...lightFieldSx,
                        "& .MuiOutlinedInput-root": {
                          ...lightFieldRootSx,
                          fontSize: 24,
                          fontWeight: 700,
                          py: 0.5,
                        },
                      }}
                    />
                  ) : (
                    <Typography
                      onClick={() => {
                        setTitleDraft(openCard.title);
                        setEditingTitle(true);
                      }}
                      sx={{
                        flex: 1,
                        fontSize: 26,
                        fontWeight: 700,
                        lineHeight: 1.25,
                        color: L_TEXT,
                        cursor: "text",
                        wordBreak: "break-word",
                      }}
                    >
                      {openCard.title}
                    </Typography>
                  )}
                </Box>

                {/* add buttons */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2.5, ml: 5.5 }}>
                  <Button
                    startIcon={<LabelOutlinedIcon />}
                    onClick={(event) =>
                      openPopover("labels", event.currentTarget, openCard.id)
                    }
                    sx={lightButtonSx}
                  >
                    Labels
                  </Button>
                  <Button
                    startIcon={<AccessTimeIcon />}
                    onClick={(event) =>
                      openPopover("dates", event.currentTarget, openCard.id)
                    }
                    sx={lightButtonSx}
                  >
                    Dates
                  </Button>
                  <Button
                    startIcon={<CheckBoxOutlinedIcon />}
                    onClick={(event) =>
                      openPopover("checklist", event.currentTarget, openCard.id)
                    }
                    sx={lightButtonSx}
                  >
                    Checklist
                  </Button>
                  <Button
                    startIcon={<AttachFileIcon />}
                    onClick={(event) =>
                      openPopover("attachment", event.currentTarget, openCard.id)
                    }
                    sx={lightButtonSx}
                  >
                    Attachment
                  </Button>
                </Box>

                {/* labels / members / dates summary */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 3, ml: 5.5 }}>
                  {(openCard.labels || []).length > 0 && (
                    <Box>
                      <Typography
                        sx={{ fontSize: 12.5, fontWeight: 700, color: L_MUTED, mb: 0.75 }}
                      >
                        Label
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {(openCard.labels || []).map((label) => (
                          <Box
                            key={label.id}
                            onClick={(event) =>
                              openPopover("labels", event.currentTarget, openCard.id)
                            }
                            sx={{
                              minWidth: 44,
                              height: 32,
                              px: 1.5,
                              display: "flex",
                              alignItems: "center",
                              borderRadius: 1,
                              cursor: "pointer",
                              backgroundColor: label.color,
                              color: "#1D2125",
                              fontSize: 14,
                              fontWeight: 700,
                              "&:hover": { filter: "brightness(1.1)" },
                            }}
                          >
                            {label.name}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {(openCard.dueDate || openCard.startDate) && (
                    <Box>
                      <Typography
                        sx={{ fontSize: 12.5, fontWeight: 700, color: L_MUTED, mb: 0.75 }}
                      >
                        Dates
                      </Typography>
                      <Button
                        endIcon={<ExpandMoreIcon />}
                        onClick={(event) =>
                          openPopover("dates", event.currentTarget, openCard.id)
                        }
                        sx={{
                          ...lightButtonSx,
                          minHeight: 32,
                          ...(dueTone(openCard) && openCard.dueDate
                            ? {
                                backgroundColor: dueTone(openCard)?.bg,
                                color: dueTone(openCard)?.fg,
                                "&:hover": { filter: "brightness(1.08)" },
                              }
                            : null),
                        }}
                      >
                        {dateRangeLabel(openCard)}
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* members */}
                <Box sx={{ mt: 3, ml: 5.5 }}>
                  <Typography
                    sx={{ fontSize: 12.5, fontWeight: 700, color: L_MUTED, mb: 0.75 }}
                  >
                    Members
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                    {(openCard.members || []).map((name) => (
                      <MemberAvatar key={name} name={name} size={34} />
                    ))}
                    <IconButton
                      onClick={(event) =>
                        openPopover("members", event.currentTarget, openCard.id)
                      }
                      sx={{
                        width: 34,
                        height: 34,
                        color: L_TEXT,
                        backgroundColor: "rgba(9,30,66,0.08)",
                        "&:hover": { backgroundColor: "rgba(9,30,66,0.16)" },
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* description */}
                <Box sx={{ mt: 3.5 }}>
                  <SectionHead
                    icon={<SubjectIcon />}
                    title="Description"
                    action={
                      openCard.description && !editingDesc ? (
                        <Button
                          onClick={() => {
                            setDescDraft(openCard.description || "");
                            setEditingDesc(true);
                          }}
                          sx={lightButtonSx}
                        >
                          Edit
                        </Button>
                      ) : undefined
                    }
                  />

                  <Box sx={{ ml: 5.5 }}>
                    {editingDesc ? (
                      <Box>
                        <TextField
                          autoFocus
                          fullWidth
                          multiline
                          minRows={4}
                          placeholder="Add a more detailed description…"
                          value={descDraft}
                          onChange={(event) => setDescDraft(event.target.value)}
                          sx={lightFieldSx}
                        />
                        <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
                          <Button
                            variant="contained"
                            onClick={() => saveDescription(openCard)}
                            sx={primaryButtonSx}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingDesc(false)}
                            sx={lightGhostButtonSx}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : openCard.description ? (
                      <Typography
                        sx={{
                          fontSize: 14.5,
                          lineHeight: 1.6,
                          color: L_TEXT,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {openCard.description}
                      </Typography>
                    ) : (
                      <Box
                        onClick={() => {
                          setDescDraft("");
                          setEditingDesc(true);
                        }}
                        sx={{
                          minHeight: 80,
                          px: 2,
                          py: 1.5,
                          borderRadius: 1.5,
                          cursor: "pointer",
                          color: L_MUTED,
                          fontSize: 14.5,
                          border: "1px solid rgba(9,30,66,0.25)",
                          "&:hover": { borderColor: FOCUS_BLUE },
                        }}
                      >
                        Add a more detailed description…
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* attachments */}
                {(openCard.attachments || []).length > 0 && (
                  <Box sx={{ mt: 3.5 }}>
                    <SectionHead
                      icon={<AttachFileIcon />}
                      title="Attachments"
                      action={
                        <Button
                          startIcon={<AddIcon />}
                          onClick={(event) =>
                            openPopover("attachment", event.currentTarget, openCard.id)
                          }
                          sx={lightButtonSx}
                        >
                          Add
                        </Button>
                      }
                    />
                    <Box sx={{ ml: 5.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {(openCard.attachments || []).map((item) => {
                        const isFile = item.kind === "file";
                        const isImage = isFile && (item.mime || "").startsWith("image/");

                        return (
                          <Box
                            key={item.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.25,
                              px: 1.25,
                              py: 0.75,
                              borderRadius: 1.5,
                              backgroundColor: "rgba(9,30,66,0.06)",
                            }}
                          >
                            {/* thumbnail / icon */}
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                flexShrink: 0,
                                borderRadius: 1,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(9,30,66,0.08)",
                                color: L_MUTED,
                              }}
                            >
                              {isImage ? (
                                <Box
                                  component="img"
                                  src={item.url}
                                  alt={item.name}
                                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : isFile ? (
                                <InsertDriveFileOutlinedIcon />
                              ) : (
                                <LinkIcon />
                              )}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                component="a"
                                href={item.url}
                                {...(isFile
                                  ? { download: item.name }
                                  : { target: "_blank", rel: "noopener noreferrer" })}
                                sx={{
                                  display: "block",
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: FOCUS_BLUE,
                                  textDecoration: "none",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: L_MUTED,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {isFile
                                  ? `File${item.size ? ` · ${formatSize(item.size)}` : ""} · click to download`
                                  : item.url}
                              </Typography>
                            </Box>

                            <IconButton
                              size="small"
                              onClick={() => deleteAttachment(openCard.id, item.id)}
                              sx={{ color: L_MUTED }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* checklists */}
                {(openCard.checklists || []).map((checklist) => {
                  const done = checklist.items.filter((item) => item.done).length;
                  const percent = checklist.items.length
                    ? Math.round((done / checklist.items.length) * 100)
                    : 0;

                  return (
                    <Box key={checklist.id} sx={{ mt: 3.5 }}>
                      <SectionHead
                        icon={<CheckBoxOutlinedIcon />}
                        title={checklist.title}
                        action={
                          <Button
                            onClick={() => deleteChecklist(openCard.id, checklist.id)}
                            sx={lightButtonSx}
                          >
                            Delete
                          </Button>
                        }
                      />

                      <Box sx={{ ml: 5.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                          <Typography sx={{ fontSize: 12, color: L_MUTED, width: 32 }}>
                            {percent}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "rgba(9,30,66,0.12)",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor:
                                  percent === 100 ? "#4BCE97" : FOCUS_BLUE,
                              },
                            }}
                          />
                        </Box>

                        {checklist.items.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              "& .item-delete": { opacity: 0 },
                              "&:hover .item-delete": { opacity: 1 },
                            }}
                          >
                            <Checkbox
                              checked={item.done}
                              onChange={() =>
                                updateChecklist(openCard.id, checklist.id, (list) => ({
                                  ...list,
                                  items: list.items.map((entry) =>
                                    entry.id === item.id
                                      ? { ...entry, done: !entry.done }
                                      : entry
                                  ),
                                }))
                              }
                              sx={{
                                color: L_MUTED,
                                "&.Mui-checked": { color: FOCUS_BLUE },
                              }}
                            />
                            <Typography
                              sx={{
                                flex: 1,
                                fontSize: 14.5,
                                wordBreak: "break-word",
                                textDecoration: item.done ? "line-through" : "none",
                                color: item.done ? L_MUTED : L_TEXT,
                              }}
                            >
                              {item.text}
                            </Typography>
                            <IconButton
                              className="item-delete"
                              size="small"
                              onClick={() =>
                                updateChecklist(openCard.id, checklist.id, (list) => ({
                                  ...list,
                                  items: list.items.filter(
                                    (entry) => entry.id !== item.id
                                  ),
                                }))
                              }
                              sx={{ color: "#F87168" }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ))}

                        {addingItemTo === checklist.id ? (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              autoFocus
                              fullWidth
                              multiline
                              minRows={2}
                              placeholder="Add an item"
                              value={itemDraft}
                              onChange={(event) => setItemDraft(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                  event.preventDefault();
                                  addChecklistItem(openCard.id, checklist.id);
                                }
                                if (event.key === "Escape") {
                                  setAddingItemTo(null);
                                  setItemDraft("");
                                }
                              }}
                              sx={lightFieldSx}
                            />
                            <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
                              <Button
                                variant="contained"
                                disabled={!itemDraft.trim()}
                                onClick={() => addChecklistItem(openCard.id, checklist.id)}
                                sx={primaryButtonSx}
                              >
                                Add
                              </Button>
                              <Button
                                onClick={() => {
                                  setAddingItemTo(null);
                                  setItemDraft("");
                                }}
                                sx={lightGhostButtonSx}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            onClick={() => {
                              setAddingItemTo(checklist.id);
                              setItemDraft("");
                            }}
                            sx={{ ...lightButtonSx, mt: 1, minHeight: 32 }}
                          >
                            Add an item
                          </Button>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* ===== RIGHT: comments and activity ===== */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflowY: { md: "auto" },
                  px: 3,
                  py: 2.5,
                  backgroundColor: PANEL_BG,
                  color: CARD_TEXT,
                  borderLeft: { md: "1px solid rgba(255,255,255,0.1)" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    mb: 2,
                  }}
                >
                  <ChatIcon sx={{ color: CARD_MUTED }} />
                  <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>
                    Comments and activity
                  </Typography>
                  <Button
                    onClick={() => setShowDetails((prev) => !prev)}
                    sx={darkButtonSx}
                  >
                    {showDetails ? "Hide details" : "Show details"}
                  </Button>
                </Box>

                {commentOpen ? (
                  <Box sx={{ mb: 2.5 }}>
                    <TextField
                      autoFocus
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="Write a comment…"
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                          event.preventDefault();
                          addComment(openCard);
                        }
                        if (event.key === "Escape") {
                          setCommentOpen(false);
                          setCommentDraft("");
                        }
                      }}
                      sx={darkFieldSx}
                    />
                    <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
                      <Button
                        variant="contained"
                        disabled={!commentDraft.trim()}
                        onClick={() => addComment(openCard)}
                        sx={primaryButtonSx}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setCommentOpen(false);
                          setCommentDraft("");
                        }}
                        sx={ghostButtonSx}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    onClick={() => setCommentOpen(true)}
                    sx={{
                      mb: 2.5,
                      px: 2,
                      py: 1.4,
                      borderRadius: 2,
                      cursor: "pointer",
                      color: CARD_MUTED,
                      fontSize: 15,
                      backgroundColor: DEFAULT_CARD_COLOR,
                      "&:hover": { backgroundColor: "#000000" },
                    }}
                  >
                    Write a comment…
                  </Box>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {feed.map((entry) => (
                    <Box key={entry.key} sx={{ display: "flex", gap: 1.5 }}>
                      <MemberAvatar name={CURRENT_USER} size={34} />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {entry.commentId !== undefined ? (
                          <>
                            <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: "#FFFFFF" }}>
                              {CURRENT_USER}
                              <Typography
                                component="span"
                                sx={{ ml: 1, fontSize: 12, color: CARD_MUTED, fontWeight: 400 }}
                              >
                                {formatDateTime(entry.time)}
                              </Typography>
                            </Typography>

                            <Box
                              sx={{
                                mt: 0.5,
                                px: 1.5,
                                py: 1,
                                borderRadius: 2,
                                backgroundColor: DEFAULT_CARD_COLOR,
                                color: CARD_TEXT,
                                fontSize: 14.5,
                                lineHeight: 1.5,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                              }}
                            >
                              {entry.text}
                            </Box>

                            <Button
                              onClick={() =>
                                deleteComment(openCard.id, entry.commentId as number)
                              }
                              sx={{
                                mt: 0.25,
                                p: 0,
                                minWidth: 0,
                                textTransform: "none",
                                fontSize: 12,
                                color: CARD_MUTED,
                                textDecoration: "underline",
                                "&:hover": {
                                  backgroundColor: "transparent",
                                  color: CARD_TEXT,
                                },
                              }}
                            >
                              Delete
                            </Button>
                          </>
                        ) : (
                          <>
                            <Typography sx={{ fontSize: 14.5, color: CARD_TEXT }}>
                              <Box component="span" sx={{ fontWeight: 700, color: "#FFFFFF" }}>
                                {CURRENT_USER}
                              </Box>{" "}
                              {entry.text}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 12.5,
                                color: FOCUS_BLUE,
                                textDecoration: "underline",
                              }}
                            >
                              {formatDateTime(entry.time)}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Dialog>

      {/* ========================= POPOVER (labels, members, dates ...) ========================= */}
      <Popover
        open={Boolean(popover)}
        anchorEl={popover?.anchor}
        onClose={() => setPopover(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 304,
            mt: 0.75,
            maxHeight: "80vh",
            borderRadius: 2,
            backgroundColor: `${PANEL_BG} !important`,
            backgroundImage: "none",
            color: `${CARD_TEXT} !important`,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: PANEL_BG,
            color: CARD_TEXT,
            borderRadius: 2,
            minHeight: 40,
          }}
        >
          {renderPopoverBody()}
        </Box>
      </Popover>

      {/* ========================= ARCHIVED CARDS ========================= */}
      <Dialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: DEFAULT_CARD_COLOR,
            backgroundImage: "none",
            color: CARD_TEXT,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Archived cards</DialogTitle>

        <DialogContent>
          {archivedCards.length === 0 ? (
            <Typography sx={{ color: CARD_MUTED }}>
              No archived cards. Archive a card and it will show up here.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {archivedCards.map(({ card, listTitle }) => (
                <Box
                  key={card.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: PANEL_BG,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14.5, wordBreak: "break-word" }}>
                      {card.title}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: CARD_MUTED }}>
                      in {listTitle}
                    </Typography>
                  </Box>

                  <Button
                    startIcon={<UnarchiveOutlinedIcon />}
                    onClick={() => restoreCard(card.id)}
                    sx={darkButtonSx}
                  >
                    Restore
                  </Button>

                  <IconButton
                    onClick={() => {
                      snapshotForUndo("Card deleted");
                      setDeleteTarget({ type: "card", id: card.id });
                    }}
                    sx={{ color: "#F87168" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setArchiveOpen(false)} sx={ghostButtonSx}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================= DELETE DIALOG ========================= */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#172B4D" }}>
          {deleteTarget?.type === "list" ? "Delete list?" : "Delete card?"}
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "#64748B", lineHeight: 1.6 }}>
            {deleteTarget?.type === "list"
              ? "This will permanently delete the list and all cards inside it."
              : "This will permanently delete this card."}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ textTransform: "none", fontWeight: 700, color: "#64748B" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={confirmDelete}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 1.5,
              backgroundColor: "#DC2626",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#B91C1C", boxShadow: "none" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================= SNACKBAR (with Undo when available) ========================= */}
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => {
          setSnack("");
          setUndoSnapshot(null);
        }}
        message={snack}
        action={
          undoSnapshot && snack === undoSnapshot.message ? (
            <Button size="small" onClick={undoLastAction} sx={{ color: FOCUS_BLUE, fontWeight: 700 }}>
              Undo
            </Button>
          ) : undefined
        }
      />
    </Box>
  );
}

export default BoardPage;
