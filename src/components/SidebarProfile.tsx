import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useAuth } from "../context/AuthContext";

const C = {
  border: "#3d4750",
  hover: "#2c333a",
  text: "#b6c2cf",
  muted: "#8c9bab",
  blue: "#579dff",
  menuBg: "#282e33",
  menuHover: "#333c43",
};

function SidebarProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const name = user?.name || user?.email || "User";
  const initial = name.charAt(0).toUpperCase();

  const open = (e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);

  const handleLogout = () => {
    close();
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Bottom block in the sidebar */}
      <Box
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setAnchor(e.currentTarget);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          cursor: "pointer",
          borderTop: `1px solid ${C.border}`,
          "&:hover": { bgcolor: C.hover },
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: C.blue,
            color: "#1d2125",
            fontWeight: 700,
          }}
        >
          {initial}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            noWrap
            sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}
          >
            {name}
          </Typography>

          <Typography noWrap sx={{ color: C.muted, fontSize: 13 }}>
            {user?.email || "Free plan"}
          </Typography>
        </Box>

        <MoreVertIcon sx={{ color: C.muted, fontSize: 20 }} />
      </Box>

      {/* Profile menu: opens upward from the bottom block */}
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: {
            bgcolor: C.menuBg,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            minWidth: 260,
            mb: 0.5,
            "& .MuiMenuItem-root": { fontSize: 14 },
            "& .MuiMenuItem-root:hover": {
              bgcolor: C.menuHover,
              color: "#fff",
            },
            "& .MuiDivider-root": { borderColor: C.border },
          },
        }}
      >
        {/* Profile details */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            sx={{ color: C.muted, fontSize: 11, letterSpacing: 0.5, mb: 1 }}
          >
            PROFILE
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: C.blue,
                color: "#1d2125",
                fontWeight: 700,
              }}
            >
              {initial}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}
              >
                {user?.name || "User"}
              </Typography>

              <Typography noWrap sx={{ color: C.muted, fontSize: 13 }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 1.5,
              fontSize: 13,
            }}
          >
            <span style={{ color: C.muted }}>Plan</span>
            <span style={{ color: "#fff" }}>Free plan</span>
          </Box>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            close();
            navigate("/settings");
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

export default SidebarProfile;
