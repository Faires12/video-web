import { Box } from "@mui/system";
import { TextField, Typography } from "@mui/material";
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

export const Chats = () => {
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInfo>();
  const { userData } = useUserData();
  const { socket } = useSocket();
  const loading = useLoading();
  const [newMessage, setNewMessage] = useState("");
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(25);
  const messageBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChats();

    return () => {
      socket.off("recieve_message");
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    socket.off("recieve_message");
    socket.on("recieve_message", (message: MessageInfo) => {
      if(message.chat.id !== selectedChat.id) return
      const newChat = selectedChat;
      newChat.messages.unshift(message);
      setSelectedChat({ ...newChat });
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
    } catch (error) {}
    loading.hide();
  };

  const getOlderChatMessages = async () => {
    if (!selectedChat) return;
    if (selectedChat.messages.length % rows !== 0) return;
    loading.show();
    try {
      const res = await getChatMessages({
        chatId: selectedChat.id,
        page: page + 1,
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
    if(!selectedChat)
        return false
    if(!selectedChat.messages[index + 1])
        return false
    if(selectedChat.messages[index + 1].created_by.email === selectedChat.messages[index].created_by.email){
        return true
    }    
    return false
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
          {selectedChat?.messages.map((message, index) => (
            <Box
              sx={{
                width: "100%",
                px: "20px",
                mt: selectedChat.messages[index + 1] &&
                selectedChat.messages[index + 1].created_by.email !==
                  message.created_by.email
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
                    display:
                      checkPreviusMessage(index)
                        ? "none"
                        : "block",
                  }}
                />
                <Box>
                  <Box
                    sx={{
                      display:
                      checkPreviusMessage(index)
                          ? "none"
                          : "flex",
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
                      ml:
                      checkPreviusMessage(index)
                          ? "40px"
                          : "0px",
                    }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
        <TextField
          sx={{
            width: "100%",
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
              setNewMessage("");
              console.log(socket);
              socket.emit("new_message", {
                content: newMessage,
                chatId: selectedChat?.id,
              });
            }
          }}
        />
      </Box>
    </Box>
  );
};
