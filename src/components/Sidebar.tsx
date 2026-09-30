import type { ReactNode } from "react";

import {
  Box,
  Drawer,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SettingsIcon from "@mui/icons-material/Settings";
import ScienceIcon from "@mui/icons-material/Science";
import GroupsIcon from "@mui/icons-material/Groups";
import ExtensionIcon from "@mui/icons-material/Extension";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

const drawerWidth = 280;

function Sidebar() {
  const navigate = useNavigate();

  const location = useLocation();

  /*
   * ACTIVE PAGE
   */

  const isBoardsActive =
    location.pathname === "/dashboard" ||
    location.pathname === "/boards" ||
    location.pathname.startsWith("/board/");

  const isMembersActive =
    location.pathname === "/members";

  const isPersonalSettingsActive =
    location.pathname === "/personal-settings";

  const isWorkspaceSettingsActive =
    location.pathname === "/workspace-settings";

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,

        flexShrink: 0,

        display: {
          xs: "none",
          md: "block",
        },

        "& .MuiDrawer-paper": {
          width: drawerWidth,

          boxSizing: "border-box",

          bgcolor: "#18191a",

          color: "#fff",

          borderRight:
            "1px solid #303033",

          position: "relative",

          height: "calc(100vh - 56px)",
        },
      }}
    >
      <Box
        sx={{
          p: 2,

          overflowY: "auto",

          height: "100%",

          "&::-webkit-scrollbar": {
            width: 5,
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              "#3a3b3d",

            borderRadius: 5,
          },
        }}
      >
        {/* ======================================
            PERSONAL SETTINGS
        ====================================== */}

        <Typography
          sx={{
            color: "#b7b8bb",

            fontSize: 13,

            fontWeight: 600,

            mb: 1,

            ml: 1,
          }}
        >
          Personal Settings
        </Typography>

        <List disablePadding>
          <SidebarItem
            icon={<PersonIcon />}
            text="Profile and Visibility"
            onClick={() =>
              navigate("/profile")
            }
          />

          <SidebarItem
            icon={<HistoryIcon />}
            text="Activity"
            onClick={() =>
              navigate("/activity")
            }
          />

          <SidebarItem
            icon={<CreditCardIcon />}
            text="Cards"
            onClick={() =>
              navigate("/cards")
            }
          />

          <SidebarItem
            icon={<SettingsIcon />}
            text="Settings"
            active={
              isPersonalSettingsActive
            }
            onClick={() =>
              navigate(
                "/personal-settings"
              )
            }
          />

          <SidebarItem
            icon={<ScienceIcon />}
            text="Labs"
            onClick={() =>
              navigate("/labs")
            }
          />
        </List>

        {/* ======================================
            DIVIDER
        ====================================== */}

        <Divider
          sx={{
            borderColor: "#363638",

            my: 2.5,
          }}
        />

        {/* ======================================
            WORKSPACE
        ====================================== */}

        <Typography
          sx={{
            color: "#b7b8bb",

            fontSize: 13,

            fontWeight: 600,

            mb: 1,

            ml: 1,
          }}
        >
          Workspace
        </Typography>

        {/* ======================================
            WORKSPACE NAME
        ====================================== */}

        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            gap: 1.5,

            px: 1,

            py: 1,

            mb: 1,
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 30,

              height: 30,

              bgcolor: "#48b883",

              color: "#10291f",

              fontSize: 15,

              fontWeight: 700,
            }}
          >
            T
          </Avatar>

          <Typography
            sx={{
              fontSize: 15,

              fontWeight: 600,
            }}
          >
            TaskFlow Workspace
          </Typography>
        </Box>

        {/* ======================================
            WORKSPACE MENU
        ====================================== */}

        <List disablePadding>
          {/* BOARDS */}

          <SidebarItem
            icon={<DashboardIcon />}
            text="Boards"
            active={isBoardsActive}
            onClick={() =>
              navigate("/dashboard")
            }
          />

          {/* MEMBERS */}

          <SidebarItem
            icon={<GroupsIcon />}
            text="Members"
            active={isMembersActive}
            onClick={() =>
              navigate("/members")
            }
          />

          {/* WORKSPACE SETTINGS */}

          <SidebarItem
            icon={<SettingsIcon />}
            text="Settings"
            active={
              isWorkspaceSettingsActive
            }
            onClick={() =>
              navigate(
                "/workspace-settings"
              )
            }
          />

          {/* POWER UPS */}

          <SidebarItem
            icon={<ExtensionIcon />}
            text="Power-Ups"
            premium
            onClick={() =>
              navigate("/power-ups")
            }
          />

          {/* EXPORT */}

          <SidebarItem
            icon={<DownloadIcon />}
            text="Export"
            premium
            onClick={() =>
              navigate("/export")
            }
          />

          {/* BILLING */}

          <SidebarItem
            icon={<ReceiptIcon />}
            text="Billing"
            onClick={() =>
              navigate("/billing")
            }
          />
        </List>
      </Box>
    </Drawer>
  );
}

/* =========================================
   SIDEBAR ITEM
========================================= */

interface SidebarItemProps {
  icon: ReactNode;

  text: string;

  active?: boolean;

  premium?: boolean;

  onClick?: () => void;
}

function SidebarItem({
  icon,

  text,

  active = false,

  premium = false,

  onClick,
}: SidebarItemProps) {
  return (
    <ListItemButton
      selected={active}
      onClick={onClick}
      sx={{
        minHeight: 40,

        borderRadius: 1.5,

        mb: 0.4,

        px: 1.2,

        color: "#d8d8da",

        "& .MuiListItemIcon-root": {
          minWidth: 34,

          color: "inherit",
        },

        /* ACTIVE */

        "&.Mui-selected": {
          bgcolor: "#24395b",

          color: "#fff",

          border:
            "1px solid #579dff",
        },

        "&.Mui-selected:hover": {
          bgcolor: "#294466",
        },

        /* HOVER */

        "&:hover": {
          bgcolor: "#292a2c",
        },
      }}
    >
      <ListItemIcon>
        {icon}
      </ListItemIcon>

      <ListItemText
        primary={text}
        primaryTypographyProps={{
          fontSize: 15,

          fontWeight: 500,
        }}
      />

      {premium && (
        <Chip
          label="PREMIUM"
          size="small"
          sx={{
            height: 22,

            border:
              "1px solid #9b6cff",

            color: "#b68cff",

            bgcolor: "transparent",

            fontSize: 9,

            fontWeight: 700,

            "& .MuiChip-label": {
              px: 0.7,
            },
          }}
        />
      )}
    </ListItemButton>
  );
}

export default Sidebar;