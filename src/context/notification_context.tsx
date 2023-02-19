import { ChatInfo, ChatNotification, getChatNotifications, MessageInfo } from "../services/chat";
import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useUserData } from "./user_data_context";

export interface NotificationInfo {
  chatNotifications: ChatNotification[]
  newMessage: MessageInfo | null
  show: (chatNotification: ChatNotification) => void
  clear: (ids: number[]) => void
}

const notificationDefault: NotificationInfo = {
  chatNotifications: [],
  newMessage: null,
  show: () => {},
  clear: () => {}
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
  const [callback, setCallback] = useState<() => void>()
  const timeout = useRef<NodeJS.Timeout>();
  const {userData} = useUserData()
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const [chatNotifications, setChatNotifications] = useState<ChatNotification[]>([]) 
  const [newMessage, setNewMessage] = useState<MessageInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    GetChatNotifications()
  }, [])

  useEffect(() => {
    if(!newMessage) return
    console.log(audioRef.current)
    if(audioRef.current){
      audioRef.current.play()
    }
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setNewMessage(null);
    }, 3000);
  }, [newMessage])

  const GetChatNotifications = async () => {
    try{
      const res = await getChatNotifications()
      setChatNotifications(res)
    } catch(e){}
  }

  const show = (notification: ChatNotification) => {
    const newNotifications = chatNotifications
    const index = newNotifications.findIndex(not => not.id === notification.id) 
    if(index >= 0){
      newNotifications.splice(index, 1)
    } 
    newNotifications.unshift(notification)
    setChatNotifications([...newNotifications])
    notification.messages.length && setNewMessage({
      ...notification.messages[notification.messages.length - 1],
      chat: notification.chat
    })
  }

  const clear = (ids: number[]) => {
    const newNotifications = chatNotifications
    for(const id of ids){
      const index = chatNotifications.findIndex(not => not.id === id)
      if(index === -1) continue
      if(index >= 0){
        newNotifications.splice(index, 1)
      } 
    }
    setChatNotifications([...newNotifications])
  }

  return (
    <NotificationContext.Provider value={{ chatNotifications, newMessage, show, clear }}>
      {newMessage && <Box
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
            setNewMessage(null)
        }}
      >
        <Box
          component="img"
          sx={{ width: "40%" }}
          src={`${baseUrl}/${newMessage.chat?.isPersonal ? 
            newMessage.created_by.avatar : newMessage.chat?.groupImage}`}
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
          <Typography>{newMessage.chat?.isPersonal ? 
          newMessage.created_by.name : newMessage.chat?.groupName}</Typography>
          <Typography sx={{wordBreak: 'break-word'}}>
            {newMessage.content?.replace(/(.{30})..+/, "$1…")}
          </Typography>
        </Box>
      </Box>}
      {children}
      <Box
        component="audio"
        ref={audioRef}
        src="./notification.wav"
      />
    </NotificationContext.Provider>
  );
}
