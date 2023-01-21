import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from "socket.io-client";
import { isLogged } from '../services/auth';
import { MessageInfo } from '../services/chat';
import { useNotification } from './notification_context';


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
    const notification = useNotification()
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
    }, [])

    useEffect(() => {
        socket.off("recieve_message");

        if(location.pathname === '/chats')
            return

        socket.on("recieve_message", (msg: MessageInfo) => {
            console.log(msg)
            notification.show(msg, () => navigate(`/chats?chatId=${msg.chat.id}`))
        })
    }, [socket, location.pathname])

    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )
}