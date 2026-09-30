import { useState } from "react";

import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Divider,
  Switch,
} from "@mui/material";

function SettingsPage() {
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("you@example.com");
  const [notifications, setNotifications] =
    useState(true);

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
          maxWidth: 900,
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
            fontSize: 40,
            fontWeight: 700,
            mb: 1,
          }}
        >
          Settings
        </Typography>

        <Typography
          sx={{
            color: "#999",
            mb: 5,
          }}
        >
          Manage your account and workspace preferences.
        </Typography>

        {/* PROFILE */}
        <Card
          sx={{
            bgcolor: "#28282a",
            border: "1px solid #363638",
            borderRadius: 2,
            p: 3,
            mb: 3,
            boxShadow: "none",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 700,
              mb: 3,
            }}
          >
            Profile
          </Typography>

          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "#fff",
              },
              "& label": {
                color: "#999",
              },
              "& fieldset": {
                borderColor: "#555",
              },
            }}
          />

          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
              },
              "& label": {
                color: "#999",
              },
              "& fieldset": {
                borderColor: "#555",
              },
            }}
          />

          <Button
            variant="contained"
            sx={{
              mt: 3,
              bgcolor: "#579dff",
              textTransform: "none",
            }}
          >
            Save changes
          </Button>
        </Card>

        {/* NOTIFICATIONS */}
        <Card
          sx={{
            bgcolor: "#28282a",
            border: "1px solid #363638",
            borderRadius: 2,
            p: 3,
            boxShadow: "none",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 700,
              mb: 1,
            }}
          >
            Notifications
          </Typography>

          <Typography
            sx={{
              color: "#999",
              mb: 2,
            }}
          >
            Receive notifications about your boards and
            workspace.
          </Typography>

          <Divider
            sx={{
              borderColor: "#363638",
              mb: 2,
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography>
              Enable notifications
            </Typography>

            <Switch
              checked={notifications}
              onChange={(e) =>
                setNotifications(e.target.checked)
              }
            />
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default SettingsPage;