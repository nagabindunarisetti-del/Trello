import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Stack,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { getBoards } from "../utils/boardStorage";

/* =========================================================
   BOARD TITLE HELPER
   ========================================================= */

const getProjectName = (board: any): string => {
  return (
    board?.title ||
    board?.projectName ||
    board?.name ||
    "Untitled Board"
  );
};

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [boards, setBoards] = useState<any[]>([]);

  /* =========================================================
     LOAD BOARDS
     ========================================================= */

  const loadBoards = () => {
    const storedBoards = getBoards();

    setBoards(Array.isArray(storedBoards) ? storedBoards : []);
  };

  /* =========================================================
     INITIAL LOAD + ROUTE CHANGE
     ========================================================= */

  useEffect(() => {
    loadBoards();
  }, [location.pathname]);

  /* =========================================================
     REFRESH WHEN WINDOW GETS FOCUS
     ========================================================= */

  useEffect(() => {
    const handleWindowFocus = () => {
      loadBoards();
    };

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, []);

  /* =========================================================
     REFRESH WHEN STORAGE CHANGES
     ========================================================= */

  useEffect(() => {
    const handleStorageChange = () => {
      loadBoards();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /* =========================================================
     STARRED / RECENT BOARDS
     ========================================================= */

  const starredBoards = boards.filter(
    (board) => board?.starred
  );

  const recentBoards = boards.slice(0, 4);

  /* =========================================================
     OPEN BOARD
     ========================================================= */

  const openBoard = (board: any) => {
    navigate(`/board/${board.id}`);
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#1f1f21",
        color: "#fff",
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: {
            xs: 2,
            sm: 3,
            md: 5,
          },
          py: 5,
        }}
      >
        {/* =====================================================
            WELCOME
            ===================================================== */}

        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontSize: {
                xs: 32,
                md: 42,
              },
              fontWeight: 700,
              mb: 1,
            }}
          >
            Welcome back 👋
          </Typography>

          <Typography
            sx={{
              color: "#a8a8ad",
              fontSize: 16,
            }}
          >
            Manage your boards and keep your work organized.
          </Typography>
        </Box>

        {/* =====================================================
            QUICK ACTIONS
            ===================================================== */}

        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            mb: 2,
          }}
        >
          Quick actions
        </Typography>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{
            mb: 5,
          }}
        >
          {/* CREATE BOARD */}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/boards")}
            sx={{
              height: 46,
              px: 3,
              textTransform: "none",
              bgcolor: "#579dff",
              fontWeight: 600,

              "&:hover": {
                bgcolor: "#4189e8",
              },
            }}
          >
            Create a board
          </Button>

          {/* VIEW ALL BOARDS */}

          <Button
            variant="outlined"
            startIcon={
              <DashboardOutlinedIcon />
            }
            onClick={() => navigate("/boards")}
            sx={{
              height: 46,
              px: 3,
              textTransform: "none",
              color: "#fff",
              borderColor: "#555",

              "&:hover": {
                borderColor: "#579dff",
                bgcolor:
                  "rgba(87,157,255,.08)",
              },
            }}
          >
            View all boards
          </Button>
        </Stack>

        {/* =====================================================
            RECENT BOARDS
            ===================================================== */}

        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            mb: 2,
          }}
        >
          Recent boards
        </Typography>

        {recentBoards.length === 0 ? (
          /* ===================================================
             NO BOARDS
             =================================================== */

          <Card
            sx={{
              bgcolor: "#28282a",
              border: "1px solid #363638",
              borderRadius: 2,
              boxShadow: "none",
              mb: 5,
            }}
          >
            <CardContent
              sx={{
                py: 4,
              }}
            >
              <Typography
                sx={{
                  color: "#aaa",
                  mb: 2,
                }}
              >
                You haven't created any boards yet.
              </Typography>

              <Button
                variant="contained"
                onClick={() =>
                  navigate("/boards")
                }
                sx={{
                  textTransform: "none",
                  bgcolor: "#579dff",

                  "&:hover": {
                    bgcolor: "#4189e8",
                  },
                }}
              >
                Create your first board
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* ===================================================
             BOARD GRID
             =================================================== */

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 5,
            }}
          >
            {recentBoards.map((board) => {
              const projectName =
                getProjectName(board);

              return (
                <Card
                  key={board.id}
                  sx={{
                    height: 150,
                    bgcolor: "#28282a",
                    border:
                      "1px solid #363638",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "none",

                    transition:
                      "transform 0.2s ease, border-color 0.2s ease",

                    "&:hover": {
                      transform:
                        "translateY(-2px)",
                      borderColor:
                        "#579dff",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      openBoard(board)
                    }
                    sx={{
                      height: "100%",
                    }}
                  >
                    {/* BOARD PREVIEW */}

                    <Box
                      sx={{
                        height: 95,

                        background:
                          board.background ||
                          "linear-gradient(135deg, #4F46E5, #7C3AED)",

                        backgroundSize:
                          "cover",
                        backgroundPosition:
                          "center",
                      }}
                    />

                    {/* PROJECT NAME */}

                    <CardContent
                      sx={{
                        height: 55,
                        boxSizing:
                          "border-box",
                        py: 1.2,
                        px: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#fff",

                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {projectName}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        )}

        {/* =====================================================
            STARRED BOARDS
            ===================================================== */}

        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 700,
            mb: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <StarBorderOutlinedIcon
            sx={{
              mr: 0.5,
              fontSize: 22,
            }}
          />

          Starred boards
        </Typography>

        {starredBoards.length === 0 ? (
          <Typography
            sx={{
              color: "#888",
              fontSize: 15,
              mb: 4,
            }}
          >
            No starred boards yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {starredBoards.map((board) => {
              const projectName =
                getProjectName(board);

              return (
                <Card
                  key={board.id}
                  sx={{
                    bgcolor: "#28282a",
                    border:
                      "1px solid #363638",
                    borderRadius: 2,
                    overflow: "hidden",

                    transition:
                      "transform 0.2s ease, border-color 0.2s ease",

                    "&:hover": {
                      borderColor:
                        "#579dff",
                      transform:
                        "translateY(-2px)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      openBoard(board)
                    }
                  >
                    {/* BOARD PREVIEW */}

                    <Box
                      sx={{
                        height: 100,

                        background:
                          board.background ||
                          "linear-gradient(135deg, #4F46E5, #7C3AED)",

                        backgroundSize:
                          "cover",
                        backgroundPosition:
                          "center",
                      }}
                    />

                    {/* PROJECT NAME */}

                    <CardContent>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#fff",

                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {projectName}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        )}

        {/* =====================================================
            TEMPLATES
            ===================================================== */}

        <Box
          sx={{
            mt: 6,
            p: 3,

            bgcolor: "#28282a",

            border:
              "1px solid #363638",

            borderRadius: 2,

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
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Need a head start?
            </Typography>

            <Typography
              sx={{
                color: "#999",
                fontSize: 14,
              }}
            >
              Explore templates and start
              with a ready-made board.
            </Typography>
          </Box>

          <Button
            endIcon={
              <ArrowForwardIcon />
            }
            onClick={() =>
              navigate("/templates")
            }
            sx={{
              color: "#579dff",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Explore templates
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;