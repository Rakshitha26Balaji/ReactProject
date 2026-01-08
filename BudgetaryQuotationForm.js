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
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Button,
  Grid,
  InputAdornment,
  Card,
  Container,
  CircularProgress,
  Checkbox,
  Menu,
  Link,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import {
  SearchRounded,
  NorthRounded,
  SouthRounded,
  RestartAltRounded,
  EditRounded,
  DeleteRounded,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import axios from "axios";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";

const BudgetaryQuotationForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [value, setValue] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [ServerIp, SetServerIp] = useState("");

  // Document Upload States
  const [browsefile, setbrowsefile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileData, setUploadFileData] = useState();

  const API = "/getBudgetaryQuotation";
  const UPLOAD_API = "/fileUpload";

  const API_ENDPOINT = "/getBudgetaryQuotation";
  let user = JSON.parse(localStorage.getItem("user"));
  // console.log(" user object ", user);

  // here, we apply the logic networking
  useEffect(() => {
    // ===== FOR TESTING - USE MOCK DATA =====
    // console.log("Loading mock data for testing...");
    // setOrderData(mockBudgetaryQuotationData);
    // SetServerIp("http://localhost:5000"); // For when API is ready
    // axios
    //   .get(ServerIp + API)
    //   .then((response) => {
    //     setOrderData(response.data);
    //   })
    //   .catch((error) => console.log(error.message));

    // ===== FOR PRODUCTION - UNCOMMENT BELOW & COMMENT ABOVE =====
    axios
      .get(`/config.json`)
      .then(function (response) {
        console.log(
          "we are looking for server IP : ",
          response.data.project[0].ServerIP[0].NodeServerIP
        );
        SetServerIp(response.data.project[0].ServerIP[0].NodeServerIP);
        axios
          .get(response.data.project[0].ServerIP[0].NodeServerIP + API)
          .then((response) => {
            console.log(" table data : ", response.data);
            setOrderData(response.data);
          })
          .catch((error) => console.log(error.message));
      })
      .catch(function (error) {
        SetServerIp("172.195.120.135");
      })
      .finally(function () {
        // always executed
      });
  }, []);

  // by default values of the form's field
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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

      fileName: "",
      filePath: "",
      hardDiskFileName: "",
    },
  });

  const defenceAndNonDefenceOptions = ["Defence", "Non-Defence", "Civil"];
  const statusOptions = [
    "Budgetary Quotation Submitted",
    "Commercial Bid Submitted",
    "EoI was Submitted",
    "Not Participated",
    " ",
  ];

  const onSubmit = (data) => {
    // here we are formatting data so that we can send to backend
    console.log("onSubmit data : ", data);
    console.log("onSubmit data : ");
    const formattedData = {
      bqTitle: data.bqTitle,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
      leadOwner: data.leadOwner,
      defenceAndNonDefence: data.defenceAndNonDefence,
      estimateValueInCrWithoutGST: parseFloat(
        parseFloat(data.estimateValueInCrWithoutGST).toFixed(2)
      ),
      submittedValueInCrWithoutGST: parseFloat(
        parseFloat(data.submittedValueInCrWithoutGST).toFixed(2)
      ),
      dateOfLetterSubmission: data.dateOfLetterSubmission,
      referenceNo: data.referenceNo,
      JSON_competitors: data.JSON_competitors,
      presentStatus: data.presentStatus,
      submittedAt: new Date().toISOString(),
      OperatorId: user.id || "291536",
      OperatorName: user.username || "Vivek Kumar Singh",
      OperatorRole: user.userRole || "Lead Owner",
      OperatorSBU: "Software SBU",

      fileName: uploadFileData?.fileName,
      filePath: uploadFileData?.filePath,
      hardDiskFileName: uploadFileData?.hardDiskFileName,
    };

    console.log("Frontend Form Data:", JSON.stringify(formattedData, null, 2));

    // HERE WE ARE CALLING THE API
    axios
      .post(ServerIp + API, formattedData)
      .then((response) => {
        console.log(response.data);
        setSubmittedData(formattedData);
        // TO SHOW THE USER
        setSubmitSuccess(true);
      })
      .catch((error) => console.log(error.message));
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
  };

  const handleCloseSnackbar = () => {
    setSubmitSuccess(false);
  };

  const handleDownloadJSON = () => {
    if (submittedData) {
      const dataStr = JSON.stringify(submittedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `budgetary-quotation-${
        submittedData.serialNumber
      }-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // ===== DOCUMENT UPLOAD HANDLERS =====
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setDocumentFile(file);
      setbrowsefile(file);
    } else {
      alert("Please Select pdf only");
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile && (user != null || user.id !== undefined)) {
      alert("Please select a document first");
      return;
    }

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      // formData.append("document", documentFile);

      const originalFileName = browsefile.name;
      const newFileName = user.id + "$" + originalFileName;

      const updatedFile = new File([browsefile], newFileName, {
        type: browsefile.type,
      });

      console.log("updated file by File class: ", updatedFile);

      formData.append("video", updatedFile);

      // This will use after upload..
      // let todayDate = dayjs();
      // todayDate = todayDate.format("DD-MM-YYYY hh:mm:ss a");

      fetch(ServerIp + UPLOAD_API, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((docResponse) => {
          console.log("file upload res : ", docResponse.data.filePath);
          // console.log(data);
          setUploadFileData({
            fileName: originalFileName,
            filePath: docResponse.data.filePath,
            hardDiskFileName: docResponse.data.fileName,
            createdDate: docResponse.data.dateTime,
          });
        })
        .catch((error) => {
          console.error(error);
          console.log("error of updated file of dialog of VBQ : ", error);
        });

      // Mock API call - In production, this would be your real upload endpoint
      // Simulating backend response with server-generated filename
      // const mockResponse = await new Promise((resolve) => {
      //   setTimeout(() => {
      //     const timestamp = Date.now();
      //     const fileExtension = documentFile.name.split(".").pop();
      //     const serverFilename = `BQ_DOC_${timestamp}.${fileExtension}`;
      //     const filePath = `/uploads/documents/${serverFilename}`;

      //     resolve({
      //       success: true,
      //       filename: serverFilename,
      //       originalName: documentFile.name,
      //       filePath: filePath,
      //       uploadedAt: new Date().toISOString(),
      //     });
      //   }, 1500); // Simulate network delay
      // });

      // up

      // if (mockResponse.success) {
      //   setUploadedDocument({
      //     filename: mockResponse.filename,
      //     originalName: mockResponse.originalName,
      //     filePath: mockResponse.filePath,
      //     uploadedAt: mockResponse.uploadedAt,
      //   });
      //   alert(`✅ Document uploaded successfully!\nFilename: ${mockResponse.filename}`);
      //   setDocumentFile(null); // Clear selected file
      // }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("❌ Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearDocument = () => {
    setDocumentFile(null);
    setUploadedDocument(null);
    // Clear file input
    const fileInput = document.getElementById("document-input");
    if (fileInput) fileInput.value = "";
  };
  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: -7,
        py: 1,
        minHeight: "83vh",
        background: "linear-gradient(135deg, #e3eeff 0%, #f8fbff 100%)",
        borderRadius: 1,
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          background: "linear-gradient(45deg, #0d47a1, #42a5f5, #1e88e5)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          // boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          // borderBottom: 2
        }}
      >
        Budgetary Quotation
      </Typography>
      {/* <Divider  flexItem sx={{ backgroundColor: '#A9D6E5', height: '4px', mt: 4}}/> */}

      <Divider
        flexItem
        sx={{
          background: "linear-gradient(135deg, #0d47a1 , #42a5f5, #1e88e5)",
          height: "4px",
          mt: 3,
        }}
      />
      {/* ------------------------ TABS ------------------------ */}
      <Tabs
        value={value}
        onChange={(e, v) => setValue(v)}
        centered
        sx={{
          md: 4,
          mb: 4,
          "& .MuiTab-root": {
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "none",
            px: 4,
          },
          "& .Mui-selected": {
            color: "#0d47a1 !important",
          },
          "& .MuiTabs-indicator": {
            height: 4,
            borderRadius: 2,
            background: "linear-gradient(90deg, #0d47a1, #42a5f5, #1e88e5)",
          },
        }}
      >
        <Tab
          icon={<AddCircleOutlineRoundedIcon />}
          iconPosition="start"
          label="Create Data"
        />
        <Tab
          icon={<VisibilityOutlinedIcon />}
          iconPosition="start"
          label="View Data"
        />
        <Tab
          icon={<CloudUploadOutlinedIcon />}
          iconPosition="start"
          label="Bulk Upload"
        />
      </Tabs>

      {/* ------------------------ CREATE FORM ------------------------ */}
      {value === 0 && (
        <Container maxWidth="lg">
          <Paper
            elevation={10}
            sx={{
              mt: -2,
              p: { xs: 2, md: 5 },
              borderRadius: 5,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(14px)",
              // transition: "0.3s",
              boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
              // "&:hover": { transform: "scale(1.01)" },
            }}
          >
            {/* ------------------- FORM START ------------------- */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* ---------------- SECTION: BQ DETAILS ---------------- */}
              <Card
                sx={{
                  mt: -5,
                  mb: 3,
                  p: 3,
                  borderRadius: 4,
                  background: "rgba(250,250,255,0.8)",
                  backdropFilter: "blur(10px)",
                  transition: "0.3s",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  // "&:hover": {
                  //   transform: "translateY(-4px)",
                  //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                  // },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                >
                  📋 BQ Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* bqTitle */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="bqTitle"
                      control={control}
                      rules={{ required: "BQ Title is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="BQ Title"
                          fullWidth
                          required
                          error={!!errors.bqTitle}
                          helperText={errors.bqTitle?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                              "&.Mui-focused": {
                                boxShadow: "0 0 15px #90caf9",
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* customerName */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="customerName"
                      control={control}
                      rules={{ required: "Customer Name is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Customer Name"
                          fullWidth
                          required
                          error={!!errors.customerName}
                          helperText={errors.customerName?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                              "&.Mui-focused": {
                                boxShadow: "0 0 15px #90caf9",
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* customerAddress */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="customerAddress"
                      control={control}
                      rules={{ required: "Customer Address is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Customer Address"
                          fullWidth
                          required
                          error={!!errors.customerAddress}
                          helperText={errors.customerAddress?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                              "&.Mui-focused": {
                                boxShadow: "0 0 15px #90caf9",
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* leadOwner */}
                  <Grid item xs={12} sm={6}>
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                              "&.Mui-focused": {
                                boxShadow: "0 0 15px #90caf9",
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* ---------------- SECTION: FINANCIAL ---------------- */}
              <Card
                sx={{
                  mt: -1,
                  mb: 3,
                  p: 3,
                  borderRadius: 4,
                  background: "rgba(250,250,255,0.8)",
                  backdropFilter: "blur(10px)",
                  // transition: "0.3s",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  // "&:hover": {
                  //   transform: "translateY(-4px)",
                  //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                  // },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                >
                  💰 Classification & Financial Info
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* defenceAndNonDefence */}
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="defenceAndNonDefence"
                      control={control}
                      rules={{ required: "Classification required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Defence / Non-Defence"
                          fullWidth
                          required
                          error={!!errors.defenceAndNonDefence}
                          helperText={errors.defenceAndNonDefence?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              minWidth: 220,
                            },
                          }}
                        >
                          {defenceAndNonDefenceOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* estimateValueInCrWithoutGST */}
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="estimateValueInCrWithoutGST"
                      control={control}
                      rules={{
                        required: "Value required",
                        pattern: {
                          value: /^[0-9]+(\.[0-9]{1,2})?$/,
                          message: "Invalid number",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Value Without GST"
                          fullWidth
                          type="number"
                          InputProps={{
                            startAdornment: (
                              <Typography sx={{ mr: 1 }}>₹</Typography>
                            ),
                          }}
                          required
                          error={!!errors.estimateValueInCrWithoutGST}
                          helperText={
                            errors.estimateValueInCrWithoutGST?.message
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* submittedValueInCrWithoutGST */}
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="submittedValueInCrWithoutGST"
                      control={control}
                      rules={{
                        required: "Value required",
                        pattern: {
                          value: /^[0-9]+(\.[0-9]{1,2})?$/,
                          message: "Invalid number",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Value With GST"
                          fullWidth
                          type="number"
                          InputProps={{
                            startAdornment: (
                              <Typography sx={{ mr: 1 }}>₹</Typography>
                            ),
                          }}
                          required
                          error={!!errors.submittedValueInCrWithoutGST}
                          helperText={
                            errors.submittedValueInCrWithoutGST?.message
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* ---------------- SECTION: ADDITIONAL ---------------- */}
              <Card
                sx={{
                  mt: -1,
                  mb: 3,
                  p: 3,
                  borderRadius: 4,
                  background: "rgba(250,250,255,0.8)",
                  backdropFilter: "blur(10px)",
                  transition: "0.3s",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  // "&:hover": {
                  //   transform: "translateY(-4px)",
                  //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                  // },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                >
                  📝 Additional Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* referenceNo */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="referenceNo"
                      control={control}
                      rules={{ required: "Reference Number required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Reference Number"
                          fullWidth
                          required
                          error={!!errors.referenceNo}
                          helperText={errors.referenceNo?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* dateOfLetterSubmission */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="dateOfLetterSubmission"
                      control={control}
                      rules={{ required: "Date required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="Letter Submission Date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          required
                          inputProps={{
                            max: new Date().toISOString().split("T")[0], // ⬅️ TODAY
                          }}
                          error={!!errors.dateOfLetterSubmission}
                          helperText={errors.dateOfLetterSubmission?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* presentStatus */}
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="presentStatus"
                      control={control}
                      rules={{ required: "Status required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Present Status"
                          fullWidth
                          required
                          error={!!errors.presentStatus}
                          helperText={errors.presentStatus?.message}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              minWidth: 320,
                            },
                          }}
                        >
                          {statusOptions.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* competitors */}
                  <Grid item xs={12} sm={8}>
                    <Controller
                      name="JSON_competitors"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Competitors (Optional)"
                          placeholder="Company A, Company B..."
                          fullWidth
                          multiline
                          rows={1}
                          helperText="Separate competitors with commas"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* ===== DOCUMENT UPLOAD SECTION (COMPACT) ===== */}

              <Card
                sx={{
                  mt: -1,
                  mb: 3,
                  p: 3,
                  borderRadius: 4,
                  background: "rgba(250,250,255,0.8)",
                  backdropFilter: "blur(10px)",
                  transition: "0.3s",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(13, 71, 161, 0.1)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                >
                  📎 Document/Attachment Upload
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4} sx={{ mt: -1, mb: 3 }}>
                  {/* file select */}
                  <Grid item xs={12} sm={6} md={6}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <input
                        id="document-input"
                        type="file"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.txt"
                      />
                      <label
                        htmlFor="document-input"
                        style={{
                          flex: 1,
                          marginBottom: 0,
                        }}
                      >
                        <Button
                          component="span"
                          variant="contained"
                          size="large"
                          startIcon={<CloudUploadOutlinedIcon />}
                          // sx={{
                          //   borderRadius: 999,
                          //   px: 4,
                          //   py: 1.2,
                          //   fontWeight: 700,
                          //   fontSize: 14,
                          //   textTransform: "none",
                          //   color: "#ffffff",

                          //   background:
                          //     "linear-gradient(135deg, #42a5f5 0%, #2563eb 50%, #1e40af 100%)",
                          //   boxShadow: "0 8px 22px rgba(37,99,235,0.35)",

                          //   transition: "all 0.25s ease",

                          //   "&:hover": {
                          //     background:
                          //       "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)",
                          //     boxShadow: "0 14px 32px rgba(37,99,235,0.45)",
                          //     transform: "translateY(-2px) scale(1.03)",
                          //   },

                          sx={{
                            // px: 8,
                            // py: 1,
                            fontSize: "1 rem",
                            borderRadius: 3,
                            fontWeight: 700,
                            minWidth: 180,
                            background:
                              "linear-gradient(135deg, #1565c0, #42a5f5)",
                            textTransform: "none",
                            transition: "0.3s",
                            "&:hover": {
                              transform: "scale(1.05)",
                              background:
                                "linear-gradient(135deg, #0d47a1, #1e88e5)",
                              boxShadow: "0 4px 12px rgba(13, 71, 161, 0.3)",
                            },
                          }}

                          // sx={{
                          //   background:
                          //     "linear-gradient(135deg, #1565c0, #42a5f5)",
                          //   color: "#ffffff",
                          //   fontWeight: 600,
                          //   textTransform: "none",
                          //   borderRadius: 2,
                          //   width: "100%",
                          //   py: 1,
                          //   transition: "0.3s",
                          //   "&:hover": {
                          //     transform: "translateY(-2px)",
                          //     background:
                          //       "linear-gradient(135deg, #0d47a1, #1e88e5)",
                          //     boxShadow: "0 4px 12px rgba(13, 71, 161, 0.3)",
                          //   },
                          // }}
                        >
                          Select Files
                        </Button>
                      </label>

                      <Button
                        onClick={handleUploadDocument}
                        disabled={!documentFile || isUploading}
                        variant="contained"
                        size="small"
                        sx={{
                          background:
                            documentFile && !isUploading
                              ? "linear-gradient(135deg, #2e7d32, #4caf50)"
                              : "#bdbdbd",
                          color: "#ffffff",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,
                          py: 1.2,
                          px: 2.5,
                          minWidth: "110px",
                          transition: "0.3s",
                          "&:hover:not(:disabled)": {
                            transform: "translateY(-2px)",
                            background:
                              "linear-gradient(135deg, #1b5e20, #388e3c)",
                            boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                          },
                        }}
                      >
                        {isUploading ? "..." : "Upload"}
                      </Button>

                      {(documentFile || uploadedDocument) && (
                        <Tooltip title="Clear selection">
                          <IconButton
                            onClick={handleClearDocument}
                            disabled={isUploading}
                            size="small"
                            sx={{
                              color: "#ef5350",
                              transition: "0.3s",
                              "&:hover": {
                                backgroundColor: "rgba(239, 83, 80, 0.1)",
                                color: "#c62828",
                              },
                            }}
                          >
                            <CloseRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        // <Button
                        //   onClick={handleClearDocument}
                        //   disabled={isUploading}
                        //   variant="outlined"
                        //   startIcon={<CloseRounded />}
                        //   sx={{
                        //     borderColor: "#ef5350",
                        //     color: "#ef5350",
                        //     fontWeight: 700,
                        //     textTransform: "none",
                        //     borderRadius: 2.5,
                        //     px: 3,
                        //     py: 1.2,
                        //     transition: "0.3s",
                        //     "&:hover": {
                        //       borderColor: "#c62828",
                        //       color: "#c62828",
                        //       backgroundColor: "rgba(239, 83, 80, 0.05)",
                        //     },
                        //   }}
                        // >
                        //   Clear
                        // </Button>
                      )}
                    </Box>
                  </Grid>

                  {/* File Status Display */}
                  <Grid item xs={12} sm={6} md={6} alignItems={"flex-end"}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 4,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {documentFile && !uploadedDocument && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 2,
                            py: 1,
                            backgroundColor: "rgba(25, 118, 210, 0.08)",
                            borderRadius: 2,
                            border: "1px solid #42a5f5",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: "#1565c0",
                              fontSize: "0.85rem",
                            }}
                          >
                            📄 {documentFile.name.substring(0, 25)}
                            {documentFile.name.length > 25 ? "..." : ""}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b", fontSize: "0.75rem" }}
                          >
                            ({(documentFile.size / 1024).toFixed(1)} KB)
                          </Typography>
                        </Box>
                      )}

                      {uploadedDocument && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 2,
                            py: 1,
                            backgroundColor: "rgba(76, 175, 80, 0.12)",
                            borderRadius: 2,
                            border: "1px solid #4caf50",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: "#2e7d32",
                              fontSize: "0.85rem",
                            }}
                          >
                            ✅ {uploadedDocument.originalName.substring(0, 25)}
                            {uploadedDocument.originalName.length > 25
                              ? "..."
                              : ""}
                          </Typography>
                        </Box>
                      )}

                      {/* {!documentFile && !uploadedDocument && ( */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748b",
                          fontSize: "0.85rem",
                          fontStyle: "italic",
                          mt: 3,
                        }}
                      >
                        (Max 10MB)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              {/* FORM ACTION BUTTONS */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  mt: 4,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    px: 6,
                    py: 1.6,
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    fontWeight: 700,
                    maxWidth: 180,
                    background: "linear-gradient(90deg, #1565c0, #42a5f5)",
                    textTransform: "none",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      background: "linear-gradient(90deg, #0d47a1, #1e88e5)",
                    },
                  }}
                >
                  Submit
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleReset}
                  sx={{
                    px: 6,
                    py: 1.6,
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    fontWeight: 700,
                    maxWidth: 180,
                    borderWidth: 2,
                    textTransform: "none",
                    "&:hover": {
                      transform: "scale(1.03)",
                      background: "#f4f6fb",
                    },
                  }}
                >
                  Reset
                </Button>
              </Box>
            </form>

            {/* ---------------- SUCCESS SNACKBAR ---------------- */}
            <Snackbar
              open={submitSuccess}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert severity="success" sx={{ fontSize: "1rem" }}>
                🎉 BQ submitted successfully!
              </Alert>
            </Snackbar>

            {/* ---------------- JSON OUTPUT ---------------- */}
            {submittedData && (
              <Box sx={{ mt: 5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  📊 Submitted Data (JSON)
                </Typography>

                <Paper
                  sx={{
                    p: 3,
                    background: "#0d1117",
                    color: "#c9d1d9",
                    borderRadius: 4,
                    maxHeight: 500,
                    overflow: "auto",
                    fontFamily: "monospace",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <pre>{JSON.stringify(submittedData, null, 2)}</pre>
                </Paper>

                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    background: "#2e7d32",
                    "&:hover": { background: "#1b5e20" },
                  }}
                  onClick={handleDownloadJSON}
                >
                  Download JSON
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      )}

      {/* ------------------------ VIEW DATA ------------------------ */}
      {value === 1 && orderData && (
        <ViewBudgetaryQuotationData
          ViewData={orderData}
          ServerIp={ServerIp}
          onDataUpdate={(updatedData) => setOrderData({ data: updatedData })}
        />
      )}

      {/* ------------------------ BULK UPLOAD ------------------------ */}
      {value === 2 && (
        <ExcelUploadAndValidate user={user} ServerIp={ServerIp} />
      )}
    </Container>
  );
};

const lightReadOnlyFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    backgroundColor: "#f1f5ff",
    color: "#0f172a",
    "& fieldset": {
      borderColor: "#bfdbfe",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#1e3a8a",
    fontWeight: 600,
  },
  "& input": {
    cursor: "default",
  },
};

const lightTextFieldSx = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    "& fieldset": {
      borderColor: "#93c5fd",
    },
    "&:hover fieldset": {
      borderColor: "#3b82f6",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
      boxShadow: "0 0 0 3px rgba(59,130,246,0.2)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#1e3a8a",
    fontWeight: 600,
  },
};

//---------------TABLE---------------

function ViewBudgetaryQuotationData(props) {
  console.log("props viewBudgetaryQuotationData", props);

  // Extract ServerIp from props
  const ServerIp = props.ServerIp || "";

  // Store data in local state for updates
  const [tableData, setTableData] = useState(props.ViewData.data || []);

  // Sync with parent data when it changes
  useEffect(() => {
    if (props.ViewData.data) {
      setTableData(props.ViewData.data);
    }
  }, [props.ViewData.data]);

  //States for search
  const [searchTerm, setSearchTerm] = useState("");
  const [defenceFilter, setDefenceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateCreated");
  const [sortDirection, setSortDirection] = useState("desc");

  // for Dialog
  const [selectedRow, setSelectedRow] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [idDeleteOpen, setIdDeleteOpen] = useState(null);

  const [tempEditingRow, setTempEditingRow] = useState(null);
  const [dialogOpenedFrom, setDialogOpenedFrom] = useState("rowClick"); // "rowClick" or "editIcon"

  // Document Upload States
  const [documentFile, setDocumentFile] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [uploadFileData, setUploadFileData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // COLUMN SELECTION STATE
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const columnMenuOpen = Boolean(columnMenuAnchor);
  let user = JSON.parse(localStorage.getItem("user"));

  const leadColumns = [
    { id: "bqTitle", label: "BQ Title" },
    { id: "customerName", label: "Customer Name" },
    { id: "customerAddress", label: "Customer Address" },
    { id: "leadOwner", label: "Lead Owner" },
    { id: "defenceAndNonDefence", label: "Defence / Non Defence" },
    { id: "estimateValueInCrWithoutGST", label: "Estimate (CR, w/o GST)" },
    { id: "submittedValueInCrWithoutGST", label: "Submitted (CR, w/o GST)" },
    { id: "dateOfLetterSubmission", label: "Letter Submission Date" },
    { id: "referenceNo", label: "Reference No" },
    { id: "competitors", label: "Competitors" },
    { id: "remarks", label: "Remarks" },
    { id: "presentStatus", label: "Present Status" },
    { id: "dateCreated", label: "Created Date" },
    { id: "document", label: "Document" },
  ];

  const [visibleColumns, setVisibleColumns] = useState(
    leadColumns.reduce((acc, col) => {
      acc[col.id] = true;
      return acc;
    }, {})
  );

  const STATUS_OPTIONS = [
    "Draft",
    "Submitted",
    "In Progress",
    "Under Review",
    "Won",
    "Lost",
    "On Hold",
  ];

  const TENDER_TYPE_OPTIONS = ["ST", "MT", "Nom", "LT"];

  // ---------------- HANDLERS ----------------
  //--------------------SEARCH----------------------
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Defence Filter
  const handleDefenceFilterChange = (e) => {
    setDefenceFilter(e.target.value);
  };

  // Status Filter
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Sort By
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };

  //---------------COLUMN SELECTION HANDLERS-------------------
  const handleColumnMenuOpen = (event) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  const handleColumnToggle = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Toggle ASC / DESC
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setDefenceFilter("all");
    setStatusFilter("all");
    setSortBy("select");
    setSortDirection("desc");
  };

  // DOWNLOAD ALL DATA AS EXCEL
  // const handleDownloadAllData = () => {
  //   console.log(" data for download : ", data);
  //   if (!data || data.length === 0) {
  //     alert("No data available to download");
  //     return;
  //   }

  //   const worksheet = XLSX.utils.json_to_sheet(data);

  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Lead_Submitted");

  //   XLSX.writeFile(
  //     workbook,
  //     `Lead_Submitted_Data_${new Date().toISOString().slice(0, 10)}.xlsx`
  //   );
  // };

  // Row Selection
  const handleRowSelect = (row) => {
    setSelectedRow(row);
  };

  // OPEN DIALOG FROM ROW CLICK (VIEW MODE ONLY)
  const handleRowClick = (row) => {
    setTempEditingRow({ ...row }); // Store original data
    setEditingRow({ ...row }); // Set for viewing
    setIsEditMode(false); // Start in VIEW mode
    setDialogOpenedFrom("rowClick"); // Mark as opened from row click
    setEditDialogOpen(true);
  };

  // OPEN DIALOG FROM EDIT ICON (READY TO EDIT) it will be hitted by edit btn of action column
  const handleEditClick = (row) => {
    setTempEditingRow({ ...row }); // Store original data
    setEditingRow({ ...row }); // Set for editing
    setIsEditMode(false); // Start in VIEW mode but with edit option
    setDialogOpenedFrom("editIcon"); // Mark as opened from edit icon
    setEditDialogOpen(true);
  };

  // UPDATE FIELD WHILE EDITING
  const handleEditFieldChange = (field, value) => {
    setEditingRow((prev) => ({ ...prev, [field]: value }));
  };

  // CANCEL / CLOSE DIALOG
  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingRow(null);
    setTempEditingRow(null);
    setIsEditMode(false);
    setDialogOpenedFrom("rowClick");
  };

  // CANCEL EDIT MODE
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingRow({ ...tempEditingRow }); // Reset to original data
  };

  // ENTER EDIT MODE
  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  // SAVE EDITED VALUES - SHOW CONFIRMATION DIALOG
  const handleEditSave = () => {
    console.log("Saving updated row:", editingRow);
    setEditingRow((prev) => ({
      ...prev,
      FileName: uploadFileData.fileName,
      FilePath: uploadFileData.filePath,
      HardDiskFileName: uploadFileData.hardDiskFileName,
    }));
    setConfirmSaveOpen(true); // Open confirmation dialog
  };

  // Delete VALUES - SHOW CONFIRMATION DIALOG
  const handleDeleteClick = (id) => {
    console.log("Saving updated editingRow:", editingRow);
    setIdDeleteOpen(id);
    setConfirmDeleteOpen(true); // Open confirmation dialog
  };

  // CONFIRM AND SAVE TO BACKEND
  const handleConfirmSave = async () => {
    try {
      console.log("Confirmed - Updating row:", editingRow);

      // SETTING DOCUMENT INFOMATION FOR UPDATE
      console.log(
        " file details clicked by handleConfirmSave : ",
        uploadFileData
      );
      // Call real update API
      const updatePayload = {
        id: editingRow.id, // Include ID for update
        ...editingRow, // Rest of data to edit
      };
      console.log(" updatedPayload by handleConfirmSave : ", updatePayload);
      // Replace with your actual API endpoint
      // const API_ENDPOINT = `/getBudgetaryQuotation/${updatePayload?.id}`;

      const response = await axios.put(
        `${ServerIp}/getBudgetaryQuotation`,
        updatePayload
      );

      if (response.data.success || response.status === 200) {
        console.log("Backend Response:", response.data);

        // Update the local table data with the new values
        const updatedTableData = tableData.map((row) =>
          row.id === editingRow.id ? editingRow : row
        );
        setTableData(updatedTableData);

        // Notify parent component about update if callback provided
        if (props.onDataUpdate) {
          props.onDataUpdate(updatedTableData);
        }

        // Show success notification
        alert("✅ Changes saved successfully!");
        setConfirmSaveOpen(false);
        setEditDialogOpen(false);
        setIsEditMode(false);
        setEditingRow(null);
        setTempEditingRow(null);
        setDocumentFile(null); // Clear selected file from frontend
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("❌ Failed to save changes. Please try again.");
    }
  };

  // DELETE ROW
  const handleDeleteRow = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this entry?")) return;

    console.log("Deleting row with ID:", id);
    const deleteData = {
      id: id,
    };

    // TODO: delete logic here
    try {
      await axios.delete(`${ServerIp}/getBudgetaryQuotation`, {
        data: deleteData, // Send the data in the request body
        headers: {
          "Content-Type": "application/json", // VERY IMPORTANT: Set the Content-Type
        },
      });
      // Show success notification
      setTableData(
        tableData.filter((item) => item.id !== id) // Create a new array excluding the item with the given id
      );
      setConfirmDeleteOpen(false);
      alert("✅ Deleted successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("❌ Failed to Delete. Please try again.");
    }
  };

  // DOWNLOAD DOCUMENT PREVIEW
  const handleDownloadFile = async (fileName, hardDiskFileName) => {
    // let serverDocPath = (filePath + "\\" + hardDiskFileName);
    console.log(" this hardiskFileName ", hardDiskFileName);

    axios
      .get(`${ServerIp}/getBudgetaryQuotation/downloadFile`, {
        responseType: "blob",
        params: {
          hardDiskFileName: JSON.parse(hardDiskFileName),
        },
      })
      .then((response) => {
        console.log(response.data);
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        // Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(pdfBlob);
        // Create a temporary <a> element to trigger the download
        // const tempLink = document.createElement("a");
        // tempLink.href = url;
        // tempLink.setAttribute("download", `bill_${User_Id}_${date}.pdf`); // Set the desired filename for the downloaded file
        // Append the <a> element to the body and click it to trigger the downl
        // document.body.appendChild(tempLink);
        // tempLink.click();
        // tempLink.remove();
        // Clean up the temporary elements and URL
        // document.body.removeChild(tempLink);
        // window.URL.revokeObjectURL(url);
        window.open(url, "_blank");
      })
      // .then((blob) => {
      //   const url = window.URL.createObjectURL(blob);
      //   const a = document.createElement("a");
      //   a.href = url;
      //   a.download = fileName; // specify the filename here
      //   document.body.appendChild(a);
      //   a.click();
      //   a.remove();
      //   window.URL.revokeObjectURL(url);
      // })
      .catch((error) => {
        console.error(error);
      });
  };

  // OPEN DOCUMENT PREVIEW
  const handleDocumentClick = (fileName, hardDiskFileName) => {
    if (!hardDiskFileName) {
      alert("No document available for this record");
      return;
    }

    // custom logic
    handleDownloadFile(fileName, hardDiskFileName);

    // Open document in new window/tab
    // In production, this would open the actual file from your document server
    // window.open(filePath, "_blank");
    console.log(`Opening document: ${fileName}`);
  };

  // DIALOG DOCUMENT UPLOAD HANDLER
  const handleDialogFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  // DIALOG DOCUMENT UPLOAD
  const handleDialogUploadDocument = async () => {
    if (!documentFile && (user != null || user.id !== undefined)) {
      alert("Please select a document first");
      return;
    }
    // console.log(" update file of dialog of VBQ is calling  : ")

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      console.log(" documentFile details of dialog of VBQ : ", documentFile);

      const originalFileName = documentFile.name;
      const newFileName = user.id + "$" + originalFileName;

      const updatedFile = new File([documentFile], newFileName, {
        type: documentFile.type,
      });

      formData.append("video", updatedFile);
      console.log(" updated file of dialog of VBQ : ", updatedFile);

      // This will use after upload..
      console.log(" updated file of dialog of VBQ : ", updatedFile);
      fetch(ServerIp + "/fileUpload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((docResponse) => {
          // console.log("res :8081/pdfupload", docResponse);
          // console.log(newFileName);
          console.log("Response of the upload the doc : ", docResponse.data);
          setUploadFileData({
            fileName: originalFileName,
            filePath: docResponse.data.filePath,
            hardDiskFileName: docResponse.data.fileName,
            createdDate: docResponse.data.dateTime,
          });
        })
        .catch((error) => {
          console.error(error);
          console.log("error of updated file of dialog of VBQ : ", error);
        });

      // Mock API call - In production, this would be your real upload endpoint
      // Simulating backend response with server-generated filename
      // const mockResponse = await new Promise((resolve) => {
      //   setTimeout(() => {
      //     const timestamp = Date.now();
      //     const fileExtension = documentFile.name.split(".").pop();
      //     const serverFilename = `BQ_DOC_${timestamp}.${fileExtension}`;
      //     const filePath = `/uploads/documents/${serverFilename}`;

      //     resolve({
      //       success: true,
      //       filename: serverFilename,
      //       originalName: documentFile.name,
      //       filePath: filePath,
      //       uploadedAt: new Date().toISOString(),
      //     });
      //   }, 1500); // Simulate network delay
      // });

      // up

      // if (mockResponse.success) {
      //   setUploadedDocument({
      //     filename: mockResponse.filename,
      //     originalName: mockResponse.originalName,
      //     filePath: mockResponse.filePath,
      //     uploadedAt: mockResponse.uploadedAt,
      //   });
      //   alert(`✅ Document uploaded successfully!\nFilename: ${mockResponse.filename}`);
      //   setDocumentFile(null); // Clear selected file
      // }
      alert(
        `✅ Document uploaded successfully!\nFilename: ${documentFile.filename}`
      );
      // setDocumentFile(null); // Clear selected file
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("❌ Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // DIALOG DOCUMENT CLEAR
  const handleDialogClearDocument = () => {
    setDocumentFile(null);
    setUploadedDocument(null);
    handleEditFieldChange("document", null);
  };

  // DOUBLE CLICK → OPEN READ-ONLY VIEW
  // const handleRowDoubleClick = (row) => {
  //   setViewRow(row);
  //   setViewDialogOpen(true);
  // };

  // ===== TABLE STYLES =====
  const headerCellStyle = {
    fontWeight: 800,
    fontSize: 13,
    color: "#ecfeff",
    background: "linear-gradient(90deg, #001F54, #034078)",
    // "linear-gradient(90deg, #0a47e0ff 0%, #1453b7ff 50%, #81a6daff 100%)",
    borderBottom: "none",
    whiteSpace: "nowrap",
  };

  const bodyCellStyle = {
    fontSize: 13,
    color: "#111827",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  };

  const ellipsisCell = {
    ...bodyCellStyle,
    maxWidth: 180,
  };

  const actionHeaderStyle = {
    ...headerCellStyle,
    textAlign: "center",
    minWidth: 140,
  };

  return (
    <>
      {/* =========================================================
   HEADER + CONTROLS CONTAINER
   ========================================================= */}
      <Box sx={{ mb: 3, px: { xs: 1, sm: 0 } }}>
        <Box
          sx={{
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            background: `
        linear-gradient(
          135deg,
          #EAF6FD 0%,
          #CFE9F7 5%,
          #B6DFF5 45%, 
          #9CCEF0 100%,
          #6FAFD8 60%
        )
      `,
            border: "1px solid rgba(111,182,232,0.5)",
            boxShadow:
              "0 16px 40px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,0.85)",
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.35), transparent 55%)",
              pointerEvents: "none",
            },
          }}
        >
          {/* =====================================================
       TOP ROW : TITLE + SEARCH + COLUMN TOGGLE
       ===================================================== */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              zIndex: 1,
            }}
          >
            {/* -------------------------------
          PAGE TITLE
         ------------------------------- */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 0.6,
                  color: "#0F172A",
                }}
              >
                Budgetary Quotation Data View
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#1E3A5F",
                  mt: 0.6,
                  maxWidth: 520,
                  fontWeight: 500,
                }}
              >
                Advanced dashboard for managing and analysing quotation data
              </Typography>
            </Box>

            {/* -------------------------------
          SEARCH + COLUMN VISIBILITY
         ------------------------------- */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {/* SEARCH FIELD */}
              <TextField
                size="small"
                placeholder="Search title, customer, lead owner..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: "#2563EB" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: { xs: "100%", sm: 290 },
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: 14,
                    fontWeight: 500,
                    "& fieldset": {
                      borderColor: "#6FB6E8",
                    },
                    "&:hover fieldset": {
                      borderColor: "#3B82F6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563EB",
                      borderWidth: 2,
                      boxShadow: "0 0 0 3px rgba(37,99,235,0.25)",
                    },
                  },
                }}
              />

              {/* COLUMN TOGGLE */}
              <Tooltip title="Show / Hide Columns">
                <IconButton
                  onClick={handleColumnMenuOpen}
                  sx={{
                    height: 44,
                    width: 44,
                    borderRadius: 2,
                    background: "linear-gradient(145deg, #6FB6E8, #3B82F6)",
                    color: "#ffffff",
                    // boxShadow: "0 8px 20px rgba(37,99,235,0.45)",
                    transition: "0.25s ease",
                    "&:hover": {
                      transform: "translateY(-2px) scale(1.05)",
                      // boxShadow: "0 12px 28px rgba(37,99,235,0.6)",
                    },
                  }}
                >
                  <ViewColumnIcon />
                </IconButton>
              </Tooltip>

              {/* COLUMN MENU */}
              <Menu
                anchorEl={columnMenuAnchor}
                open={columnMenuOpen}
                onClose={handleColumnMenuClose}
                PaperProps={{
                  sx: {
                    minWidth: 280,
                    maxHeight: 400,
                    borderRadius: 2,
                    boxShadow: "0 16px 36px rgba(0,0,0,0.25)",
                  },
                }}
              >
                {leadColumns.map((col) => (
                  <MenuItem
                    key={col.id}
                    onClick={() => handleColumnToggle(col.id)}
                    sx={{ display: "flex", gap: 1 }}
                  >
                    <Checkbox
                      checked={visibleColumns[col.id]}
                      size="small"
                      sx={{
                        color: "#3B82F6",
                        "&.Mui-checked": { color: "#2563EB" },
                      }}
                    />
                    {col.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>

          {/* =====================================================
       FILTERS + SORTING CONTROLS
       ===================================================== */}
          <Box
            sx={{
              position: "relative",
              mt: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
              zIndex: 1,
            }}
          >
            {/* FILTER FIELDS */}
            {[
              {
                label: "Defence / Non Defence",
                value: defenceFilter,
                onChange: handleDefenceFilterChange,
                width: 190,
                children: (
                  <>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Defence">Defence</MenuItem>
                    <MenuItem value="Civil">Civil</MenuItem>
                  </>
                ),
              },
              {
                label: "Present Status",
                value: statusFilter,
                onChange: handleStatusFilterChange,
                width: 220,
                children: (
                  <>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Budgetary Quotation Submitted">
                      Budgetary Quotation Submitted
                    </MenuItem>
                    <MenuItem value="Commercial Bid Submitted">
                      Commercial Bid Submitted
                    </MenuItem>
                  </>
                ),
              },
              {
                label: "Sort by",
                value: sortBy,
                onChange: handleSortByChange,
                width: 210,
                children: (
                  <>
                    <MenuItem value="select">Select</MenuItem>
                    <MenuItem value="dateOfLetterSubmission">
                      Letter Submission Date
                    </MenuItem>
                    <MenuItem value="estimateValueInCrWithoutGST">
                      Estimate Value
                    </MenuItem>
                    <MenuItem value="submittedValueInCrWithoutGST">
                      Submitted Value
                    </MenuItem>
                  </>
                ),
              },
            ].map((field, i) => (
              <TextField
                key={i}
                select
                size="small"
                label={field.label}
                value={field.value}
                onChange={field.onChange}
                sx={{
                  minWidth: field.width,
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "#9CCEF0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#3B82F6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563EB",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#1E3A5F",
                    fontWeight: 500,
                  },
                }}
              >
                {field.children}
              </TextField>
            ))}

            {/* SORT DIRECTION */}
            <IconButton
              onClick={toggleSortDirection}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(145deg, #93C5FD, #60A5FA)",
                color: "#0F172A",
                // boxShadow: "0 6px 16px rgba(59,130,246,0.35)",
                "&:hover": {
                  transform: "scale(1.08)",
                },
              }}
            >
              {sortDirection === "asc" ? <SouthRounded /> : <NorthRounded />}
            </IconButton>

            {/* RESET */}
            <Button
              variant="contained"
              onClick={handleResetFilters}
              startIcon={<RestartAltRounded />}
              sx={{
                ml: { xs: 0, sm: "auto" },
                borderRadius: 999,
                px: 3,
                py: 0.8,
                fontWeight: 700,
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                //

                "&:hover": {
                  background: "linear-gradient(135deg, #1D4ED8, #2563EB)",
                },
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Box>

      {/* TABLE */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1800px", // ⬅️ Increased table width
          mx: "auto",
          mt: 2,
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: 8,
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "50vh",
            minWidth: "100%",
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              borderCollapse: "separate",
              borderSpacing: 0,
              "& th, & td": {
                borderRight: "1px solid rgba(203,213,225,0.8)",
              },
              "& th:last-child, & td:last-child": {
                borderRight: "none",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={actionHeaderStyle}>Actions</TableCell>
                {leadColumns.map((col) =>
                  visibleColumns[col.id] ? (
                    <TableCell
                      key={col.id}
                      sx={{
                        ...headerCellStyle,
                        ...(col.id === "customerAddress" && {
                          minWidth: 200,
                        }),
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ) : null
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {tableData &&
                tableData.length > 0 &&
                tableData
                  .filter((row) => {
                    const q = searchTerm.toLowerCase();
                    const matchesSearch =
                      !q ||
                      row.bqTitle?.toLowerCase().includes(q) ||
                      row.customerName?.toLowerCase().includes(q) ||
                      row.referenceNo?.toLowerCase().includes(q) ||
                      row.leadOwner?.toLowerCase().includes(q) ||
                      row.customerAddress?.toLowerCase().includes(q);

                    const matchesDefence =
                      defenceFilter === "all" ||
                      row.defenceAndNonDefence === defenceFilter;

                    const matchesStatus =
                      statusFilter === "all" ||
                      row.presentStatus?.toLowerCase() ===
                        statusFilter.toLowerCase();

                    return matchesSearch && matchesDefence && matchesStatus;
                  })
                  .sort((a, b) => {
                    let aVal;
                    let bVal;

                    switch (sortBy) {
                      case "dateOfLetterSubmission":
                        aVal = a.dateOfLetterSubmission || "";
                        bVal = b.dateOfLetterSubmission || "";
                        break;
                      case "estimateValueInCrWithoutGST":
                        aVal = parseFloat(a.estimateValueInCrWithoutGST) || 0;
                        bVal = parseFloat(b.estimateValueInCrWithoutGST) || 0;
                        break;
                      case "submittedValueInCrWithoutGST":
                        aVal = parseFloat(a.submittedValueInCrWithoutGST) || 0;
                        bVal = parseFloat(b.submittedValueInCrWithoutGST) || 0;
                        break;
                      case "dateCreated":
                      default:
                        aVal = a.dateCreated || "";
                        bVal = b.dateCreated || "";
                        break;
                    }

                    if (typeof aVal === "string") aVal = aVal.toLowerCase();
                    if (typeof bVal === "string") bVal = bVal.toLowerCase();

                    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  })
                  .map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      selected={selectedRow?.id === row.id}
                      onClick={() => handleRowClick(row)}
                      // onDoubleClick={() => handleRowDoubleClick(row)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.18s ease-out",
                        "&:hover": {
                          backgroundColor: "rgba(59,130,246,0.06)",
                          boxShadow: 1,
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {/* ACTIONS COLUMN */}
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(row);
                              }}
                              sx={{
                                borderRadius: 2,
                                backgroundColor: "rgba(59,130,246,0.12)",
                                "&:hover": {
                                  backgroundColor: "rgba(59,130,246,0.25)",
                                },
                                maxWidth: 40,
                              }}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {/* delete logic of any row */}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // handleConfirmSave(row.id)
                                handleDeleteClick(row.id);
                              }}
                              sx={{
                                borderRadius: 2,
                                backgroundColor: "rgba(239,68,68,0.12)",
                                "&:hover": {
                                  backgroundColor: "rgba(239,68,68,0.25)",
                                },
                                maxWidth: 40,
                              }}
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>

                      {leadColumns.map((col) => {
                        if (!visibleColumns[col.id]) return null;

                        let cellContent = row[col.id];

                        // Special rendering for specific columns
                        if (col.id === "bqTitle") {
                          return (
                            <TableCell
                              key={col.id}
                              component="th"
                              scope="row"
                              // sx={{
                              //   fontWeight: 600,
                              //   fontSize: 14,
                              //   maxWidth: 180,
                              //   whiteSpace: "nowrap",
                              //   textOverflow: "ellipsis",
                              //   overflow: "hidden",
                              // }}

                              sx={{
                                fontFamily: `"Inter", "Roboto", sans-serif`,
                                fontSize: 14,
                                fontWeight: 500,
                                maxWidth: 180,
                                whiteSpace: "normal", // ⬅️ allow wrap
                                wordBreak: "break-word", // ⬅️ prevents weird splits
                                fontKerning: "none", // ⬅️ key fix
                              }}
                            >
                              {cellContent}
                            </TableCell>
                          );
                        }

                        if (col.id === "customerName") {
                          return (
                            <TableCell
                              key={col.id}
                              sx={{
                                fontSize: 14,
                                maxWidth: 180,
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                            >
                              {cellContent}
                            </TableCell>
                          );
                        }

                        if (col.id === "customerAddress") {
                          return (
                            <TableCell
                              key={col.id}
                              align="left"
                              sx={{
                                fontSize: 13,
                                maxWidth: 260,
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                            >
                              {cellContent}
                            </TableCell>
                          );
                        }

                        if (col.id === "defenceAndNonDefence") {
                          return (
                            <TableCell
                              key={col.id}
                              align="left"
                              sx={{ fontSize: 13 }}
                            >
                              <Chip
                                size="small"
                                label={cellContent || "-"}
                                sx={{
                                  borderRadius: 999,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  backgroundColor:
                                    cellContent === "Defence"
                                      ? "rgba(22,163,74,0.12)"
                                      : "rgba(59,130,246,0.12)",
                                  color:
                                    cellContent === "Defence"
                                      ? "#15803d"
                                      : "#1d4ed8",
                                }}
                              />
                            </TableCell>
                          );
                        }

                        if (col.id === "presentStatus") {
                          return (
                            <TableCell
                              key={col.id}
                              align="left"
                              sx={{ fontSize: 13 }}
                            >
                              <Chip
                                size="small"
                                label={cellContent || "-"}
                                sx={{
                                  borderRadius: 999,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  backgroundColor:
                                    cellContent === "Closed"
                                      ? "rgba(248,113,113,0.18)"
                                      : cellContent === "In Progress"
                                      ? "rgba(234,179,8,0.18)"
                                      : "rgba(52,211,153,0.18)",
                                  color:
                                    cellContent === "Closed"
                                      ? "#b91c1c"
                                      : cellContent === "In Progress"
                                      ? "#92400e"
                                      : "#15803d",
                                }}
                              />
                            </TableCell>
                          );
                        }

                        if (
                          col.id === "referenceNo" ||
                          col.id === "competitors"
                        ) {
                          return (
                            <TableCell
                              key={col.id}
                              align="left"
                              sx={{
                                fontSize: 13,
                                maxWidth: 160,
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                            >
                              {col.id === "competitors"
                                ? row.JSON_competitors
                                : cellContent}
                            </TableCell>
                          );
                        }

                        if (col.id === "remarks") {
                          return (
                            <TableCell
                              key={col.id}
                              align="left"
                              sx={{
                                fontSize: 13,
                                maxWidth: 200,
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                            >
                              {cellContent}
                            </TableCell>
                          );
                        }

                        if (col.id === "document") {
                          return (
                            <TableCell
                              key={col.id}
                              align="left"
                              sx={{ fontSize: 13, onClick: "disabled" }}
                            >
                              {row.FileName ? (
                                <Link
                                  rel="noopener"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("row : ", row);
                                    handleDocumentClick(
                                      row.FileName,
                                      row.HardDiskFileName
                                    );
                                  }}
                                  sx={{
                                    cursor: "pointer",
                                    color: "#1e40af",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    "&:hover": {
                                      textDecoration: "underline",
                                      color: "#0d47a1",
                                    },
                                  }}
                                >
                                  {row.FileName}
                                </Link>
                              ) : (
                                <Typography
                                  sx={{
                                    color: "#9ca3af",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  No document
                                </Typography>
                              )}
                            </TableCell>
                          );
                        }

                        // Default rendering for other columns
                        return (
                          <TableCell
                            key={col.id}
                            align="left"
                            sx={{ fontSize: 13 }}
                          >
                            {cellContent}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
              {(!tableData || tableData.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={
                      leadColumns.filter((c) => visibleColumns[c.id]).length + 1
                    }
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography variant="body1" sx={{ color: "#6b7280" }}>
                      No profiles found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* EDIT DIALOG - VIEW MODE & EDIT MODE - PROFESSIONAL BLUE THEME */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            background: "#ffffff",
            boxShadow:
              "0 25px 50px rgba(0,0,0,0.15), 0 10px 30px rgba(30,64,95,0.2)",
            maxHeight: "80vh",
          },
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 2,
            background: isEditMode
              ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)" // ORANGE (Edit)
              : "linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)", // BLUE (View)
            color: "#ffffff",
            borderBottom: isEditMode
              ? "3px solid #fb923c"
              : "3px solid #60a5fa",
            py: 2.5,
            transition: "all 0.3s ease", // smooth color change
          }}
        >
          {/* title and heading */}
          <Box display="flex" alignItems="center" gap={4}>
            <Box
              sx={{
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              📋
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#ffffff" }}
              >
                {editingRow?.tenderName || "BQ Details"}
              </Typography>
              {/* <Typography variant="caption" sx={{ color: "#bfdbfe", mt: 0.5 }}>
                Reference: {editingRow?.tenderReferenceNo || "N/A"}
              </Typography> */}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={isEditMode ? "EDIT MODE" : "VIEW MODE"}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                background: isEditMode ? "#fbbf24" : "#60a5fa",
                color: isEditMode ? "#1f2937" : "#ffffff",
                mr: 8,
              }}
            />
            {/* Close Button */}
            <IconButton
              onClick={handleEditCancel}
              sx={{
                color: "#ffffff",
                maxWidth: 40,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <CloseRounded />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* CONTENT - TABULAR MATRIX FORMAT */}
        <DialogContent
          sx={{
            background: "#f8fafc",
            p: 0,
            maxHeight: "calc(90vh - 130px)",
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#e2e8f0",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#94a3b8",
              borderRadius: "4px",
            },
            "@media (max-height: 800px)": {
              maxHeight: "calc(85vh - 130px)",
            },
          }}
        >
          <Box sx={{ p: 1.5 }}>
            {/* TENDER INFORMATION SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Tender Information
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    // sm: "repeat(2, 1fr)",
                    // md: "repeat(2, 1fr)",
                    // lg: "repeat(4, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  { label: "Bq Title", key: "bqTitle" },
                  // { label: "Tender Reference No", key: "tenderReferenceNo" },
                  // { label: "Document Type", key: "documentType" },
                  // { label: "Tender Dated", key: "tenderDated", isDate: true },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant=""
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",

                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        multiline
                        size="small"
                        type={field.isDate ? "date" : "text"}
                        InputLabelProps={
                          field.isDate ? { shrink: true } : undefined
                        }
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* CUSTOMER INFORMATION SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Customer Information
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  { label: "Customer Name", key: "customerName" },
                  { label: "Customer Address", key: "customerAddress" },
                  { label: "Lead Owner", key: "leadOwner" },
                  { label: "Civil / Defence", key: "defenceAndNonDefence" },
                  // { label: "Business Domain", key: "businessDomain" },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Customer Address - Full Width */}
              {/* <Box
                sx={{
                  background: "#ffffff",
                  border: "1px solid #e0e7ff",
                  borderRadius: 2,
                  p: 2,
                  mt: 2,
                  "&:hover": {
                    borderColor: "#60a5fa",
                    boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.7rem",
                  }}
                >
                  Customer Address
                </Typography>
                {isEditMode ? (
                  <TextField
                    value={editingRow?.customerAddress || ""}
                    onChange={(e) =>
                      handleEditFieldChange("customerAddress", e.target.value)
                    }
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    sx={{
                      mt: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        background: "#ffffff",
                        "& fieldset": {
                          borderColor: "#60a5fa",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1e40af",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1e40af",
                          borderWidth: 2,
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        color: "#1e293b",
                        fontWeight: 600,
                      },
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      mt: 1,
                      color: "#1e293b",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {editingRow?.customerAddress || "-"}
                  </Typography>
                )}
              </Box> */}
            </Box>

            {/* FINANCIAL DETAILS SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Financial Details
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  // { label: "Value of EMD", key: "valueOfEMD" },
                  {
                    label: "Estimated Value (Cr, w/o GST)",
                    key: "estimateValueInCrWithoutGST",
                  },
                  {
                    label: "Submitted Value (Cr, w/o GST)",
                    key: "submittedValueInCrWithoutGST",
                  },
                  // {
                  //   label: "Order Won Value (Cr, w/o GST)",
                  //   key: "orderWonValueInCrWithoutGST",
                  // },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* TIMELINE SECTION */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  {
                    label: "Date of Letter Submission",
                    key: "dateOfLetterSubmission",
                    isDate: true,
                  },
                  {
                    label: "Reference No",
                    key: "referenceNo", // 🔒 Reference Number (Always Disabled)
                  },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Field Label */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>

                    {/* EDIT MODE */}
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        type={field.isDate ? "datetime-local" : "text"}
                        /* 🔒 Reference Number Disabled in Edit Mode */
                        disabled={field.key === "referenceNo"}
                        InputLabelProps={
                          field.isDate ? { shrink: true } : undefined
                        }
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,

                            /* Grey background when disabled */
                            background:
                              field.key === "referenceNo"
                                ? "#f1f5f9"
                                : "#ffffff",

                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            fontWeight: 600,

                            /* Muted text when disabled */
                            color:
                              field.key === "referenceNo"
                                ? "#64748b"
                                : "#1e293b",
                          },
                        }}
                      />
                    ) : (
                      /* VIEW MODE (Already Non-Editable) */
                      <Typography
                        sx={{
                          mt: 1,
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          color: "#1e293b",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* STATUS & RESULTS SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Status & Results
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  // {
                  //   label: "Won / Lost / Participated",
                  //   key: "wonLostParticipated",
                  // },
                  // { label: "Open / Closed", key: "openClosed" },
                  // { label: "Present Status", key: "presentStatus" },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* DOCUMENT UPLOAD SECTION - EDIT MODE ONLY */}
            {isEditMode && (
              <>
                {/* <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      background: "#ffffff",
                      border: "2px dashed #60a5fa",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#1e40af",
                        backgroundColor: "rgba(96,165,250,0.02)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <CloudUploadOutlinedIcon
                        sx={{ color: "#1e40af", fontSize: 22 }}
                      />
                      <Typography
                        sx={{
                          color: "#1e3a5f",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        📎 Document/Attachment
                      </Typography>
                    </Box>

                    <input
                      id="dialog-document-input"
                      type="file"
                      onChange={handleDialogFileSelect}
                      style={{ display: "none" }}
                    />

                    <label
                      htmlFor="dialog-document-input"
                      style={{
                        cursor: "pointer",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          backgroundColor: "#f0f9ff",
                          borderRadius: 1.5,
                          border: "1px dashed #60a5fa",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#e0f2fe",
                            borderColor: "#1e40af",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#1e40af",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Click to select document
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b", display: "block", mt: 0.5 }}
                        >
                          PDF, DOC, DOCX, XLS, XLSX, PPT, TXT (Max 10MB)
                        </Typography>
                      </Box>
                    </label>

                    {/* Selected File Display 
                    {documentFile && (
                      <Box
                        sx={{
                          p: 1,
                          backgroundColor: "#e0f2fe",
                          borderRadius: 1.5,
                          border: "1px solid #60a5fa",
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#1e40af",
                            fontSize: "0.8rem",
                            flex: 1,
                          }}
                        >
                          📄 {documentFile.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b", ml: 1 }}
                        >
                          ({(documentFile.size / 1024).toFixed(2)} KB)
                        </Typography>
                      </Box>
                    )}

                    {/* Uploaded Success Display 
                    {uploadedDocument && (
                      <Box
                        sx={{
                          p: 1,
                          backgroundColor: "#dcfce7",
                          borderRadius: 1.5,
                          border: "1px solid #4caf50",
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#2e7d32",
                            fontSize: "0.8rem",
                            flex: 1,
                          }}
                        >
                          ✅ {uploadedDocument.filename}
                        </Typography>
                      </Box>
                    )}

                    {/* Action Buttons 
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        onClick={handleDialogUploadDocument}
                        disabled={!documentFile || isUploading}
                        size="small"
                        variant="contained"
                        sx={{
                          background: "linear-gradient(135deg, #1e40af, #1e3a5f)",
                          color: "#ffffff",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          textTransform: "none",
                          borderRadius: 1.5,
                          px: 2,
                          py: 0.7,
                          "&:hover": {
                            background: "linear-gradient(135deg, #1e3a5f, #162e4a)",
                          },
                          "&:disabled": {
                            background: "#bdbdbd",
                            color: "#757575",
                          },
                        }}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>

                      {(documentFile || uploadedDocument) && (
                        <Button
                          onClick={handleDialogClearDocument}
                          disabled={isUploading}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "#ef5350",
                            color: "#ef5350",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "none",
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.7,
                            "&:hover": {
                              borderColor: "#c62828",
                              color: "#c62828",
                              backgroundColor: "rgba(239, 83, 80, 0.05)",
                            },
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </Box>

                  </Box>
                </Box> beware before removing this comment closing */}

                {/* The above block for document upload in edit mode only */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                      },
                      gap: 1.5,
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#1e40af",
                        backgroundColor: "rgba(96,165,250,0.02)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <Typography
                        sx={{
                          color: "#1e3a5f",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        Document/Attachment
                      </Typography>
                    </Box>

                    <input
                      id="dialog-document-input"
                      type="file"
                      onChange={handleDialogFileSelect}
                      style={{ display: "none" }}
                    />

                    <label
                      htmlFor="dialog-document-input"
                      style={{
                        cursor: "pointer",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      <Button
                        component="span"
                        variant="contained"
                        size="small"
                        startIcon={<CloudUploadOutlinedIcon />}
                        sx={{
                          background:
                            "linear-gradient(135deg, #1565c0, #42a5f5)",
                          color: "#ffffff",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,
                          width: "75%",
                          py: 1.2,
                          transition: "0.3s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            background:
                              "linear-gradient(135deg, #0d47a1, #1e88e5)",
                            boxShadow: "0 4px 12px rgba(13, 71, 161, 0.3)",
                          },
                        }}
                      >
                        Select Document
                      </Button>
                    </label>

                    {/* Selected File Display */}
                    {/* {documentFile && ( */}
                    <Box
                      sx={{
                        p: 1,
                        backgroundColor: "#e0f2fe",
                        borderRadius: 1.5,
                        border: "1px solid #60a5fa",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#1e40af",
                          fontSize: "0.8rem",
                          flex: 1,
                        }}
                      >
                        📄 {documentFile.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", ml: 1 }}
                      >
                        ({(documentFile.size / 1024).toFixed(2)} KB)
                      </Typography>
                    </Box>
                    {/* )} */}

                    {/* Uploaded Success Display */}
                    {uploadedDocument && (
                      <Box
                        sx={{
                          p: 1,
                          backgroundColor: "#dcfce7",
                          borderRadius: 1.5,
                          border: "1px solid #4caf50",
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#2e7d32",
                            fontSize: "0.8rem",
                            flex: 1,
                          }}
                        >
                          {" "}
                          Ajay testing ✅ {uploadedDocument.filename}
                        </Typography>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
                      <Button
                        onClick={handleDialogUploadDocument}
                        disabled={!documentFile || isUploading}
                        size="small"
                        variant="contained"
                        sx={{
                          background:
                            "linear-gradient(135deg, #1e40af, #1e3a5f)",
                          color: "#ffffff",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          textTransform: "none",
                          borderRadius: 1.5,
                          px: 2,
                          py: 0.7,
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #1e3a5f, #162e4a)",
                          },
                          "&:disabled": {
                            background: "#bdbdbd",
                            color: "#757575",
                          },
                        }}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>

                      {/* {(documentFile || uploadedDocument) && ( */}
                      <Button
                        onClick={handleDialogClearDocument}
                        disabled={isUploading}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "#ef5350",
                          color: "#ef5350",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          textTransform: "none",
                          borderRadius: 1.5,
                          px: 2,
                          // py: 0.7,
                          minWidth: 200,
                          "&:hover": {
                            borderColor: "#c62828",
                            color: "#c62828",
                            backgroundColor: "rgba(239, 83, 80, 0.05)",
                          },
                        }}
                      >
                        Clear
                      </Button>
                      {/* )} */}
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            {/* DOCUMENT VIEW - VIEW MODE ONLY */}
            {!isEditMode && editingRow?.FileName && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    background: "#ffffff",
                    border: "1px solid #e0e7ff",
                    borderRadius: 2,
                    p: 2,
                    "&:hover": {
                      borderColor: "#60a5fa",
                      boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography
                      sx={{
                        color: "#1e3a5f",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      📎 Document
                    </Typography>
                  </Box>
                  <Link
                    onClick={() =>
                      handleDocumentClick(
                        editingRow.Filename,
                        editingRow.HardDiskFileName
                      )
                    }
                    sx={{
                      cursor: "pointer",
                      color: "#1e40af",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                        color: "#0d47a1",
                      },
                    }}
                  >
                    {editingRow.FileName}
                  </Link>
                </Box>
              </Box>
            )}

            {/* ADDITIONAL INFORMATION SECTION */}
            <Box sx={{ mb: 2 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Additional Information
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  { label: "Competitors Info", key: "JSON_competitors" },
                  {
                    label: "Present Status",
                    key: "presentStatus",
                  },

                  // {
                  //   label: "Corrigendums Date / File",
                  //   key: "corrigendumsDateFile",
                  // },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* DIALOG ACTIONS */}
        <DialogActions
          sx={{
            background: "#f8fafc",
            borderTop: "1px solid #e0e7ff",
            p: 2.5,
            gap: 1.5,
          }}
        >
          {!isEditMode ? (
            <>
              {/* <Button
                onClick={handleEditCancel}
                sx={{
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                  maxWidth: 180,
                  letterSpacing: "0.5px",
                  backgroundColor: "#e2e8ff",
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                  },
                }}
              >
                Close
              </Button> */}
              {/* Show Edit button only if dialog opened from edit icon */}
              {dialogOpenedFrom === "editIcon" && (
                <Button
                  onClick={handleEnterEditMode}
                  variant="contained"
                  sx={{
                    background:
                      "linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.85rem",
                    letterSpacing: "0.5px",
                    maxWidth: 180,
                    px: 3,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1e3a5f 0%, #162e4a 100%)",
                      boxShadow: "0 8px 24px rgba(30,64,95,0.3)",
                    },
                    "&:active": {
                      transform: "scale(0.98)",
                    },
                  }}
                >
                  ✏️ Edit Details
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={handleCancelEdit}
                sx={{
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                  maxWidth: 180,
                  letterSpacing: "0.5px",
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px",
                  maxWidth: 220,
                  px: 3,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                💾 Save Changes
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "#ffffff",
            boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#1e3a5f",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "2px solid #fbbf24",
          }}
        >
          <Box sx={{ fontSize: 28 }}>⚠️</Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#1e3a5f" }}>
              Confirm Update
            </Typography>
            {/* <Typography variant="caption" sx={{ color: "#64748b" }}>
              Please review before saving
            </Typography> */}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography sx={{ color: "#475569", lineHeight: 1.6 }}>
            You are about to update this tender record with the following
            changes. This action will be synced to the database immediately.
          </Typography>
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              background: "#f0f9ff",
              border: "1px solid #bfdbfe",
              borderRadius: 2,
              color: "#1e3a5f",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            📌 Make sure all fields are correct before confirming.
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            background: "#f8fafc",
            borderTop: "1px solid #e0e7ff",
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setConfirmSaveOpen(false)}
            sx={{
              color: "#64748b",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              "&:hover": { backgroundColor: "#e2e8f0" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              px: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              },
            }}
          >
            ✓ Yes, Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "#ffffff",
            boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#1e3a5f",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "2px solid #fbbf24",
          }}
        >
          <Box sx={{ fontSize: 28 }}>⚠️</Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#1e3a5f" }}>
              Confirm Update
            </Typography>
            {/* <Typography variant="caption" sx={{ color: "#64748b" }}>
              Please review before saving
            </Typography> */}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography sx={{ color: "#475569", lineHeight: 1.6 }}>
            You are about to delete this tender record. This action will be
            synced to the database immediately.
          </Typography>
          {/* <Box
            sx={{
              mt: 2.5,
              p: 2,
              background: "#f0f9ff",
              border: "1px solid #bfdbfe",
              borderRadius: 2,
              color: "#1e3a5f",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            📌 Make sure all fields are correct before confirming.
          </Box> */}
        </DialogContent>
        <DialogActions
          sx={{
            background: "#f8fafc",
            borderTop: "1px solid #e0e7ff",
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            sx={{
              color: "#64748b",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              "&:hover": { backgroundColor: "#e2e8f0" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteRow(idDeleteOpen)}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              px: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              },
            }}
          >
            ✓ Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

//-----------Bulk Upload-----------
function ExcelUploadAndValidate({ user, ServerIp }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState([]);

  const DB_COLUMNS = [
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
    // user info
    "OperatorId",
    "OperatorName",
    "OperatorRole",
    "OperatorSBU",
  ];

  const DB_COLUMNS_MATCH = [
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

  // ----------------------------
  // HANDLE FILE UPLOAD
  // ----------------------------
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert Excel to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        setError("Excel file is empty.");
        return;
      }

      const excelColumns = jsonData[0].map((col) => col.toString().trim());

      // Validate columns
      const missing = DB_COLUMNS_MATCH.filter(
        (col) => !excelColumns.includes(col)
      );
      const extra = excelColumns.filter(
        (col) => !DB_COLUMNS_MATCH.includes(col)
      );

      if (missing.length > 0 || extra.length > 0) {
        setError(
          `Column mismatch!
          Missing : ${missing.join(", ") || "None"}; 
          Extra : ${extra.join(", ") || "None"}`
        );
        return;
      }

      // Remove header & extract data rows

      console.log("jsonData from browse", jsonData);
      const rows = jsonData.slice(1).map((row) => {
        const rowObj = {};
        DB_COLUMNS.forEach((col, index) => {
          // if (col==="") {
          //   setError(`This field is blank`)
          //   return;
          // }
          if (col === "OperatorId") {
            rowObj[col] = user?.id || "291536";
            return;
          }

          if (col === "OperatorName") {
            rowObj[col] = user?.username;
            return;
          }

          if (col === "OperatorRole") {
            rowObj[col] = user?.userRole;
            return;
          }

          if (col === "OperatorSBU") {
            rowObj[col] = "Software SBU";
            return;
          } else {
            rowObj[col] = row[index] || "";
          }
        });
        return rowObj;
      });

      setExcelData(rows);
      setSuccess(`File validated successfully. Total rows: ${rows.length}`);
    };
    console.log(excelData);

    reader.readAsArrayBuffer(file);
  };

  // ----------------------------
  // SEND TO BACKEND
  // ----------------------------
  const handleUploadToServer = async () => {
    if (excelData.length === 0) {
      setError("No valid data found to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    // setExcelData(...excelData, {
    //   OperatorId: user.id || "291536",
    //   OperatorName: user.username || "Vivek Kumar Singh",
    //   OperatorRole: user.userRole || "Lead Owner",
    //   OperatorSBU: "Software SBU",
    // })

    // VIEW FINALLY THE DATA IS GOING TO BACKEND
    console.log(
      "VIEW FINAL DATA IS GOING INTO BACKEND : ",
      excelData,
      "ServerIP : ",
      ServerIp
    );

    // HERE WE ARE CALLING THE API TO BULK UPLOAD
    axios
      .post(ServerIp + "/bqbulkUpload", { excelData })
      .then((response) => {
        console.log("Server response : ", response);
        if (response) {
          setSuccess("Data successfully pushed into the database!");
        } else {
          setError(response?.data || "Failed to upload data.");
        }
      })
      .catch((error) => {
        console.log(error.message);
        setError("Server error: " + error.message);
      })
      .finally(() => {
        console.log(" finally is hitted");
      });

    setLoading(false);
  };

  return (
    <Box
      sx={{
        mb: 5,
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef5ff 0%, #f8fbff 100%)",
        borderRadius: 4,
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          mb: 8,
          width: "100%",
          maxWidth: 720,
          p: 4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
        }}
      >
        {/* TITLE */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            textAlign: "center",
            color: "#0d47a1",
            mb: 1,
          }}
        >
          Upload Export Leads Data
        </Typography>

        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "#64748b",
            mb: 3,
          }}
        >
          Upload Excel file (.xlsx / .xls) to bulk insert records into the
          system
        </Typography>

        {/* UPLOAD BOX */}
        {excelData.length === 0 && (
          <Box
            sx={{
              mb: 5,
              border: "2px dashed #93c5fd",
              borderRadius: 4,
              p: { xs: 4, sm: 6 }, // ⬅️ MORE INNER SPACE
              minHeight: 280, // ⬅️ INCREASED HEIGHT

              textAlign: "center",
              background: "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
              transition: "all 0.25s ease",
              "&:hover": {
                background: "linear-gradient(180deg, #eef5ff 0%, #e0f2fe 100%)",
                borderColor: "#3b82f6",
                boxShadow: "0 10px 30px rgba(59,130,246,0.15)",
              },
            }}
          >
            {/* ICON */}
            <Box
              sx={{
                mb: 4,
                animation: "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%": { transform: "translateY(0px)" },
                  "50%": { transform: "translateY(-8px)" },
                  "100%": { transform: "translateY(0px)" },
                },
              }}
            >
              <CloudQueueRoundedIcon
                sx={{
                  fontSize: 64,
                  background: "linear-gradient(135deg, #93c5fd, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 8px 16px rgba(59,130,246,0.35))",
                }}
              />
            </Box>

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}
            >
              Drag & drop your file here
            </Typography>

            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              or click to browse (.xlsx or .xls)
            </Typography>

            {/* BROWSE FILE BUTTON */}
            <Button
              variant="contained"
              component="label"
              sx={{
                borderRadius: 999,
                px: 4,
                py: 1.2,
                fontWeight: 700,
                fontSize: 14,
                textTransform: "none",
                color: "#ffffff",

                background:
                  "linear-gradient(135deg, #42a5f5 0%, #2563eb 50%, #1e40af 100%)",
                boxShadow: "0 8px 22px rgba(37,99,235,0.35)",

                transition: "all 0.25s ease",

                "&:hover": {
                  background:
                    "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)",
                  boxShadow: "0 14px 32px rgba(37,99,235,0.45)",
                  transform: "translateY(-2px) scale(1.03)",
                },

                "&:active": {
                  transform: "scale(0.96)",
                  boxShadow: "0 6px 14px rgba(37,99,235,0.35)",
                },
              }}
            >
              📁 Browse File
              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        )}

        {/* STATUS MESSAGES */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {success}
          </Alert>
        )}

        {/* PUSH BUTTON (UNCHANGED LOGIC) */}
        {excelData.length > 0 && (
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleUploadToServer}
              disabled={loading}
              sx={{
                px: 5,
                py: 1.4,
                borderRadius: 999,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 8px 20px rgba(22,163,74,0.35)",
              }}
            >
              {loading ? (
                <CircularProgress size={26} sx={{ color: "#fff" }} />
              ) : (
                "Push Data to Database"
              )}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default BudgetaryQuotationForm;
