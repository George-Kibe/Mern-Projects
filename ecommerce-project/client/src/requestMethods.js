import axios from "axios";

const BASE_URL= "http://localhost:5000/api/";
const TOKEN ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNWViZTA0MTdiMjEwZWExZTk1YmMxYiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTY1MDM3NjU1MywiZXhwIjoxNjUwNjM1NzUzfQ.RqB5_MU4x0V_gvyDH6AZX0BZTUBEGG1qSLyC2CEYDlU";

const user = JSON.parse(localStorage.getItem("persist:root"))?.user;
const currentUser = user && JSON.parse(user).currentUser;
//const TOKEN = currentUser?.accessToken;

export const publicRequest = axios.create({
    baseURL:BASE_URL,
});

export const userRequest = axios.create({
    baseURL:BASE_URL,
    header:{token:`Bearer ${TOKEN}`},
});
