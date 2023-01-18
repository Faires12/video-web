import { Box } from "@mui/system";
import React, { useState } from "react";
import LeftPanel from "../LeftPanel";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const [drawerWidth, setDrawerWidth] = useState(200);
  const [headerHeight, setHeaderHeight] = useState(90);

  return (
    <>
      <LeftPanel drawerWidth={drawerWidth} headerHeight={headerHeight}/>
      <Box
        sx={{
          width: { xs: "100%", lg: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: "0", lg: `${drawerWidth}px` },
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
