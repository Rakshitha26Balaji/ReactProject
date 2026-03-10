import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  Grid,
  Container,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";

/* ================= PROFESSIONAL LIGHT THEME ================= */

const THEME = {
  pageBg: "#F4F7FB",
  primary: "#5C6F91",
  accent: "#4A90E2",
  card: "#FFFFFF",
  border: "#E3E8F2",
  tableHeader: "#6B7C93",
  rowHover: "#F1F4FA",
};

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
};

/* ================= COMPONENT ================= */

const ContractAssetsForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [value, setValue] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [ServerIp, SetServerIp] = useState("");

  const API = "/getBudgetaryQuoatation";

  useEffect(() => {
    axios.get(`/config.json`)
      .then((response) => {
        const ip = response.data.project[0].ServerIP[0].NodeServerIP;
        SetServerIp(ip);
        return axios.get(ip + API);
      })
      .then((res) => setOrderData(res.data))
      .catch(() => SetServerIp(""));
  }, []);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      slno: "",
      projectDescription: "",
      customerName: "",
      lineItemWiseValue: "",
      totalValue: "",
      revisedValue: "",
      remarks: "",
      projectManager: "",
    },
  });

  const onSubmit = (data) => {
    axios.post(ServerIp + API, data)
      .then(() => {
        setSubmitSuccess(true);
        reset();
      })
      .catch(console.log);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: -8,
        pb: 4,
        pt: 2,
        backgroundColor: THEME.pageBg,
        borderRadius: 3,
      }}
    >
      {/* TABS */}
      <Tabs
        value={value}
        onChange={(e, v) => setValue(v)}
        centered
        sx={{
          mb: 4,
          "& .MuiTab-root": {
            fontWeight: 700,
            textTransform: "none",
          },
          "& .Mui-selected": {
            color: THEME.primary + " !important",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: THEME.accent,
          },
        }}
      >
        <Tab label="Form" />
        <Tab label="Table" />
      </Tabs>

      {/* ================= CREATE FORM ================= */}
      {value === 0 && (
        <Paper
          sx={{
            p: 5,
            borderRadius: 4,
            backgroundColor: THEME.card,
            border: `1px solid ${THEME.border}`,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: THEME.primary, mb: 1 }}
            align="center"
          >
            Contract Asset Form
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 4, color: "#6B7280" }}
          >
            Enter contract asset details below
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* LEFT COLUMN */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="projectDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Project Description" fullWidth sx={fieldStyle} />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="customerName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Customer Name" fullWidth sx={fieldStyle} />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="lineItemWiseValue"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Line Item Wise Value (Cr)" fullWidth sx={fieldStyle} />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="totalValue"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Total Value (Cr)" fullWidth sx={fieldStyle} />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="revisedValue"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Revised Value (Cr)" fullWidth sx={fieldStyle} />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="projectManager"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Project Manager" fullWidth sx={fieldStyle} />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Remarks"
                      multiline
                      rows={3}
                      fullWidth
                      sx={fieldStyle}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* BUTTONS */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 5 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  px: 6,
                  py: 1.3,
                  borderRadius: 3,
                  fontWeight: 700,
                  backgroundColor: THEME.accent,
                  textTransform: "none",
                }}
              >
                Submit
              </Button>

              <Button
                variant="outlined"
                onClick={() => reset()}
                sx={{
                  px: 6,
                  py: 1.3,
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: "none",
                  borderColor: THEME.primary,
                  color: THEME.primary,
                }}
              >
                Reset
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {/* ================= VIEW TABLE ================= */}
      {value === 1 && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            border: `1px solid ${THEME.border}`,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: THEME.tableHeader }}>
                {[
                  "Sl No",
                  "Project Description",
                  "Customer",
                  "Line Item Value",
                  "Total Value",
                  "Revised Value",
                  "Remarks",
                  "Project Manager",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      borderRight: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {orderData?.data?.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": { backgroundColor: THEME.rowHover },
                  }}
                >
                  <TableCell sx={{ border: `1px solid ${THEME.border}` }}>{row.slno}</TableCell>
                  <TableCell sx={{ border: `1px solid ${THEME.border}` }}>{row.projectDescription}</TableCell>
                  <TableCell sx={{ border: `1px solid ${THEME.border}` }}>{row.customerName}</TableCell>
                  <TableCell sx={{ border: `1px solid ${THEME.border}`, textAlign: "right" }}>{row.lineItemWiseValue}</TableCell>
                  <TableCell sx={{ border: `1px solid ${THEME.border}`, textAlign: "right" }}>{row.totalValue}</TableCell>
                  <TableCell sx={{ border: `1px solid ${THEME.border}`, textAlign: "right" }}>{row.revisedValue}</TableCell>
                  <TableCell sx={{ border: `1px solid ${THEME.border}` }}>{row.remarks}</TableCell>
                  <TableCell sx={{ border: `1px solid ${THEME.border}` }}>{row.projectManager}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={submitSuccess}
        autoHideDuration={4000}
        onClose={() => setSubmitSuccess(false)}
      >
        <Alert severity="success">
          Data submitted successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContractAssetsForm;