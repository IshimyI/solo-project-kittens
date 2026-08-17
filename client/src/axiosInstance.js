import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_TARGET}/api`,
  withCredentials: true,
});

let accessToken = "";

export function setAccessToken(newToken) {
  accessToken = newToken;
}

// Пишем перехватчик для приклеивания accessToken к каждому запросу
axiosInstance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Пишем перехватчик для перевыпуска accessToken при его истечении
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const prevReq = error.config;
    if (error.response?.status === 401 && prevReq && !prevReq.sent) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_TARGET}/api/tokens/refresh`,
          { withCredentials: true }
        );
        accessToken = response.data.accessToken;
        prevReq.sent = true;
        prevReq.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(prevReq);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
