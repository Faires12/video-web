import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import FileUploadIcon from '@mui/icons-material/FileUpload';

interface Navigation{
    text: string
    link: string
    icon: JSX.Element  
}

export const navMenu : Navigation[] = [
    {
        text: 'Home',
        link: '',
        icon: <HomeIcon/>
    },
    {
        text: 'Following',
        link: '',
        icon: <PersonIcon/>
    },
    {
        text: 'Playlists',
        link: '',
        icon: <FeaturedPlayListIcon/>
    },
    {
        text: 'New Upload',
        link: '',
        icon: <FileUploadIcon/>
    },
]