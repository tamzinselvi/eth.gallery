import * as Express from "express"

import apiRouter from "./api"

const router = Express.Router();

router.use('/api', apiRouter);

export default router
