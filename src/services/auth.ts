import jwtDecode from "jwt-decode";
import { post } from "./generic";
import validator from "validator";

export async function Login(email: string, password: string) {
  try {
    const token = await post("/login", { email, password });
    localStorage.setItem("token", token);
  } catch (error) {
    throw error;
  }
}

export const doLogout = () => {
  localStorage.removeItem("token");
};

export function isLogged() {
  const token = localStorage.getItem("token");

  if (token && validator.isJWT(token)) {
    const jwt = jwtDecode<any>(token);
    if (jwt && jwt.exp && jwt.exp > new Date().valueOf() / 1000) {
      return true;
    }
  }

  doLogout();
  return false;
}
