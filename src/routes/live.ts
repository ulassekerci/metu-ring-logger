import { Request, Response, Router } from 'express'
import { liveData } from '../poller/store'

const app = Router()

app.get('/', async (req: Request, res: Response) => {
  return res.json(liveData.trips)
})

export default app
