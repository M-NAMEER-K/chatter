import axios from "axios";
import { setToken, setUser } from "../slices/authSlice";
import { store } from "../reducer/store";

export const axiosInstance = axios.create({
  withCredentials: true
});


axiosInstance.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      store.dispatch(setToken(null));
      store.dispatch(setUser(null));

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";

    }

    return Promise.reject(error);

  }

);


export const apiConnector = async ({ method, url, body }: any) => {

  return axiosInstance({
    method,
    url,
    data: body
  });

};