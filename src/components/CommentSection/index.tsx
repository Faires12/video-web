import React, {useEffect, useState} from "react";
import { Comment } from "../../services/comment";
import { Box } from "@mui/system";
import { Typography } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { format } from 'timeago.js';
import { useLoading } from "../../context/loading_context";

interface CommentBoxProps{
  comment: Comment
  handleChangeCommentEvaluation(commentId: number, isPositive: boolean) : Promise<void>
}

const CommentBox = ({comment, handleChangeCommentEvaluation}: CommentBoxProps) => {
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const loading = useLoading();

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mt: '30px' }}>
      <Box sx={{ color: "#80819", fontSize: "12px" }}>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <Box sx={{ mr: "15px" }}>{comment.likesCount}</Box>
          <ThumbUpIcon
            sx={{ color: comment.evaluation ? "blue" : "#80819", cursor: "pointer" }}
            onClick={() => handleChangeCommentEvaluation(comment.id, true)}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end", mt: "5px" }}>
          <Box sx={{ mr: "15px" }}>{comment.deslikesCount}</Box>
          <ThumbDownIcon
            sx={{ color: comment.evaluation === false ? "blue" : "#80819", cursor: "pointer" }}
            onClick={() => handleChangeCommentEvaluation(comment.id, false)}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", ml: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src={`${baseUrl}/${comment.created_by.avatar}`}
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ color: "#CFD1D2", fontSize: "14px" }}>
              {comment.created_by.name}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(183, 185, 210, 0.7)",
                  fontSize: "12px",
                  ml: "10px",
                }}
              >
                {format(comment.createdAt)}
              </Typography>
              <Typography
                sx={{
                  color: "#FFF",
                  fontSize: "12px",
                  ml: "10px",
                  cursor: "pointer",
                }}
              >
                Reply
              </Typography>
            </Box>
            <Typography sx={{ color: "#AEAFB7", fontSize: "13px", mt: "5px" }}>
              {comment.content}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            color: "#FFF",
            fontSize: "12px",
            alignItems: "center",
            mt: "5px",
            cursor: "pointer",
          }}
        >
          <ArrowDropDownIcon />
          <Box>{comment.commentCount} replies</Box>
        </Box>
      </Box>
    </Box>
  );
};

  

interface Props {
  comments: Comment[];
  commentCount: number;
  handleChangeCommentEvaluation(commentId: number, isPositive: boolean) : Promise<void>
}

export const CommentSection = ({ comments, commentCount, handleChangeCommentEvaluation}: Props) => {
  return (
    <Box sx={{ width: "100%", my: "40px" }}>
      <Typography sx={{ fontSize: "16px", fontWeight: "600", mb: "25px" }}>
        {commentCount} comments
      </Typography>
      {
        comments.map(comment => (
          <CommentBox comment={comment} handleChangeCommentEvaluation={handleChangeCommentEvaluation}/>
        ))
      }
    </Box>
  );
};
