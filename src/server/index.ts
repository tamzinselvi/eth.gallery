import { server, pgClient, throwawaymailService, rawService, malwaredomainlistService } from "./services"

async function start() {
  await pgClient.connect()
  await server.start()

  if (process.env.RUN_TASKS) {
    throwawaymailService.run()
    rawService.run()
    malwaredomainlistService.run()
  }
}

start().catch(err => console.error(err))
