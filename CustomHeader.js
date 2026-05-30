import React, { useState, useEffect, useMemo } from "react";
import {
  AppBar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Box,
  useTheme,
  useScrollTrigger,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Redux/Actions/authUser";
import { getServerIp } from "../../MarketingApp/utils/getServerIp";

// --- Constants ---
// const SETTINGS = ["User Profile", "Create Users", "Logout"];
const GRAPH_VIEW = [
  "Maintenance",
  "Training",
  "Repair",
  "Operation",
  "Advance Search",
];

const DEFAULT_SERVER_IP = "http://127.0.0.1:8082/auth/";

// Move this outside the component to prevent re-renders
const USER_MENU_ITEMS = [
  {
    id: "profile",
    label: "User Profile",
    icon: <PersonIcon fontSize="small" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon fontSize="small" />,
  },
  { id: "logout", label: "Logout", icon: <LogoutIcon fontSize="small" /> },
];

export default function CustomHeader({}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Redux Selectors ---
  // const { user: currentUser } = useSelector((state) => state.AuthUserReducer);

  // --- State ---
  const [anchorElUser, setAnchorElUser] = useState(null);
  // const [anchorTreeUser, setAnchorTreeUser] = useState(null);
  // const [sbuDepartment, setSbuDepartment] = useState("MARKETING");
  // const [shipName, setShipName] = useState("");
  // const [homeValueNull, setHomeValueNull] = useState("/home");

  // --- Derived State / Memoized Logic ---
  const serverIP = getServerIp();

  // Memoize user to prevent unnecessary re-parsing on every render
  const userData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return {};
    }
  }, []);

  // --- Effects ---
  // useEffect(() => {
  //   if (path) {
  //     const parts = path.split("/");
  //     // setSbuDepartment("MARKETING"); // Hardcoded as per original logic
  //     setShipName(parts[1]?.replace(/_/g, "-") || "");
  //   }
  // }, [path]);

  // --- Event Handlers ---
  /**
   * Without this, the Menu wouldn't know where to "float."
   * By passing the Avatar element to anchorEl,
   * MUI calculates the coordinates of that icon and
   * ensures the menu pops up exactly underneath or next to it.
   */
  const handleOpenUserMenu = (event) => {
    // console.log(event.currentTarget);
    // console.log(Boolean(event.currentTarget));
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // const handleOpenTreeMenu = (event) => setAnchorTreeUser(event.currentTarget);
  // const handleCloseTreeMenu = () => setAnchorTreeUser(null);

  // const handleUserAction_Deleted = (id) => {
  //   handleCloseUserMenu();
  //   switch (id) {
  //     case "0":
  //       navigate("/user-profile-details");
  //       break;
  //     case "1":
  //       navigate("/profile");
  //       break;
  //     case "2":
  //       navigate("/");
  //       if (currentUser) dispatch(logout(currentUser.id, serverIP));
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // const handleTreeAction = (id) => {
  //   handleCloseTreeMenu();
  //   if (id === "4") {
  //     navigate("/AdvancedSearch");
  //   } else {
  //     navigate("/Main/MES");
  //   }
  // };

  // const setHomeNull = () => {
  //   setHomeValueNull(null);
  // };

  // IMPROVED: Use String IDs instead of Numbers
  const handleUserAction = (actionId) => {
    handleCloseUserMenu();

    switch (actionId) {
      case "profile":
        navigate("/user-profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "logout":
        if (userData) {
          // Logic for logout
          dispatch(logout(userData.id, serverIP));
          navigate("/");
        }
        break;
      default:
        break;
    }
  };

  // const isMobile = width < breakpoint;

  // This adds a slight shadow effect when the user starts scrolling
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed" // Makes it stick to the top
        elevation={trigger ? 8 : 2} // Adds shadow on scroll
        sx={{
          height: 70, // Slightly taller for a premium feel
          backgroundColor: "#003049",
          borderBottom: "2px solid #fcbf49", // Subtle accent line
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Toolbar sx={{ height: 70, justifyContent: "space-between" }}>
          {/* LEFT SECTION: Logo & SBU */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src="../Icons/bharatelectronics.jpg"
              alt="Company Logo"
              sx={{
                height: 55,
                width: "auto",
                mr: 3,
                borderRadius: "3px",
              }}
            />

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                borderLeft: "1px solid rgba(255,255,255,0.3)",
                pl: 3,
                gap: 1,
              }}
            >
              {/* HOME ICON */}
              <Link
                to="/home"
                style={{
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <HomeIcon
                  sx={{
                    fontSize: 24,
                  }}
                />
              </Link>

              {/* SOFTWARE */}
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#fcbf49",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  letterSpacing: "0.5px",
                  lineHeight: 1.2,
                }}
              >
                {(userData?.sbu || "DUMMY") + " : "}
              </Typography>

              {/* MARKETING */}
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#fff",
                  opacity: 0.8,
                  fontWeight: 500,
                  fontSize: "1.1rem",
                  letterSpacing: "0.5px",
                  lineHeight: 1.2,
                }}
              >
                {userData?.subDivision || "MARKETING"}
              </Typography>
            </Box>
          </Box>

          {/* CENTER SECTION: Page Title */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: "#fff",
              fontWeight: 600,
              textAlign: "center",
              fontSize: { xs: "1.1rem", md: "1.5rem" },
              letterSpacing: "1px",
              textTransform: "uppercase",
              ml: -15,
            }}
          >
            {/* This could be passed as a prop if you want dynamic titles */}
            Marketing Portal
          </Typography>

          {/* RIGHT SECTION: User Profile */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip
              title={`${userData?.id || "B001"} \n ${
                userData?.userName || "User"
              }`}
              arrow
            >
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{
                  p: 0.5,
                  // border: "2px solid #fcbf49",
                  "&:hover": { borderColor: "#fff" },
                  transition: "0.2s",
                }}
              >
                <Avatar
                  alt={userData?.userName || "User"}
                  src={userData?.profilePic || "/Icons/default-avatar.png"}
                  sx={{ width: 40, height: 40 }}
                />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 180,
                  boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                },
              }}
            >
              {USER_MENU_ITEMS.map((item) => (
                <MenuItem
                  key={item.id}
                  onClick={() => handleUserAction(item.id)}
                  sx={{ fontSize: "0.9rem", py: 1 }}
                >
                  <Typography>{item.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
