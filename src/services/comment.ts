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
        const userData = await get(`/video/comments/${videoId}?page=${page}&rows=${rows}`)
        return userData
    } catch (error) {
        throw error
    }
}


export async function GetComment(commentId: number) : Promise<Comment>{
    try {
        const userData = await get(`/video/comment/${commentId}`)
        return userData
    } catch (error) {
        throw error
    }
}