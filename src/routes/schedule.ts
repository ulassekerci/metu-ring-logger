import { Request, Response, Router } from 'express'
import { ringLines } from '../data/lines'

const app = Router()

app.get('/', async (req: Request, res: Response) => {
  const schedule = ringLines.map((line) => ({
    name: line.name,
    departures: line.departures,
    weekend: line.weekend,
    colors: line.colors,
  }))
  return res.json(schedule)
})

export default app
