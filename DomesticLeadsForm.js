import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
} from "@mui/material";

import axios from "axios";

/* ------------------------------------------------------------------
   🔵 SAME EXACT STYLES FROM BUDGETARY FORM
------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------
   🔵 OPTIONS
------------------------------------------------------------------ */

const tenderTypeOptions = ["ST", "MT"];
const civilDefenceOptions = ["Civil", "Defence"];
const businessDomainOptions = ["IT", "Electronics", "Telecom", "Construction", "Other"];
const documentTypeOptions = ["RFP", "RFI", "RFE", "EoI", "BQ", "ST", "NIT", "RFQ"];
const resultStatusOptions = [
  "Won",
  "Lost",
  "Participated",
  "Participated-Won",
  "Participated-Pursuing",
  "Participated-Lost",
  "Not Participated",
];
const openClosedOptions = ["Open", "Closed"];
const presentStatusOptions = [
  "BQ Submitted",
  "Commercial Bid Submitted",
  "EOI was submitted",
  "Not participated",
  " ",
];

/* ==================================================================
   🔵 MAIN COMPONENT — DomesticLeadForm (THEMED)
================================================================== */
const DomesticLeadForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [value, setValue] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [ServerIp, SetServerIp] = useState("");

  const API = "/getDomesticLead";
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`/config.json`)
      .then((response) => {
        const url = response.data.project[0].ServerIP[0].NodeServerIP + API;
        SetServerIp(url);
        axios.get(url).then((res) => setOrderData(res.data));
      })
      .catch(() => SetServerIp("172.195.120.135"));
  }, []);

  /* react-hook-form settings */
  const {
    control,
    handleSubmit,
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

  /* ------------------------------------------------------------------
     🔵 SUBMIT HANDLER
  ------------------------------------------------------------------ */
  const onSubmit = (data) => {
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
      OperatorId: user?.id || "291536",
      OperatorName: user?.username || "Vivek Kumar Singh",
      OperatorRole: user?.userRole || "Lead Owner",
      OperatorSBU: "Software SBU",
    };

    axios
      .post(ServerIp, payload)
      .then(() => {
        setSubmittedData(payload);
        setSubmitSuccess(true);
      })
      .catch((err) => console.log(err.message));
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
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
          sx={{ fontWeight: 700, fontSize: "1rem" }}
        />
        <Tab
          label="View Data"
          sx={{ fontWeight: 700, fontSize: "1rem" }}
        />
      </Tabs>

      {/* ==================================================================
         🔵 CREATE DATA (FORM)
      ================================================================== */}
      {value === 0 && (
        <Paper sx={{ p: { xs: 2, sm: 4 }, backgroundColor: "#ffffff", mt: 2 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              color: "#1a4fbf",
              mb: 2,
            }}
          >
            Domestic Leads Form
          </Typography>

          <Box sx={{ height: "3px", width: "100%", backgroundColor: "#1a4fbf", mb: 4 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ==========================================================
               🔵 SECTION 1 — Basic Details
            ========================================================== */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  Tender Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  {[
                    ["tenderName", "Tender Name"],
                    ["tenderReferenceNo", "Tender Reference No"],
                    ["customerName", "Customer Name"],
                    ["customerAddress", "Customer Address"],
                  ].map(([fieldKey, label]) => (
                    <Grid item xs={12} md={4} key={fieldKey}>
                      <Controller
                        name={fieldKey}
                        control={control}
                        rules={{ required: `${label} is required` }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={label}
                            error={!!errors[fieldKey]}
                            helperText={errors[fieldKey]?.message}
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </Grid>
                  ))}

                  {/* Tender Type */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="tenderType"
                      control={control}
                      rules={{ required: "Tender Type is required" }}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth label="Tender Type" sx={textFieldStyle}>
                          {tenderTypeOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ==========================================================
               🔵 SECTION 2 — Classification (& Financial Details)
            ========================================================== */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  Classification & Financial Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  {/* Document Type */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="documentType"
                      control={control}
                      rules={{ required: "Document Type is required" }}
                      render={({ field }) => (
                        <TextField {...field} select label="Document Type" fullWidth sx={textFieldStyle}>
                          {documentTypeOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Lead Owner */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="leadOwner"
                      control={control}
                      rules={{ required: "Lead Owner is required" }}
                      render={({ field }) => (
                        <TextField {...field} label="Lead Owner" fullWidth sx={textFieldStyle} />
                      )}
                    />
                  </Grid>

                  {/* Civil / Defence */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="civilOrDefence"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select label="Civil / Defence" fullWidth sx={textFieldStyle}>
                          {civilDefenceOptions.map((c) => (
                            <MenuItem key={c} value={c}>
                              {c}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Business Domain */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="businessDomain"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth label="Business Domain" sx={textFieldStyle}>
                          {businessDomainOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ==========================================================
               🔵 SECTION 3 — Values
            ========================================================== */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  Financial Values
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  {[
                    ["valueOfEMD", "Value of EMD"],
                    ["estimatedValueInCrWithoutGST", "Estimated Value (Cr) Without GST"],
                    ["submittedValueInCrWithoutGST", "Submitted Value (Cr) Without GST"],
                  ].map(([fieldKey, label]) => (
                    <Grid item xs={12} md={4} key={fieldKey}>
                      <Controller
                        name={fieldKey}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} fullWidth label={label} sx={textFieldStyle} />
                        )}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* ==========================================================
               🔵 SECTION 4 — Dates Section
            ========================================================== */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  Submission Timeline
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  {[
                    ["tenderDated", "Tender Dated"],
                    ["lastDateOfSub", "Last Date of Submission"],
                  ].map(([fieldKey, label]) => (
                    <Grid item xs={12} md={4} key={fieldKey}>
                      <Controller
                        name={fieldKey}
                        control={control}
                        rules={{ required: `${label} is required` }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="date"
                            label={label}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={textFieldStyle}
                          />
                        )}
                      />
                    </Grid>
                  ))}

                  {/* Sole / Consortium */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="soleOrConsortium"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Sole / Consortium" fullWidth sx={textFieldStyle} />
                      )}
                    />
                  </Grid>

                  {/* Prebid Date */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="prebidMeetingDateTime"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="datetime-local"
                          label="Pre-Bid Meeting Date & Time"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ==========================================================
               🔵 SECTION 5 — Competitors Section
            ========================================================== */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  Competitors & Results
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  {/* Competitors Info */}
                  <Grid item xs={12} md={12}>
                    <Controller
                      name="competitorsInfo"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Competitors Info" sx={textFieldStyle} />
                      )}
                    />
                  </Grid>

                  {/* Result Status */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="wonLostParticipated"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth label="Result Status" sx={textFieldStyle}>
                          {resultStatusOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Open / Closed */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="openClosed"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth label="Open / Closed" sx={textFieldStyle}>
                          {openClosedOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* Order Won Value */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="orderWonValueInCrWithoutGST"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Order Won Value (Cr) Without GST"
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </Grid>

                  {/* Present Status */}
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="presentStatus"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth label="Present Status" sx={textFieldStyle}>
                          {presentStatusOptions.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ==========================================================
               🔵 SECTION 6 — Reason Section
            ========================================================== */}
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={sectionTitleStyle}>
                  Reason & Additional Info
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                  {/* Reason */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="reasonForLossingOpp"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Reason for Losing / Participating" sx={textFieldStyle} />
                      )}
                    />
                  </Grid>

                  {/* Corrigendum */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="corrigendumsDateFile"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Corrigendum Info" sx={textFieldStyle} />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ==================================================================
               🔵 BUTTONS
            ================================================================== */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 4 }}>
              <Button type="submit" variant="contained" size="large" sx={{ px: 5 }}>
                Submit
              </Button>

              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={handleReset}
                sx={{ px: 5 }}
              >
                Reset
              </Button>
            </Box>
          </form>

          {/* Snackbar */}
          <Snackbar open={submitSuccess} autoHideDuration={5000} onClose={() => setSubmitSuccess(false)}>
            <Alert severity="success">Form submitted successfully!</Alert>
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
                <pre style={{ margin: 0 }}>{JSON.stringify(submittedData, null, 2)}</pre>
              </Paper>
            </Box>
          )}
        </Paper>
      )}

      {/* ==================================================================
         🔵 VIEW DATA TABLE
      ================================================================== */}
      {value === 1 && orderData && (
        <ViewDomesticLeadsData ViewData={orderData} />
      )}
    </Container>
  );
};

/* ==================================================================
   🔵 TABLE COMPONENT — Themed like Budgetary View Table
================================================================== */
function ViewDomesticLeadsData({ ViewData }) {
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
        Domestic Leads Records
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2, width: "100%" }}>
        <Table sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              {[
                "Tender Name",
                "Tender Ref. No",
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
                "Pre-Bid Date & Time",
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
            {ViewData.data?.map((row) => (
              <TableRow key={row.id}>
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

export default DomesticLeadForm;
