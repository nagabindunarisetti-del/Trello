import { NavLink, Outlet, useLocation } from "react-router-dom";

import {
  Box,
  Typography,
  Divider,
  Avatar,
} from "@mui/material";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CollectionsBookmarkOutlinedIcon from "@mui/icons-material/CollectionsBookmarkOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import Navbar from "./Navbar";

const navigationItems = [
  {
    label: "Home",
    path: "/dashboard",
    icon: <HomeOutlinedIcon />,
  },
  {
    label: "Boards",
    path: "/boards",
    icon: <DashboardOutlinedIcon />,
  },
  {
    label: "Templates",
    path: "/templates",
    icon: <CollectionsBookmarkOutlinedIcon />,
  },
  {
    label: "Members",
    path: "/members",
    icon: <PeopleOutlineOutlinedIcon />,
  },
  {
    label: "Subscription",
    path: "/subscription",
    icon: <CreditCardOutlinedIcon />,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsOutlinedIcon />,
  },
];

function MainLayout() {
  const location = useLocation();

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
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 1200,
        }}
      >
        <Navbar />
      </Box>

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <Box
        sx={{
          width: 240,
          minWidth: 240,

          height: "calc(100vh - 56px)",

          bgcolor: "#18181a",
          borderRight: "1px solid #303033",

          display: "flex",
          flexDirection: "column",

          position: "fixed",

          left: 0,
          top: 56,
          bottom: 0,

          zIndex: 1100,
        }}
      >
        {/* =========================================
            SIDEBAR LOGO
        ========================================= */}

        <Box
          sx={{
            height: 72,

            display: "flex",
            alignItems: "center",

            px: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 25,
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#ffffff",
            }}
          >
            TaskFlow 
          </Typography>
        </Box>

        <Divider
          sx={{
            borderColor: "#303033",
          }}
        />

        {/* =========================================
            NAVIGATION
        ========================================= */}

        <Box
          sx={{
            px: 1.5,
            py: 2,

            flex: 1,

            overflowY: "auto",
          }}
        >
          {navigationItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/boards" &&
                location.pathname.startsWith("/board/"));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Box
                  sx={{
                    height: 46,

                    px: 1.5,
                    mb: 0.7,

                    display: "flex",
                    alignItems: "center",

                    gap: 1.5,

                    borderRadius: 1.5,

                    bgcolor: isActive
                      ? "#2d3f55"
                      : "transparent",

                    color: isActive
                      ? "#579dff"
                      : "#c7c7ca",

                    transition:
                      "background-color 0.2s, color 0.2s",

                    cursor: "pointer",

                    "&:hover": {
                      bgcolor: "#252528",
                      color: "#ffffff",
                    },

                    "& svg": {
                      fontSize: 22,
                    },
                  }}
                >
                  {item.icon}

                  <Typography
                    sx={{
                      fontSize: 15,

                      fontWeight: isActive
                        ? 600
                        : 500,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </NavLink>
            );
          })}
        </Box>

        {/* =========================================
            USER SECTION
        ========================================= */}

        <Box
          sx={{
            borderTop: "1px solid #303033",

            p: 2,

            display: "flex",
            alignItems: "center",

            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,

              bgcolor: "#579dff",

              fontSize: 15,
              fontWeight: 700,
            }}
          >
            U
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              User
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color: "#999",
              }}
            >
              Free plan
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <Box
        component="main"
        sx={{
          ml: "240px",

          width: "calc(100% - 240px)",

          minHeight: "100vh",

          pt: "56px",

          bgcolor: "#1f1f21",

          overflow: "auto",

          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;