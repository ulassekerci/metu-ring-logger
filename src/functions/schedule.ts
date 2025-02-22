import { DateTime } from 'luxon'
import { schedule } from '../data/schedule'

export const predictDeparture = (tripStart: DateTime, ringColor: string) => {
  const filteredSchedule = schedule.filter((sch) => sch.colors.includes(ringColor.toUpperCase()))
  if (!filteredSchedule.length) return tripStart
  const closestScheduledTime = filteredSchedule.reduce((prev, curr) => {
    const currDiff = getTimeDiff(curr.time, tripStart)
    const prevDiff = getTimeDiff(prev.time, tripStart)
    return currDiff < prevDiff ? curr : prev
  })
  return DateTime.fromFormat(closestScheduledTime.time, 'HH:mm:ss')
}

const getTimeDiff = (time: string, tripStart: DateTime) => {
  const scheduledTime = DateTime.fromFormat(time, 'HH:mm:ss')
  const timeDiff = scheduledTime.diff(tripStart).as('seconds')
  return Math.abs(timeDiff)
}
