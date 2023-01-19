import { Box } from "@mui/system";
import { Menu, MenuItem, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useUserData } from "../../context/user_data_context";
import {
  ChatInfo,
  getChatMessages,
  getUserChats,
  MessageInfo,
} from "../../services/chat";
import { useSocket } from "../../context/socket_context";
import { useLoading } from "../../context/loading_context";
import { format } from "timeago.js";
import { useSnack } from "../../context/snack_context";
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

interface TypingResponse {
  users: {
    email: string;
    name: string;
  }[];
  chat: ChatInfo;
}

export const Chats = () => {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInfo>();
  const { userData } = useUserData();
  const { socket } = useSocket();
  const loading = useLoading();
  const [newMessage, setNewMessage] = useState("");
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(40);
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const [typingString, setTypingString] = useState("");
  const newMessagesNumber = useRef<number>(0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openSendFileMenu = Boolean(anchorEl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileBase64, setFileBase64] = useState("");
  const [fileType, setFileType] = useState<"image" | "video" | "pdf">("image");
  const [fileName, setFileName] = useState("");
  const snack = useSnack();

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
        setFileName(element.name)
      }
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    getChats();

    return () => {
      socket.off("recieve_message");
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    socket.off("recieve_message");
    socket.off("other_typing");

    socket.on("recieve_message", (message: MessageInfo) => {
      if (message.chat.id !== selectedChat.id) return;
      const newChat = selectedChat;
      newChat.messages.unshift(message);
      setSelectedChat({ ...newChat });
      newMessagesNumber.current += 1;
    });

    socket.on("other_typing", (res: TypingResponse) => {
      if (res.chat.id !== selectedChat.id) return;
      let newTypingString = "";

      const users = [...res.users];
      const index = users.findIndex((u) => u.email === userData.email);
      index >= 0 && users.splice(index, 1);

      for (let i = 0; i < users.length; i++) {
        newTypingString += `${users[i].name}${
          users.length > 1 && i < users.length - 1 ? "," : ""
        } `;
      }
      if (newTypingString)
        newTypingString += `${users.length === 1 ? "is" : "are"} typing`;
      setTypingString(newTypingString);
    });
  }, [selectedChat]);

  const getChats = async () => {
    loading.show();
    try {
      const res = await getUserChats();
      setChats(res);
    } catch (error) {}
    loading.hide();
  };

  const getPersonalChatName = (chat: ChatInfo) => {
    for (const user of chat.users) {
      if (user.email === userData.email) continue;
      return user.name;
    }

    return "";
  };

  const getPersonalChatAvatar = (chat: ChatInfo) => {
    for (const user of chat.users) {
      if (user.email === userData.email) continue;
      return user.avatar;
    }

    return "";
  };

  const handleClickNewChat = async (chat: ChatInfo) => {
    loading.show();
    try {
      const res = await getChatMessages({
        chatId: chat.id,
        page: 1,
        rows: rows,
      });
      chat.messages = res;
      setSelectedChat({ ...chat });
      setPage(1);
      setTypingString("");
      setFileBase64("")
      setNewMessage("")
      newMessagesNumber.current = 0;
    } catch (error) {}
    loading.hide();
  };

  const getOlderChatMessages = async () => {
    if (!selectedChat) return;
    if (
      (selectedChat.messages.length - newMessagesNumber.current) % rows !== 0 ||
      selectedChat.messages.length - newMessagesNumber.current === 0
    )
      return;
    loading.show();
    try {
      const res = await getChatMessages({
        chatId: selectedChat.id,
        page: page + newMessagesNumber.current / rows + 1,
        rows: rows,
      });
      const newChat = selectedChat;
      newChat.messages.push(...res);
      setSelectedChat({ ...newChat });
      setPage((prev) => prev + 1);
    } catch (error) {}
    loading.hide();
  };

  const checkPreviusMessage = (index: number) => {
    if (!selectedChat) return false;
    if (!selectedChat.messages[index + 1]) return false;
    if (
      selectedChat.messages[index + 1].created_by.email ===
      selectedChat.messages[index].created_by.email
    ) {
      const diff = Math.abs(new Date(selectedChat.messages[index + 1].createdAt).getTime() - new Date(selectedChat.messages[index].createdAt).getTime())
      const minutes = Math.floor((diff/1000)/60);
      if(minutes <= 5)
        return true;
    }
    return false;
  };

  useEffect(() => {
    if (!selectedChat || !newMessage) return;

    socket.emit("typing", {
      id: selectedChat.id,
      users: selectedChat.users,
    });
  }, [newMessage]);

  const getFileElement = (fileRef: string) => {
    const ext = fileRef.split('.').pop()
    if(ext === "jpg" || ext === "png" || ext === "gif")
      return <img style={{maxWidth: '400px', marginTop: '5px', marginLeft: '40px'}} src={`${baseUrl}/${fileRef}`}/>
    else if(ext === "pdf")
      return <embed style={{maxWidth: '400px', marginTop: '5px', marginLeft: '40px'}} src={`${baseUrl}/${fileRef}`}/>
    else if(ext === "mp4")
      return <video style={{maxWidth: '400px', marginTop: '5px', marginLeft: '40px'}} src={`${baseUrl}/${fileRef}`} controls/>
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "absolute",
        display: "flex",
        borderTop: "1px solid white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid white",
          borderLeft: "1px solid white",
        }}
      >
        {chats.map((chat) => (
          <Box
            sx={{
              padding: "15px",
              borderBottom: "1px solid white",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => handleClickNewChat(chat)}
          >
            <Box
              component="img"
              src={`${baseUrl}/${
                chat.isPersonal
                  ? getPersonalChatAvatar(chat)
                  : chat.groupName
                  ? chat.groupName
                  : ""
              }`}
              sx={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                cursor: "pointer",
                mr: "10px",
              }}
            />
            {chat.isPersonal
              ? getPersonalChatName(chat)
              : chat.groupName
              ? chat.groupName
              : ""}
          </Box>
        ))}
      </Box>
      <Box sx={{ flexGrow: "1", display: "flex", flexDirection: "column" }}>
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
          {fileBase64 && <Box
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
                alignItems: 'center'
              }}
            >
              {fileName}
              <ClearOutlinedIcon onClick={() => setFileBase64("")} sx={{cursor: 'pointer'}}/>
            </Box>
          </Box>}
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
                mt:
                  !checkPreviusMessage(index)
                    ? "20px"
                    : "0px",
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
              {
                message.fileRef && getFileElement(message.fileRef)
              }
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
                  setAnchorEl(null);
                }}
              >
                Select file
              </MenuItem>
              <MenuItem>Share video</MenuItem>
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
                    socket.emit("new_message", {
                      content: newMessage,
                      chatId: selectedChat?.id,
                      file: fileBase64
                    });
                    setNewMessage("");
                    setFileBase64("")
                  }
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
