import { get } from "./generic";
import { UserData } from "./user";

export interface VideoData{
    createdAt: Date
    created_by: UserData
    description?: string
    deslikesCount: number
    likesCount: number
    id: number
    path: string
    thumbnail: string
    title: string
    viewsCount: number
    commentCount: number
    evaluation?: boolean | null
}

export async function getVideo(id: number) : Promise<VideoData>{
    try {
        const res = await get(`/video/${id}`)
        console.log(res)
        return res
    } catch (error) {
        throw error
    }
}