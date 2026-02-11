import { DateTime, Duration } from 'luxon'

export class ServiceTime {
  readonly seconds: number

  constructor(seconds: number) {
    this.seconds = Math.floor(seconds)
  }

  static fromLuxon(luxon: DateTime) {
    let serviceStart = luxon.set({ hour: 6, minute: 0, second: 0 })
    if (luxon < serviceStart) serviceStart = serviceStart.minus({ days: 1 })
    const seconds = luxon.diff(serviceStart, 'seconds').seconds
    return new ServiceTime(seconds)
  }

  static now() {
    return this.fromLuxon(DateTime.now())
  }

  static fromFormat(text: string, format: string) {
    const luxon = DateTime.fromFormat(text, format)
    return this.fromLuxon(luxon)
  }

  get morning() {
    return DateTime.now().minus({ seconds: this.seconds })
  }

  get isWeekend() {
    return this.morning.isWeekend
  }

  diff(other: ServiceTime) {
    const diffSeconds = Math.abs(this.seconds - other.seconds)
    return Duration.fromObject({ seconds: diffSeconds })
  }

  plus({ hours, minutes, seconds }: { hours?: number; minutes?: number; seconds?: number }) {
    let currentSeconds = this.seconds
    if (hours) currentSeconds += hours * 3600
    if (minutes) currentSeconds += minutes * 60
    if (seconds) currentSeconds += seconds
    return new ServiceTime(currentSeconds)
  }

  minus({ hours, minutes, seconds }: { hours?: number; minutes?: number; seconds?: number }) {
    let currentSeconds = this.seconds
    if (hours) currentSeconds -= hours * 3600
    if (minutes) currentSeconds -= minutes * 60
    if (seconds) currentSeconds -= seconds
    return new ServiceTime(currentSeconds)
  }

  toJSON() {
    return this.seconds
  }

  toHuman() {
    return DateTime.fromObject({ hour: 6 }).plus({ seconds: this.seconds }).toFormat('HH:mm')
  }
}
