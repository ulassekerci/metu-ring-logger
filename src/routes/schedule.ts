import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {
  return c.json(schedule)
})

const schedule = [
  {
    color: '#FFFF57',
    time: '09:00:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '09:20:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '09:40:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '10:00:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '10:20:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '10:40:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '11:00:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '11:20:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '11:40:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '12:00:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '12:20:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '12:40:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '13:00:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '13:20:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '13:40:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '14:00:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '14:20:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '14:40:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '15:00:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '15:20:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '15:40:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '16:00:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '16:20:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '16:40:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '17:05:00',
    weekend: false,
  },
  {
    color: '#FFFF57',
    time: '17:35:00',
    weekend: false,
  },
  {
    color: '#A64D00',
    time: '18:20:00',
    weekend: false,
  },
  {
    color: '#A64D00',
    time: '18:40:00',
    weekend: false,
  },
  {
    color: '#A64D00',
    time: '19:00:00',
    weekend: false,
  },
  {
    color: '#A64D00',
    time: '19:20:00',
    weekend: false,
  },
  {
    color: '#A64D00',
    time: '19:40:00',
    weekend: false,
  },
  {
    color: '#A64D00',
    time: '20:00:00',
    weekend: false,
  },
  {
    color: '#9600CD',
    time: '00:30:00',
    weekend: false,
  },
  {
    color: '#9600CD',
    time: '20:30:00',
    weekend: false,
  },
  {
    color: '#9600CD',
    time: '21:10:00',
    weekend: false,
  },
  {
    color: '#9600CD',
    time: '21:50:00',
    weekend: false,
  },
  {
    color: '#9600CD',
    time: '22:30:00',
    weekend: false,
  },
  {
    color: '#9600CD',
    time: '23:10:00',
    weekend: false,
  },
  {
    color: '#9600CD',
    time: '23:50:00',
    weekend: false,
  },
  {
    color: '#737373',
    time: '08:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '09:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '10:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '11:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '12:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '13:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '14:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '15:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '16:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '17:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '18:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '19:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '20:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '21:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '22:30:00',
    weekend: true,
  },
  {
    color: '#737373',
    time: '23:30:00',
    weekend: true,
  },
]

export default app
