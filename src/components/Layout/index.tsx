import React from 'react';
import LeftPanel from '../LeftPanel';

interface Props{
    children: React.ReactNode
}

const Layout = ({children}: Props) => {
    return (
        <>
            <LeftPanel/>
            {children}
        </>
    )
}

export default Layout
