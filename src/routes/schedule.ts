import { Request, Response, Router } from 'express'
import { ringLines } from '../data/lines'

const app = Router()

app.get('/', async (req: Request, res: Response) => {
  return res.json(
    ringLines.flatMap((line) => {
      return line.departures.map((departure) => ({
        colors: line.colors,
        time: departure,
        weekend: line.weekend,
      }))
    })
  )
})

export default app
