import { get } from './generic'
import {UserData} from './user'

export interface MessageInfo{
    content: string
    created_by: UserData
    chat: ChatInfo
    createdAt: string
    fileRef?: string
}

export interface ChatInfo{
    isPersonal: boolean
    users: UserData[]
    messages: MessageInfo[]
    id: number
    groupName?: string
}

export async function getUserChats() : Promise<ChatInfo[]> {
    try {
        const res = await get("/chat")
        return res
    } catch (error) {
        throw error
    }
}

export interface GetChatMessagesInterface{
    chatId: number
    page: number
    rows: number
}

export async function getChatMessages({chatId, page, rows}: GetChatMessagesInterface) : Promise<MessageInfo[]> {
    try {
        const res = await get(`/chat/messages/${chatId}?page=${page}&rows=${rows}`)
        return res
    } catch (error) {
        throw error
    }
}