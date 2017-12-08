import * as rp from "request-promise"

import { pgClient } from "../services"

class RawService {
  constructor(private urls: string[], private reason: number = 1, private reasonDetails: string = "SCANNED_THROWAWAY") {}

  getRaw(uri) {
    return rp({
      uri,
    })
  }

  async run() {
    console.log("Gathering RAW blacklists...")

    const raws = await Promise.all(
      this.urls.map(url => this.getRaw(url))
    )

    console.log("Updating RAW listings...")

    raws.forEach(async (raw, i) => {
      raw.split(/\r?\n/).forEach(async (domainName) => {
        await pgClient.query(
          "INSERT INTO domains(name, reason, reason_url, reason_details) VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING",
          [
            domainName,
            this.reason,
            this.urls[i],
            this.reasonDetails,
          ],
        )
      })
    })

    console.log("Done with RAW...")
  }
}

export default RawService
