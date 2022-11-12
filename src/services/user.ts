import { get } from "./generic"

export interface UserData{
    email: string
    avatar: string
    name: string
    subsCount?: number
}

export async function GetLoggedUserData() : Promise<UserData>{
    try {
        const userData = await get("/user")
        return userData
    } catch (error) {
        throw error
    }
}