import * as Express from "express"
import * as emailCheck from "email-check"

import { pgClient } from "../../services"

const router = Express.Router();

const rEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@((?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))/

router.get('/:email', async (req, res) => {
  if (!rEmail.test(req.params.email)) {
    return res.status(400).json({
      reason: "BAD_EMAIL"
    })
  }

  const domainName = rEmail.exec(req.params.email)[1]

  const match = await pgClient.query(
    "SELECT * FROM domains WHERE name = $1",
    [ domainName ],
  )

  if (match.rows.length) {
    const data = match.rows[0]
    return res.status(200).json({ reason: data.reason, reasonDetails: data.reason_details })
  }

  emailCheck(req.params.email)
    .then((valid) => {
      if (valid) {
        res.status(204).end()
      }
      else {
        res.status(200).json({ reason: 0, reasonDetails: "INVALID_EMAIL" })
      }
    })
    .catch((err) => {
      if (err.message === 'refuse') {
        return res.status(200).json({ reason: 0, reasonDetails: "INVALID_EMAIL" })
      }

      res.status(204).end()
    })
})

export default router
