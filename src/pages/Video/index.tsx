import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import { Typography, Button } from "@mui/material";
import MainVideo from "../../components/MainVideo";
import { getVideo, VideoData } from "../../services/video";
import { useNavigate, useParams } from "react-router-dom";
import { useLoading } from "../../context/loading_context";
import { useSnack } from "../../context/snack_context";

const Video = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState<VideoData>();
  const loading = useLoading();
  const snack = useSnack();

  useEffect(() => {
    getVideoData();
  }, []);

  const getVideoData = async () => {
    try {
      if (!id || isNaN(Number(id))) {
        navigate("/");
        return;
      }
      loading.show();
      const res = await getVideo(Number(id));
      setVideoData(res);
    } catch (error) {
      snack.error("Video não encontrado");
      navigate("/");
    }
    loading.hide();
  };

  return (
    <Box sx={{ width: "100%", display: "flex", pt: "20px", pl: "40px" }}>
      <MainVideo videoData={videoData} />
    </Box>
  );
};

export default Video;
