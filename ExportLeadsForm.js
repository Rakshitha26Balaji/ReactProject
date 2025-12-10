import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

/**
 * ExportLeadsForm
 * Recreated to match EXACT style/theme used in BudgetaryQuotationForm / DomesticLeadForm:
 * - textFieldStyle, cardStyle, sectionTitleStyle
 * - container gradient
 * - buttons, JSON preview, table styling
 *
 * Props:
 *  - OrderData (optional) : data for the View Data tab (expected shape similar to { data: [...] })
 */

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    "& fieldset": {
      borderColor: "#c6cfe1",
    },
    "&:hover fieldset": {
      borderColor: "#7ba4ff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
      borderWidth: "2px",
    },
  },
};

const cardStyle = {
  mb: 3,
  backgroundColor: "#f4f7ff",
  border: "1px solid #d8e1f5",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  p: 2,
};

const sectionTitleStyle = {
  fontWeight: 600,
  mb: 1,
  color: "#1a4fbf",
  letterSpacing: "0.3px",
};

export default function ExportLeadsForm({ OrderData }) {
  const [value, setValue] = useState(0);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Options (can be adjusted)
  const tenderTypeOptions = ["Open", "Limited", "Single Bid"];
  const documentTypeOptions = ["EoI", "RFP", "Tender", "Corrigendum"];
  const civilDefenceOptions = ["Civil", "Defence"];
  const businessDomainOptions = ["Railways", "Metro", "Highways", "Oil & Gas"];
  const resultStatusOptions = ["Won", "Lost", "Participated", "Not Participated"];
  const openClosedOptions = ["Open", "Closed"];
  const presentStatusOptions = ["Submitted", "In Progress", "Pending", "Rejected", "Approved"];

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tenderName: "",
      tenderReferenceNo: "",
      customerName: "",
      customerAddress: "",
      tenderType: "",
      documentType: "",
      leadOwner: "",
      civilOrDefence: "",
      businessDomain: "",
      valueOfEMD: "",
      estimatedValueInCrWithoutGST: "",
      submittedValueInCrWithoutGST: "",
      tenderDated: "",
      lastDateOfSub: "",
      soleOrConsortium: "",
      prebidMeetingDateTime: "",
      competitorsInfo: "",
      wonLostParticipated: "",
      openClosed: "",
      orderWonValueInCrWithoutGST: "",
      presentStatus: "",
      reasonForLossingOpp: "",
      corrigendumsDateFile: "",
    },
  });

  const onSubmit = (data) => {
    // Add operator metadata consistently with other forms
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const payload = {
      ...data,
      estimatedValueInCrWithoutGST:
        data.estimatedValueInCrWithoutGST !== ""
          ? parseFloat(data.estimatedValueInCrWithoutGST)
          : null,
      submittedValueInCrWithoutGST:
        data.submittedValueInCrWithoutGST !== ""
          ? parseFloat(data.submittedValueInCrWithoutGST)
          : null,
      submittedAt: new Date().toISOString(),
      OperatorId: user.id || "291536",
      OperatorName: user.username || "Vivek Kumar Singh",
      OperatorRole: user.userRole || "Lead Owner",
      OperatorSBU: "Software SBU",
    };

    // For now, we just store locally and show JSON preview (original ExportLeadsForm did not POST)
    console.log("Export Lead payload:", payload);
    setSubmittedData(payload);
    setSubmitSuccess(true);
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
  };

  const handleCloseSnackbar = () => setSubmitSuccess(false);

  const handleDownloadJSON = () => {
    if (!submittedData) return;
    const blob = new Blob([JSON.stringify(submittedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export-lead-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        pb: 4,
        mb: 6,
        background: "linear-gradient(to bottom right, #e9f1ff, #ffffff)",
        borderRadius: 4,
        mt: 2,
        p: 3,
      }}
    >
      <Tabs value={value} onChange={(e, v) => setValue(v)}>
        <Tab
          label="Create Data"
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
          }}
        />
        <Tab
          label="View Data"
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
          }}
        />
      </Tabs>

      {value === 0 && (
        <Paper sx={{ p: { xs: 2, sm: 4 }, backgroundColor: "#ffffff", mt: 2 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              color: "#1a4fbf",
              mb: 1,
            }}
          >
            Export Leads Form
          </Typography>

          <Box
            sx={{
              height: "3px",
              width: "100%",
              backgroundColor: "#1a4fbf",
              mb: 4,
            }}
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* SECTION 1 */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  📌 Export Lead Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  {[
                    ["tenderName", "Tender Name"],
                    ["tenderReferenceNo", "Tender Reference No"],
                    ["customerName", "Customer Name"],
                    ["customerAddress", "Customer Address"],
                  ].map(([name, label]) => (
                    <Grid item xs={12} md={6} key={name}>
                      <Controller
                        name={name}
                        control={control}
                        rules={{ required: `${label} is required` }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={label}
                            fullWidth
                            required
                            error={!!errors[name]}
                            helperText={errors[name]?.message}
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="tenderType"
                      control={control}
                      rules={{ required: "Tender Type is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Tender Type"
                          fullWidth
                          sx={{ ...textFieldStyle, minWidth: 220 }}
                          required
                        >
                          {tenderTypeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 2 */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  🏷 Classification & Financial Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="documentType"
                      control={control}
                      rules={{ required: "Document Type is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Document Type"
                          fullWidth
                          sx={{ ...textFieldStyle, minWidth: 220 }}
                          required
                        >
                          {documentTypeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="leadOwner"
                      control={control}
                      rules={{ required: "Lead Owner is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Lead Owner"
                          fullWidth
                          required
                          error={!!errors.leadOwner}
                          helperText={errors.leadOwner?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="civilOrDefence"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Civil / Defence"
                          fullWidth
                          sx={{ ...textFieldStyle, minWidth: 220 }}
                        >
                          {civilDefenceOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="businessDomain"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Business Domain"
                          fullWidth
                          sx={{ ...textFieldStyle, minWidth: 220 }}
                        >
                          {businessDomainOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 3 */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  📊 Values
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="valueOfEMD"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Value of EMD"
                          fullWidth
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="estimatedValueInCrWithoutGST"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Estimated Value in Cr without GST"
                          fullWidth
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="submittedValueInCrWithoutGST"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Submitted Value in Cr without GST"
                          fullWidth
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 4 */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  🗓️ Submission Timeline
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="tenderDated"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="Tender Dated"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="lastDateOfSub"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="Last Date of Submission"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="soleOrConsortium"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Sole / Consortium"
                          fullWidth
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="prebidMeetingDateTime"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="datetime-local"
                          label="Pre-Bid Meeting Date & Time"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 5 */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  📌 Competitors & Results
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  <Grid item xs={12} md={12}>
                    <Controller
                      name="competitorsInfo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Competitors Info"
                          fullWidth
                          multiline
                          rows={2}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="wonLostParticipated"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Result Status"
                          fullWidth
                          sx={textFieldStyle}
                        >
                          {resultStatusOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="openClosed"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Open / Closed"
                          fullWidth
                          sx={textFieldStyle}
                        >
                          {openClosedOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="orderWonValueInCrWithoutGST"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Order Won Value in Crore (without GST)"
                          fullWidth
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="presentStatus"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Present Status"
                          fullWidth
                          sx={textFieldStyle}
                        >
                          {presentStatusOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 6 */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  📝 Reason & Additional Info
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="reasonForLossingOpp"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Reason for Losing / Participated / Not Participating"
                          fullWidth
                          multiline
                          rows={2}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="corrigendumsDateFile"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Corrigendum Info"
                          fullWidth
                          multiline
                          rows={2}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* BUTTONS */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                mt: 4,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ px: 5 }}
              >
                Submit Lead
              </Button>

              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={handleReset}
                sx={{ px: 5 }}
              >
                Reset Form
              </Button>
            </Box>
          </form>

          {/* Snackbar */}
          <Snackbar
            open={submitSuccess}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert severity="success">Export lead submitted successfully!</Alert>
          </Snackbar>

          {/* JSON OUTPUT */}
          {submittedData && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Submitted JSON Data
              </Typography>

              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "#1e1e1e",
                  color: "#d4d4d4",
                  borderRadius: 2,
                  fontFamily: "monospace",
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </Paper>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button variant="contained" onClick={handleDownloadJSON}>
                  Download JSON
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* VIEW TABLE */}
      {value === 1 && OrderData && (
        <ViewExportLeadsData ViewData={OrderData} />
      )}
    </Container>
  );
}

/* ============================
   ViewExportLeadsData (Themed)
   ============================ */
function ViewExportLeadsData({ ViewData }) {
  return (
    <>
      <Typography
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          backgroundColor: "lavender",
          p: 1,
          fontSize: "1.4rem",
          mt: 3,
        }}
      >
        Export Leads Records
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2, width: "100%" }}>
        <Table sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              {[
                "Tender Name",
                "Tender Ref No",
                "Customer Name",
                "Customer Address",
                "Tender Type",
                "Document Type",
                "Lead Owner",
                "Civil/Defence",
                "Business Domain",
                "EMD Value",
                "Estimate Value",
                "Submitted Value",
                "Tender Dated",
                "Last Date of Submission",
                "Sole/Consortium",
                "Pre-Bid DateTime",
                "Competitors Info",
                "Result Status",
                "Open/Closed",
                "Order Won Value",
                "Present Status",
                "Reason",
                "Corrigendum Info",
              ].map((head) => (
                <TableCell key={head} sx={{ fontWeight: 700, fontSize: "15px" }}>
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {ViewData.data?.map((row, idx) => (
              <TableRow key={row.id || idx}>
                <TableCell>{row.tenderName}</TableCell>
                <TableCell>{row.tenderReferenceNo}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell>{row.customerAddress}</TableCell>
                <TableCell>{row.tenderType}</TableCell>
                <TableCell>{row.documentType}</TableCell>
                <TableCell>{row.leadOwner}</TableCell>
                <TableCell>{row.civilOrDefence}</TableCell>
                <TableCell>{row.businessDomain}</TableCell>
                <TableCell>{row.valueOfEMD}</TableCell>
                <TableCell>{row.estimatedValueInCrWithoutGST}</TableCell>
                <TableCell>{row.submittedValueInCrWithoutGST}</TableCell>
                <TableCell>{row.tenderDated}</TableCell>
                <TableCell>{row.lastDateOfSub}</TableCell>
                <TableCell>{row.soleOrConsortium}</TableCell>
                <TableCell>{row.prebidMeetingDateTime}</TableCell>
                <TableCell>{row.competitorsInfo}</TableCell>
                <TableCell>{row.wonLostParticipated}</TableCell>
                <TableCell>{row.openClosed}</TableCell>
                <TableCell>{row.orderWonValueInCrWithoutGST}</TableCell>
                <TableCell>{row.presentStatus}</TableCell>
                <TableCell>{row.reasonForLossingOpp}</TableCell>
                <TableCell>{row.corrigendumsDateFile}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
