import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { crawl, lastCrawl } from './crawler'
import { shouldCrawl } from './util/helpers'
import { cors } from 'hono/cors'
import { routes } from './routes'
import './util/env'

const app = new Hono()
app.use(cors())

app.get('/', (c) => c.json(lastCrawl))
app.route('/auth', routes.auth)
app.route('/trips', routes.trips)
app.route('/stops', routes.stops)
app.route('/averages', routes.averages)
app.route('/schedule', routes.schedule)

setInterval(() => {
  if (shouldCrawl()) crawl()
}, 1000)

serve(app)
