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
import { VideoList } from "../../components/VideoList";
import { GetSubscription, ManageSubscription } from "../../services/subscription";
import { isLogged } from "../../services/auth";

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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const {userData} = useUserData()

  useEffect(() => {
    if (otherUserData) getBgColor(`${baseUrl}/${otherUserData.avatar}`);
  }, [otherUserData]);

  const getBgColor = async (src: string) => {
    const newColor = await getAverageRGB(src);
    setBgColor(newColor);
  };

  useEffect(() => {
    if (email && validator.isEmail(email)) {
      getUserData(email);

    }
    else navigate("/");
  }, [userData]);

  const getUserData = async (email: string) => {
    if(isLogged() && !userData.email)
      return
    loading.show();
    try {
      const [user, videos] = await Promise.all([
        GetUserDataByEmail(email),
        getUserVideos(email, page, rows, orderBy),
      ]);

      if(user.email !== userData.email && isLogged()){
        const subscription = await GetSubscription(email)
        setIsSubscribed(subscription)
      }  
      setOtherUserData(user);
      setVideosData(videos);
    } catch (error) {}
    loading.hide();
  };

  const handleSubscription = async () => {
    if (!otherUserData) return;

    try {
      loading.show();
      const res = await ManageSubscription(otherUserData.email);
      const user = await GetUserDataByEmail(otherUserData.email)
      setIsSubscribed(res);
      setOtherUserData(user)
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

  const changePage = () => {
    if (email && validator.isEmail(email)) {
      loadMoreVideos(email, page + 1);
      setPage((page) => page + 1);
    }
  };

  const changeOrderBy = (order: number) => {
    if (email && validator.isEmail(email)) {
      setOrderBy(order);
      setPage(1);
      loadChangeOrderVideos(email, 1, order);
    }
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
        {otherUserData?.email !== userData.email && <Button
          variant="contained"
          sx={{
            color: "#FFF",
            background: isSubscribed ? 'blue' : "#FF7551",
            borderRadius: "5px",
            height: "50px",
            width: "150px",
            ml: "30px",
            textTransform: "none",
            "&.MuiButtonBase-root:hover": {
              background: isSubscribed ? 'blue' : "#FF7551",
            },
          }}
          onClick={handleSubscription}
        >
          {isSubscribed ? 'Following' : 'Follow'}
        </Button>}
      </Box>
      <VideoList
        changePage={changePage}
        orderBy={orderBy}
        rows={rows}
        videosData={videosData}
        changeOrderBy={changeOrderBy}
        flexDirection={"row"}
      />
    </Box>
  );
};
