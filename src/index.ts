import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { crawl, lastCrawl } from './crawler'
import { shouldCrawl } from './util/helpers'
import { cors } from 'hono/cors'
import trips from './routes/trips'
import stops from './routes/stops'
import averages from './routes/averages'

const app = new Hono()
app.use(cors())

app.get('/', (c) => c.json(lastCrawl))
app.route('/trips', trips)
app.route('/stops', stops)
app.route('/averages', averages)

setInterval(() => {
  if (shouldCrawl()) crawl()
}, 1000)

serve(app)
