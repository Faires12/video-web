import React, { useRef, useState, useEffect } from "react";
import { Box } from "@mui/system";
import { TextField, Typography, Menu, MenuItem } from "@mui/material";
import { ChatInfo } from "../../services/chat";
import { useSnack } from "../../context/snack_context";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { format } from "timeago.js";
import { SelectVideoModal } from "../SelectVideoModal";
import { VideoData } from "../../services/video";
import { VideoInChat } from "../VideoInChat";

interface Props {
  getOlderChatMessages(): void;
  typingString: string;
  selectedChat: ChatInfo;
  typingEvent(): void;
  sendMessage(message: string, file?: string): void;
  sendVideoMessage(video: VideoData): void;
  handleSetVideoReferenceEvaluation(messageId: number, e: boolean | null, likesCount?: number, deslikesCount?: number): void
}

export const ChatBody = ({
  selectedChat,
  getOlderChatMessages,
  typingString,
  typingEvent,
  sendMessage,
  sendVideoMessage,
  handleSetVideoReferenceEvaluation
}: Props) => {
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openSendFileMenu = Boolean(anchorEl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileBase64, setFileBase64] = useState("");
  const [fileType, setFileType] = useState<"image" | "video" | "pdf">("image");
  const [fileName, setFileName] = useState("");
  const snack = useSnack();
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const [openSelectVideoModal, setOpenSelectVideoModal] = useState(false);
  const [videoRef, setVideoRef] = useState<VideoData>();

  const checkPreviusMessage = (index: number) => {
    if (!selectedChat) return false;
    if (!selectedChat.messages[index + 1]) return false;
    if (
      selectedChat.messages[index + 1].created_by.email ===
      selectedChat.messages[index].created_by.email
    ) {
      const diff = Math.abs(
        new Date(selectedChat.messages[index + 1].createdAt).getTime() -
          new Date(selectedChat.messages[index].createdAt).getTime()
      );
      const minutes = Math.floor(diff / 1000 / 60);
      if (minutes <= 5) return true;
    }
    return false;
  };

  function encodeImageFileAsURL(element: File) {
    var file = element;
    var reader = new FileReader();
    reader.onloadend = function () {
      if (typeof reader.result === "string") {
        setFileBase64(reader.result);
        const type = reader.result.split(",")[0];
        if (type.includes("image")) setFileType("image");
        else if (type.includes("pdf")) setFileType("pdf");
        else if (type.includes("video")) setFileType("video");
        setFileName(element.name);
      }
    };
    reader.readAsDataURL(file);
  }

  const getFileElement = (fileRef: string) => {
    const ext = fileRef.split(".").pop();
    if (ext === "jpg" || ext === "png" || ext === "gif")
      return (
        <img
          style={{ maxWidth: "400px", marginTop: "5px", marginLeft: "40px" }}
          src={`${baseUrl}/${fileRef}`}
        />
      );
    else if (ext === "pdf")
      return (
        <embed
          style={{ maxWidth: "400px", marginTop: "5px", marginLeft: "40px" }}
          src={`${baseUrl}/${fileRef}`}
        />
      );
    else if (ext === "mp4")
      return (
        <video
          style={{ maxWidth: "400px", marginTop: "5px", marginLeft: "40px" }}
          src={`${baseUrl}/${fileRef}`}
          controls
        />
      );
  };

  useEffect(() => {
    if (!selectedChat || !newMessage) return;
    typingEvent();
  }, [newMessage]);

  useEffect(() => {
    setNewMessage("");
    setFileBase64("");
  }, [selectedChat]);

  return (
    <>
      <SelectVideoModal
        open={openSelectVideoModal}
        close={() => setOpenSelectVideoModal(false)}
        returnVideo={(video: VideoData) => {
          sendVideoMessage(video);
          setOpenSelectVideoModal(false);
        }}
      />
      <Box
        sx={{
          width: "100%",
          flexGrow: "1",
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
          position: "relative",
        }}
        ref={messageBoxRef}
        onScroll={(e) => {
          if (!messageBoxRef.current) return;
          if (
            messageBoxRef.current?.scrollTop +
              messageBoxRef.current?.scrollHeight <=
            messageBoxRef.current?.offsetHeight
          )
            getOlderChatMessages();
        }}
      >
        {fileBase64 && (
          <Box
            sx={{
              position: "fixed",
              width: "300px",
              top: "100px",
              right: "30px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {fileType === "image" ? (
              <img src={fileBase64} style={{ width: "100%" }} />
            ) : fileType === "video" ? (
              <video controls src={fileBase64} style={{ width: "100%" }} />
            ) : (
              <embed src={fileBase64} style={{ width: "100%" }} />
            )}
            <Box
              sx={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#FFF",
                padding: "5px",
                fontSize: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {fileName}
              <ClearOutlinedIcon
                onClick={() => setFileBase64("")}
                sx={{ cursor: "pointer" }}
              />
            </Box>
          </Box>
        )}
        {typingString && (
          <Typography
            sx={{
              mt: "10px",
              px: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {typingString}
            <Box
              component="img"
              src={"/loading.gif"}
              sx={{
                ml: "10px",
                width: "25px",
              }}
            />
          </Typography>
        )}
        {selectedChat?.messages.map((message, index) => (
          <Box
            sx={{
              width: "100%",
              px: "20px",
              mt: !checkPreviusMessage(index) ? "20px" : "0px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <Box
                component="img"
                src={`${baseUrl}/${message.created_by.avatar}`}
                sx={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  mr: "10px",
                  display: checkPreviusMessage(index) ? "none" : "block",
                }}
              />
              <Box>
                <Box
                  sx={{
                    display: checkPreviusMessage(index) ? "none" : "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ color: "#CFD1D2", fontSize: "14px" }}>
                    {message.created_by.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(183, 185, 210, 0.7)",
                      fontSize: "12px",
                      ml: "10px",
                    }}
                  >
                    {format(message.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    wordBreak: "break-word",
                    ml: checkPreviusMessage(index) ? "40px" : "0px",
                  }}
                >
                  {message.content}
                </Typography>
              </Box>
            </Box>
            {message.fileRef && getFileElement(message.fileRef)}
            {message.videoRef && <VideoInChat video={message.videoRef}
            setEvaluation={(e: boolean | null, likesCount?: number, deslikesCount?: number) => {
              handleSetVideoReferenceEvaluation(message.id, e, likesCount, deslikesCount)
            }}/>}
          </Box>
        ))}
      </Box>
      {selectedChat && (
        <>
          <input
            type="file"
            style={{ display: "none" }}
            ref={fileRef}
            accept="image/png, image/jpeg, image/gif, video/mp4, application/pdf"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              if (!file) return;
              if (file.size > 5000000) {
                snack.error("The file need to be at max 5mb");
                return;
              }
              encodeImageFileAsURL(file);
            }}
          />
          <Menu
            anchorEl={anchorEl}
            open={openSendFileMenu}
            onClose={() => setAnchorEl(null)}
            sx={{ mb: "10px" }}
          >
            <MenuItem
              onClick={() => {
                fileRef.current?.click();
                setAnchorEl(null)
              }}
            >
              Select file
            </MenuItem>
            <MenuItem
              onClick={() => {
                setOpenSelectVideoModal(true);
                setAnchorEl(null);
              }}
            >
              Share video
            </MenuItem>
          </Menu>
          <Box sx={{ display: "flex" }}>
            <Box
              sx={{
                width: "5%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#FFF",
                cursor: "pointer",
              }}
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              +
            </Box>
            <TextField
              sx={{
                flexGrow: "1",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#FFF",
                outline: "none",
                input: { color: "#FFF", outline: "hidden" },
              }}
              placeholder="Mensagem"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter" && newMessage && selectedChat) {
                  sendMessage(newMessage, fileBase64);
                  setNewMessage("");
                  setFileBase64("");
                }
              }}
            />
          </Box>
        </>
      )}
    </>
  );
};
