import React, { useEffect } from "react";
import { VideoData } from "../../services/video";
import { Box } from "@mui/system";
import { Typography } from "@mui/material";
import { maskDateInFull } from "../../utils";
import { useNavigate } from "react-router-dom";
import { GetVideoEvaluation, PostVideoEvaluation } from "../../services/evaluation";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";


interface Props {
  video: VideoData;
  setEvaluation(e: boolean | null, likesCount?: number, deslikesCount?: number): void
}

export const VideoInChat = ({ video, setEvaluation }: Props) => {
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const navigate = useNavigate();

  useEffect(() => {
    if(video.evaluation === undefined)
      getVideoEvaluation()
  }, [])

  const getVideoEvaluation = async () => {
    try {
      const res = await GetVideoEvaluation(video.id)
      setEvaluation(res)
    } catch (error) {
      
    }
  }

  const handleChangeEvaluation = async (e: boolean) => {
    try {
      const res = await PostVideoEvaluation(video.id, e)
      setEvaluation(res.evaluation ?? null, res.likesCount, res.deslikesCount)
    } catch (error) {
      
    }
  }

  return (
    <Box
      sx={{
        background: "rgba(255, 255, 255, 0.1)",
        p: "20px",
        maxWidth: "500px",
        my: "15px",
        borderRadius: "20px",
      }}
    >
      <Box
        component="video"
        src={`${baseUrl}/${video.path}`}
        controls
        sx={{ width: "100%", borderRadius: "20px", height: "250px" }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          mt: "10px",
        }}
      >
        <Typography
          sx={{ fontSize: "20px", cursor: "pointer" }}
          onClick={() => navigate(`/video/${video.id}`)}
        >
          {video.title}
        </Typography>
        <Typography sx={{ color: "#808191", fontSize: "14px" }}>
          {video.viewsCount} views • {maskDateInFull(video.createdAt)}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          mt: "20px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src={`${baseUrl}/${video.created_by.avatar}`}
            sx={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
            onClick={() => navigate("/profile/" + video.created_by.email)}
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
              {video.created_by.name}
            </Typography>
            <Typography
              sx={{ color: "rgba(183, 185, 210, 0.7)", fontSize: "14px" }}
            >
              {video.created_by.subsCount} Followers
            </Typography>
          </Box>
          <Box sx={{ color: "#80819", fontSize: "12px" }}></Box>
        </Box>
        <Box>
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <Box sx={{ mr: "15px" }}>{video.likesCount}</Box>
            <ThumbUpIcon
              sx={{
                color: video.evaluation ? "blue" : "#80819",
                cursor: "pointer",
              }}
              onClick={() => handleChangeEvaluation(true)}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-end", mt: "5px" }}>
            <Box sx={{ mr: "15px" }}>{video.deslikesCount}</Box>
            <ThumbDownIcon
              sx={{
                color: video.evaluation === false ? "blue" : "#80819",
                cursor: "pointer",
              }}
              onClick={() => handleChangeEvaluation(false)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
