import axios from "axios";
import { DEFALT_REQUEST_URL, DEVELOPMENT_URL_VERSION } from "../constants";
import Cookies from "js-cookie";

export async function login({ email, password }) {
  try {
    const {
      data: {
        session: { user },
      },
    } = await axios.post(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/users/login`,
      {
        email,
        password,
      },
      {
        withCredentials: true, // 正确配置跨域凭证
        headers: {
          "Content-Type": "application/json",
          // 不要在此处设置 credentials，用 withCredentials 代替
        },
      }
    );

    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error logging in");
  }
}

export async function signup({ name, email, password, passwordConfirm }) {
  try {
    const {
      data: {
        session: { user },
      },
    } = await axios.post(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/users/signup`,
      {
        name,
        email,
        password,
        passwordConfirm,
      },
      {
        withCredentials: true, // 正确配置跨域凭证
        headers: {
          "Content-Type": "application/json",
          // 不要在此处设置 credentials，用 withCredentials 代替
        },
      }
    );

    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error signing up");
  }
}

export function getCurrentUser() {
  const session = Cookies.get("session");
  if (session) return JSON.parse(session.replace(/^j:/, ""));
  else return "nothing";
}

export async function logout() {
  console.log("logout");
  Cookies.remove("session");
}
