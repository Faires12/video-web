import React, { useState, useRef, useEffect } from "react";
import { TextField, Typography, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box } from "@mui/system";
import { useUserData } from "../../context/user_data_context";
import { useLoading } from "../../context/loading_context";
import { useSnack } from "../../context/snack_context";
import { useNavigate, useParams } from "react-router-dom";
import { EditVideo, getVideo, VideoData } from "../../services/video";
import { getFileInfosFromPath } from "../../utils";

export const Edit = () => {
  const [thumb, setThumb] = useState<File>();
  const [base64Thumb, setBase64Thumb] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const thumbRef = useRef<HTMLInputElement>(null);
  const {id} = useParams()
  const navigate = useNavigate()
  const snack = useSnack()
  const loading = useLoading()
  const {userData} = useUserData()
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;

  useEffect(() => {
    if(userData.email)
      verifyVideo()
  }, [userData])

  const verifyVideo = async () => {
    if(!id || isNaN(Number(id))){
        navigate("/")
        return;
    }
    loading.show()
    try {
        const video = await getVideo(Number(id))
        if(video.created_by.email !== userData.email){
            snack.error("Video não pertence ao usuário")
            loading.hide()
            navigate("/")
            return
        }
        setTitle(video.title)
        if(video.description) setDescription(video.description)
        const {file, base64} = await getFileInfosFromPath(`${baseUrl}/${video.thumbnail}`)
        setThumb(file)
        setBase64Thumb(base64) 
    } catch (error) {
        snack.error("Video não encontrado")
        navigate("/")
    }
    loading.hide()
  }

  function encodeImageFileAsURL(element: File) {
    var file = element;
    var reader = new FileReader();
    reader.onloadend = function () {
      if (typeof reader.result === "string") {
        setBase64Thumb(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  const validate = () => {
    if (thumb && thumb.type !== "image/png" && thumb.type !== "image/jpeg" && thumb.type !== "image/gif") {
      snack.error("The thumb need to be of type .jpg or png");
      return true;
    }

    if (thumb && thumb.size > 5000000) {
      snack.error("The thumb have to be at max 5mb");
      return true;
    }

    if (title && !title) {
      setTitleError("A title is needed");
      return true;
    }

    if (title && title.length < 3) {
      setTitleError("A title need to have at least 3 characteres");
      return true;
    }

    if (title && title.length > 30) {
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
        "The description need to have at max 200 characteres"
      );
      return true;
    }

    return false;
  };

  const edit = async () => {
    if(validate())
      return
    loading.show()
    try {
      const body : any = {id: Number(id)}
      if(title) body.title = title
      if(description) body.description = description
      if(thumb) body.thumbnail = thumb
      await EditVideo(body)
      snack.success("Video editado com sucesso")
      navigate(`/video/${id}`)
    } catch (error) {
      
    }
    loading.hide()
  }

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
            <Typography sx={{ color: "red", fontSize: "12px" }}>
              {titleError}
            </Typography>
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
            <Typography sx={{ color: "red", fontSize: "12px" }}>
              {descriptionError}
            </Typography>
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
            color: "#FFF",
            background: "#FF7551",
            borderRadius: "5px",
            width: "25%",
            textTransform: "none",
            "&.MuiButtonBase-root:hover": {
              background: "#FF7551",
            },
            p: "10px",
          }}
          onClick={edit}
        >
          Edit Video
        </Button>
      </Box>
      <input
        type="file"
        style={{ display: "none" }}
        ref={thumbRef}
        accept="image/png, image/jpeg, image/gif"
        onChange={(e) => {
          const file = e.target.files ? e.target.files[0] : null;
          if (file) {
            encodeImageFileAsURL(file);
            setThumb(file);
          }
        }}
      />
    </>
  );
};
