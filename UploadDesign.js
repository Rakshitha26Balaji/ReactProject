import React, { useState } from "react";
import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const DOCUMENT_TYPES = [
  { id: "contract_copy", label: "Contract Copy" },
  { id: "loi", label: "Letter of Intent (LOI)" },
  { id: "invoice", label: "Invoice" },
  { id: "po", label: "Purchase Order (PO)" },
  { id: "other", label: "Other Document" },
];

const createEmptyRow = () => ({
  documentType: "",
  file: null,
  uploaded: false,
});

export default function AttachmentsPreview() {
  const [documents, setDocuments] = useState([createEmptyRow()]); // ✅ minimum one row

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const showSnack = (msg, severity = "success") => {
    setSnack({ open: true, msg, severity });
  };

  const handleAddDocument = () => {
    setDocuments((prev) => [...prev, createEmptyRow()]);
    showSnack("New document row added!", "info");
  };

  const handleRemoveDocument = (index) => {
    if (documents.length === 1) {
      showSnack("At least one document row is required.", "warning");
      return;
    }

    setDocuments((prev) => prev.filter((_, i) => i !== index));
    showSnack("Document row removed.", "info");
  };

  const handleDocumentTypeChange = (index, value) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], documentType: value };
      return updated;
    });
  };

  const handleFileChangeDropdown = (index, file) => {
    if (!file) return;

    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file };
      return updated;
    });
  };

  const handleUpload = (index) => {
    const doc = documents[index];

    if (!doc.documentType) {
      showSnack("Please select a document type.", "warning");
      return;
    }

    if (!doc.file) {
      showSnack("Please choose a file before uploading.", "warning");
      return;
    }

    // dummy upload simulation
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], uploaded: true };
      return updated;
    });

    showSnack(`Uploaded successfully: ${doc.file.name}`, "success");
  };

  const handleClear = (index) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = createEmptyRow();
      return updated;
    });

    showSnack("Row cleared.", "info");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, sm: 4 },
        background:
          "linear-gradient(135deg, rgba(234,246,253,1), rgba(207,233,247,1), rgba(182,223,245,1))",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1800 }}>
        {/* ===================== Attachments Section ===================== */}
        <Card
          sx={{
            mt: 1,
            mb: 3,
            p: { xs: 2, sm: 3, md: 3.5 },
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,250,255,0.75))",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(148,163,184,0.25)",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(59,130,246,0.14), transparent 55%)",
              pointerEvents: "none",
            },
          }}
        >
          {/* Header */}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    letterSpacing: 0.3,
                    color: "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  📎 Attachments
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "rgba(30,41,59,0.75)" }}
                >
                  Upload Contract Copy / Letter of Intent (Optional)
                </Typography>
              </Box>

              {/* ✅ Add Document Button */}
              <Button
                onClick={handleAddDocument}
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2.4,
                  py: 1.15,
                  boxShadow: "0 12px 26px rgba(59,130,246,0.22)",
                  background: "linear-gradient(135deg, #2563eb, #60a5fa)",
                  "&:hover": {
                    boxShadow: "0 18px 34px rgba(59,130,246,0.28)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Add Document
              </Button>
            </Box>

            <Divider sx={{ mt: 2.5, mb: 3, opacity: 0.5 }} />

            {/* Documents List */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
              {documents.map((doc, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: { xs: 1.7, sm: 2 },
                    borderRadius: 3,
                    border: "1px solid rgba(148,163,184,0.25)",
                    background: "rgba(255,255,255,0.7)",
                    boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
                    transition: "0.25s ease",
                    position: "relative",
                    "&:hover": {
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {/* ✅ Remove Button (Top Right) */}
                  <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                    <Tooltip title="Remove this document row">
                      <span>
                        <IconButton
                          onClick={() => handleRemoveDocument(index)}
                          disabled={documents.length === 1}
                          sx={{
                            borderRadius: 2,
                            background: "rgba(239,68,68,0.08)",
                            "&:hover": {
                              background: "rgba(239,68,68,0.16)",
                            },
                          }}
                        >
                          <DeleteOutlineIcon
                            sx={{
                              color:
                                documents.length === 1
                                  ? "rgba(148,163,184,0.9)"
                                  : "#ef4444",
                            }}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  <Grid container spacing={2} alignItems="center">
                    {/* Document Type */}
                    <Grid item xs={12} sm={5} md={3}>
                      <TextField
                        select
                        label="Document Type"
                        fullWidth
                        value={doc.documentType}
                        onChange={(e) =>
                          handleDocumentTypeChange(index, e.target.value)
                        }
                        disabled={doc.uploaded}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2.5,
                            backgroundColor: "rgba(241,248,255,0.95)",
                            "& fieldset": {
                              borderColor: "rgba(148,163,184,0.35)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(59,130,246,0.65)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#3b82f6",
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputLabel-root": { color: "#334155" },
                        }}
                      >
                        {DOCUMENT_TYPES.map((docType) => (
                          <MenuItem key={docType.id} value={docType.id}>
                            {docType.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Choose File */}
                    <Grid item xs={12} sm={7} md={5}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        disabled={doc.uploaded}
                        sx={{
                          borderRadius: 2.5,
                          py: 1.45,
                          textTransform: "none",
                          fontWeight: 650,
                          borderColor: "rgba(59,130,246,0.35)",
                          color: "#0f172a",
                          background: "rgba(255,255,255,0.85)",
                          "&:hover": {
                            borderColor: "#3b82f6",
                            background: "rgba(239,246,255,0.8)",
                          },
                        }}
                      >
                        {doc.file ? doc.file.name : "Choose File"}
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChangeDropdown(index, e.target.files?.[0])
                          }
                        />
                      </Button>

                      {doc.file && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <Chip
                            label={`Size: ${(doc.file.size / 1024).toFixed(
                              2
                            )} KB`}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              background: "rgba(59,130,246,0.10)",
                              color: "#1e3a8a",
                              fontWeight: 700,
                            }}
                          />

                          {doc.uploaded && (
                            <Chip
                              label="Uploaded"
                              size="small"
                              sx={{
                                borderRadius: 2,
                                background: "rgba(34,197,94,0.12)",
                                color: "#166534",
                                fontWeight: 800,
                              }}
                            />
                          )}
                        </Box>
                      )}
                    </Grid>

                    {/* Upload Button */}
                    <Grid item xs={6} sm={6} md={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={doc.uploaded || !doc.file || !doc.documentType}
                        onClick={() => handleUpload(index)}
                        sx={{
                          borderRadius: 2.5,
                          py: 1.45,
                          textTransform: "none",
                          fontWeight: 800,
                          boxShadow: "0 10px 20px rgba(59,130,246,0.22)",
                          background:
                            "linear-gradient(135deg, #2563eb, #60a5fa)",
                          "&:hover": {
                            boxShadow: "0 14px 26px rgba(59,130,246,0.30)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        Upload
                      </Button>
                    </Grid>

                    {/* Clear Button */}
                    <Grid item xs={6} sm={6} md={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => handleClear(index)}
                        sx={{
                          borderRadius: 2.5,
                          py: 1.45,
                          textTransform: "none",
                          fontWeight: 800,
                          borderColor: "rgba(239,68,68,0.45)",
                          background: "rgba(255,255,255,0.85)",
                          "&:hover": {
                            borderColor: "#ef4444",
                            background: "rgba(254,242,242,0.9)",
                          },
                        }}
                      >
                        Clear
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          </Box>
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={2500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snack.severity}
            variant="filled"
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{ borderRadius: 2 }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
