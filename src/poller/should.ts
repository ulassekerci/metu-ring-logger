import { DateTime } from 'luxon'

export const shouldPoll = () => {
  // If polling is disabled, do not poll
  if (process.env.DISABLE_POLLING) return false

  // If it is night, do not poll
  if (DateTime.now().hour >= 2 && DateTime.now().hour < 8) return false

  return true
}
