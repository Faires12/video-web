import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LeftPanel from "../LeftPanel";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const [drawerWidth, setDrawerWidth] = useState(200);
  const [headerHeight, setHeaderHeight] = useState(90);
  const [hideSideBar, setHideSideBar] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setHideSideBar(location.pathname === '/chats')
  }, [location.pathname])

  return (
    <>
      <LeftPanel drawerWidth={drawerWidth} headerHeight={headerHeight} hideSideBar={hideSideBar}/>
      <Box
        sx={{
          width: { xs: "100%", lg: hideSideBar ? '100%' : `calc(100% - ${drawerWidth}px)` },
          ml: { xs: "0", lg: hideSideBar ? "0" : `${drawerWidth}px` },
          background: "rgba(0,4,15,1)",
          color: "#FFF",
          minHeight: `calc(100vh - ${headerHeight}px)`,
          position: 'relative'
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default Layout;
