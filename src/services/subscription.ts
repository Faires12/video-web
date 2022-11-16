import { get, post } from "./generic"

export async function GetSubscription(subscribeTo: string) : Promise<boolean>{
    try {
        const res = await get("/subscription/" + subscribeTo)
        return res
    } catch (error) {
        throw error
    }
}

export async function ManageSubscription(subscribeTo: string) : Promise<boolean>{
    try {
        const res = await post("/subscription", {subscribeTo})
        return res
    } catch (error) {
        throw error
    }
}