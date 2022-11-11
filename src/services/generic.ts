import axios from 'axios'

function getInstance() {
    const baseURL = process.env.REACT_APP_API_ENDPOINT
    const headers = {
        'Content-Type': 'application/json',
        token: localStorage.getItem("token")
    }

    return axios.create({
        baseURL,
        headers
    })
}

export async function get(endpoint: string){
    try {
        const axios = getInstance()
        const res = await axios.get(endpoint)
        return res.data
    } catch (error: any) {
        throw error.response
    }
}

export async function post(endpoint: string, body: any){
    try {
        const axios = getInstance()
        const res = await axios.post(endpoint, body)
        return res.data
    } catch (error: any) {
        throw error.response
    }
}