import { poll } from '.'

let isPolling = false
let failedAttempts = 0

export const runPoller = async () => {
  if (isPolling) return
  if (process.env.DISABLE_POLLING) return

  try {
    isPolling = true
    await poll()
    failedAttempts = 0
  } catch (error) {
    failedAttempts += 1
    if (failedAttempts > 100) {
      console.error('Polling failed 100 times in a row.')
      failedAttempts = 0
    }
  } finally {
    isPolling = false
  }
}
