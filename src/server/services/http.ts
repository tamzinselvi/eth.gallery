import * as HTTP from "http"

import { app } from "./express"

export const http = new HTTP.Server(app)
