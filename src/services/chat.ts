import { get, post } from "./generic";
import { UserData } from "./user";
import { VideoData } from "./video";

export interface MessageInfo {
  content?: string;
  created_by: UserData;
  chat?: ChatInfo;
  createdAt: string;
  fileRef?: string;
  videoRef?: VideoData
  id: number
}

export interface ChatInfo {
  isPersonal: boolean;
  users: UserData[];
  messages: MessageInfo[];
  id: number;
  groupName?: string;
  groupImage?: string;
  isTyping?: boolean
}

export interface ChatNotification{
  chat: ChatInfo
  id: number
  messages: MessageInfo[]
  read: boolean
  reciever: string
}


export async function getUserChats(): Promise<ChatInfo[]> {
  try {
    const res = await get("/chat");
    return res;
  } catch (error) {
    throw error;
  }
}

export interface GetChatMessagesInterface {
  chatId: number;
  page: number;
  rows: number;
}

export async function getChatMessages({
  chatId,
  page,
  rows,
}: GetChatMessagesInterface): Promise<MessageInfo[]> {
  try {
    const res = await get(`/chat/messages/${chatId}?page=${page}&rows=${rows}`);
    return res;
  } catch (error) {
    throw error;
  }
}

export interface CreateChatInterface {
  otherUsersEmails: string[];
  groupName?: string;
  groupImage?: string;
}

export async function createChat({
  otherUsersEmails,
  groupName,
  groupImage,
}: CreateChatInterface): Promise<ChatInfo> {
  try {
    const res = await post("/chat", {
      otherUsersEmails,
      groupName,
      groupImage,
      isPersonal: otherUsersEmails.length === 1,
    });
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getChatNotifications(): Promise<ChatNotification[]> {
  try {
    const res = await get("/chat/notifications");
    return res;
  } catch (error) {
    throw error;
  }
}

export async function clearChatNotifications(chatNotificationsIds: number[]): Promise<void> {
  try {
    await post("/chat/notifications/clear", {chatNotificationsIds});
  } catch (error) {
    throw error;
  }
}
