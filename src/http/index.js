import axios from "axios";

export const http = axios.create({
  #baseURL: "http://localhost:3000",
  baseURL: "https://api-rwqk.onrender.com/",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
