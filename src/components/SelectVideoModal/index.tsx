import {
  Dialog,
  Tab,
  Tabs,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useRef, useEffect } from "react";
import { useLoading } from "../../context/loading_context";
import { useUserData } from "../../context/user_data_context";
import { getUserVideos, SearchVideos, VideoData } from "../../services/video";
import { VideoList } from "../VideoList";

interface Props {
  open: boolean;
  returnVideo(video: VideoData): void
  close(): void
}

enum TabEnum {
  myVideos = 1,
  searchVideos = 2,
}

export const SelectVideoModal = ({ open, returnVideo, close }: Props) => {
  const loading = useLoading();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { userData } = useUserData();
  const [tabValue, setTabValue] = useState(TabEnum.myVideos);
  const [myVideos, setMyVideos] = useState<VideoData[]>([]);
  const myVideosPage = useRef(1);
  const myVideosRows = useRef(10);
  const [otherVideos, setOtherVideos] = useState<VideoData[]>([]);
  const [otherVideosSearch, setOtherVideosSearch] = useState("");
  const otherVideosPage = useRef(1);
  const otherVideosRows = useRef(10);
  const searchTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!userData.email) return;

    loadMyVideos(myVideosPage.current);
  }, [userData]);

  useEffect(() => {
    if (!otherVideosSearch) {
        setOtherVideos([])
        return
    }

    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
        loadOtherVideos(1)
    }, 1000);
  }, [otherVideosSearch]);

  const loadMyVideos = async (page: number) => {
    if (!userData.email) return;

    loading.show();
    try {
      const res = await getUserVideos(
        userData.email,
        page,
        myVideosRows.current
      );
      myVideosPage.current = page;

      const newMyVideos = myVideos;
      newMyVideos.push(...res);
      setMyVideos([...newMyVideos]);
    } catch (error) {}
    loading.hide();
  };

  const loadOtherVideos = async (page: number) => {
    loading.show();
    try {
      const res = await SearchVideos(otherVideosSearch, page, otherVideosRows.current)
      otherVideosPage.current = page

      const newOtherVideos = otherVideos;
      newOtherVideos.push(...res);
      setOtherVideos([...newOtherVideos]);
    } catch (error) {}
    loading.hide();
  };

  return (
    <Dialog open={open} fullScreen={fullScreen} onClose={close}>
      <Box
        sx={{
          width: { xs: "auto", md: "600px" },
          background: "rgba(0,4,15,1)",
          overflowX: "hidden",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={tabValue}
            onChange={(e, value) => setTabValue(value)}
            sx={{}}
          >
            <Tab
              value={TabEnum.myVideos}
              label="Your vídeos"
              sx={{ width: "50%", color: "white" }}
            />
            <Tab
              value={TabEnum.searchVideos}
              label="Search vídeos"
              sx={{ width: "50%", color: "white" }}
            />
          </Tabs>
        </Box>
        <Box sx={{ width: "100%", p: "15px", color: "white" }}>
          {tabValue === TabEnum.myVideos && (
            <VideoList
              videosData={myVideos}
              flexDirection="row"
              rows={myVideosRows.current}
              changePage={() => loadMyVideos(myVideosPage.current + 1)}
              returnVideo={returnVideo}
            />
          )}
          {tabValue === TabEnum.searchVideos && (
            <>
              <TextField
                sx={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  color: "#FFF",
                  outline: "none",
                  mr: "30px",
                  input: { color: "#FFF", outline: "hidden" },
                }}
                placeholder="Search"
                onChange={(e) => setOtherVideosSearch(e.target.value)}
                value={otherVideosSearch}
              />
              {
                <VideoList
                  videosData={otherVideos}
                  flexDirection="row"
                  rows={otherVideosRows.current}
                  changePage={() => loadOtherVideos(otherVideosPage.current+1)}
                  returnVideo={returnVideo}
                />
              }
            </>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};
