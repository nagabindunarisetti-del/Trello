import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Snackbar,
  Paper,
  ClickAwayListener,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpIcon from "@mui/icons-material/Help";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AppsIcon from "@mui/icons-material/Apps";

import {
  getBoards,
  saveBoards,
} from "../utils/boardStorage";

import type { BoardItem } from "../types/board";

/* =====================================================
   THEME
===================================================== */

const C = {
  bar: "#1d2125",
  border: "#3d4750",
  hover: "#2c333a",
  text: "#b6c2cf",
  textStrong: "#ffffff",
  muted: "#8c9bab",
  blue: "#579dff",
  blueHover: "#85b8ff",
  menuBg: "#282e33",
  menuHover: "#333c43",
  star: "#f5cd47",
};

/* =====================================================
   HELPERS
===================================================== */

const getName = (board: BoardItem) =>
  board.title || "Untitled board";

const isStarred = (board: BoardItem) =>
  Boolean(board.starred);

/* =====================================================
   MENUS
===================================================== */

const SIMPLE_MENUS = {
  help: [
    "Getting started",
    "Keyboard shortcuts",
    "Contact support",
  ],

  profile: [
    "Profile",
    "Settings",
    "Log out",
  ],
};

/* =====================================================
   STYLES
===================================================== */

const iconBtnSx = {
  color: C.text,
  borderRadius: "3px",
  p: 0.75,

  "&:hover": {
    bgcolor: C.hover,
    color: C.textStrong,
  },
};

const menuPaperSx = {
  bgcolor: C.menuBg,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: "8px",
  boxShadow:
    "0 8px 12px #0304045c, 0 0 1px #03040480",
  mt: 0.5,
  minWidth: 260,

  "& .MuiMenuItem-root": {
    fontSize: 14,
  },

  "& .MuiMenuItem-root:hover": {
    bgcolor: C.menuHover,
    color: C.textStrong,
  },

  "& .MuiDivider-root": {
    borderColor: C.border,
  },
};

/* =====================================================
   PROPS
===================================================== */

interface NavbarProps {
  onOpenBoard?: (board: BoardItem) => void;
  onSelect?: (label: string) => void;
}

/* =====================================================
   NAVBAR
===================================================== */

