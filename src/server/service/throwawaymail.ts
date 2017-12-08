import { pgClient } from "../services"

import * as puppeteer from "puppeteer"

const rEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@((?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))/

class ThrowawaymailService {
  async getRandomThrowaway() {
    const args = [ '--proxy-server="http=localhost:8118;"' ]
    const browser = await puppeteer.launch({ args })
    const page = await browser.newPage()
    await page.goto("http://www.throwawaymail.com")
    await page.waitForSelector("#email")
    const element = await page.$("#email")
    const elementText = await element.evaluate(element => element.textContent)
    await browser.close()
    return elementText
  }

  async run() {
    console.log("Gathering random email from http://www.throwawaymail.com...")

    const email = await this.getRandomThrowaway()
    const domainName = rEmail.exec(email)[1]

    await pgClient.query(
      "INSERT INTO domains(name, reason, reason_url, reason_details) VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING",
      [
        domainName,
        1,
        "https://www.throwawaymail.com",
        "SCANNED_THROWAWAY",
      ],
    )

    console.log(`Done with http://www.throwawaymail.com, found ${domainName}`)

    setTimeout(() => this.run(), 1000 * 60 * 30)
  }
}

export default ThrowawaymailService
