import React, { useEffect, useRef, useState } from "react";
import { Comment } from "../../services/comment";
import { Box } from "@mui/system";
import { TextField, Typography } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { format } from "timeago.js";
import { useLoading } from "../../context/loading_context";
import { useUserData } from "../../context/user_data_context";
import { useSnack } from "../../context/snack_context";

interface CommentBoxProps {
  comment: Comment;
  handleChangeCommentEvaluation(
    commentId: number,
    isPositive: boolean,
    isResponse: boolean,
    mainCommentId?: number
  ): Promise<void>;
  loadCommentResponses(commentId: number, page: number): Promise<void>;
  isResponse: boolean;
  mainCommentId?: number;
}

const CommentBox = ({
  comment,
  handleChangeCommentEvaluation,
  loadCommentResponses,
  isResponse,
  mainCommentId,
}: CommentBoxProps) => {
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const loading = useLoading();
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          mt: "30px",
          ml: isResponse ? "30px" : "0px",
        }}
      >
        <Box sx={{ color: "#80819", fontSize: "12px" }}>
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <Box sx={{ mr: "15px" }}>{comment.likesCount}</Box>
            <ThumbUpIcon
              sx={{
                color: comment.evaluation ? "blue" : "#80819",
                cursor: "pointer",
              }}
              onClick={() =>
                handleChangeCommentEvaluation(
                  comment.id,
                  true,
                  isResponse,
                  mainCommentId
                )
              }
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-end", mt: "5px" }}>
            <Box sx={{ mr: "15px" }}>{comment.deslikesCount}</Box>
            <ThumbDownIcon
              sx={{
                color: comment.evaluation === false ? "blue" : "#80819",
                cursor: "pointer",
              }}
              onClick={() =>
                handleChangeCommentEvaluation(
                  comment.id,
                  false,
                  isResponse,
                  mainCommentId
                )
              }
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
                {!isResponse && (
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
                )}
              </Box>
              <Typography
                sx={{ color: "#AEAFB7", fontSize: "13px", mt: "5px" }}
              >
                {comment.content}
              </Typography>
            </Box>
          </Box>
          {!isResponse && (
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
              <Box
                onClick={() => {
                  if (
                    comment.commentCount > 0 &&
                    comment.responses &&
                    comment.responses?.length === 0
                  ) {
                    loadCommentResponses(comment.id, page);
                    setPage((prevPage) => prevPage + 1);
                  } else if (
                    comment.commentCount > 0 &&
                    comment.responses &&
                    comment.responses?.length > 0
                  ) {
                    setHidden((prevHidden) => !prevHidden)
                  }
                }}
              >
                {comment.commentCount} replies
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      {!isResponse && !hidden && (
        <>
          {comment.responses?.map((c) => (
            <CommentBox
              comment={c}
              handleChangeCommentEvaluation={handleChangeCommentEvaluation}
              loadCommentResponses={loadCommentResponses}
              isResponse={true}
              mainCommentId={comment.id}
            />
          ))}
          {comment.responses &&
            comment.responses.length > 0 &&
            comment.responses.length < comment.commentCount && (
              <Typography
                onClick={() => {
                  loadCommentResponses(comment.id, page);
                  setPage((prevPage) => prevPage + 1);
                }}
                sx={{
                  ml: "30px",
                  mt: "10px",
                  textDecoration: "underline",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Load more
              </Typography>
            )}
        </>
      )}
    </>
  );
};

interface Props {
  comments: Comment[];
  commentCount: number;
  handleChangeCommentEvaluation(
    commentId: number,
    isPositive: boolean,
    isResponse: boolean,
    mainCommentId?: number
  ): Promise<void>;
  sendNewComment(content: string): Promise<void>;
  loadCommentResponses(commentId: number, page: number): Promise<void>;
}

export const CommentSection = ({
  comments,
  commentCount,
  handleChangeCommentEvaluation,
  sendNewComment,
  loadCommentResponses,
}: Props) => {
  const { userData } = useUserData();
  const textFieldRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState("");
  const snack = useSnack();

  const keyPressEvent = (e: any) => {
    if (e.key === "Enter") {
      if (newComment.length < 5) {
        snack.error("The comment have to be at least 5 characteres");
        return;
      }
      if (newComment.length > 200) {
        snack.error("The comment can have 200 max");
        return;
      }
      sendNewComment(newComment);
      setNewComment("");
    }
  };

  return (
    <Box sx={{ width: "100%", my: "40px" }}>
      <Typography sx={{ fontSize: "16px", fontWeight: "600", mb: "25px" }}>
        {commentCount} comments
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src={`${process.env.REACT_APP_MEDIA_ENDPOINT}/${userData.avatar}`}
          sx={{ width: "40px", height: "40px", borderRadius: "50%" }}
        />
        <Box sx={{ ml: "20px", width: "100%" }}>
          <Typography sx={{ color: "#CFD1D2" }}>{userData.name}</Typography>
          <TextField
            sx={{
              border: "none",
              borderBottom: "2px solid rgba(255, 255, 255, 0.05)",
              input: { color: "#FFF", outline: "hidden" },
              mt: "10px",
              width: "70%",
            }}
            ref={textFieldRef}
            value={newComment}
            onKeyDown={keyPressEvent}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write an comment..."
            inputProps={{
              style: {
                padding: 2,
                fontSize: 13,
                color: "#FFF",
              },
              maxLength: 200,
            }}
          />
        </Box>
      </Box>
      {comments.map((comment) => (
        <CommentBox
          comment={comment}
          handleChangeCommentEvaluation={handleChangeCommentEvaluation}
          loadCommentResponses={loadCommentResponses}
          isResponse={false}
        />
      ))}
    </Box>
  );
};
