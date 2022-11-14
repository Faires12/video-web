import React, { useState, useRef } from "react";
import { Box } from "@mui/system";
import { TextField, Typography, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MainVideo from "../../components/MainVideo";
import { useUserData } from "../../context/user_data_context";
import { useLoading } from "../../context/loading_context";
import { useSnack } from "../../context/snack_context";
import { UploadVideo } from "../../services/video";
import { useNavigate } from "react-router-dom";

export const Upload = () => {
  const [thumb, setThumb] = useState<File>();
  const [base64Thumb, setBase64Thumb] = useState("");
  const [video, setVideo] = useState<File>();
  const [base64Video, setBase64Video] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const thumbRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const { userData } = useUserData();
  const loading = useLoading();
  const snack = useSnack();
  const navigate = useNavigate()

  const validate = () => {
    if (!video) {
      snack.error("A video is needed");
      return true;
    }

    if (video.type !== "video/mp4") {
      snack.error("The video need to be of type .mp4");
      return true;
    }

    if (video.size > 100000000) {
      snack.error("The video have to be at max 100mb");
      return true;
    }

    if (!thumb) {
      snack.error("A thumb is needed");
      return true;
    }

    if (thumb.type !== "image/png" && thumb.type !== "image/jpeg") {
      snack.error("The thumb need to be of type .jpg or png");
      return true;
    }

    if (thumb.size > 5000000) {
      snack.error("The thumb have to be at max 5mb");
      return true;
    }

    if (!title) {
      setTitleError("A title is needed");
      return true;
    }

    if (title.length < 3) {
      setTitleError("A title need to have at least 3 characteres");
      return true;
    }

    if (title.length > 30) {
      setTitleError("A title need to have at max 30 characteres");
      return true;
    }

    if (description && description.length < 5) {
      setDescriptionError(
        "The description need to have at least 5 characteres"
      );
      return true;
    }

    if (description && description.length > 200) {
      setDescriptionError(
        "AThe description need to have at max 200 characteres"
      );
      return true;
    }

    return false;
  };

  function encodeImageFileAsURL(element: File, isThumb: boolean) {
    var file = element;
    var reader = new FileReader();
    reader.onloadend = function () {
      if (typeof reader.result === "string") {
        if (isThumb) setBase64Thumb(reader.result);
        else setBase64Video(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  const upload = async () => {
    if (validate() || !video || !thumb)
        return 
    loading.show();
    try {
        const id = await UploadVideo({title, description, video, thumbnail: thumb})
        navigate(`/video/${id}`)
    } catch (error) {
        snack.error("Erro ao enviar video")
    }
    loading.hide();
  };

  return (
    <>
      <Box sx={{ width: "100%", display: "flex", p: "30px" }}>
        <Box sx={{ width: "50%" }}>
          <Box>
            <Typography>Video Title</Typography>
            <TextField
              sx={{
                border: "none",
                input: { color: "#FFF", outline: "hidden" },
                mt: "5px",
                width: "100%",
                background: "#040A16",
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              inputProps={{
                style: {
                  padding: 15,
                  fontSize: 13,
                  color: "#FFF",
                },
                maxLength: 50,
              }}
              onClick={() => setTitleError("")}
              error={Boolean(titleError)}
            />
            <Typography sx={{color: 'red', fontSize: '12px'}}>{titleError}</Typography>
          </Box>
          <Box sx={{ mt: "20px" }}>
            <Typography>Video Description</Typography>
            <TextField
              sx={{
                border: "none",
                input: { color: "#FFF", outline: "hidden" },
                mt: "5px",
                width: "100%",
                background: "#040A16",
              }}
              multiline
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              inputProps={{
                style: {
                  fontSize: 13,
                  color: "#FFF",
                },
                maxLength: 200,
              }}
              error={Boolean(descriptionError)}
              onClick={() => setDescriptionError("")}
            />
            <Typography sx={{color: 'red', fontSize: '12px'}}>{descriptionError}</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            ml: "30px",
          }}
        >
          <Typography>Thumbnail</Typography>
          <Box
            sx={{
              width: "90%",
              height: "100%",
              background: base64Thumb ? `url(${base64Thumb})` : "#040A16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": {
                filter: "brightness(120%)",
              },
              transition: "0.5s",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "100% 100%",
            }}
            onClick={() => thumbRef.current?.click()}
          >
            {!base64Thumb && (
              <UploadFileIcon
                sx={{ color: "#FF7551", width: "100px", height: "100px" }}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: "100%", px: "30px", display: "flex" }}>
        <Button
          variant="contained"
          sx={{
            color: "#FF7551",
            background: "#FFF",
            borderRadius: "5px",
            width: "25%",
            textTransform: "none",
            "&.MuiButtonBase-root:hover": {
              background: "#FFF",
            },
            p: "10px",
          }}
          onClick={() => videoRef.current?.click()}
        >
          Select Video
        </Button>
        <Button
          variant="contained"
          sx={{
            color: "#FFF",
            background: "#FF7551",
            borderRadius: "5px",
            width: "25%",
            textTransform: "none",
            "&.MuiButtonBase-root:hover": {
              background: "#FF7551",
            },
            p: "10px",
            ml: "15px",
          }}
          onClick={upload}
        >
          Upload Video
        </Button>
      </Box>
      <Box sx={{ width: "70%", mt: "30px" }}>
        <Typography sx={{ mb: "10px" }}>Preview</Typography>
        <MainVideo
          createdAt={new Date()}
          createdBy={userData}
          deslikesCount={0}
          likesCount={0}
          videoUrl={base64Video}
          title={title}
          viewsCount={0}
          description={description}
        />
      </Box>
      <input
        type="file"
        style={{ display: "none" }}
        ref={thumbRef}
        accept="image/png, image/jpeg"
        onChange={(e) => {
          const file = e.target.files ? e.target.files[0] : null;
          if (file) {
            encodeImageFileAsURL(file, true);
            setThumb(file);
          }
        }}
      />
      <input
        type="file"
        style={{ display: "none" }}
        ref={videoRef}
        accept="video/mp4"
        onChange={(e) => {
          const file = e.target.files ? e.target.files[0] : null;
          if (file) {
            encodeImageFileAsURL(file, false);
            setVideo(file);
          }
        }}
      />
    </>
  );
};