function Navbar({
  onOpenBoard,
  onSelect = () => {},
}: NavbarProps) {
  const navigate = useNavigate();

  /* =====================================================
     MENU STATE
  ===================================================== */

  const [menu, setMenu] = useState<{
    id: string | null;
    anchor: HTMLElement | null;
  }>({
    id: null,
    anchor: null,
  });

  /* =====================================================
     SEARCH STATE
  ===================================================== */

  const [query, setQuery] = useState("");

  const [searchOpen, setSearchOpen] =
    useState(false);

  const searchRef =
    useRef<HTMLDivElement | null>(null);

  /* =====================================================
     BOARDS STATE
  ===================================================== */

  const [boards, setBoards] =
    useState<BoardItem[]>([]);

  /* =====================================================
     CREATE BOARD STATE
  ===================================================== */

  const [createOpen, setCreateOpen] =
    useState(false);

  const [newName, setNewName] =
    useState("");

  /* =====================================================
     TOAST
  ===================================================== */

  const [toast, setToast] =
    useState("");

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const [notifications, setNotifications] =
    useState([
      {
        id: 1,
        text:
          'Aisha assigned you to "Fix login bug"',
        read: false,
      },
      {
        id: 2,
        text:
          "Sprint 24 is due tomorrow",
        read: false,
      },
      {
        id: 3,
        text:
          'Ravi commented on "Homepage hero"',
        read: false,
      },
    ]);

  /* =====================================================
     LOAD BOARDS
  ===================================================== */

  useEffect(() => {
    const loadBoards = () => {
      try {
        const storedBoards = getBoards();

        setBoards(
          Array.isArray(storedBoards)
            ? storedBoards
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load boards:",
          error
        );

        setBoards([]);
      }
    };

    loadBoards();

    window.addEventListener(
      "boardsUpdated",
      loadBoards
    );

    return () => {
      window.removeEventListener(
        "boardsUpdated",
        loadBoards
      );
    };
  }, []);

  /* =====================================================
     SEARCH RESULTS
  ===================================================== */

  const results = useMemo(() => {
    const searchText = query
      .trim()
      .toLowerCase();

    if (!searchText) {
      return [];
    }

    return boards.filter((board) => {
      const boardName = getName(board)
        .toLowerCase()
        .trim();

      return boardName.includes(searchText);
    });
  }, [query, boards]);

  /* =====================================================
     UNREAD NOTIFICATIONS
  ===================================================== */

  const unread =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  /* =====================================================
     MENU HANDLERS
  ===================================================== */

  const openMenu =
    (id: string) =>
    (event: MouseEvent<HTMLElement>) => {
      setMenu({
        id,
        anchor: event.currentTarget,
      });
    };

  const closeMenu = () => {
    setMenu({
      id: null,
      anchor: null,
    });
  };

  /* =====================================================
     SEARCH HANDLERS
  ===================================================== */

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setQuery(value);

    if (value.trim()) {
      setSearchOpen(true);
    } else {
      setSearchOpen(false);
    }
  };

  const handleSearchFocus = () => {
    if (query.trim()) {
      setSearchOpen(true);
    }
  };

  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (results.length > 0) {
        handleOpenBoard(results[0]);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      setSearchOpen(false);

      return;
    }
  };

  /* =====================================================
     OPEN BOARD
  ===================================================== */

  const handleOpenBoard = (
    board: BoardItem
  ) => {
    setQuery("");

    setSearchOpen(false);

    closeMenu();

    navigate(`/board/${board.id}`);

    onOpenBoard?.(board);
  };

  /* =====================================================
     CREATE BOARD
  ===================================================== */

  const submitCreate = () => {
    const name = newName.trim();

    if (!name) {
      return;
    }

    const newBoard: BoardItem = {
      id: Date.now(),
      title: name,
      background:
        "linear-gradient(135deg, #667eea, #764ba2)",
      starred: false,
      lists: [],
    };

    const currentBoards = getBoards();

    const updatedBoards = [
      ...currentBoards,
      newBoard,
    ];

    saveBoards(updatedBoards);

    setBoards(updatedBoards);

    window.dispatchEvent(
      new Event("boardsUpdated")
    );

    setCreateOpen(false);

    setNewName("");

    setToast(
      `Board "${name}" created`
    );

    navigate(`/board/${newBoard.id}`);
  };

  /* =====================================================
     TOGGLE STAR
  ===================================================== */

  const handleToggleStar = (
    event: MouseEvent,
    board: BoardItem
  ) => {
    event.stopPropagation();

    const currentBoards = getBoards();

    const updatedBoards =
      currentBoards.map((item) =>
        item.id === board.id
          ? {
              ...item,
              starred: !item.starred,
            }
          : item
      );

    saveBoards(updatedBoards);

    setBoards(updatedBoards);

    window.dispatchEvent(
      new Event("boardsUpdated")
    );
  };

  /* =====================================================
     SIMPLE MENU
  ===================================================== */

  const pickSimple = (
    label: string
  ) => {
    closeMenu();

    setToast(label);

    onSelect(label);
  };

  /* =====================================================
     SEARCH RESULT
     
     IMPORTANT:
     This is Box, NOT MenuItem.
     MenuItem cannot be used outside Menu/MenuList.
  ===================================================== */

  const renderBoard = (
    board: BoardItem
  ) => {
    return (
      <Box
        key={board.id}
        role="button"
        tabIndex={0}
        onClick={() =>
          handleOpenBoard(board)
        }
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();

            handleOpenBoard(board);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          gap: 1,

          minHeight: 46,

          px: 1.5,

          cursor: "pointer",

          "&:hover": {
            bgcolor: C.menuHover,
          },

          "&:focus": {
            outline:
              `2px solid ${C.blue}`,

            outlineOffset: "-2px",
          },
        }}
      >
        {/* BOARD NAME */}

        <Typography
          sx={{
            fontSize: 14,

            color: C.textStrong,

            overflow: "hidden",

            textOverflow:
              "ellipsis",

            whiteSpace:
              "nowrap",

            flex: 1,

            minWidth: 0,
          }}
        >
          {getName(board)}
        </Typography>

        {/* STAR BUTTON */}

        <IconButton
          size="small"
          aria-label={
            isStarred(board)
              ? "Unstar board"
              : "Star board"
          }
          onClick={(event) => {
            event.stopPropagation();

            handleToggleStar(
              event,
              board
            );
          }}
          sx={{
            color: isStarred(board)
              ? C.star
              : C.muted,

            flexShrink: 0,

            "&:hover": {
              bgcolor: C.hover,
            },
          }}
        >
          {isStarred(board) ? (
            <StarIcon
              fontSize="small"
            />
          ) : (
            <StarBorderIcon
              fontSize="small"
            />
          )}
        </IconButton>
      </Box>
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* =================================================
          NAVBAR
      ================================================= */}

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          height: 48,

          bgcolor: C.bar,

          backgroundImage: "none",

          borderBottom:
            `1px solid ${C.border}`,

          zIndex: 1200,
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight:
              "48px !important",

            height: 48,

            px: 1.5,

            gap: 1,
          }}
        >
          {/* =================================================
              APP SWITCHER
          ================================================= */}

          <IconButton
            aria-label="switch apps"
            onClick={openMenu("apps")}
            sx={iconBtnSx}
          >
            <AppsIcon />
          </IconButton>

          {/* =================================================
              LOGO
          ================================================= */}

          <Box
            onClick={() =>
              navigate("/")
            }
            sx={{
              display: "flex",

              alignItems: "center",

              gap: 0.75,

              height: 32,

              px: 0.75,

              borderRadius: "3px",

              cursor: "pointer",

              flexShrink: 0,

              "&:hover": {
                bgcolor: C.hover,
              },
            }}
          >
            {/* LOGO ICON */}

            <Box
              sx={{
                display: "flex",

                gap: "2px",

                p: "3px",

                width: 20,

                height: 20,

                bgcolor: C.blue,

                borderRadius: "3px",

                boxSizing:
                  "border-box",
              }}
            >
              <Box
                sx={{
                  flex: 1,

                  height: "75%",

                  bgcolor: C.bar,

                  borderRadius: "1px",
                }}
              />

              <Box
                sx={{
                  flex: 1,

                  height: "50%",

                  bgcolor: C.bar,

                  borderRadius: "1px",
                }}
              />
            </Box>

            {/* LOGO TEXT */}

            <Typography
              sx={{
                fontSize: 18,

                fontWeight: 700,

                color: C.text,

                letterSpacing:
                  "-0.3px",

                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              TaskFlow
            </Typography>
          </Box>

          {/* =================================================
              SEARCH
          ================================================= */}

          <Box
            ref={searchRef}
            sx={{
              flex: 1,

              minWidth: 0,

              position: "relative",
            }}
          >
            <TextField
              fullWidth
              placeholder="Search boards"
              size="small"
              value={query}
              onChange={
                handleSearchChange
              }
              onFocus={
                handleSearchFocus
              }
              onKeyDown={
                handleSearchKeyDown
              }
              autoComplete="off"
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 34,

                  bgcolor: "#22272b",

                  color:
                    C.textStrong,

                  borderRadius:
                    "3px",

                  pl: 1.25,

                  "& fieldset": {
                    borderColor:
                      "#738496",
                  },

                  "&:hover fieldset": {
                    borderColor:
                      C.text,
                  },

                  "&.Mui-focused": {
                    bgcolor: C.bar,
                  },

                  "&.Mui-focused fieldset": {
                    borderColor:
                      C.blue,

                    borderWidth: 2,
                  },
                },

                "& input": {
                  color:
                    C.textStrong,

                  fontSize: 14,

                  p:
                    "0 8px 0 0",
                },

                "& input::placeholder": {
                  color: C.text,

                  opacity: 1,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{
                        mr: 0.75,
                      }}
                    >
                      <SearchIcon
                        sx={{
                          color: C.text,

                          fontSize: 18,
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* =================================================
                SEARCH RESULTS

                IMPORTANT:
                No MenuItem here.
                Using Box prevents the
                MenuListContext crash.
            ================================================= */}

            {searchOpen &&
              query.trim() && (
                <ClickAwayListener
                  onClickAway={() => {
                    setSearchOpen(
                      false
                    );
                  }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      position:
                        "absolute",

                      top: 40,

                      left: 0,

                      right: 0,

                      zIndex: 1500,

                      bgcolor:
                        C.menuBg,

                      color: C.text,

                      border:
                        `1px solid ${C.border}`,

                      borderRadius:
                        "8px",

                      overflow:
                        "hidden",

                      boxShadow:
                        "0 8px 20px rgba(0,0,0,0.4)",

                      maxHeight: 360,

                      overflowY:
                        "auto",
                    }}
                  >
                    {/* NO RESULTS */}

                    {results.length ===
                    0 ? (
                      <Box
                        sx={{
                          p: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14,

                            color:
                              C.muted,
                          }}
                        >
                          No boards found
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,

                            color:
                              C.muted,

                            mt: 0.5,
                          }}
                        >
                          Try another
                          board name.
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {/* RESULT COUNT */}

                        <Box
                          sx={{
                            px: 2,

                            py: 1,

                            borderBottom:
                              `1px solid ${C.border}`,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 12,

                              color:
                                C.muted,
                            }}
                          >
                            {results.length}{" "}
                            {results.length ===
                            1
                              ? "board"
                              : "boards"}{" "}
                            found
                          </Typography>
                        </Box>

                        {/* BOARD RESULTS */}

                        {results.map(
                          renderBoard
                        )}
                      </>
                    )}
                  </Paper>
                </ClickAwayListener>
              )}
          </Box>

          {/* =================================================
              CREATE
          ================================================= */}

          <Button
            onClick={() =>
              setCreateOpen(true)
            }
            startIcon={
              <AddIcon />
            }
            sx={{
              display: {
                xs: "none",
                md: "inline-flex",
              },

              flexShrink: 0,

              height: 32,

              px: 1.5,

              minWidth: 0,

              bgcolor: C.blue,

              color: "#1d2125",

              textTransform:
                "none",

              fontSize: 14,

              fontWeight: 500,

              borderRadius: "3px",

              boxShadow: "none",

              "&:hover": {
                bgcolor:
                  C.blueHover,

                boxShadow:
                  "none",
              },
            }}
          >
            Create
          </Button>

          {/* =================================================
              MOBILE CREATE
          ================================================= */}

          <IconButton
            aria-label="create"
            onClick={() =>
              setCreateOpen(true)
            }
            sx={{
              ...iconBtnSx,

              display: {
                xs: "inline-flex",
                md: "none",
              },

              bgcolor: C.blue,

              color: "#1d2125",

              "&:hover": {
                bgcolor:
                  C.blueHover,
              },
            }}
          >
            <AddIcon
              fontSize="small"
            />
          </IconButton>

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <Box
            sx={{
              display: "flex",

              alignItems:
                "center",

              gap: 0.25,

              flexShrink: 0,
            }}
          >
            {/* NOTIFICATIONS */}

            <IconButton
              aria-label="notifications"
              onClick={openMenu(
                "notifications"
              )}
              sx={{
                ...iconBtnSx,

                display: {
                  xs: "none",
                  sm: "flex",
                },
              }}
            >
              <Badge
                badgeContent={
                  unread
                }
                color="error"
              >
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>

            {/* HELP */}

            <IconButton
              aria-label="help"
              onClick={openMenu(
                "help"
              )}
              sx={{
                ...iconBtnSx,

                display: {
                  xs: "none",
                  sm: "flex",
                },
              }}
            >
              <HelpIcon />
            </IconButton>

            {/* PROFILE */}

            <IconButton
              aria-label="account"
              onClick={openMenu(
                "profile"
              )}
              sx={{
                p: 0.5,

                ml: 0.25,
              }}
            >
              <Avatar
                sx={{
                  width: 28,

                  height: 28,

                  bgcolor: C.blue,

                  color:
                    "#1d2125",

                  fontSize: 13,

                  fontWeight: 700,
                }}
              >
                U
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* =================================================
          HELP / PROFILE MENU
      ================================================= */}

      <Menu
        anchorEl={menu.anchor}
        open={
          menu.id === "help" ||
          menu.id === "profile"
        }
        onClose={closeMenu}
        PaperProps={{
          sx: menuPaperSx,
        }}
      >
        {(
          SIMPLE_MENUS[
            menu.id as keyof typeof SIMPLE_MENUS
          ] || []
        ).map((label) => (
          <MenuItem
            key={label}
            onClick={() =>
              pickSimple(label)
            }
          >
            {label}
          </MenuItem>
        ))}
      </Menu>

      {/* =================================================
          APP SWITCHER
      ================================================= */}

      <Menu
        anchorEl={menu.anchor}
        open={
          menu.id === "apps"
        }
        onClose={closeMenu}
        PaperProps={{
          sx: {
            ...menuPaperSx,

            minWidth: 220,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            closeMenu();

            navigate("/");
          }}
        >
          Boards
        </MenuItem>

        <MenuItem
          onClick={() => {
            closeMenu();

            navigate(
              "/templates"
            );
          }}
        >
          Templates
        </MenuItem>
      </Menu>

      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      <Menu
        anchorEl={menu.anchor}
        open={
          menu.id ===
          "notifications"
        }
        onClose={closeMenu}
        PaperProps={{
          sx: {
            ...menuPaperSx,

            width: 340,
          },
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            px: 2,

            py: 0.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,

              color: "#fff",

              fontSize: 15,
            }}
          >
            Notifications
          </Typography>

          <Button
            size="small"
            disabled={
              unread === 0
            }
            onClick={() =>
              setNotifications(
                (list) =>
                  list.map(
                    (item) => ({
                      ...item,

                      read: true,
                    })
                  )
              )
            }
            sx={{
              textTransform:
                "none",

              color: C.blue,
            }}
          >
            Mark all as read
          </Button>
        </Box>

        <Divider />

        {/* NOTIFICATIONS */}

        {notifications.map(
          (notification) => (
            <MenuItem
              key={
                notification.id
              }
              onClick={() =>
                setNotifications(
                  (list) =>
                    list.map(
                      (item) =>
                        item.id ===
                        notification.id
                          ? {
                              ...item,

                              read: true,
                            }
                          : item
                    )
                )
              }
              sx={{
                whiteSpace:
                  "normal",

                alignItems:
                  "flex-start",

                gap: 1.25,

                py: 1.25,
              }}
            >
              <Box
                sx={{
                  width: 8,

                  height: 8,

                  mt: 0.75,

                  flexShrink: 0,

                  borderRadius:
                    "50%",

                  bgcolor:
                    notification.read
                      ? "transparent"
                      : C.blue,
                }}
              />

              <Typography
                sx={{
                  fontSize: 14,

                  color:
                    notification.read
                      ? C.muted
                      : "#fff",
                }}
              >
                {
                  notification.text
                }
              </Typography>
            </MenuItem>
          )
        )}
      </Menu>

      {/* =================================================
          CREATE BOARD DIALOG
      ================================================= */}

      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);

          setNewName("");
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Create board
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Board title"
            placeholder="Enter board name..."
            value={newName}
            onChange={(event) =>
              setNewName(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                newName.trim()
              ) {
                event.preventDefault();

                submitCreate();

                return;
              }

              if (
                event.key ===
                "Escape"
              ) {
                setCreateOpen(
                  false
                );

                setNewName("");
              }
            }}
            sx={{
              mt: 1,
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setCreateOpen(
                false
              );

              setNewName("");
            }}
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              submitCreate
            }
            disabled={
              !newName.trim()
            }
            sx={{
              textTransform:
                "none",
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================
          TOAST
      ================================================= */}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2000}
        onClose={() =>
          setToast("")
        }
        message={toast}
      />
    </>
  );
}

export default Navbar;