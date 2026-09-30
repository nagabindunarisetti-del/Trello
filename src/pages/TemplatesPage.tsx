import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { BoardItem } from "../types/board";

const STORAGE_KEY = "trello_boards";
const templates = [
  {
    title: "Project Management",
    description: "Plan and manage projects with lists and cards.",
    background: "linear-gradient(135deg, #667eea, #764ba2)",

    lists: [
      {
        title: "To Do",
        cards: [
          "Define project requirements",
          "Create project plan",
          "Assign tasks",
        ],
      },
      {
        title: "In Progress",
        cards: ["Development", "Testing"],
      },
      {
        title: "Done",
        cards: ["Project setup"],
      },
    ],
  },

  {
    title: "Marketing Plan",
    description: "Organize marketing campaigns and tasks.",
    background: "linear-gradient(135deg, #11998e, #38ef7d)",

    lists: [
      {
        title: "Ideas",
        cards: ["Campaign ideas", "Social media ideas"],
      },
      {
        title: "In Progress",
        cards: ["Create campaign", "Prepare content"],
      },
      {
        title: "Published",
        cards: [],
      },
    ],
  },

  {
    title: "To Do List",
    description: "Keep track of your daily tasks.",
    background: "linear-gradient(135deg, #ff9966, #ff5e62)",

    lists: [
      {
        title: "To Do",
        cards: [
          "Complete assignment",
          "Check emails",
          "Finish pending work",
        ],
      },
      {
        title: "Doing",
        cards: [],
      },
      {
        title: "Done",
        cards: [],
      },
    ],
  },

  {
    title: "Product Roadmap",
    description: "Plan features and future product releases.",
    background: "linear-gradient(135deg, #4568dc, #b06ab3)",

    lists: [
      {
        title: "Ideas",
        cards: ["New feature ideas", "Customer feedback"],
      },
      {
        title: "Planned",
        cards: ["Feature planning"],
      },
      {
        title: "In Development",
        cards: [],
      },
      {
        title: "Released",
        cards: [],
      },
    ],
  },

  {
    title: "Team Planning",
    description: "Coordinate tasks and responsibilities.",
    background: "linear-gradient(135deg, #f7971e, #ffd200)",

    lists: [
      {
        title: "Backlog",
        cards: ["Team tasks", "New requests"],
      },
      {
        title: "In Progress",
        cards: ["Current sprint"],
      },
      {
        title: "Completed",
        cards: [],
      },
    ],
  },

  {
    title: "Personal Goals",
    description: "Track your personal projects and goals.",
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",

    lists: [
      {
        title: "Goals",
        cards: ["Learn new skill", "Complete personal project"],
      },
      {
        title: "In Progress",
        cards: [],
      },
      {
        title: "Completed",
        cards: [],
      },
    ],
  },
];

