import { io } from "socket.io-client";
const URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";
export const socket = io(URL, { autoConnect: false, withCredentials: true, transports: ["websocket", "polling"] });
