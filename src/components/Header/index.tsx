import React, { useRef, useState } from "react";
import {
  AppBar,
  TextField,
  Link,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Box } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuthenticationModal } from "../../context/authentication_modal_context";
import { useUserData } from "../../context/user_data_context";
import { doLogout, isLogged } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useNotification } from "../../context/notification_context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { clearChatNotifications } from "../../services/chat";

interface Props {
  drawerWidth: number;
  headerHeight: number;
  setShowMobile(value: boolean): void;
  hideSideBar: boolean;
}

const Header = ({
  drawerWidth,
  setShowMobile,
  headerHeight,
  hideSideBar,
}: Props) => {
  const modal = useAuthenticationModal();
  const { userData, setUserData } = useUserData();
  const appBarRef = useRef<HTMLDivElement>(null);
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { chatNotifications, clear } = useNotification();

  const [notificationsAnchor, setNotificationsAnchor] =
    React.useState<null | HTMLElement>(null);
  const notificationsOpen = Boolean(notificationsAnchor);

  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigateToProfile = () => {
    navigate(`/profile/${userData.email}`);
    handleClose();
  };

  const logout = () => {
    doLogout();
    setUserData({});
    handleClose();
    window.location.reload();
  };

  const clearNotifications = async () => {
    try {
      const notificationsIds : number[] = []
      for(const not of chatNotifications){
        notificationsIds.push(not.id)
      }

      await clearChatNotifications(notificationsIds)
      clear(notificationsIds)
    } catch (error) {
      
    }
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        width: {
          xs: "100%",
          lg: hideSideBar ? "100%" : `calc(100% - ${drawerWidth}px)`,
        },
        ml: { xs: "0", lg: hideSideBar ? "0" : `${drawerWidth}px` },
      }}
      ref={appBarRef}
    >
      <Box
        sx={{
          background: "#00040F",
          width: "100%",
          display: "flex",
          height: `${headerHeight}px`,
          alignItems: "center",
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setShowMobile(true)}
          sx={{
            mr: 2,
            display: { xs: "block", lg: hideSideBar ? "block" : "none" },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            width: { xs: "80%", md: "50%" },
            mr: "20px",
          }}
        >
          {isLogged() && (
            <>
              <Menu
                anchorEl={notificationsAnchor}
                open={notificationsOpen}
                onClose={() => setNotificationsAnchor(null)}
                sx={{ mt: "10px" }}
              >
                {chatNotifications.length ? (
                  <>
                    {chatNotifications.map((not, index) => (
                      <Box
                        sx={{
                          p: "15px",
                          borderBottom:
                            index === chatNotifications.length - 1
                              ? "none"
                              : "1px solid black",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setNotificationsAnchor(null)
                          navigate(`/chats?chatId=${not.chat.id}`)
                        }}
                      >
                        <Box
                          component="img"
                          sx={{ maxWidth: "40px" }}
                          src={`${baseUrl}/${
                            not.chat?.isPersonal
                              ? not.messages[0].created_by.avatar
                              : not.chat?.groupImage
                          }`}
                        />
                        <Box sx={{ ml: "15px" }}>
                          <Typography sx={{ fontSize: "12px" }}>
                            {not.chat?.isPersonal
                              ? not.messages[0].created_by.name
                              : not.chat?.groupName}
                          </Typography>
                          <Typography sx={{ fontSize: "12px" }}>
                            {not.messages.length} não lidas
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    <Button
                      sx={{ padding: "15px", width: "100%" }}
                      variant="contained"
                      onClick={clearNotifications}
                    >
                      Clear notifications
                    </Button>
                  </>
                ) : (
                  <Typography sx={{p: '15px'}}>
                    No new notifications
                  </Typography>
                )}
              </Menu>
              <Box
                sx={{ position: "relative", cursor: "pointer" }}
                onClick={(e) => setNotificationsAnchor(e.currentTarget)}
              >
                <NotificationsActiveIcon />
                {chatNotifications.length > 0 && (
                  <Box
                    sx={{
                      width: "15px",
                      height: "15px",
                      borderRadius: "50%",
                      background: "#cc0000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "absolute",
                      top: "15px",
                      left: "15px",
                      fontSize: "11px",
                    }}
                  >
                    {chatNotifications.length}
                  </Box>
                )}
              </Box>
            </>
          )}
          <TextField
            sx={{
              width: "70%",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              color: "#FFF",
              outline: "none",
              mr: "30px",
              input: { color: "#FFF", outline: "hidden" },
            }}
            InputProps={{
              endAdornment: (
                <SearchIcon
                  sx={{
                    color: "#FFF",
                    transform: "rotate(90deg)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (query) {
                      setQuery("");
                      window.location.href = `/search?query=${query}`;
                    }
                  }}
                />
              ),
            }}
            placeholder="Search"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            onKeyDown={(e: any) => {
              if (e.key === "Enter" && query) {
                setQuery("");
                window.location.href = `/search?query=${query}`;
              }
            }}
          />
          {isLogged() ? (
            <>
              <Box
                component="img"
                src={`${baseUrl}/${userData?.avatar}`}
                sx={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
                onClick={handleClick}
              />
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{ mt: "10px" }}
              >
                <MenuItem onClick={navigateToProfile}>Perfil</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Link onClick={() => modal.show()} sx={{ cursor: "pointer" }}>
              Login
            </Link>
          )}
        </Box>
      </Box>
    </AppBar>
  );
};

export default Header;
