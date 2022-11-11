import { get } from "./generic";

export interface VideoData{
    createdAt: Date
    created_by: {
        avatar: string
        email: string
        name: string
        subsCount: number
    }
    description?: string
    deslikesCount: number
    likesCount: number
    id: number
    path: string
    thumbnail: string
    title: string
    viewsCount: number
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