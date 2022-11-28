import { get, post } from "./generic";
import { UserData } from "./user";

export interface VideoData {
  createdAt: Date;
  created_by: UserData;
  description?: string;
  deslikesCount: number;
  likesCount: number;
  id: number;
  path: string;
  thumbnail: string;
  title: string;
  viewsCount: number;
  commentCount: number;
  evaluation?: boolean | null;
}

export async function getVideo(id: number): Promise<VideoData> {
  try {
    const res = await get(`/video/${id}`);
    return res;
  } catch (error) {
    throw error;
  }
}

export enum VideoOrderBy{
  Views = 1,
  Recent = 2
}

export async function getHomeVideos(page: number, rows: number): Promise<VideoData[]> {
  try {
    let url = `/video/home?page=${page}&rows=${rows}`
    const res = await get(url);
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getUserVideos(email: string, page: number, rows: number, orderBy?: number): Promise<VideoData[]> {
  try {
    let url = `/video/user/${email}?page=${page}&rows=${rows}`
    if(orderBy)
      url += `&orderBy=${orderBy}`
    const res = await get(url);
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getRelatedVideos(videoId: number, page: number, rows: number): Promise<VideoData[]> {
  try {
    let url = `/video/related/${videoId}?page=${page}&rows=${rows}`
    const res = await get(url);
    return res;
  } catch (error) {
    throw error;
  }
}

interface UploadVideoInterface {
  title: string;
  description?: string;
  thumbnail: File;
  video: File;
}

export async function UploadVideo(infos: UploadVideoInterface) : Promise<number> {
  try {
    const formData = new FormData();
    formData.append("title", infos.title);
    if (infos.description) formData.append("description", infos.description);
    formData.append("thumbnail", infos.thumbnail);
    formData.append("video", infos.video);
    const id = await post("/video", formData, true);
    return id
  } catch (error) {
    throw error;
  }
}
