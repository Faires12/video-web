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
import { Comment, CreateVideoComment, GetComment, GetCommentResponses, GetVideoComments } from "../../services/comment";
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
    HandleGetVideoComments(commentsPage, commentsRows);
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

  const HandleGetVideoComments = async (page: number, rows: number) => {
    try {
      loading.show();
      const res = await GetVideoComments(
        Number(id),
        page,
        rows
      );
      const c = [...comments]
      c.push(...res)
      setComments([...c]);
    } catch (error) {}
    loading.hide();
  };

  const handleChangeCommentEvaluation = async (
    commentId: number,
    isPositive: boolean,
    isResponse: boolean,
    mainCommentId?: number
  ) => {
    if (!isLogged()) return;

    try {
      loading.show();
      const newComment = await PostCommentEvaluation(commentId, isPositive);
      const newComments = [...comments]
      if(!isResponse){
        const index = newComments.findIndex((c) => c.id === commentId);
        newComments[index] = newComment;
      } else {
        const mainIndex = newComments.findIndex((c) => c.id === mainCommentId);
        newComments[mainIndex].responses = newComments[mainIndex].responses?.map((c) => {
          if(c.id === newComment.id)
            c = newComment
          return c
        })
      }
      setComments([...newComments]);
    } catch (error) {}
    loading.hide();
  };

  const sendNewComment = async (content: string) => {
    loading.show()
    try {
      const comment = await CreateVideoComment(Number(id), content)
      const newComments = [...comments];
      newComments.unshift(comment)
      setComments([...newComments]);
    } catch (error) {
      
    }
    loading.hide()
  }

  const loadCommentResponses = async (commentId: number, page: number) => {
    loading.show()
    try {
      const responses = await GetCommentResponses(commentId, page, 5)
      const newComments = [...comments];
      const index = newComments.findIndex(c => c.id === commentId)
      newComments[index].responses?.push(...responses)
      setComments([...newComments]);
    } catch (error) {
      
    }
    loading.hide()
  }

  window.onscroll = () => {
    if(!videoData)
      return
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        if(videoData.commentCount > comments.length) {
          HandleGetVideoComments(commentsPage + 1, commentsRows)
          setCommentsPage((prevPage) => prevPage + 1)
        }        
    }
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
          sendNewComment={sendNewComment}
          loadCommentResponses={loadCommentResponses}
        />
      </Box>
    </Box>
  );
};

export default Video;
