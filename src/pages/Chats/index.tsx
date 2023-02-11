import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChatBody } from "../../components/ChatBody";
import { CreateChatModal } from "../../components/CreateChatModal";
import { useLoading } from "../../context/loading_context";
import { useNotification } from "../../context/notification_context";
import { useSnack } from "../../context/snack_context";
import { useSocket } from "../../context/socket_context";
import { useUserData } from "../../context/user_data_context";
import {
  ChatInfo,
  ChatNotification,
  clearChatNotifications,
  createChat,
  getChatMessages,
  getUserChats,
  MessageInfo,
} from "../../services/chat";
import { UserData } from "../../services/user";

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
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(40);
  const [typingString, setTypingString] = useState("");
  const newMessagesNumber = useRef<number>(0);
  const [openCreateChatModal, setOpenCreateChatModal] = useState(false);
  const snack = useSnack()
  const [searchParams, setSearchParams] = useSearchParams();
  const {chatNotifications, newMessage, clear} = useNotification()

  useEffect(() => {
    getChats();

    return () => {
      socket.off("recieve_message");
      socket.off("recieve_chat");
      socket.off("other_typing");
    };
  }, []);

  useEffect(() => {
    if(!newMessage) return

    const index = chats.findIndex(chat => chat.id === newMessage.chat?.id)
    if(index === -1) return

    const chat = chats[index]
    const newChats = chats
    newChats.splice(index, 1)
    newChats.unshift(chat)
    setChats([...newChats])
    
  }, [newMessage]);

  useEffect(() => {
    socket.off("recieve_chat");
    socket.on("recieve_chat", (chat: ChatInfo) => {
      const newChatList = [...chats]
      newChatList.unshift(chat)
      setChats([...newChatList])
    })
  }, [chats]);

  useEffect(() => {
    socket.off("recieve_message");
    socket.off("other_typing");

    if(selectedChat)
      socket.emit("enter_chat", selectedChat.id)

    socket.on("recieve_message", (message: MessageInfo) => {
      if(!selectedChat) return

      const newChat = selectedChat;
      newChat.messages.unshift(message);
      setSelectedChat({ ...newChat });
      newMessagesNumber.current += 1;     
    });

    socket.on("other_typing", (res: TypingResponse) => {
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

      const newChats = chats 
      const chat = newChats.find(c => c.id === res.chat.id)
      if(chat){
        chat.isTyping = Boolean(newTypingString)
        setChats([...newChats])
      }
      
      if (selectedChat && res.chat.id === selectedChat.id) 
          setTypingString(newTypingString);
    });
  }, [chats, selectedChat]);

  const getChats = async () => {
    loading.show();
    try {
      const res = await getUserChats();
      setChats(res);
      const chatId = searchParams.get("chatId")
      if(chatId){
        const chat = res.find(c => c.id === Number(chatId))
        chat && setSelectedChat(chat)
        chat && handleClickNewChat(chat)

        const notification = chatNotifications.find(not => not.chat.id === Number(chatId))
        if(notification){
          await clearChatNotifications([notification.id])
          clear([notification.id])
        }   
      }    
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
      newMessagesNumber.current = 0;

      const notification = chatNotifications.find(not => not.chat.id === chat.id)
      if(notification){
        await clearChatNotifications([notification.id])
        clear([notification.id])
      }   
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

  const createNewChat = async (users: UserData[], groupName?: string, groupImage?: string) => {
    loading.show()
    socket.emit("new_chat", {
      isPersonal: users.length === 1,
      otherUsersEmails: users.map(user => user.email),
      groupName,
      groupImage,
    }, (err: string, success: boolean) => {
      if(success)
        snack.success("Chat created")
      else if(err)
        snack.error(err)
      loading.hide()
    })
  }

  const getNotificationsInChat = (chatId: number) => {
    const chatNotification = chatNotifications.find(not => not.chat.id === chatId)
    
    if(!chatNotification)
      return <></>

    return (
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', 
      width: '25px', height: '25px', borderRadius: '50%', background: '#cc0000'}}>
        {chatNotification.messages.length}
      </Box>
    )
  } 

  return (
    <>
      <CreateChatModal
        open={openCreateChatModal}
        close={() => setOpenCreateChatModal(false)}
        create={createNewChat}
      />
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
            overflow: 'auto',
            width: '20%'
          }}
        >
          <Box
            sx={{
              borderBottom: "1px solid white",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Button
              sx={{ padding: "15px", width: "100%" }}
              variant="contained"
              onClick={() => setOpenCreateChatModal(true)}
            >
              Create chat
            </Button>
          </Box>
          {chats.map((chat) => (
            <Box
              sx={{
                padding: "15px",
                borderBottom: "1px solid white",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                justifyContent: 'space-between'
              }}
              onClick={() => handleClickNewChat(chat)}
            >
              <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Box
                  component="img"
                  src={`${baseUrl}/${
                    chat.isPersonal
                      ? getPersonalChatAvatar(chat)
                      : chat.groupImage
                  }`}
                  sx={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    mr: "10px",
                  }}
                />
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                  <Typography sx={{wordBreak: 'break-word'}}>
                  {chat.isPersonal
                    ? getPersonalChatName(chat)
                    : chat.groupName
                    ? chat.groupName
                    : ""}
                  </Typography>
                  {
                    chat.isTyping && 
                    <Box
                      component="img"
                      src={"/loading.gif"}
                      sx={{
                        width: "25px",
                      }}
                    />
                  } 
                </Box>
              </Box>
              {getNotificationsInChat(chat.id)}
            </Box>
          ))}
        </Box>
        <Box sx={{ flexGrow: "1", display: "flex", flexDirection: "column" }}>
          {selectedChat && (
            <ChatBody
              selectedChat={selectedChat}
              typingString={typingString}
              getOlderChatMessages={getOlderChatMessages}
              sendMessage={(message: string, file?: string) => {
                socket.emit("new_message", {
                  content: message,
                  chatId: selectedChat?.id,
                  file: file,
                });
              }}
              typingEvent={() => {
                socket.emit("typing", {
                  id: selectedChat.id,
                  users: selectedChat.users,
                });
              }}
            />
          )}
        </Box>
      </Box>
    </>
  );
};
