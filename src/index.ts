import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { crawl, lastCrawl } from './crawler'
import { shouldCrawl } from './helpers'
import { cors } from 'hono/cors'
import trips from './trips'
import stops from './stops'

const app = new Hono()
app.use(cors())

app.get('/', (c) => c.json(lastCrawl))
app.route('/trips', trips)
app.route('/stops', stops)

setInterval(() => {
  if (shouldCrawl()) crawl()
}, 1000)

serve(app)
