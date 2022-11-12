import React from "react";
import { Box } from "@mui/system";
import { Typography, Button } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { VideoData } from "../../services/video";
import { maskDateInFull } from "../../utils";

interface Props {
  videoData: VideoData | undefined;
  handleChangeEvaluation(isPositive: boolean): Promise<void>;
}

export const MainVideo = ({
  videoData,
  handleChangeEvaluation,
}: Props) => {
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        component="video"
        src={`${baseUrl}/${videoData?.path}`}
        controls
        sx={{ width: "90%", borderRadius: "20px" }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
          mt: "10px",
        }}
      >
        <Typography sx={{ fontSize: "20px" }}>{videoData?.title}</Typography>
        <Typography sx={{ color: "#808191", fontSize: "14px" }}>
          {videoData?.viewsCount} views • {maskDateInFull(videoData?.createdAt)}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
          mt: "20px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src={`${baseUrl}/${videoData?.created_by.avatar}`}
            sx={{ width: "40px", height: "40px", borderRadius: "50%" }}
          />
          <Box
            sx={{
              ml: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ color: "#CFD1D2", fontSize: "14px" }}>
              {videoData?.created_by.name}
            </Typography>
            <Typography
              sx={{ color: "rgba(183, 185, 210, 0.7)", fontSize: "14px" }}
            >
              {videoData?.created_by.subsCount} Followers
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{
              color: "#FFF",
              background: "#FF7551",
              borderRadius: "5px",
              height: "25px",
              width: "75px",
              ml: "30px",
              textTransform: "none",
              "&.MuiButtonBase-root:hover": {
                background: "#FF7551",
              },
            }}
          >
            Follow
          </Button>
        </Box>
        <Box sx={{ color: "#80819", fontSize: "12px" }}>
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <Box sx={{ mr: "15px" }}>{videoData?.likesCount}</Box>
            <ThumbUpIcon
              sx={{ color: videoData?.evaluation ? "blue" : "#80819", cursor: 'pointer' }}
              onClick={() => handleChangeEvaluation(true)}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-end", mt: "5px" }}>
            <Box sx={{ mr: "15px" }}>{videoData?.deslikesCount}</Box>
            <ThumbDownIcon
              sx={{ color: videoData?.evaluation === false ? "blue" : "#80819", cursor: 'pointer' }}
              onClick={() => handleChangeEvaluation(false)}
            />
          </Box>
        </Box>
      </Box>
      <Typography sx={{ mt: "30px", color: "#808191", fontSize: "13px" }}>
        {videoData?.description}
      </Typography>
    </Box>
  );
};

export default MainVideo;
