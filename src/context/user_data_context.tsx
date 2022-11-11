import React, {useContext, createContext, useState, Dispatch, SetStateAction, useEffect} from 'react'
import { doLogout, isLogged } from '../services/auth'
import { GetLoggedUserData, UserData } from '../services/user'
import { useLoading } from './loading_context'
import { useSnack } from './snack_context'

export interface UserContextData{
    userData: Partial<UserData>
    setUserData: Dispatch<SetStateAction<Partial<UserData>>>
}

const UserContext = createContext<UserContextData>({
    userData: {},
    setUserData: () => {}
})

export function useUserData(){
    return useContext(UserContext)
}

interface Props {
    children: React.ReactNode;
}

export const UserDataProvider = ({children}: Props) => {
    const [userData, setUserData] = useState<Partial<UserData>>({})
    const snack = useSnack()
    const loading = useLoading()

    useEffect(() => {
        getUserData()
    }, [])

    const getUserData = async () => {
        if(!isLogged())
            return
        loading.show()
        try {
            const res = await GetLoggedUserData()
            setUserData(res)
        } catch (error) {
            snack.error("Erro ao carregar informações do usuário")
            doLogout()
        }
        loading.hide()
    }

    return(
        <UserContext.Provider value={{userData, setUserData}}>
            {children}
        </UserContext.Provider>
    )
}