import { get, post } from "./generic"
import { UserData } from "./user"

export interface Comment{
    content: string
    created_by: UserData
    likesCount: number
    deslikesCount: number
    id: number
    responses?: Comment[]
    createdAt: Date
    commentCount: number
    evaluation?: boolean | null
} 

export async function GetVideoComments(videoId: number, page: number, rows: number) : Promise<Comment[]>{
    try {
        const comments = await get(`/video/comments/${videoId}?page=${page}&rows=${rows}`)
        return comments
    } catch (error) {
        throw error
    }
}

export async function GetCommentResponses(commentId: number, page: number, rows: number) : Promise<Comment[]>{
    try {
        const comments = await get(`/video/comments/responses/${commentId}?page=${page}&rows=${rows}`)
        return comments
    } catch (error) {
        throw error
    }
}

export async function GetComment(commentId: number) : Promise<Comment>{
    try {
        const comment = await get(`/video/comment/${commentId}`)
        return comment
    } catch (error) {
        throw error
    }
}

export async function CreateVideoComment(videoId: number, content: string) : Promise<Comment>{
    try {
        const comment = await post(`/video/comment/`, {videoId, content})
        return comment
    } catch (error) {
        throw error
    }
}