import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

let accessToken = "";

export function setAccessToken(newToken) {
  accessToken = newToken;
}

export default axiosInstance;
