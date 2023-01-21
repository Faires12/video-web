import { ChatInfo, MessageInfo } from "../services/chat";
import React, { createContext, useContext, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useUserData } from "./user_data_context";

export interface NotificationInfo {
  show(message: MessageInfo, cb?: () => void): void;
}

const notificationDefault: NotificationInfo = {
  show: (message: MessageInfo) => {},
};

const NotificationContext =
  createContext<NotificationInfo>(notificationDefault);

export function useNotification() {
  return useContext(NotificationContext);
}

interface Props {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: Props) {
  const [message, setMessage] = useState<MessageInfo | null>(null);
  const [callback, setCallback] = useState<() => void>()
  const timeout = useRef<NodeJS.Timeout>();
  const {userData} = useUserData()
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;

  const show = (msg: MessageInfo, cb?: () => void) => {
    clearTimeout(timeout.current);
    setMessage(msg);
    cb && setCallback(() => cb)
    timeout.current = setTimeout(() => {
      setMessage(null);
    }, 3000);
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

  return (
    <NotificationContext.Provider value={{ show }}>
      {message && <Box
        sx={{
          position: "absolute",
          bottom: "0",
          right: "0",
          color: "#FFF",
          background: "rgba(255, 255, 255, 0.1)",
          zIndex: "100000",
          m: "20px",
          p: "10px",
          width: "300px",
          display: "flex",
          cursor: "pointer",
        }}
        onClick={() => {
            callback && callback()
            setMessage(null)
        }}
      >
        <Box
          component="img"
          sx={{ width: "40%" }}
          src={`${baseUrl}/${message.chat.isPersonal ? getPersonalChatAvatar(message.chat) : message.chat.groupImage}`}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "space-between",
            ml: "10px",
            flexGrow: "1",
          }}
        >
          <Typography>{message.chat.isPersonal ? getPersonalChatName(message.chat) : message.chat.groupName}</Typography>
          <Typography sx={{wordBreak: 'break-word'}}>
            {message.content.replace(/(.{30})..+/, "$1…")}
          </Typography>
        </Box>
      </Box>}
      {children}
    </NotificationContext.Provider>
  );
}
