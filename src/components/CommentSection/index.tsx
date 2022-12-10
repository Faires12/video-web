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
import { UserData } from "../../services/user";
import { DeleteModal } from "../DeleteModal";

interface CommentBoxProps {
  comment: Comment;
  handleChangeCommentEvaluation(
    commentId: number,
    isPositive: boolean,
    isResponse: boolean,
    mainCommentId?: number
  ): Promise<void>;
  loadCommentResponses?(commentId: number, page: number): Promise<void>;
  sendNewCommentResponse?(commentId: number, content: string): Promise<void>;
  isResponse: boolean;
  mainCommentId?: number;
  handleEditComment(
    commentId: number,
    content: string,
    isResponse: boolean,
    mainCommentId?: number
  ): Promise<void>;
  handleDeleteComment(
    commentId: number,
    isResponse: boolean,
    mainCommentId?: number
  ): Promise<void>;
}

const CommentBox = ({
  comment,
  handleChangeCommentEvaluation,
  loadCommentResponses,
  isResponse,
  mainCommentId,
  sendNewCommentResponse,
  handleEditComment,
  handleDeleteComment
}: CommentBoxProps) => {
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState(false);
  const [responding, setResponding] = useState(false);
  const [newComment, setNewComment] = useState("");
  const snack = useSnack();
  const { userData } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const editRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  const keyPressEvent = async (e: any) => {
    if (e.key === "Enter") {
      if (newComment.length < 5) {
        snack.error("The comment have to be at least 5 characteres");
        return;
      }
      if (newComment.length > 200) {
        snack.error("The comment can have 200 max");
        return;
      }
      if(newComment === comment.content){
        return;
      }
      sendNewCommentResponse && sendNewCommentResponse(comment.id, newComment);
      setNewComment("");
      setResponding(false);
    }
  };

  const keyPressEditEvent = async (e: any) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
    if (e.key === "Enter") {
      if (editValue.length < 5) {
        snack.error("The comment have to be at least 5 characteres");
        return;
      }
      if (editValue.length > 200) {
        snack.error("The comment can have 200 max");
        return;
      }
      handleEditComment(comment.id, editValue, isResponse, mainCommentId);
      setIsEditing(false);
      setEditValue("")
    }
  };

  const changeToEdit = () => {
    if (userData.email === comment.created_by.email) {
      setIsEditing(true);
      setEditValue(comment.content);
    }
  };

  const changeToDelete = () => {
    if (userData.email === comment.created_by.email) {
      setIsDeleting(true);
    }
  };

  
  const handleClickOutside = (event: any) => {
    if (editRef.current && !editRef.current.contains(event.target)) {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <>
      <DeleteModal
        open={isDeleting}
        close={() => setIsDeleting(false)}
        okClick={() => handleDeleteComment(comment.id, isResponse, mainCommentId)}
        title="Deltar comentário"
        description="Tem certeza que quer deletar o comentário?"
      />
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
          <Box sx={{ display: "flex" }}>
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
                    onClick={() => setResponding((prev) => !prev)}
                  >
                    Reply
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontSize: "12px",
                    ml: "10px",
                    cursor: "pointer",
                    color: "red",
                  }}
                  onClick={changeToDelete}
                >
                  Delete
                </Typography>
              </Box>
              {!isEditing ? (
                <Typography
                  sx={{
                    color: "#AEAFB7",
                    fontSize: "13px",
                    mt: "5px",
                    wordBreak: "break-word",
                  }}
                  onClick={changeToEdit}
                >
                  {comment.content}
                </Typography>
              ) : (
                <TextField
                  sx={{
                    border: "none",
                    borderBottom: "2px solid rgba(255, 255, 255, 0.05)",
                    input: { color: "#FFF", outline: "hidden" },
                    mt: "10px",
                    width: "100%",
                  }}
                  inputRef={editRef}
                  value={editValue}
                  onKeyDown={keyPressEditEvent}
                  onChange={(e) => setEditValue(e.target.value)}
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
              )}
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
                    loadCommentResponses &&
                      loadCommentResponses(comment.id, page);
                    setPage((prevPage) => prevPage + 1);
                  } else if (
                    comment.commentCount > 0 &&
                    comment.responses &&
                    comment.responses?.length > 0
                  ) {
                    setHidden((prevHidden) => !prevHidden);
                  }
                }}
              >
                {comment.commentCount} replies
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      {responding && (
        <Box sx={{ width: "100%", mt: "30px", ml: "30px" }}>
          <NewCommentInput
            keyPressEvent={keyPressEvent}
            value={newComment}
            setValue={setNewComment}
            userData={userData}
          />
        </Box>
      )}
      {!isResponse && !hidden && (
        <>
          {comment.responses?.map((c) => (
            <CommentBox
              comment={c}
              handleChangeCommentEvaluation={handleChangeCommentEvaluation}
              isResponse={true}
              mainCommentId={comment.id}
              handleEditComment={handleEditComment}
              handleDeleteComment={handleDeleteComment}
            />
          ))}
          {comment.responses &&
            comment.responses.length > 0 &&
            comment.responses.length < comment.commentCount && (
              <Typography
                onClick={() => {
                  loadCommentResponses &&
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

interface NewCommentInputProps {
  userData: Partial<UserData>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  keyPressEvent(e: any): void;
}

const NewCommentInput = ({
  userData,
  value,
  setValue,
  keyPressEvent,
}: NewCommentInputProps) => {
  return (
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
          value={value}
          onKeyDown={keyPressEvent}
          onChange={(e) => setValue(e.target.value)}
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
  sendNewCommentResponse(commentId: number, content: string): Promise<void>;
  handleEditComment(
    commentId: number,
    content: string,
    isResponse: boolean,
    mainCommentId?: number
  ): Promise<void>;
  handleDeleteComment(
    commentId: number,
    isResponse: boolean,
    mainCommentId?: number
  ): Promise<void>;
}

export const CommentSection = ({
  comments,
  commentCount,
  handleChangeCommentEvaluation,
  sendNewComment,
  loadCommentResponses,
  sendNewCommentResponse,
  handleEditComment,
  handleDeleteComment
}: Props) => {
  const { userData } = useUserData();
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
    <Box sx={{ width: "100%", my: "40px", px: { xs: "10px", md: "0" } }}>
      <Typography sx={{ fontSize: "16px", fontWeight: "600", mb: "25px" }}>
        {commentCount} comments
      </Typography>
      <NewCommentInput
        keyPressEvent={keyPressEvent}
        value={newComment}
        setValue={setNewComment}
        userData={userData}
      />
      {comments.map((comment) => (
        <CommentBox
          comment={comment}
          handleChangeCommentEvaluation={handleChangeCommentEvaluation}
          loadCommentResponses={loadCommentResponses}
          sendNewCommentResponse={sendNewCommentResponse}
          isResponse={false}
          handleEditComment={handleEditComment}
          handleDeleteComment={handleDeleteComment}
        />
      ))}
    </Box>
  );
};
