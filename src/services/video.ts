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
    console.log(res);
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
