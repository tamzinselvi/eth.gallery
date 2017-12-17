import * as IO from "socket.io"

import { http } from "./http"

export const io = IO(http)
