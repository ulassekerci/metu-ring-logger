import { Request, Response, Router } from 'express'

const app = Router()

app.get('/', async (req: Request, res: Response) => {
  return res.json()
})

export default app
