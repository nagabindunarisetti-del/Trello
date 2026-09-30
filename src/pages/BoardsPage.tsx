import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AddIcon from "@mui/icons-material/Add";

import { useNavigate } from "react-router-dom";

import {
  getBoards,
  saveBoards,
} from "../utils/boardStorage";

import type { BoardItem } from "../types/board";

function BoardsPage() {
  const navigate = useNavigate();

  const [boards, setBoards] =
    useState<BoardItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("Most recently active");

  const [menuAnchor, setMenuAnchor] =
    useState<null | HTMLElement>(null);

  const [selectedBoard, setSelectedBoard] =
    useState<BoardItem | null>(null);

  const [createDialog, setCreateDialog] =
    useState(false);

  const [newBoardName, setNewBoardName] =
    useState("");

  /* =====================================================
     LOAD BOARDS
     ===================================================== */

  useEffect(() => {
    const loadBoards = () => {
      const storedBoards = getBoards();

      setBoards(storedBoards);
    };

    // Initial load
    loadBoards();

    /*
     * Listen for board changes from Navbar
     * or other components.
     */
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
     FILTER + SORT
     ===================================================== */

  const filteredBoards = useMemo(() => {
    let result = boards.filter((board) =>
      board.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (sortBy === "Alphabetically A-Z") {
      result = [...result].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (sortBy === "Alphabetically Z-A") {
      result = [...result].sort((a, b) =>
        b.title.localeCompare(a.title)
      );
    }

    if (sortBy === "Starred") {
      result = result.filter(
        (board) => board.starred
      );
    }

    if (sortBy === "Most recently active") {
      result = [...result].sort(
        (a, b) => b.id - a.id
      );
    }

    return result;
  }, [boards, search, sortBy]);

  /* =====================================================
     OPEN BOARD
     ===================================================== */

  const handleOpenBoard = (
    board: BoardItem
  ) => {
    navigate(`/board/${board.id}`);
  };

  /* =====================================================
     CREATE BOARD
     ===================================================== */

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) {
      return;
    }

    const newBoard: BoardItem = {
      id: Date.now(),

      title: newBoardName.trim(),

      background:
        "linear-gradient(135deg, #667eea, #764ba2)",

      starred: false,

      lists: [],
    };

    const updatedBoards = [
      ...boards,
      newBoard,
    ];

    setBoards(updatedBoards);

    saveBoards(updatedBoards);

    /*
     * Tell Navbar and other components
     * that boards have changed.
     */
    window.dispatchEvent(
      new Event("boardsUpdated")
    );

    setNewBoardName("");

    setCreateDialog(false);
  };

  /* =====================================================
     OPEN BOARD MENU
     ===================================================== */

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    board: BoardItem
  ) => {
    event.stopPropagation();

    setMenuAnchor(
      event.currentTarget
    );

    setSelectedBoard(board);
  };

  /* =====================================================
     CLOSE MENU
     ===================================================== */

  const handleCloseMenu = () => {
    setMenuAnchor(null);

    setSelectedBoard(null);
  };

  /* =====================================================
     STAR / UNSTAR
     ===================================================== */

  const handleToggleStar = () => {
    if (!selectedBoard) {
      return;
    }

    const updatedBoards =
      boards.map((board) =>
        board.id === selectedBoard.id
          ? {
              ...board,
              starred: !board.starred,
            }
          : board
      );

    setBoards(updatedBoards);

    saveBoards(updatedBoards);

    /*
     * Tell Navbar that board data changed.
     */
    window.dispatchEvent(
      new Event("boardsUpdated")
    );

    handleCloseMenu();
  };

  /* =====================================================
     DELETE BOARD
     ===================================================== */

  const handleDeleteBoard = () => {
    if (!selectedBoard) {
      return;
    }

    const updatedBoards =
      boards.filter(
        (board) =>
          board.id !== selectedBoard.id
      );

    setBoards(updatedBoards);

    saveBoards(updatedBoards);

    /*
     * Tell Navbar that board data changed.
     */
    window.dispatchEvent(
      new Event("boardsUpdated")
    );

    handleCloseMenu();
  };

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <Box
      sx={{
        minHeight: "100vh",

        backgroundColor:
          "#f4f5f7",

        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Box
        sx={{
          display: "flex",

          alignItems: {
            xs: "flex-start",
            sm: "center",
          },

          justifyContent:
            "space-between",

          flexDirection: {
            xs: "column",
            sm: "row",
          },

          gap: 2,

          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 28,

              fontWeight: 700,

              color: "#172b4d",
            }}
          >
            Boards
          </Typography>

          <Typography
            sx={{
              mt: 0.5,

              fontSize: 14,

              color: "#5e6c84",
            }}
          >
            Manage and organize your
            boards.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            <AddIcon />
          }
          onClick={() =>
            setCreateDialog(true)
          }
          sx={{
            textTransform:
              "none",

            fontWeight: 600,

            backgroundColor:
              "#0c66e4",

            "&:hover": {
              backgroundColor:
                "#0055cc",
            },
          }}
        >
          Create board
        </Button>
      </Box>

      {/* =================================================
          SEARCH + SORT
      ================================================= */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <TextField
          size="small"
          placeholder="Search boards..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          sx={{
            width: {
              xs: "100%",
              sm: 300,
            },

            backgroundColor:
              "#fff",

            "& .MuiOutlinedInput-root":
              {
                borderRadius: 1.5,
              },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color:
                      "#5e6c84",
                  }}
                />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          size="small"
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target.value
            )
          }
          sx={{
            width: {
              xs: "100%",
              sm: 220,
            },

            backgroundColor:
              "#fff",

            "& .MuiOutlinedInput-root":
              {
                borderRadius: 1.5,
              },
          }}
        >
          <MenuItem value="Most recently active">
            Most recently active
          </MenuItem>

          <MenuItem value="Alphabetically A-Z">
            Alphabetically A-Z
          </MenuItem>

          <MenuItem value="Alphabetically Z-A">
            Alphabetically Z-A
          </MenuItem>

          <MenuItem value="Starred">
            Starred
          </MenuItem>
        </TextField>
      </Stack>

      {/* =================================================
          BOARD COUNT
      ================================================= */}

      <Typography
        sx={{
          fontSize: 16,

          fontWeight: 700,

          color: "#172b4d",

          mb: 2,
        }}
      >
        Your boards ({
          filteredBoards.length
        })
      </Typography>

      {/* =================================================
          BOARD GRID
      ================================================= */}

      {filteredBoards.length > 0 ? (
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },

            gap: 2,
          }}
        >
          {filteredBoards.map(
            (board) => (
              <Card
                key={board.id}
                sx={{
                  height: 160,

                  borderRadius: 2,

                  overflow:
                    "hidden",

                  position:
                    "relative",

                  boxShadow:
                    "0 2px 6px rgba(9,30,66,.15)",

                  transition:
                    "transform .15s, box-shadow .15s",

                  "&:hover": {
                    transform:
                      "translateY(-2px)",

                    boxShadow:
                      "0 6px 14px rgba(9,30,66,.2)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() =>
                    handleOpenBoard(
                      board
                    )
                  }
                  sx={{
                    height: "100%",
                  }}
                >
                  {/* BOARD BACKGROUND */}

                  <Box
                    sx={{
                      position:
                        "absolute",

                      inset: 0,

                      background:
                        board.background ||
                        "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                  />

                  {/* DARK OVERLAY */}

                  <Box
                    sx={{
                      position:
                        "absolute",

                      inset: 0,

                      background:
                        "rgba(0,0,0,.15)",
                    }}
                  />

                  {/* CONTENT */}

                  <CardContent
                    sx={{
                      position:
                        "relative",

                      zIndex: 2,

                      height: "100%",

                      display: "flex",

                      flexDirection:
                        "column",

                      justifyContent:
                        "space-between",

                      p: 2,

                      "&:last-child": {
                        pb: 2,
                      },
                    }}
                  >
                    {/* TOP */}

                    <Box
                      sx={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "flex-start",

                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            "#fff",

                          fontSize: 17,

                          fontWeight: 700,

                          lineHeight:
                            1.2,

                          wordBreak:
                            "break-word",
                        }}
                      >
                        {board.title}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={(
                          event
                        ) =>
                          handleOpenMenu(
                            event,
                            board
                          )
                        }
                        sx={{
                          color:
                            "#fff",

                          backgroundColor:
                            "rgba(0,0,0,.18)",

                          "&:hover": {
                            backgroundColor:
                              "rgba(0,0,0,.35)",
                          },
                        }}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </Box>

                    {/* BOTTOM */}

                    <Box
                      sx={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            "rgba(255,255,255,.9)",

                          fontSize: 13,
                        }}
                      >
                        {
                          board.lists
                            .length
                        }{" "}
                        {board.lists
                          .length ===
                        1
                          ? "list"
                          : "lists"}
                      </Typography>

                      {board.starred ? (
                        <StarIcon
                          sx={{
                            color:
                              "#fff",

                            fontSize:
                              21,
                          }}
                        />
                      ) : (
                        <StarBorderIcon
                          sx={{
                            color:
                              "rgba(255,255,255,.8)",

                            fontSize:
                              21,
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          )}
        </Box>
      ) : (
        /* =================================================
           EMPTY STATE
        ================================================= */

        <Box
          sx={{
            minHeight: 300,

            display: "flex",

            flexDirection:
              "column",

            alignItems:
              "center",

            justifyContent:
              "center",

            backgroundColor:
              "#fff",

            border:
              "1px solid #dfe1e6",

            borderRadius: 2,

            p: 4,

            textAlign:
              "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,

              fontWeight: 700,

              color: "#172b4d",

              mb: 1,
            }}
          >
            {search
              ? "No boards found"
              : "You don't have any boards yet"}
          </Typography>

          <Typography
            sx={{
              color: "#5e6c84",

              fontSize: 14,

              mb: 2,
            }}
          >
            {search
              ? "Try a different search."
              : "Create your first board to get started."}
          </Typography>

          {!search && (
            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              onClick={() =>
                setCreateDialog(
                  true
                )
              }
              sx={{
                textTransform:
                  "none",

                fontWeight: 600,
              }}
            >
              Create board
            </Button>
          )}
        </Box>
      )}

      {/* =================================================
          BOARD MENU
      ================================================= */}

      <Menu
        anchorEl={
          menuAnchor
        }
        open={Boolean(
          menuAnchor
        )}
        onClose={
          handleCloseMenu
        }
      >
        <MenuItem
          onClick={
            handleToggleStar
          }
        >
          {selectedBoard?.starred ? (
            <>
              <StarBorderIcon
                sx={{
                  mr: 1,
                  fontSize: 20,
                }}
              />

              Unstar board
            </>
          ) : (
            <>
              <StarIcon
                sx={{
                  mr: 1,
                  fontSize: 20,
                }}
              />

              Star board
            </>
          )}
        </MenuItem>

        <MenuItem
          onClick={
            handleDeleteBoard
          }
          sx={{
            color:
              "#c9372c",
          }}
        >
          Delete board
        </MenuItem>
      </Menu>

      {/* =================================================
          CREATE BOARD DIALOG
      ================================================= */}

      <Dialog
        open={createDialog}
        onClose={() => {
          setCreateDialog(
            false
          );

          setNewBoardName("");
        }}
        fullWidth
        maxWidth="sm"
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
            label="Board name"
            placeholder="Enter board name..."
            value={newBoardName}
            onChange={(event) =>
              setNewBoardName(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                newBoardName.trim()
              ) {
                handleCreateBoard();
              }

              if (
                event.key ===
                "Escape"
              ) {
                setCreateDialog(
                  false
                );

                setNewBoardName("");
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
              setCreateDialog(
                false
              );

              setNewBoardName("");
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
              handleCreateBoard
            }
            disabled={
              !newBoardName.trim()
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
    </Box>
  );
}

export default BoardsPage;