import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";

import { getBoards } from "../utils/boardStorage";
import type { Member, JoinRequest } from "../types/member";

/* ============================================================
 *  CONSTANTS
 * ============================================================ */

const MEMBERS_STORAGE_KEY = "trello_members";
const REQUESTS_STORAGE_KEY = "trello_join_requests";

/* Matches the seed user used on the board page, so "You" lines up
   with whoever is actually acting in this workspace. */
const CURRENT_USER_ID = 1;

/* Unique ids: Date.now() alone collides when two rows are created
   in the same millisecond (invite + approve in quick succession). */
const uid = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);

const AVATAR_COLORS = ["#579DFF", "#9F8FEF", "#4BCE97", "#F5CD47", "#F87168", "#60C6D2"];

const avatarColorFor = (id: number, name: string) => {
  if (id === CURRENT_USER_ID) return "#579DFF";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const defaultMembers: Member[] = [
  {
    id: CURRENT_USER_ID,
    name: "Naga Bindu Narisetti",
    username: "@nagabindunarisetti",
    email: "nagabindu@example.com",
    initials: "NN",
    boards: [],
    role: "Admin",
    lastActive: "Aug 2026",
    type: "member",
  },
];

const defaultRequests: JoinRequest[] = [];

/* Fallback board list, used only if the workspace has no real boards yet
   (so the "Boards" menu is never completely empty). */
const FALLBACK_BOARDS: { id: number; title: string }[] = [
  { id: 1, title: "Board 1" },
];

type TabValue = "members" | "single-board" | "multi-board" | "join-requests";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(MEMBERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error("Unable to load members:", error);
    }
    return defaultMembers;
  });

  const [requests, setRequests] = useState<JoinRequest[]>(() => {
    try {
      const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error("Unable to load join requests:", error);
    }
    return defaultRequests;
  });

  /* Real boards from this workspace, so the Boards menu and access
     counts reflect boards that actually exist rather than a hardcoded list. */
  const [availableBoards, setAvailableBoards] = useState<
    { id: number; title: string }[]
  >(FALLBACK_BOARDS);

  useEffect(() => {
    try {
      const boards = getBoards();
      if (boards.length > 0) {
        setAvailableBoards(
          boards.map((board) => ({ id: Number(board.id), title: board.title }))
        );
      }
    } catch (error) {
      console.error("Unable to load boards:", error);
    }
  }, []);

  const boardNames = useMemo(() => {
    const map: Record<number, string> = {};
    availableBoards.forEach((board) => {
      map[board.id] = board.title;
    });
    return map;
  }, [availableBoards]);

  const [activeTab, setActiveTab] = useState<TabValue>("members");
  const [search, setSearch] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [roleAnchor, setRoleAnchor] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [boardAnchor, setBoardAnchor] = useState<null | HTMLElement>(null);
  const [boardMember, setBoardMember] = useState<Member | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });

  useEffect(() => {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const showMessage = (
    message: string,
    severity: "success" | "error" | "info" = "success"
  ) => setSnackbar({ open: true, message, severity });

  /* Trello never lets a workspace drop to zero Admins, so role changes
     and removals that would do that are blocked with an explanation. */
  const adminCount = useMemo(
    () => members.filter((member) => member.role === "Admin").length,
    [members]
  );

  const filteredMembers = useMemo(() => {
    const value = search.trim().toLowerCase();

    let filtered = members;

    if (activeTab === "members") {
      filtered = members.filter((member) => member.type === "member");
    }

    if (activeTab === "single-board") {
      filtered = members.filter(
        (member) => member.type === "guest" && member.boards.length === 1
      );
    }

    if (activeTab === "multi-board") {
      filtered = members.filter(
        (member) => member.type === "guest" && member.boards.length > 1
      );
    }

    if (!value) return filtered;

    return filtered.filter(
      (member) =>
        member.name.toLowerCase().includes(value) ||
        member.username.toLowerCase().includes(value) ||
        member.email.toLowerCase().includes(value)
    );
  }, [members, activeTab, search]);

  const memberCount = members.filter((member) => member.type === "member").length;

  const singleBoardGuestCount = members.filter(
    (member) => member.type === "guest" && member.boards.length === 1
  ).length;

  const multiBoardGuestCount = members.filter(
    (member) => member.type === "guest" && member.boards.length > 1
  ).length;

  /* ============================================================
   *  INVITE
   * ============================================================ */

  const handleInvite = () => {
    const name = inviteName.trim();
    const email = inviteEmail.trim();

    if (!name || !email) {
      setInviteError("Please enter a name and email.");
      return;
    }

    if (!isValidEmail(email)) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    if (members.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      setInviteError("That email is already a member of this workspace.");
      return;
    }

    const newMember: Member = {
      id: uid(),
      name,
      username: "@" + name.toLowerCase().replace(/\s+/g, ""),
      email,
      initials: initialsOf(name),
      boards: [],
      role: "Member",
      lastActive: "Just now",
      type: "member",
    };

    setMembers((previous) => [...previous, newMember]);

    setInviteName("");
    setInviteEmail("");
    setInviteError("");
    setInviteOpen(false);

    showMessage("Member invited successfully.");
  };

  const closeInviteDialog = () => {
    setInviteOpen(false);
    setInviteError("");
  };

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/join?workspace=${encodeURIComponent(
      "my-workspace"
    )}`;
    try {
      await navigator.clipboard.writeText(link);
      showMessage("Invite link copied to clipboard.");
    } catch {
      showMessage(link, "info");
    }
  };

  /* ============================================================
   *  ROLE MENU
   * ============================================================ */

  const openRoleMenu = (event: MouseEvent<HTMLElement>, member: Member) => {
    setRoleAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const closeRoleMenu = () => {
    setRoleAnchor(null);
    setSelectedMember(null);
  };

  const changeRole = (role: "Admin" | "Member" | "Guest") => {
    if (!selectedMember) return;

    if (selectedMember.role === "Admin" && role !== "Admin" && adminCount <= 1) {
      showMessage(
        "This workspace needs at least one Admin. Make someone else an Admin first.",
        "error"
      );
      closeRoleMenu();
      return;
    }

    setMembers((previous) =>
      previous.map((member) =>
        member.id === selectedMember.id
          ? { ...member, role, type: role === "Guest" ? "guest" : "member" }
          : member
      )
    );

    closeRoleMenu();
    showMessage(`Role changed to ${role}.`);
  };

  /* ============================================================
   *  BOARD ACCESS MENU
   * ============================================================ */

  const openBoardMenu = (event: MouseEvent<HTMLElement>, member: Member) => {
    setBoardAnchor(event.currentTarget);
    setBoardMember(member);
  };

  const closeBoardMenu = () => {
    setBoardAnchor(null);
    setBoardMember(null);
  };

  const toggleBoard = (boardId: number) => {
    if (!boardMember) return;

    setMembers((previous) =>
      previous.map((member) => {
        if (member.id !== boardMember.id) return member;

        const hasBoard = member.boards.includes(boardId);
        const nextBoards = hasBoard
          ? member.boards.filter((id) => id !== boardId)
          : [...member.boards, boardId];

        /* keep boardMember (the popover's own copy) in sync so repeated
           clicks in the same open menu toggle correctly */
        setBoardMember({ ...member, boards: nextBoards });

        return { ...member, boards: nextBoards };
      })
    );

    showMessage("Board access updated.");
  };

  /* ============================================================
   *  DELETE MEMBER
   * ============================================================ */

  const openDeleteDialog = (member: Member) => {
    if (member.id === CURRENT_USER_ID) {
      showMessage("You can't remove yourself from the workspace.", "error");
      return;
    }

    if (member.role === "Admin" && adminCount <= 1) {
      showMessage(
        "This workspace needs at least one Admin. Make someone else an Admin first.",
        "error"
      );
      return;
    }

    setMemberToDelete(member);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setMemberToDelete(null);
    setDeleteOpen(false);
  };

  const deleteMember = () => {
    if (!memberToDelete) return;

    setMembers((previous) =>
      previous.filter((member) => member.id !== memberToDelete.id)
    );

    showMessage(`${memberToDelete.name} was removed from the workspace.`);
    closeDeleteDialog();
  };

  /* ============================================================
   *  JOIN REQUESTS
   * ============================================================ */

  const approveRequest = (request: JoinRequest) => {
    const newMember: Member = {
      id: uid(),
      name: request.name,
      username: request.username,
      email: request.email,
      initials: initialsOf(request.name),
      boards: [],
      role: "Member",
      lastActive: "Just now",
      type: "member",
    };

    setMembers((previous) => [...previous, newMember]);
    setRequests((previous) => previous.filter((item) => item.id !== request.id));

    showMessage(`${request.name} was approved.`);
  };

  const rejectRequest = (requestId: number) => {
    setRequests((previous) => previous.filter((request) => request.id !== requestId));
    showMessage("Join request rejected.", "info");
  };

  /* ============================================================
   *  JSX
   * ============================================================ */

  return (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: "#1d1f21",
        color: "#fff",
        px: { xs: 2, sm: 3, md: 5 },
        py: 4,
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 700, color: "#fff", mb: 0.5 }}>
            Collaborators
          </Typography>
          <Typography sx={{ color: "#9ea1a6", fontSize: 14 }}>
            Members of your Trello Workspace
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={() => setInviteOpen(true)}
          sx={{
            bgcolor: "#579dff",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 2,
            py: 1,
            borderRadius: 1.5,
            "&:hover": { bgcolor: "#478eea" },
          }}
        >
          Invite members
        </Button>
      </Box>

      {/* TABS */}
      <Box sx={{ borderBottom: "1px solid #36383b", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => {
            setActiveTab(value);
            setSearch("");
          }}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            minHeight: 48,
            "& .MuiTabs-indicator": { backgroundColor: "#579dff", height: 2 },
            "& .MuiTab-root": {
              color: "#9ea1a6",
              textTransform: "none",
              fontSize: 14,
              fontWeight: 600,
              minHeight: 48,
              px: 2,
            },
            "& .Mui-selected": { color: "#fff !important" },
          }}
        >
          <Tab value="members" label={`Members (${memberCount})`} />
          <Tab value="single-board" label={`Single-board guests (${singleBoardGuestCount})`} />
          <Tab value="multi-board" label={`Multi-board guests (${multiBoardGuestCount})`} />
          <Tab value="join-requests" label={`Join requests (${requests.length})`} />
        </Tabs>
      </Box>

      {/* SEARCH */}
      {activeTab !== "join-requests" && (
        <TextField
          fullWidth
          placeholder="Search members"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#85888d" }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={() => setSearch("")}
                  sx={{ minWidth: 0, color: "#85888d", "&:hover": { color: "#fff" } }}
                >
                  Clear
                </Button>
              </InputAdornment>
            ) : undefined,
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              bgcolor: "#222426",
              color: "#fff",
              borderRadius: 1.5,
              "& fieldset": { borderColor: "#3a3c3f" },
              "&:hover fieldset": { borderColor: "#5c6065" },
              "&.Mui-focused fieldset": { borderColor: "#579dff" },
            },
            "& input::placeholder": { color: "#85888d", opacity: 1 },
          }}
        />
      )}

      {/* MEMBERS TABLE */}
      {activeTab !== "join-requests" && (
        <Box
          sx={{
            bgcolor: "#222426",
            border: "1px solid #36383b",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns:
                "minmax(280px, 2fr) minmax(120px, .8fr) minmax(120px, .8fr) minmax(160px, 1fr) 60px",
              px: 3,
              py: 1.5,
              bgcolor: "#282a2d",
              borderBottom: "1px solid #36383b",
            }}
          >
            <Typography sx={tableHeaderStyle}>Member</Typography>
            <Typography sx={tableHeaderStyle}>Role</Typography>
            <Typography sx={tableHeaderStyle}>Boards</Typography>
            <Typography sx={tableHeaderStyle}>Last active</Typography>
            <Box />
          </Box>

          {filteredMembers.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography sx={{ color: "#9ea1a6", fontSize: 15 }}>
                No members found.
              </Typography>
            </Box>
          ) : (
            filteredMembers.map((member, index) => {
              const isSelf = member.id === CURRENT_USER_ID;
              const isLastAdmin = member.role === "Admin" && adminCount <= 1;

              return (
                <Box key={member.id}>
                  <Box
                    sx={{
                      display: { xs: "block", md: "grid" },
                      gridTemplateColumns:
                        "minmax(280px, 2fr) minmax(120px, .8fr) minmax(120px, .8fr) minmax(160px, 1fr) 60px",
                      alignItems: "center",
                      px: 3,
                      py: 2,
                      transition: "background .15s",
                      "&:hover": { bgcolor: "#292b2e" },
                    }}
                  >
                    {/* MEMBER */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: { xs: 2, md: 0 },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: avatarColorFor(member.id, member.name),
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {member.initials}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>
                            {member.name}
                          </Typography>
                          {isSelf && (
                            <Chip
                              label="You"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: "rgba(87,157,255,0.18)",
                                color: "#579dff",
                              }}
                            />
                          )}
                        </Box>

                        <Typography
                          sx={{
                            color: "#8f9297",
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {member.username}
                        </Typography>

                        <Typography sx={{ color: "#72757a", fontSize: 12 }}>
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* ROLE */}
                    <Box sx={{ mb: { xs: 1.5, md: 0 } }}>
                      <Tooltip
                        title={
                          isLastAdmin
                            ? "This workspace needs at least one Admin"
                            : ""
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            endIcon={<KeyboardArrowDownIcon />}
                            onClick={(event) => openRoleMenu(event, member)}
                            sx={{
                              color: "#d7d9dc",
                              textTransform: "none",
                              fontSize: 13,
                              justifyContent: "flex-start",
                              px: 0,
                              "&:hover": { bgcolor: "transparent", color: "#579dff" },
                            }}
                          >
                            {member.role}
                          </Button>
                        </span>
                      </Tooltip>
                    </Box>

                    {/* BOARDS */}
                    <Box sx={{ mb: { xs: 1.5, md: 0 } }}>
                      <Button
                        size="small"
                        endIcon={<KeyboardArrowDownIcon />}
                        onClick={(event) => openBoardMenu(event, member)}
                        sx={{
                          color: "#d7d9dc",
                          textTransform: "none",
                          fontSize: 13,
                          px: 0,
                          "&:hover": { bgcolor: "transparent", color: "#579dff" },
                        }}
                      >
                        {member.boards.length} {member.boards.length === 1 ? "board" : "boards"}
                      </Button>
                    </Box>

                    {/* LAST ACTIVE */}
                    <Typography sx={{ color: "#9ea1a6", fontSize: 13 }}>
                      {member.lastActive}
                    </Typography>

                    {/* DELETE */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: { xs: "flex-start", md: "flex-end" },
                        mt: { xs: 2, md: 0 },
                      }}
                    >
                      <Tooltip
                        title={
                          isSelf
                            ? "You can't remove yourself"
                            : isLastAdmin
                            ? "This workspace needs at least one Admin"
                            : "Remove from workspace"
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            disabled={isSelf || isLastAdmin}
                            onClick={() => openDeleteDialog(member)}
                            sx={{
                              minWidth: 38,
                              width: 38,
                              height: 38,
                              borderRadius: 1.5,
                              color: "#a5a7aa",
                              "&:hover": { color: "#f15b50", bgcolor: "#382527" },
                              "&.Mui-disabled": { color: "#4a4d51" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>

                  {index < filteredMembers.length - 1 && (
                    <Divider sx={{ borderColor: "#36383b" }} />
                  )}
                </Box>
              );
            })
          )}
        </Box>
      )}

      {/* JOIN REQUESTS */}
      {activeTab === "join-requests" && (
        <Box
          sx={{
            bgcolor: "#222426",
            border: "1px solid #36383b",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {requests.length === 0 ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "50%",
                  bgcolor: "#2d3033",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon sx={{ color: "#48b883", fontSize: 28 }} />
              </Box>

              <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
                No pending requests
              </Typography>

              <Typography sx={{ color: "#8f9297", fontSize: 13 }}>
                There are no member requests waiting for approval.
              </Typography>
            </Box>
          ) : (
            requests.map((request, index) => (
              <Box key={request.id}>
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    display: "flex",
                    alignItems: { xs: "flex-start", md: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: "#579dff", width: 42, height: 42 }}>
                      {initialsOf(request.name)}
                    </Avatar>

                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Typography sx={{ fontWeight: 600 }}>{request.name}</Typography>
                        <Chip
                          label="Pending"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: "rgba(245,205,71,0.16)",
                            color: "#f5cd47",
                          }}
                        />
                      </Box>

                      <Typography sx={{ color: "#8f9297", fontSize: 13 }}>
                        {request.email}
                      </Typography>

                      <Typography sx={{ color: "#707378", fontSize: 12 }}>
                        {request.username}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={() => approveRequest(request)}
                      sx={{
                        bgcolor: "#48b883",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#3da474" },
                      }}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<LogoutOutlinedIcon />}
                      onClick={() => rejectRequest(request.id)}
                      sx={{
                        color: "#f15b50",
                        borderColor: "#5a3434",
                        textTransform: "none",
                        "&:hover": { borderColor: "#f15b50", bgcolor: "#382527" },
                      }}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Box>

                {index < requests.length - 1 && (
                  <Divider sx={{ borderColor: "#36383b" }} />
                )}
              </Box>
            ))
          )}
        </Box>
      )}

      {/* ROLE MENU */}
      <Menu
        anchorEl={roleAnchor}
        open={Boolean(roleAnchor)}
        onClose={closeRoleMenu}
        PaperProps={{
          sx: {
            bgcolor: "#282a2d",
            color: "#fff",
            border: "1px solid #424448",
            minWidth: 150,
          },
        }}
      >
        {(["Admin", "Member", "Guest"] as const).map((role) => (
          <MenuItem
            key={role}
            selected={selectedMember?.role === role}
            onClick={() => changeRole(role)}
            sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}
          >
            {role}
            {selectedMember?.role === role && <CheckIcon fontSize="small" />}
          </MenuItem>
        ))}
      </Menu>

      {/* BOARD ACCESS MENU */}
      <Menu
        anchorEl={boardAnchor}
        open={Boolean(boardAnchor)}
        onClose={closeBoardMenu}
        PaperProps={{
          sx: {
            bgcolor: "#282a2d",
            color: "#fff",
            border: "1px solid #424448",
            minWidth: 200,
          },
        }}
      >
        {availableBoards.length === 0 ? (
          <MenuItem disabled>No boards yet</MenuItem>
        ) : (
          availableBoards.map((board) => {
            const selected = boardMember?.boards.includes(board.id) ?? false;

            return (
              <MenuItem key={board.id} onClick={() => toggleBoard(board.id)} sx={{ gap: 1 }}>
                <Box sx={{ width: 20, display: "flex", justifyContent: "center" }}>
                  {selected && <CheckIcon fontSize="small" />}
                </Box>
                {board.title}
              </MenuItem>
            );
          })
        )}
      </Menu>

      {/* INVITE DIALOG */}
      <Dialog
        open={inviteOpen}
        onClose={closeInviteDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { bgcolor: "#282a2d", color: "#fff", border: "1px solid #424448" } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Invite members</DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "#9ea1a6", fontSize: 13, mb: 2 }}>
            Add a new member to your workspace, or share an invite link.
          </Typography>

          {inviteError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setInviteError("")}>
              {inviteError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Name"
            value={inviteName}
            onChange={(event) => setInviteName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleInvite();
            }}
            margin="normal"
            InputLabelProps={{ sx: { color: "#9ea1a6" } }}
            sx={dialogInputStyle}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleInvite();
            }}
            margin="normal"
            InputLabelProps={{ sx: { color: "#9ea1a6" } }}
            sx={dialogInputStyle}
          />

          <Button
            startIcon={<LinkIcon />}
            onClick={copyInviteLink}
            sx={{
              mt: 1.5,
              color: "#9ea1a6",
              textTransform: "none",
              px: 0,
              "&:hover": { bgcolor: "transparent", color: "#579dff" },
            }}
          >
            Copy invite link instead
          </Button>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeInviteDialog} sx={{ color: "#b7b9bc", textTransform: "none" }}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleInvite}
            sx={{
              bgcolor: "#579dff",
              textTransform: "none",
              "&:hover": { bgcolor: "#478eea" },
            }}
          >
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog
        open={deleteOpen}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { bgcolor: "#282a2d", color: "#fff", border: "1px solid #424448" } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Remove member?</DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "#b5b7ba", fontSize: 14, lineHeight: 1.6 }}>
            Are you sure you want to remove <strong>{memberToDelete?.name}</strong> from
            this workspace? They will lose access to every board they were a member of.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} sx={{ color: "#b7b9bc", textTransform: "none" }}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={deleteMember}
            sx={{
              bgcolor: "#c9372c",
              textTransform: "none",
              "&:hover": { bgcolor: "#a92e25" },
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const tableHeaderStyle = {
  color: "#85888d",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
};

const dialogInputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    bgcolor: "#222426",
    "& fieldset": { borderColor: "#45474b" },
    "&:hover fieldset": { borderColor: "#66696e" },
    "&.Mui-focused fieldset": { borderColor: "#579dff" },
  },
  "& .MuiInputLabel-root": { color: "#9ea1a6" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#579dff" },
};
