// BudgetaryQuotationManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";

/* ---------------- THEME COLORS (no external CSS) ---------------- */
const themeBlue = {
  primary: "#1565c0",
  headerBg: "#0d47a1",
  sectionBg: "#f0f6ff",
  tableStriped: "#f4f9ff",
  tableHover: "#e3f2fd",
};

/* ---------------- Component ---------------- */
export default function BudgetaryQuotationManager() {
  // Tab state: 0 -> Create, 1 -> View
  const [tab, setTab] = useState(0);

  /* ---------- Server + data state ---------- */
  const [serverBase, setServerBase] = useState("");
  const [rows, setRows] = useState([]);
  const [loadingError, setLoadingError] = useState("");

  /* ---------- Form (Create) ---------- */
  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors },
  } = useForm({
    defaultValues: {
      bqTitle: "",
      customerName: "",
      customerAddress: "",
      leadOwner: "",
      defenceAndNonDefence: "",
      estimateValueInCrWithoutGST: "",
      submittedValueInCrWithoutGST: "",
      dateOfLetterSubmission: "",
      referenceNo: "",
      JSON_competitors: "",
      presentStatus: "",
    },
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState(null);

  /* ---------- Table controls ---------- */
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortKey, setSortKey] = useState("dateOfLetterSubmission");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ---------- Edit dialog ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { isSubmitting: editSubmitting },
  } = useForm({
    defaultValues: {
      bqTitle: "",
      customerName: "",
      customerAddress: "",
      leadOwner: "",
      defenceAndNonDefence: "",
      estimateValueInCrWithoutGST: "",
      submittedValueInCrWithoutGST: "",
      dateOfLetterSubmission: "",
      referenceNo: "",
      JSON_competitors: "",
      presentStatus: "",
    },
  });

  /* ---------- Delete confirm ---------- */
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, rowId: null });

  /* ---------- Snack ---------- */
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  /* ---------- Options ---------- */
  const defenceOptions = ["Defence", "Non-Defence", "Civil"];
  const statusOptions = [
    "Budgetary Quotation Submitted",
    "Commercial Bid Submitted",
    "EoI was Submitted",
    "Not Participated",
  ];

  /* ---------- Load config + data ---------- */
  useEffect(() => {
    axios
      .get("/config.json")
      .then((resp) => {
        const ip = resp.data?.project?.[0]?.ServerIP?.[0]?.NodeServerIP ?? "";
        const base = ip || "http://172.195.120.135";
        setServerBase(base);
        fetchData(base);
      })
      .catch(() => {
        const fallback = "http://172.195.120.135";
        setServerBase(fallback);
        fetchData(fallback);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = (base = serverBase) => {
    setLoadingError("");
    axios
      .get(`${base}/getBudgetaryQuotation`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setRows(data);
      })
      .catch((err) => {
        console.error("Fetch error", err);
        setLoadingError("Failed to load data from server.");
        setRows([]);
      });
  };

  /* ---------- CREATE submit ---------- */
  const onCreate = (data) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const payload = {
      ...data,
      estimateValueInCrWithoutGST: parseFloat(data.estimateValueInCrWithoutGST) || 0,
      submittedValueInCrWithoutGST: parseFloat(data.submittedValueInCrWithoutGST) || 0,
      submittedAt: new Date().toISOString(),
      OperatorId: user.id ?? "291536",
      OperatorName: user.username ?? "Vivek Kumar Singh",
      OperatorRole: user.userRole ?? "Lead Owner",
      OperatorSBU: "Software SBU",
    };

    axios
      .post(`${serverBase}/addBudgetaryQuotation`, payload)
      .then((res) => {
        setLastSubmittedData(payload);
        setSubmitSuccess(true);
        setSnack({ open: true, msg: "BQ created successfully", severity: "success" });
        resetCreateForm();
        fetchData();
      })
      .catch((err) => {
        console.error("Create error", err);
        setSnack({ open: true, msg: "Failed to create record", severity: "error" });
      });
  };

  /* ---------- Table: filtering, searching, sorting ---------- */
  const filteredSortedRows = useMemo(() => {
    let data = [...rows];

    if (filterCategory) data = data.filter((r) => (r.defenceAndNonDefence || "") === filterCategory);
    if (filterStatus) data = data.filter((r) => (r.presentStatus || "") === filterStatus);

    if (searchText?.trim()) {
      const q = searchText.trim().toLowerCase();
      data = data.filter((r) => {
        const hay = [
          r.bqTitle,
          r.customerName,
          r.customerAddress,
          r.leadOwner,
          r.defenceAndNonDefence,
          r.referenceNo,
          r.JSON_competitors,
          r.presentStatus,
          r.dateOfLetterSubmission,
        ]
          .map((v) => (v ?? "").toString().toLowerCase())
          .join(" ");
        return hay.includes(q);
      });
    }

    data.sort((a, b) => {
      const A = (a[sortKey] ?? "").toString();
      const B = (b[sortKey] ?? "").toString();
      const numA = parseFloat(A.replace(/[^0-9.-]+/g, ""));
      const numB = parseFloat(B.replace(/[^0-9.-]+/g, ""));
      let cmp = 0;
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) cmp = numA - numB;
      else cmp = A.localeCompare(B);
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return data;
  }, [rows, filterCategory, filterStatus, searchText, sortKey, sortOrder]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSortedRows.slice(start, start + rowsPerPage);
  }, [filteredSortedRows, page, rowsPerPage]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getSortIndicator = (key) => {
    if (sortKey !== key) return "";
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  /* ---------- Edit flow ---------- */
  const openEditDialog = (row) => {
    setEditingRow(row);
    resetEditForm({
      bqTitle: row.bqTitle ?? "",
      customerName: row.customerName ?? "",
      customerAddress: row.customerAddress ?? "",
      leadOwner: row.leadOwner ?? "",
      defenceAndNonDefence: row.defenceAndNonDefence ?? "",
      estimateValueInCrWithoutGST: row.estimateValueInCrWithoutGST ?? "",
      submittedValueInCrWithoutGST: row.submittedValueInCrWithoutGST ?? "",
      dateOfLetterSubmission: row.dateOfLetterSubmission ?? "",
      referenceNo: row.referenceNo ?? "",
      JSON_competitors: row.JSON_competitors ?? "",
      presentStatus: row.presentStatus ?? "",
    });
    setEditOpen(true);
  };

  const closeEditDialog = () => {
    setEditOpen(false);
    setEditingRow(null);
  };

  const onSaveEdit = async (formData) => {
    if (!editingRow?.id) {
      setSnack({ open: true, msg: "No selected row to update", severity: "error" });
      return;
    }
    try {
      const payload = {
        ...formData,
        estimateValueInCrWithoutGST: parseFloat(formData.estimateValueInCrWithoutGST) || 0,
        submittedValueInCrWithoutGST: parseFloat(formData.submittedValueInCrWithoutGST) || 0,
      };
      await axios.put(`${serverBase}/updateBudgetaryQuotation/${editingRow.id}`, payload);
      setSnack({ open: true, msg: "Record updated", severity: "success" });
      closeEditDialog();
      fetchData();
    } catch (err) {
      console.error("Update error", err);
      setSnack({ open: true, msg: "Failed to update", severity: "error" });
    }
  };

  /* ---------- Delete flow ---------- */
  const confirmDelete = (id) => setDeleteConfirm({ open: true, rowId: id });
  const cancelDelete = () => setDeleteConfirm({ open: false, rowId: null });

  const doDelete = async () => {
    const id = deleteConfirm.rowId;
    if (!id) return;
    try {
      await axios.delete(`${serverBase}/deleteBudgetaryQuotation/${id}`);
      setSnack({ open: true, msg: "Record deleted", severity: "success" });
      cancelDelete();
      fetchData();
    } catch (err) {
      console.error("Delete error", err);
      setSnack({ open: true, msg: "Failed to delete", severity: "error" });
    }
  };

  /* ---------- Export CSV ---------- */
  const exportCSV = () => {
    const all = filteredSortedRows;
    if (!all || all.length === 0) {
      setSnack({ open: true, msg: "No data to export", severity: "info" });
      return;
    }
    const headers = [
      "bqTitle",
      "customerName",
      "customerAddress",
      "leadOwner",
      "defenceAndNonDefence",
      "estimateValueInCrWithoutGST",
      "submittedValueInCrWithoutGST",
      "dateOfLetterSubmission",
      "referenceNo",
      "JSON_competitors",
      "presentStatus",
    ];
    const csvRows = [headers.join(",")];
    all.forEach((r) => {
      const row = headers
        .map((h) => {
          const cell = r[h] ?? "";
          const escaped = cell.toString().replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",");
      csvRows.push(row);
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budgetary-quotation-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Utility: download last submitted JSON ---------- */
  const downloadLastJSON = () => {
    if (!lastSubmittedData) return;
    const blob = new Blob([JSON.stringify(lastSubmittedData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budgetary-quotation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Render ---------- */
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ color: themeBlue.primary, fontWeight: 800, mb: 3, textAlign: "center" }}>
        🔷 Budgetary Quotation Manager
      </Typography>

      {/* Tabs */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" centered>
          <Tab label="Create Data" />
          <Tab label="View Data" />
        </Tabs>
      </Paper>

      {/* ------------------- TAB 0: CREATE FORM ------------------- */}
      {tab === 0 && (
        <Paper elevation={5} sx={{ p: 4, borderRadius: 3, maxWidth: "1500px", mx: "auto", background: "#fff" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: themeBlue.primary }}>
              🔷 Budgetary Quotation Form
            </Typography>
            <Divider sx={{ mt: 2, borderColor: themeBlue.primary }} />
          </Box>

          <Box component="form" onSubmit={handleCreateSubmit(onCreate)}>
            {/* BQ Details */}
            <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: themeBlue.sectionBg }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: themeBlue.primary, mb: 1 }}>
                  📘 BQ Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="bqTitle"
                      control={createControl}
                      rules={{ required: "BQ Title required" }}
                      render={({ field }) => (
                        <TextField {...field} label="BQ Title" fullWidth required InputLabelProps={{ shrink: true }} error={!!createErrors.bqTitle} helperText={createErrors.bqTitle?.message} />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="customerName"
                      control={createControl}
                      rules={{ required: "Customer Name required" }}
                      render={({ field }) => <TextField {...field} label="Customer Name" fullWidth required InputLabelProps={{ shrink: true }} error={!!createErrors.customerName} helperText={createErrors.customerName?.message} />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller name="customerAddress" control={createControl} rules={{ required: "Customer Address required" }} render={({ field }) => <TextField {...field} label="Customer Address" fullWidth required InputLabelProps={{ shrink: true }} error={!!createErrors.customerAddress} helperText={createErrors.customerAddress?.message} />} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller name="leadOwner" control={createControl} rules={{ required: "Lead Owner required" }} render={({ field }) => <TextField {...field} label="Lead Owner" fullWidth required InputLabelProps={{ shrink: true }} error={!!createErrors.leadOwner} helperText={createErrors.leadOwner?.message} />} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Classification & Financial */}
            <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: themeBlue.sectionBg }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: themeBlue.primary, mb: 1 }}>
                  🏷 Classification & Financial Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="defenceAndNonDefence"
                      control={createControl}
                      rules={{ required: "Classification required" }}
                      render={({ field }) => (
                        <TextField {...field} select label="Defence / Non-Defence" sx={{ width: 260 }} InputLabelProps={{ shrink: true }} required>
                          {defenceOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Controller name="estimateValueInCrWithoutGST" control={createControl} rules={{ required: "Estimate required" }} render={({ field }) => <TextField {...field} label="Estimate Value Without GST" type="number" fullWidth InputLabelProps={{ shrink: true }} required />} />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Controller name="submittedValueInCrWithoutGST" control={createControl} rules={{ required: "Submitted value required" }} render={({ field }) => <TextField {...field} label="Submitted Value Without GST" type="number" fullWidth InputLabelProps={{ shrink: true }} required />} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: themeBlue.sectionBg }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: themeBlue.primary, mb: 1 }}>
                  📝 Additional Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller name="referenceNo" control={createControl} render={({ field }) => <TextField {...field} label="Reference Number" fullWidth InputLabelProps={{ shrink: true }} />} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller name="dateOfLetterSubmission" control={createControl} render={({ field }) => <TextField {...field} label="Date of Submission" type="date" fullWidth InputLabelProps={{ shrink: true }} />} />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Controller name="presentStatus" control={createControl} render={({ field }) => <TextField {...field} select label="Present Status" sx={{ width: 260 }} InputLabelProps={{ shrink: true }} >{statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>} />
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <Controller name="JSON_competitors" control={createControl} render={({ field }) => <TextField {...field} label="Competitors" fullWidth multiline rows={2} placeholder="Company A, Company B..." InputLabelProps={{ shrink: true }} />} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
              <Button type="submit" variant="contained" size="large" sx={{ px: 4 }}>
                Submit BQ
              </Button>
              <Button type="button" variant="outlined" size="large" onClick={() => resetCreateForm()} sx={{ px: 4 }}>
                Reset
              </Button>
              {lastSubmittedData && (
                <Button variant="contained" color="success" onClick={downloadLastJSON} startIcon={<FileDownloadIcon />}>
                  Download Last JSON
                </Button>
              )}
            </Box>

            {/* Snackbar */}
            <Snackbar open={submitSuccess} autoHideDuration={3000} onClose={() => setSubmitSuccess(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
              <Alert onClose={() => setSubmitSuccess(false)} severity="success">
                Form submitted successfully!
              </Alert>
            </Snackbar>
          </Box>
        </Paper>
      )}

      {/* ------------------- TAB 1: VIEW / TABLE ------------------- */}
      {tab === 1 && (
        <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search (title, customer, lead owner, ref no...)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchText ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchText("")}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <TextField
                select
                size="small"
                label="Category"
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(0);
                }}
                sx={{ width: 260 }}
              >
                <MenuItem value="">All</MenuItem>
                {defenceOptions.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <TextField
                select
                size="small"
                label="Status"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                sx={{ width: 260 }}
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1 }}>
              <Button variant="outlined" onClick={() => { setFilterCategory(""); setFilterStatus(""); setSearchText(""); setPage(0); }}>
                Clear Filters
              </Button>
              <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={exportCSV}>
                Export CSV
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ maxHeight: 640, overflowX: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort("bqTitle")} sx={{ cursor: "pointer", backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>
                    BQ Title{getSortIndicator("bqTitle")}
                  </TableCell>
                  <TableCell onClick={() => handleSort("customerName")} sx={{ cursor: "pointer", backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>
                    Customer{getSortIndicator("customerName")}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>Address</TableCell>
                  <TableCell onClick={() => handleSort("leadOwner")} sx={{ cursor: "pointer", backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>
                    Lead Owner{getSortIndicator("leadOwner")}
                  </TableCell>
                  <TableCell onClick={() => handleSort("defenceAndNonDefence")} sx={{ cursor: "pointer", backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>
                    Category{getSortIndicator("defenceAndNonDefence")}
                  </TableCell>
                  <TableCell onClick={() => handleSort("estimateValueInCrWithoutGST")} sx={{ cursor: "pointer", backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>
                    Est. Value{getSortIndicator("estimateValueInCrWithoutGST")}
                  </TableCell>
                  <TableCell onClick={() => handleSort("submittedValueInCrWithoutGST")} sx={{ cursor: "pointer", backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>
                    Submitted Value{getSortIndicator("submittedValueInCrWithoutGST")}
                  </TableCell>
                  <TableCell onClick={() => handleSort("dateOfLetterSubmission")} sx={{ cursor: "pointer", backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>
                    Date{getSortIndicator("dateOfLetterSubmission")}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>Ref No</TableCell>
                  <TableCell sx={{ backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>Competitors</TableCell>
                  <TableCell onClick={() => handleSort("presentStatus")} sx={{ cursor: "pointer", backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700 }}>
                    Status{getSortIndicator("presentStatus")}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: themeBlue.headerBg, color: "#fff", fontWeight: 700, textAlign: "center" }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                      <Typography variant="subtitle1" color="textSecondary">
                        No records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, idx) => (
                    <TableRow
                      key={row.id ?? idx}
                      sx={{
                        backgroundColor: idx % 2 === 0 ? themeBlue.tableStriped : "white",
                        "&:hover": { backgroundColor: themeBlue.tableHover },
                      }}
                    >
                      <TableCell sx={{ width: 220 }}>{row.bqTitle}</TableCell>
                      <TableCell sx={{ width: 200 }}>{row.customerName}</TableCell>
                      <TableCell sx={{ width: 260 }}>{row.customerAddress}</TableCell>
                      <TableCell sx={{ width: 160 }}>{row.leadOwner}</TableCell>
                      <TableCell sx={{ width: 140 }}>{row.defenceAndNonDefence}</TableCell>
                      <TableCell sx={{ width: 130 }}>{row.estimateValueInCrWithoutGST}</TableCell>
                      <TableCell sx={{ width: 130 }}>{row.submittedValueInCrWithoutGST}</TableCell>
                      <TableCell sx={{ width: 120 }}>{row.dateOfLetterSubmission}</TableCell>
                      <TableCell sx={{ width: 140 }}>{row.referenceNo}</TableCell>
                      <TableCell sx={{ width: 200 }}>{row.JSON_competitors}</TableCell>
                      <TableCell sx={{ width: 180 }}>{row.presentStatus}</TableCell>
                      <TableCell align="center" sx={{ width: 120 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => confirmDelete(row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredSortedRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          {/* Loading error */}
          {loadingError && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error">{loadingError}</Alert>
            </Box>
          )}
        </Paper>
      )}

      {/* -------------- Edit Dialog -------------- */}
      <Dialog open={editOpen} fullWidth maxWidth="md" onClose={closeEditDialog}>
        <DialogTitle sx={{ backgroundColor: themeBlue.primary, color: "#fff" }}>Edit Budgetary Quotation</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit(onSaveEdit)} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller name="bqTitle" control={editControl} render={({ field }) => <TextField {...field} label="BQ Title" fullWidth InputLabelProps={{ shrink: true }} />} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller name="customerName" control={editControl} render={({ field }) => <TextField {...field} label="Customer Name" fullWidth InputLabelProps={{ shrink: true }} />} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller name="customerAddress" control={editControl} render={({ field }) => <TextField {...field} label="Customer Address" fullWidth InputLabelProps={{ shrink: true }} />} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller name="leadOwner" control={editControl} render={({ field }) => <TextField {...field} label="Lead Owner" fullWidth InputLabelProps={{ shrink: true }} />} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller name="defenceAndNonDefence" control={editControl} render={({ field }) => (
                  <TextField {...field} select label="Category" sx={{ width: 260 }} InputLabelProps={{ shrink: true }}>
                    {defenceOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>

              <Grid item xs={6} md={4}>
                <Controller name="estimateValueInCrWithoutGST" control={editControl} render={({ field }) => <TextField {...field} label="Est. Value" fullWidth InputLabelProps={{ shrink: true }} />} />
              </Grid>

              <Grid item xs={6} md={4}>
                <Controller name="submittedValueInCrWithoutGST" control={editControl} render={({ field }) => <TextField {...field} label="Submitted Value" fullWidth InputLabelProps={{ shrink: true }} />} />
              </Grid>

              <Grid item xs={6} md={4}>
                <Controller name="dateOfLetterSubmission" control={editControl} render={({ field }) => <TextField {...field} label="Date of Submission" type="date" fullWidth InputLabelProps={{ shrink: true }} />} />
              </Grid>

              <Grid item xs={6} md={4}>
                <Controller name="referenceNo" control={editControl} render={({ field }) => <TextField {...field} label="Reference No" fullWidth InputLabelProps={{ shrink: true }} />} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller name="presentStatus" control={editControl} render={({ field }) => (
                  <TextField {...field} select label="Status" sx={{ width: 260 }} InputLabelProps={{ shrink: true }}>
                    {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>

              <Grid item xs={12}>
                <Controller name="JSON_competitors" control={editControl} render={({ field }) => <TextField {...field} label="Competitors" fullWidth multiline rows={2} InputLabelProps={{ shrink: true }} />} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEditDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleEditSubmit(onSaveEdit)} variant="contained" disabled={editSubmitting}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* -------------- Delete Confirmation -------------- */}
      <Dialog open={deleteConfirm.open} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={doDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* -------------- Snack -------------- */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
{/* -------------- TABLE SECTION (your advanced table) -------------- */}

<AdvancedBQTable initialData={orderData} />

</Container>
);
}

/* -------------------------------------------------------------
   ADVANCED TABLE COMPONENT – Search | Sort | Filter | Edit/Delete
-------------------------------------------------------------- */

function AdvancedBQTable({ initialData }) {
  const [serverBase, setServerBase] = useState("");
  const [rows, setRows] = useState(initialData?.data || []);
  const [loadingError, setLoadingError] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const defenceOptions = ["Defence", "Non-Defence", "Civil"];
  const statusOptions = [
    "Budgetary Quotation Submitted",
    "Commercial Bid Submitted",
    "EoI was Submitted",
    "Not Participated",
  ];

  /* ---------------- TABLE CONTROL STATES ---------------- */
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [sortKey, setSortKey] = useState("dateOfLetterSubmission");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ---------------- EDIT DIALOG ---------------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  /* ---------------- DELETE CONFIRM ---------------- */
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, rowId: null });

  const {
    control,
    handleSubmit,
    reset: resetEditForm,
    formState: { isSubmitting },
  } = useForm();

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    axios
      .get("/config.json")
      .then((resp) => {
        const ip = resp.data.project?.[0]?.ServerIP?.[0]?.NodeServerIP ?? "";
        const base = ip || "http://172.195.120.135";
        setServerBase(base);
        fetchData(base);
      })
      .catch(() => {
        const fallback = "http://172.195.120.135";
        setServerBase(fallback);
        fetchData(fallback);
      });
  }, []);

  const fetchData = (baseUrl = serverBase) => {
    axios
      .get(`${baseUrl}/getBudgetaryQuotation`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setRows(data);
      })
      .catch(() => setLoadingError("Failed to load data from server."));
  };

  /* ---------------- SEARCH + FILTER + SORT ---------------- */
  const filteredSortedRows = useMemo(() => {
    let data = [...rows];

    if (filterCategory) data = data.filter((r) => r.defenceAndNonDefence === filterCategory);
    if (filterStatus) data = data.filter((r) => r.presentStatus === filterStatus);

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      data = data.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const A = (a[sortKey] ?? "").toString();
      const B = (b[sortKey] ?? "").toString();

      let cmp = isNaN(A) ? A.localeCompare(B) : A - B;
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return data;
  }, [rows, searchText, filterCategory, filterStatus, sortKey, sortOrder]);

  /* ---------------- PAGINATION ---------------- */
  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSortedRows.slice(start, start + rowsPerPage);
  }, [filteredSortedRows, page, rowsPerPage]);

  /* ---------------- SORT HANDLER ---------------- */
  const toggleSort = (key) => {
    setSortKey(key);
    setSortOrder((old) => (old === "asc" ? "desc" : "asc"));
  };

  const sortIndicator = (key) =>
    sortKey === key ? (sortOrder === "asc" ? " ▲" : " ▼") : "";

  /* ---------------- EDIT HANDLERS ---------------- */
  const openEdit = (row) => {
    setEditingRow(row);
    resetEditForm(row);
    setEditOpen(true);
  };

  const saveEdit = async (data) => {
    try {
      await axios.put(`${serverBase}/updateBudgetaryQuotation/${editingRow.id}`, data);
      setSnack({ open: true, msg: "Record updated successfully", severity: "success" });
      setEditOpen(false);
      fetchData();
    } catch {
      setSnack({ open: true, msg: "Failed to update", severity: "error" });
    }
  };

  /* ---------------- DELETE HANDLERS ---------------- */
  const confirmDelete = (id) => setDeleteConfirm({ open: true, rowId: id });
  const doDelete = async () => {
    try {
      await axios.delete(`${serverBase}/deleteBudgetaryQuotation/${deleteConfirm.rowId}`);
      setSnack({ open: true, msg: "Record deleted", severity: "success" });
      setDeleteConfirm({ open: false, rowId: null });
      fetchData();
    } catch {
      setSnack({ open: true, msg: "Failed to delete", severity: "error" });
    }
  };

  /* ---------------- CSV EXPORT ---------------- */
  const exportCSV = () => {
    if (filteredSortedRows.length === 0) {
      setSnack({ open: true, msg: "No data to export", severity: "info" });
      return;
    }

    const headers = Object.keys(filteredSortedRows[0]);
    const csv = [
      headers.join(","),
      ...filteredSortedRows.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `BQ-export-${Date.now()}.csv`;
    link.click();
  };

  /* ================== RENDER UI ================== */
  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: "#1565c0", mb: 3, textAlign: "center" }}
      >
        📑 Budgetary Quotation Records
      </Typography>

      {/* ----------- SEARCH + FILTER BAR ----------- */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            select
            size="small"
            label="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            sx={{ width: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            {defenceOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            select
            size="small"
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ width: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
          <Button variant="contained" onClick={exportCSV}>
            Export CSV
          </Button>
        </Grid>
      </Grid>

      {/* ---------------- TABLE ---------------- */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {[
                ["bqTitle", "BQ Title"],
                ["customerName", "Customer"],
                ["customerAddress", "Address"],
                ["leadOwner", "Lead Owner"],
                ["defenceAndNonDefence", "Category"],
                ["estimateValueInCrWithoutGST", "Est. Value"],
                ["submittedValueInCrWithoutGST", "Submitted Value"],
                ["dateOfLetterSubmission", "Date"],
                ["referenceNo", "Ref No"],
                ["JSON_competitors", "Competitors"],
                ["presentStatus", "Status"],
              ].map(([key, label]) => (
                <TableCell
                  key={key}
                  onClick={() => toggleSort(key)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: "#0d47a1",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {label}
                  {sortIndicator(key)}
                </TableCell>
              ))}

              <TableCell
                sx={{
                  backgroundColor: "#0d47a1",
                  color: "white",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow
                key={row.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? "#f4f9ff" : "white",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell>{row.bqTitle}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell>{row.customerAddress}</TableCell>
                <TableCell>{row.leadOwner}</TableCell>
                <TableCell>{row.defenceAndNonDefence}</TableCell>
                <TableCell>{row.estimateValueInCrWithoutGST}</TableCell>
                <TableCell>{row.submittedValueInCrWithoutGST}</TableCell>
                <TableCell>{row.dateOfLetterSubmission}</TableCell>
                <TableCell>{row.referenceNo}</TableCell>
                <TableCell>{row.JSON_competitors}</TableCell>
                <TableCell>{row.presentStatus}</TableCell>

                <TableCell align="center">
                  <IconButton color="primary" onClick={() => openEdit(row)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton color="error" onClick={() => confirmDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                  <Typography>No Records Found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredSortedRows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target

