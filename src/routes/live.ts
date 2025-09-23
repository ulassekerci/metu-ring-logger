import { Request, Response, Router } from 'express'
import { lastPoll } from '../poller'
import { vehicles as vehicleInfo } from '../data/vehicles'

const app = Router()

app.get('/', async (req: Request, res: Response) => {
  const vehicles = lastPoll.data?.map((point) => {
    const plate = point.plate
    const info = vehicleInfo.find((info) => info.plate === plate)
    return { plate, info: info ?? null }
  })
  return res.json({ ...lastPoll, vehicles })
})

export default app
