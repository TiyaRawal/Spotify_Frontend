import axios from "axios";
import CheckToken from "./CheckToken";
import Home from "../src/pages/Home";

let api = axios.create({
    baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
    let token = CheckToken();
    if(token) {
        config.headers.Authorization = "Bearer " + token;
    }
    return config;
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            Home();
        }
        return Promise.reject(err);
    }
)

export default api;
