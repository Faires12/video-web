import HomeIcon from '@mui/icons-material/Home';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';

interface Navigation{
    text: string
    link: string
    icon: JSX.Element  
}

export const navMenu : Navigation[] = [
    {
        text: 'Home',
        link: '/',
        icon: <HomeIcon/>
    },
    {
        text: 'Following',
        link: '/following',
        icon: <GroupIcon/>
    },
    {
        text: 'Playlists',
        link: '/playlists',
        icon: <FeaturedPlayListIcon/>
    },
    {
        text: 'New Upload',
        link: '/upload',
        icon: <FileUploadIcon/>
    },
    {
        text: 'Chats',
        link: '/chats',
        icon: <ChatIcon/>
    },
    {
        text: 'Historic',
        link: '/historic',
        icon: <HistoryIcon/>
    },
]