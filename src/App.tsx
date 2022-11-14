import React from "react";
import Layout from "./components/Layout";
import { Routes, Route } from "react-router-dom";
import Video from "./pages/Video";
import { ModalProvider } from "./context/authentication_modal_context";
import { LoadingProvider } from "./context/loading_context";
import { SnackProvider } from "./context/snack_context";
import { UserDataProvider } from "./context/user_data_context";
import { Upload } from "./pages/Upload";

function App() {
  return (
    <LoadingProvider>
      <SnackProvider>
        <UserDataProvider>
          <ModalProvider>
            <Layout>
              <Routes>
                <Route path="/video/:id" element={<Video />} />
                <Route path="/upload" element={<Upload />} />
              </Routes>
            </Layout>
          </ModalProvider>
        </UserDataProvider>
      </SnackProvider>
    </LoadingProvider>
  );
}

export default App;
