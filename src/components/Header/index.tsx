import React, {useRef, useEffect} from 'react'
import {
    AppBar,
    TextField,
    Link,
    IconButton,
    
  } from "@mui/material";
import { Box } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";

interface Props {
    drawerWidth: number
    setShowMobile(value: boolean) : void
}

const Header = ({drawerWidth, setShowMobile} : Props) => {
    const appBarRef = useRef<HTMLDivElement>(null)
    return(
        <AppBar
        position="sticky"
        sx={{
          width: { xs: "100%", lg: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: "0", lg: `${drawerWidth}px` },
        }}
        ref={appBarRef}
      >
        
        <Box
          sx={{
            background: "#00040F",
            width: "100%",
            display: "flex",
            padding: "20px",
            alignItems: "center",
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setShowMobile(true)}
            sx={{ mr: 2, display: { xs: "block", lg: "none" } }}
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
            }}
          >
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
                    sx={{ color: "#FFF", transform: "rotate(90deg)" }}
                  />
                ),
              }}
              placeholder="Search"
            />
            <Link>Login</Link>
          </Box>
        </Box>
      </AppBar>
    )
}

export default Header