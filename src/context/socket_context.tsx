import { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client";


export interface SocketContext{
    socket: Socket
}

const SocketContext = createContext<SocketContext>({
    socket: io() 
})

export function useSocket(){
    return useContext(SocketContext)
}

interface Props {
    children: React.ReactNode;
}

export const SocketProvider = ({children}: Props) => {
    const [socket, setSocket] = useState<Socket>(io())

    useEffect(() => {
        if(process.env.REACT_APP_MEDIA_ENDPOINT){
            const skt = io(process.env.REACT_APP_MEDIA_ENDPOINT, {
                auth: {
                    token: localStorage.getItem("token")
                }
            })
            setSocket(skt)
        }
    }, [])

    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )
}