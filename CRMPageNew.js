import React from "react";
import { Grid, Card, CardActionArea, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PeopleIcon from "@mui/icons-material/People";

const menuItems = [
  {
    title: "Budgetary Quotation",
    icon: <TrendingUpIcon sx={{ fontSize: 55, color: "#0D47A1" }} />,
    path: "/budgetary-quotation",
  },
  {
    title: "Lead Submitted",
    icon: <AssignmentTurnedInIcon sx={{ fontSize: 55, color: "#1B5E20" }} />,
    path: "/lead-submitted",
  },
  {
    title: "Domestic Leads",
    icon: <PeopleIcon sx={{ fontSize: 55, color: "#0D47A1" }} />,
    path: "/domestic-leads",
  },
];

export default function CrmPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",

        // 🌟 FORMAL BLUE CORPORATE GRADIENT
        background: `
          linear-gradient(
            135deg,
            #E8F1FF 0%,
            #D6E4F9 50%,
            #F9FBFF 100%
          )
        `,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        mb={6}
        sx={{
          textAlign: "center",
          color: "#0A2E6E",
          letterSpacing: "1.2px",
        }}
      >
        CRM Dashboard
      </Typography>

      <Grid container spacing={5} justifyContent="center" sx={{ maxWidth: 1300, mx: "auto" }}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card
              sx={{
                height: 250,
                borderRadius: 6,
                padding: "6px",

                // Glass-style professional card
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 8px 28px rgba(0,0,0,0.12)",

                transition: "all 0.45s ease",

                "&:hover": {
                  transform: "translateY(-10px) scale(1.03)",
                  boxShadow: "0 18px 38px rgba(0,0,0,0.22)",
                  background: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(0,0,0,0.1)",
                },
              }}
              onClick={() => navigate(item.path)}
            >
              <CardActionArea sx={{ height: "100%", borderRadius: "inherit" }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)",
                      boxShadow: "0 0 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography variant="h5" fontWeight={700} sx={{ color: "#0D47A1" }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Open this module
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
