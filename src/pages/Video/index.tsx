import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import { Typography, Button } from "@mui/material";
import MainVideo from "../../components/MainVideo";
import { getVideo, VideoData } from "../../services/video";
import { useNavigate, useParams } from "react-router-dom";
import { useLoading } from "../../context/loading_context";
import { useSnack } from "../../context/snack_context";
import {
  GetCommentEvaluation,
  GetVideoEvaluation,
  PostCommentEvaluation,
  PostVideoEvaluation,
} from "../../services/evaluation";
import { isLogged } from "../../services/auth";
import { Comment, GetComment, GetVideoComments } from "../../services/comment";
import { CommentSection } from "../../components/CommentSection";

const Video = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState<VideoData>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsRows, setCommentsRows] = useState(10);
  const loading = useLoading();
  const snack = useSnack();

  useEffect(() => {
    getVideoData();
    HandleGetVideoComments();
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

  const handleChangeEvaluation = async (isPositive: boolean) => {
    if (!isLogged()) return;

    try {
      loading.show();
      const video = await PostVideoEvaluation(Number(id), isPositive);
      setVideoData(video);
    } catch (error) {}
    loading.hide();
  };

  const HandleGetVideoComments = async () => {
    try {
      loading.show();
      const res = await GetVideoComments(
        Number(id),
        commentsPage,
        commentsRows
      );
      setComments(res);
    } catch (error) {}
    loading.hide();
  };

  const handleChangeCommentEvaluation = async (
    commentId: number,
    isPositive: boolean
  ) => {
    if (!isLogged()) return;

    try {
      loading.show();
      const newComment = await PostCommentEvaluation(commentId, isPositive);
      const newComments = [...comments];
      const index = newComments.findIndex((c) => c.id === commentId);
      newComments[index] = newComment;
      setComments([...newComments]);
    } catch (error) {}
    loading.hide();
  };

  return (
    <Box sx={{ width: "100%", display: "flex", pt: "20px", pl: "40px" }}>
      <Box sx={{ width: "70%" }}>
        <MainVideo
          videoData={videoData}
          handleChangeEvaluation={handleChangeEvaluation}
        />
        <CommentSection
          commentCount={videoData?.commentCount ?? 0}
          comments={comments}
          handleChangeCommentEvaluation={handleChangeCommentEvaluation}
        />
      </Box>
    </Box>
  );
};

export default Video;
