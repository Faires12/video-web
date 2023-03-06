import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from "socket.io-client";
import { isLogged } from '../services/auth';
import { ChatNotification, MessageInfo } from '../services/chat';
import { useNotification } from './notification_context';


export interface SocketContext{
    socket: Socket
    publicSocket: Socket
}

const SocketContext = createContext<SocketContext>({
    socket: io(),
    publicSocket: io()
})

export function useSocket(){
    return useContext(SocketContext)
}

interface Props {
    children: React.ReactNode;
}

export const SocketProvider = ({children}: Props) => {
    const [socket, setSocket] = useState<Socket>(io())
    const [publicSocket, setPublicSocket] = useState<Socket>(io())
    const {chatNotifications, show} = useNotification()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if(!process.env.REACT_APP_MEDIA_ENDPOINT)
            return
        const token = localStorage.getItem("token")

        if(isLogged() && token){
            const skt = io(`${process.env.REACT_APP_MEDIA_ENDPOINT}`, {
                auth: {
                    token: token
                }
            })
            setSocket(skt)
        }
        
        const publicSkt = io(`${process.env.REACT_APP_MEDIA_ENDPOINT}/public`, {
            auth: {
                token: isLogged() && token ? token : null
            }
        })
        setPublicSocket(publicSkt)
    }, [])

    useEffect(() => {
        socket.off("recieve_notification");

        socket.on("recieve_notification", (notification: ChatNotification) => {
            show(notification)
        })
    }, [chatNotifications])

    useEffect(() => {
        socket.emit("enter_chat", null)
    }, [location.pathname])

    return (
        <SocketContext.Provider value={{socket, publicSocket}}>
            {children}
        </SocketContext.Provider>
    )
}