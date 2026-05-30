import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  Lock as LockIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import CustomHeader from "../Header/CustomHeader";
import axios from "axios";
import authHeader from "../../Services/auth-header";

export default function SettingsPage() {
  // =========================================================
  // STATE
  // =========================================================
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setSnackbar({
        open: true,
        message: "All fields are required",
        severity: "error",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await axios.put(
        "http://localhost:8082/change-password",
        {
          userId: user.userID,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: authHeader(),
        },
      );

      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Password update failed",
        severity: "error",
      });
    }
  };

  // =========================================================
  // CLOSE SNACKBAR
  // =========================================================
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <>
      <CustomHeader />

      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #001f2f 0%, #003049 45%, #0a4d68 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 5,
        }}
      >
        <Container maxWidth="sm">
          <Card
            elevation={15}
            sx={{
              borderRadius: 5,
              overflow: "hidden",
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* =========================================================
                HEADER SECTION
            ========================================================= */}
            <Box
              sx={{
                background: "linear-gradient(90deg, #003049 0%, #005f73 100%)",
                py: 5,
                textAlign: "center",
                color: "#fff",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 2,
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <LockIcon
                  sx={{
                    fontSize: 40,
                    color: "#fcbf49",
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  letterSpacing: 1,
                }}
              >
                Security Settings
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  opacity: 0.8,
                }}
              >
                Change your password securely
              </Typography>
            </Box>

            {/* =========================================================
                FORM SECTION
            ========================================================= */}
            <CardContent sx={{ p: 5 }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  {/* CURRENT PASSWORD */}
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#003049" }} />
                        </InputAdornment>
                      ),

                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />

                  {/* NEW PASSWORD */}
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#003049" }} />
                        </InputAdornment>
                      ),

                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />

                  {/* CONFIRM PASSWORD */}
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#003049" }} />
                        </InputAdornment>
                      ),

                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />

                  {/* FORGOT PASSWORD */}
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: "right",
                      color: "#005f73",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": {
                        textDecoration: "underline",
                        color: "#003049",
                      },
                    }}
                  >
                    Forgot Password?
                  </Typography>

                  {/* BUTTONS */}
                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      onClick={() =>
                        setFormData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: "bold",
                        textTransform: "none",
                        fontSize: "1rem",
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: "bold",
                        textTransform: "none",
                        fontSize: "1rem",
                        background:
                          "linear-gradient(90deg, #003049 0%, #005f73 100%)",

                        "&:hover": {
                          background:
                            "linear-gradient(90deg, #00263a 0%, #00495a 100%)",
                        },
                      }}
                    >
                      Update Password
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Container>

        {/* =========================================================
            SNACKBAR
        ========================================================= */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: "100%",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
