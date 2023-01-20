import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  useMediaQuery,
  useTheme,
  TextField,
  Checkbox,
  Typography,
  Button,
} from "@mui/material";
import { Box } from "@mui/system";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { searchUsers, UserData } from "../../services/user";
import { useLoading } from "../../context/loading_context";
import { useSnack } from "../../context/snack_context";

export interface Props {
  open: boolean;
  close(): void;
  create(users: UserData[], groupName?: string, groupImage?: string): void
}

export const CreateChatModal = ({ open, close, create }: Props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const loading = useLoading();
  const timeout = useRef<NodeJS.Timeout>();
  const baseUrl = process.env.REACT_APP_MEDIA_ENDPOINT;
  const [step, setStep] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const [base64File, setBase64File] = useState("");
  const [groupName, setGroupName] = useState("");
  const snack = useSnack();

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    if (!search) return;
    getUsers(search, page, rows);
  }, [search]);

  const getUsers = (search: string, page: number, rows: number) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      loading.show();
      try {
        const res = await searchUsers({ search, page: 1, rows });
        setUsers(res);
        setPage(1);
      } catch (error) {}
      loading.hide();
    }, 500);
  };

  const loadMoreUsers = async () => {
    loading.show();
    try {
      const res = await searchUsers({ search, page: page + 1, rows });
      const newUsers = users;
      newUsers.push(...res);
      setPage((prev) => prev + 1);
      setUsers([...newUsers]);
    } catch (error) {}
    loading.hide();
  };

  function encodeImageFileAsURL(element: File) {
    var file = element;
    var reader = new FileReader();
    reader.onloadend = function () {
      if (typeof reader.result === "string") setBase64File(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <Dialog open={open} onClose={close} fullScreen={fullScreen}>
      <DialogTitle sx={{ textAlign: "center" }}>Create chat</DialogTitle>
      <Box
        sx={{
          width: { xs: "auto", md: "400px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <Box sx={{ display: step === 1 ? "block" : "none" }}>
          <>
            <TextField
              variant="standard"
              sx={{
                width: "100%",
                input: {
                  border: "none",
                  borderBottom: "2px solid rgba(183, 185, 210, 0.7)",
                },
              }}
              placeholder="Type the users email or name"
              inputProps={{
                maxLength: 50,
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Box
              sx={{
                mt: "15px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {search ? (
                <>
                  {users.length ? (
                    <>
                      <Typography sx={{ mt: "10px", textAlign: "center" }}>
                        Resultados
                      </Typography>
                      {users.map((user) => (
                        <Box sx={{ p: "10px", display: "flex" }}>
                          <Checkbox
                            checked={
                              selectedUsers.findIndex(
                                (u) => u.email === user.email
                              ) >= 0
                            }
                            onChange={(e) => {
                              const { checked } = e.target;
                              const newSelectedUsers = selectedUsers;
                              if (checked) newSelectedUsers.push(user);
                              else {
                                const index = newSelectedUsers.findIndex(
                                  (u) => u.email === user.email
                                );
                                index >= 0 && newSelectedUsers.splice(index, 1);
                              }
                              setSelectedUsers([...newSelectedUsers]);
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              ml: "10px",
                            }}
                          >
                            <Box
                              component="img"
                              src={`${baseUrl}/${user.avatar}`}
                              sx={{
                                width: "25px",
                                height: "25px",
                                borderRadius: "50%",
                                cursor: "pointer",
                                mr: "10px",
                              }}
                            />
                            <Box>
                              <Typography sx={{ fontSize: "12px" }}>
                                {user.email}
                              </Typography>
                              <Typography sx={{ fontSize: "12px" }}>
                                {user.name}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                      {users.length % rows === 0 && users.length !== 0 && (
                        <Button onClick={loadMoreUsers}>Load more</Button>
                      )}
                    </>
                  ) : (
                    <Typography sx={{ mt: "10px", textAlign: "center" }}>
                      No results
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  {selectedUsers.length ? (
                    <>
                      <Typography sx={{ mt: "10px", textAlign: "center" }}>
                        Selected users
                      </Typography>
                      {selectedUsers.map((user) => (
                        <Box sx={{ p: "10px", display: "flex" }}>
                          <Checkbox
                            checked={
                              selectedUsers.findIndex(
                                (u) => u.email === user.email
                              ) >= 0
                            }
                            onChange={(e) => {
                              const { checked } = e.target;
                              const newSelectedUsers = selectedUsers;
                              if (checked) newSelectedUsers.push(user);
                              else {
                                const index = newSelectedUsers.findIndex(
                                  (u) => u.email === user.email
                                );
                                index >= 0 && newSelectedUsers.splice(index, 1);
                              }
                              setSelectedUsers([...newSelectedUsers]);
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              ml: "10px",
                            }}
                          >
                            <Box
                              component="img"
                              src={`${baseUrl}/${user.avatar}`}
                              sx={{
                                width: "25px",
                                height: "25px",
                                borderRadius: "50%",
                                cursor: "pointer",
                                mr: "10px",
                              }}
                            />
                            <Box>
                              <Typography sx={{ fontSize: "12px" }}>
                                {user.email}
                              </Typography>
                              <Typography sx={{ fontSize: "12px" }}>
                                {user.name}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </>
                  ) : (
                    <Typography sx={{ mt: "10px", textAlign: "center" }}>
                      No user selected
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </>
        </Box>
        <Box sx={{ display: step === 2 ? "block" : "none" }}>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <input
              type="file"
              style={{ display: "none" }}
              ref={fileRef}
              accept="image/png, image/jpeg, image/gif"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) {
                  if (file.size > 5000000) {
                    snack.error("The file must be 5mb max");
                    return;
                  }
                  encodeImageFileAsURL(file);
                }
              }}
            />
            <Box
              component="img"
              sx={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                "&:hover": {
                  opacity: "0.7",
                },
                cursor: "pointer",
              }}
              src={base64File ? base64File : `${baseUrl}/default_avatar.jpg`}
              onClick={() => fileRef.current?.click()}
            />
            <TextField
              variant="standard"
              sx={{
                width: "60%",
                input: {
                  border: "none",
                  borderBottom: "2px solid rgba(183, 185, 210, 0.7)",
                  mt: "10px",
                },
              }}
              placeholder="Type the groupName"
              inputProps={{
                maxLength: 50,
              }}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </Box>
        </Box>
      </Box>
      <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={() => {
            step === 1 && close();
            step === 2 && setStep(1);
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => {
            if (step === 1) {
              if (!selectedUsers.length) {
                snack.error("Select at least 1 user");
                return;
              }
              if (selectedUsers.length >= 2) {
                setStep(2);
                return;
              }
              create(selectedUsers)
              setSelectedUsers([])
              setBase64File("")
              setGroupName("")
              setStep(1)
              setSearch("")
              close()
            } else {
              if (!base64File) {
                snack.error("Select a group image");
                return;
              }
              if (groupName.length < 3) {
                snack.error("Group name need be have at least 3 characters");
                return;
              }
              create(selectedUsers, groupName, base64File)
              setSelectedUsers([])
              setBase64File("")
              setGroupName("")
              setStep(1)
              setSearch("")
              close()
            }
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
