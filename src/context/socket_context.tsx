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
        if(process.env.REACT_APP_MEDIA_ENDPOINT && isLogged()){
            const skt = io(process.env.REACT_APP_MEDIA_ENDPOINT, {
                auth: {
                    token: localStorage.getItem("token")
                }
            })
            setSocket(skt)
        }
        setPublicSocket(io(`${process.env.REACT_APP_MEDIA_ENDPOINT}/public`))
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