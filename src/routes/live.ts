import { Request, Response, Router } from 'express'
import { lastPoll } from '../poller'

const app = Router()

app.get('/', async (req: Request, res: Response) => {
  return res.json(lastPoll)
})

export default app
