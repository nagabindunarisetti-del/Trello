import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

function SubscriptionPage() {
  const features = [
    "Create unlimited boards",
    "Create unlimited lists and cards",
    "Manage workspace members",
    "Organize your projects easily",
    "Access Trello-style Kanban boards",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f5f7",
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#172b4d",
            mb: 1,
          }}
        >
          Subscription
        </Typography>

        <Typography
          sx={{
            color: "#5e6c84",
            fontSize: 15,
          }}
        >
          Manage your subscription and choose the plan that works for you.
        </Typography>
      </Box>

      {/* Plans */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {/* Free Plan */}
        <Card
          sx={{
            width: {
              xs: "100%",
              sm: 320,
            },
            borderRadius: 3,
            border: "1px solid #dfe1e6",
            boxShadow: "0 2px 8px rgba(9,30,66,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#172b4d",
                mb: 1,
              }}
            >
              Free
            </Typography>

            <Typography
              sx={{
                color: "#5e6c84",
                mb: 2,
              }}
            >
              For personal projects and small teams.
            </Typography>

            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 700,
                color: "#172b4d",
                mb: 3,
              }}
            >
              ₹0
              <Typography
                component="span"
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#5e6c84",
                }}
              >
                {" "}
                / month
              </Typography>
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              {features.map((feature) => (
                <Box
                  key={feature}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#e3fcef",
                      color: "#00875a",
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "#172b4d",
                    }}
                  >
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              disabled
              sx={{
                mt: 3,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card
          sx={{
            width: {
              xs: "100%",
              sm: 320,
            },
            borderRadius: 3,
            border: "2px solid #0c66e4",
            boxShadow: "0 4px 14px rgba(9,30,66,0.12)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#0c66e4",
                mb: 1,
              }}
            >
              Pro
            </Typography>

            <Typography
              sx={{
                color: "#5e6c84",
                mb: 2,
              }}
            >
              For growing teams and larger projects.
            </Typography>

            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 700,
                color: "#172b4d",
                mb: 3,
              }}
            >
              ₹499
              <Typography
                component="span"
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#5e6c84",
                }}
              >
                {" "}
                / month
              </Typography>
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              {features.map((feature) => (
                <Box
                  key={feature}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#deebff",
                      color: "#0c66e4",
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "#172b4d",
                    }}
                  >
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                backgroundColor: "#0c66e4",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#0055cc",
                },
              }}
            >
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default SubscriptionPage;

