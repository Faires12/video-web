import React, { useRef, useEffect, useState } from "react";
import { Box } from "@mui/system";
import { Typography, Button, Select, MenuItem } from "@mui/material";
import { useUserData } from "../../context/user_data_context";
import { GetUserDataByEmail, UserData } from "../../services/user";
import { getAverageRGB } from "../../utils";
import { useNavigate, useParams } from "react-router-dom";
import { useLoading } from "../../context/loading_context";
import validator from "validator";
import { getUserVideos, VideoData, VideoOrderBy } from "../../services/video";
import { format } from "timeago.js";

export const Profile = () => {
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const imgRef = useRef<HTMLImageElement>(null);
  const [bgColor, setBgColor] = useState("rgb(255, 0, 0)");
  const { email } = useParams();
  const loading = useLoading();
  const navigate = useNavigate();
  const [otherUserData, setOtherUserData] = useState<UserData>();
  const [videosData, setVideosData] = useState<VideoData[]>([]);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [orderBy, setOrderBy] = useState(VideoOrderBy.Recent);

  useEffect(() => {
    if (otherUserData) getBgColor(`${baseUrl}/${otherUserData.avatar}`);
  }, [otherUserData]);

  const getBgColor = async (src: string) => {
    const newColor = await getAverageRGB(src);
    setBgColor(newColor);
  };

  useEffect(() => {
    if (email && validator.isEmail(email)) getUserData(email);
    else navigate("/");
  }, []);

  const getUserData = async (email: string) => {
    loading.show();
    try {
      const [userData, videos] = await Promise.all([
        GetUserDataByEmail(email),
        getUserVideos(email, page, rows, orderBy),
      ]);

      setOtherUserData(userData);
      setVideosData(videos);
    } catch (error) {}
    loading.hide();
  };

  const loadMoreVideos = async (email: string, page: number) => {
    loading.show();
    try {
      const videos = await getUserVideos(email, page, rows, orderBy);
      const newVideos = videosData;
      newVideos.push(...videos);
      setVideosData([...newVideos]);
    } catch (error) {}
    loading.hide();
  };

  const loadChangeOrderVideos = async (
    email: string,
    page: number,
    orderBy: number
  ) => {
    loading.show();
    try {
      const videos = await getUserVideos(email, page, rows, orderBy);
      setVideosData(videos);
    } catch (error) {}
    loading.hide();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          height: "150px",
          background: bgColor,
          position: "relative",
        }}
      >
        <Box
          component="img"
          src={`${baseUrl}/${otherUserData?.avatar}`}
          sx={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            position: "absolute",
            left: "50%",
            top: "100%",
            transform: "translate(-50%, -50%)",
          }}
          ref={imgRef}
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          p: "20px",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "20px" }}>
            {otherUserData?.name}
          </Typography>
          <Typography sx={{ color: "rgba(183, 185, 210, 0.7)" }}>
            {otherUserData?.subsCount} followers
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{
            color: "#FFF",
            background: "#FF7551",
            borderRadius: "5px",
            height: "50px",
            width: "150px",
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
      <Box sx={{ display: "flex", alignItems: "center", p: "20px" }}>
        <Typography>Order by: </Typography>
        <Select
          sx={{
            background: "#FFF",
            ml: "10px",
          }}
          value={orderBy}
          onChange={(e: any) => {
            if (email && validator.isEmail(email)) {
              setOrderBy(e.target.value);
              setPage(1);
              loadChangeOrderVideos(email, 1, e.target.value);
            }
          }}
        >
          {(
            Object.keys(VideoOrderBy).filter((v) => !isNaN(Number(v))) as Array<
              keyof typeof VideoOrderBy
            >
          ).map((key) => (
            <MenuItem value={Number(key)}>{VideoOrderBy[key]}</MenuItem>
          ))}
        </Select>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          mt: "15px"
        }}
      >
        {videosData.map((video) => (
          <Box
            sx={{
              m: "10px",
              transition: "0.5s",
              cursor: "pointer",
              "&:hover": {
                filter: "brightness(120%)",
              },
            }}
            onClick={() => navigate(`/video/${video.id}`)}
          >
            <Box
              sx={{
                width: "250px",
                height: "175px",
                backgroundImage: `url(${baseUrl}/${video.thumbnail})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 100%",
                borderRadius: "6px",
              }}
            ></Box>
            <Typography sx={{ mt: "3px" }}>{video.title}</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ fontSize: "13px" }}>
                {video.viewsCount} views •{" "}
              </Typography>
              <Typography
                sx={{ ml: "5px", color: "#808191", fontSize: "12px" }}
              >
                {format(video.createdAt)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      {videosData.length % rows === 0 && (
        <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
          <Button
            variant="contained"
            sx={{
              color: "#FFF",
              background: "#FF7551",
              borderRadius: "5px",
              height: "50px",
              width: "150px",
              mt: "30px",
              textTransform: "none",
              "&.MuiButtonBase-root:hover": {
                background: "#FF7551",
              },
            }}
            onClick={() => {
              if (email && validator.isEmail(email)) {
                loadMoreVideos(email, page + 1);
                setPage((page) => page + 1);
              }
            }}
          >
            Load more
          </Button>
        </Box>
      )}
    </Box>
  );
};
