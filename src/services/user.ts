import { del, get, put, post } from "./generic"

export interface UserData{
    email: string
    avatar: string
    name: string
    subsCount?: number
}

interface EditUserInterface{
    name?: string
    avatar?: File
}

interface SearchUsersInterface{
    search: string
    page: number
    rows: number
}

export async function searchUsers({search, page, rows}: SearchUsersInterface) : Promise<UserData[]>{
    try {
        const userDatas = await post(`/user/search?page=${page}&rows=${rows}`, {search})
        return userDatas
    } catch (error) {
        throw error
    }
}

export async function GetLoggedUserData() : Promise<UserData>{
    try {
        const userData = await get("/user")
        return userData
    } catch (error) {
        throw error
    }
}

export async function DeleteUser() : Promise<void>{
    try {
        await del("/user")
    } catch (error) {
        throw error
    }
}

export async function EditUserData(infos: EditUserInterface) : Promise<UserData>{
    try {
        const formData = new FormData();
        infos.name && formData.append('name', infos.name)
        infos.avatar && formData.append('avatar', infos.avatar)

        const userData = await put("/user", formData, true)
        return userData
    } catch (error) {
        throw error
    }
}

export async function GetUserDataByEmail(email: string) : Promise<UserData>{
    try {
        const userData = await get("/user/" + email)
        return userData
    } catch (error) {
        throw error
    }
}