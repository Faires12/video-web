import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import validator from "validator";
import { Login } from "../../services/auth";
import { useLoading } from "../../context/loading_context";
import { useSnack } from "../../context/snack_context";
import { useUserData } from "../../context/user_data_context";
import { GetLoggedUserData } from "../../services/user";

interface Props {
  open: boolean;
  setOpen(v: boolean): void;
  doneCallback(): void;
}

export const AuthenticationModal = ({ open, setOpen, doneCallback }: Props) => {
  const [isLogin, setIsLogin] = useState(true);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const loading = useLoading();
  const snack = useSnack();
  const {userData, setUserData} = useUserData()

  const handleClose = () => {
    setOpen(false);
  };

  const validateLogin = () => {
    let hasError = false
    if (!validator.isEmail(email)) {
      setErrorEmail(true);
      hasError = true;
    }
    if (!password) {
      setErrorPassword(true);
      hasError = true;
    }
    return hasError
  }

  const doLogin = async () => {
    try {
      if(validateLogin())
        return
        
      loading.show();
      await Login(email, password);
      const res = await GetLoggedUserData()
      setUserData(res)
      doneCallback();
    } catch (error) {
      snack.error("Usuário ou senha inválidos");
    }
    loading.hide();
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullScreen={fullScreen}
      sx={{}}
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        {isLogin ? "Login" : "Registro"}
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          p: "20px",
          width: "400px",
        }}
      >
        <TextField
          label="Email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errorEmail}
          helperText={errorEmail && "Email inválido"}
          onClick={() => setErrorEmail(false)}
        />
        {!isLogin && (
          <TextField
            label="Nome"
            placeholder="Digite seu nome"
            sx={{ mt: "10px" }}
          />
        )}
        <TextField
          label="Senha"
          placeholder="Digite sua senha"
          sx={{ mt: "10px" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorPassword}
          helperText={errorPassword && "Email inválido"}
          type="password"
          onClick={() => setErrorPassword(false)}
        />

        {isLogin ? (
          <Typography sx={{ mt: "5px" }}>
            Não possui conta?{" "}
            <Box
              component="span"
              sx={{
                color: "#1976d2",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => setIsLogin(false)}
            >
              Registre-se
            </Box>
          </Typography>
        ) : (
          <Typography sx={{ mt: "5px" }}>
            Não possui conta?{" "}
            <Box
              component="span"
              sx={{
                color: "#1976d2",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => setIsLogin(true)}
            >
              Login
            </Box>
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button autoFocus onClick={handleClose}>
          Voltar
        </Button>
        <Button
          onClick={() => {
            if (isLogin) doLogin();
          }}
          autoFocus
        >
          {isLogin ? "Login" : "Registro"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
