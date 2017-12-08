import * as Express from "express"

import emailRouter from "./api/email"

const router = Express.Router()

router.use("/email", emailRouter)

export default router
