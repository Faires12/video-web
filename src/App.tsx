import React from "react";
import Layout from "./components/Layout";
import { Routes, Route } from "react-router-dom";
import Video from "./pages/Video";
import { ModalProvider } from "./context/authentication_modal_context";
import { LoadingProvider } from "./context/loading_context";
import { SnackProvider } from "./context/snack_context";
import { UserDataProvider } from "./context/user_data_context";
import { Upload } from "./pages/Upload";
import { Profile } from "./pages/Profile";
import {createTheme, ThemeProvider} from '@mui/material'

function App() {

  const theme = createTheme({
    typography: {
     "fontFamily": 'Poppins',
    }
 });

  return (
    <ThemeProvider theme={theme}>
<LoadingProvider>
      <SnackProvider>
        <UserDataProvider>
          <ModalProvider>
            <Layout>
              <Routes>
                <Route path="/video/:id" element={<Video />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/profile/:email" element={<Profile />} />
              </Routes>
            </Layout>
          </ModalProvider>
        </UserDataProvider>
      </SnackProvider>
    </LoadingProvider>
    </ThemeProvider>
    
  );
}

export default App;
