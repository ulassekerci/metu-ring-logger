import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { lastCrawl } from '../crawler'
import { DateTime } from 'luxon'

const app = new Hono()
let id = 0
let lastTimeSent: DateTime | null = null

app.get('/', (c) => c.json(lastCrawl))

app.get('/sse', async (c) => {
  return streamSSE(c, async (stream) => {
    while (true) {
      if (lastCrawl.timestamp !== lastTimeSent) {
        await stream.writeSSE({
          data: JSON.stringify(lastCrawl),
          event: 'ring-update',
          id: String(id++),
        })
        lastTimeSent = lastCrawl.timestamp
      }
      await stream.sleep(200)
    }
  })
})

export default app