function TemplatesPage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] =
    useState<(typeof templates)[number] | null>(null);
  const [projectName, setProjectName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const getBoards = (): BoardItem[] => {
    try {
      const storedBoards = localStorage.getItem(STORAGE_KEY);

      if (!storedBoards) {
        return [];
      }

      return JSON.parse(storedBoards);
    } catch (error) {
      console.error("Failed to load boards:", error);
      return [];
    }
  };

  const saveBoards = (boards: BoardItem[]) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(boards)
      );
    } catch (error) {
      console.error("Failed to save boards:", error);
    }
  };

  const handleSelectTemplate = (
    template: (typeof templates)[number]
  ) => {
    setSelectedTemplate(template);
    setProjectName("");
    setOpenDialog(true);
  };

  const createBoardFromTemplate = () => {
    if (!selectedTemplate) {
      return;
    }

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      return;
    }

    const existingBoards = getBoards();

    const boardId = Date.now();
    const newBoard: BoardItem = {
      id: boardId,
      title: trimmedName,
      background: selectedTemplate.background,

      starred: false,
      lists: selectedTemplate.lists.map(
        (list, listIndex) => ({
          id: boardId + listIndex + 1,
          title: list.title,
          cards: list.cards.map(
            (cardTitle, cardIndex) => ({
              id:
                boardId +
                listIndex * 100 +
                cardIndex +
                1,

              title: cardTitle,
            })
          ),
        })
      ),
    };

    const updatedBoards = [
      ...existingBoards,
      newBoard,
    ];

    saveBoards(updatedBoards);

    setOpenDialog(false);

    setProjectName("");

    setSelectedTemplate(null);

    navigate(`/board/${newBoard.id}`);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setProjectName("");
    setSelectedTemplate(null);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      createBoardFromTemplate();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 56px)",
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
          Templates
        </Typography>

        <Typography
          sx={{
            color: "#999",
            mb: 5,
          }}
        >
          Start your next project with a ready-made template.
        </Typography>
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },

            gap: 2.5,
          }}
        >
          {templates.map((template) => (
            <Card
              key={template.title}
              sx={{
                bgcolor: "#28282a",

                border: "1px solid #363638",

                borderRadius: 2,

                overflow: "hidden",

                boxShadow: "none",

                transition:
                  "transform 0.2s, border-color 0.2s",

                "&:hover": {
                  transform: "translateY(-3px)",

                  borderColor: "#579dff",
                },
              }}
            >
              <CardActionArea
                onClick={() =>
                  handleSelectTemplate(template)
                }
              >
                <Box
                  sx={{
                    height: 130,

                    background:
                      template.background,

                    display: "flex",

                    gap: 1,

                    p: 1.5,

                    overflow: "hidden",
                  }}
                >
                  {template.lists
                    .slice(0, 3)
                    .map((list) => (
                      <Box
                        key={list.title}
                        sx={{
                          width: 85,

                          minWidth: 85,

                          bgcolor: "#ebecf0",

                          borderRadius: 1,

                          p: 0.8,
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#333",

                            fontSize: 8,

                            fontWeight: 700,

                            mb: 0.7,
                          }}
                        >
                          {list.title}
                        </Typography>

                        {list.cards
                          .slice(0, 3)
                          .map((card) => (
                            <Box
                              key={card}
                              sx={{
                                bgcolor: "#fff",

                                height: 22,

                                borderRadius: 0.5,

                                mb: 0.5,

                                boxShadow:
                                  "0 1px 2px rgba(0,0,0,0.15)",
                              }}
                            />
                          ))}
                      </Box>
                    ))}
                </Box>

                <Box
                  sx={{
                    p: 2,
                  }}
                >

                  <Typography
                    sx={{
                      fontSize: 17,

                      fontWeight: 700,

                      mb: 0.7,

                      color: "#fff",
                    }}
                  >
                    {template.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#999",

                      fontSize: 14,

                      mb: 2,
                    }}
                  >
                    {template.description}
                  </Typography>
                  <Button
                    variant="outlined"

                    startIcon={<AddIcon />}

                    onClick={(event) => {
                      event.stopPropagation();

                      handleSelectTemplate(template);
                    }}

                    sx={{
                      color: "#fff",

                      borderColor: "#555",

                      textTransform: "none",

                      "&:hover": {
                        borderColor: "#579dff",

                        bgcolor:
                          "rgba(87,157,255,0.08)",
                      },
                    }}
                  >
                    Use template
                  </Button>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"

        PaperProps={{
          sx: {
            bgcolor: "#28282a",

            color: "#fff",

            borderRadius: 2,

            border: "1px solid #3b3b3d",
          },
        }}
      >

        <DialogTitle
          sx={{
            fontWeight: 700,

            fontSize: 22,

            pb: 1,
          }}
        >
          Create your project
        </DialogTitle>

        <DialogContent>

          {selectedTemplate && (
            <Box
              sx={{
                mb: 2.5,

                p: 1.5,

                borderRadius: 1.5,

                background:
                  "rgba(87,157,255,0.08)",

                border:
                  "1px solid rgba(87,157,255,0.25)",
              }}
            >
              <Typography
                sx={{
                  color: "#888",

                  fontSize: 12,

                  mb: 0.5,
                }}
              >
                Selected template
              </Typography>

              <Typography
                sx={{
                  color: "#fff",

                  fontWeight: 600,

                  fontSize: 16,
                }}
              >
                {selectedTemplate.title}
              </Typography>
            </Box>
          )}

          <Typography
            sx={{
              color: "#aaa",

              mb: 1,
            }}
          >
            Enter your project name
          </Typography>

          <TextField
            autoFocus

            fullWidth

            placeholder="Enter project name"

            value={projectName}

            onChange={(event) =>
              setProjectName(event.target.value)
            }

            onKeyDown={handleKeyDown}

            variant="outlined"

            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",

                bgcolor: "#1f1f21",

                "& fieldset": {
                  borderColor: "#555",
                },

                "&:hover fieldset": {
                  borderColor: "#777",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#579dff",
                },
              },

              "& .MuiInputBase-input": {
                py: 1.5,
              },

              "& .MuiInputBase-input::placeholder": {
                color: "#777",

                opacity: 1,
              },
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,

            pt: 0,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: "#aaa",

              textTransform: "none",

              "&:hover": {
                bgcolor: "#333",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"

            onClick={createBoardFromTemplate}

            disabled={!projectName.trim()}

            sx={{
              bgcolor: "#579dff",

              color: "#fff",

              textTransform: "none",

              px: 2.5,

              "&:hover": {
                bgcolor: "#468de8",
              },

              "&.Mui-disabled": {
                bgcolor: "#3b4b60",

                color: "#888",
              },
            }}
          >
            Create project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TemplatesPage;
