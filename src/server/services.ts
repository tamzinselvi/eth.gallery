import { Client } from "pg"

import Server from "./server"
import ThrowawaymailService from "./service/throwawaymail"
import RawService from "./service/raw"
import MalwaredomainlistService from "./service/malwaredomainlist"

export let server = new Server()
export let pgClient = new Client()
export let throwawaymailService = new ThrowawaymailService()
export let rawService = new RawService([
  "https://raw.githubusercontent.com/MattKetmo/EmailChecker/master/res/throwaway_domains.txt",
  "https://gist.githubusercontent.com/adamloving/4401361/raw/db901ef28d20af8aa91bf5082f5197d27926dea4/temporary-email-address-domains",
  "https://gist.githubusercontent.com/michenriksen/8710649/raw/e09ee253960ec1ff0add4f92b62616ebbe24ab87/disposable-email-provider-domains",
  "https://raw.githubusercontent.com/martenson/disposable-email-domains/master/disposable_email_blacklist.conf",
  "https://raw.githubusercontent.com/andreis/disposable/master/domains.txt",
])
export let malwaredomainlistService = new MalwaredomainlistService()
