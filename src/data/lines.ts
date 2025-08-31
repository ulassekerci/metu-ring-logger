import { RingLine } from '../entities/Line'
import { blueInboundPolyline } from './polylines/blue-in'
import { blueOutboundPolyline } from './polylines/blue-out'
import { brownInboundPolyline } from './polylines/brown-in'
import { brownOutboundPolyline } from './polylines/brown-out'
import { grayDayInboundPolyline } from './polylines/gray-day-in'
import { grayDayOutboundPolyline } from './polylines/gray-day-out'
import { grayNightInboundPolyline } from './polylines/gray-night-in'
import { grayNightOutboundPolyline } from './polylines/gray-night-out'
import { purpleInboundPolyline } from './polylines/purple-in'
import { purpleOutboundPolyline } from './polylines/purple-out'
import { redPolyline } from './polylines/red'
import { yellowPolyline } from './polylines/yellow'
import { blueDepartures, brownDepartures, grayDepartures, purpleDepartures, yellowRedDepartures } from './schedule'
import * as stops from './stops'

const yellowRedLine = new RingLine({
  name: 'Sarı-Kırmızı Ring',
  departures: yellowRedDepartures,
  weekend: false,
  sections: [
    {
      name: 'Sarı',
      color: '#FFFF57',
      polyline: yellowPolyline,
      stops: [
        { stop: stops.a2Metro, mins: 0 },
        { stop: stops.kolej, mins: 1 },
        { stop: stops.boteOutbound, mins: 3 },
        { stop: stops.egitimOutbound, mins: 4 },
        { stop: stops.teknokent, mins: 5 },
        { stop: stops.odtukentSpor, mins: 6 },
        { stop: stops.odtukentKavsak, mins: 7 },
        { stop: stops.isaOutbound, mins: 8 },
        { stop: stops.havacilik, mins: 9 },
        { stop: stops.isaInbound, mins: 11 },
        { stop: stops.gida, mins: 13 },
        { stop: stops.jeoloji, mins: 14 },
        { stop: stops.makine, mins: 15 },
        { stop: stops.endustri, mins: 16 },
        { stop: stops.yuva, mins: 17 },
        { stop: stops.mimarlik, mins: 18 },
        { stop: stops.ydyo, mins: 19 },
        { stop: stops.iibf, mins: 21 },
        { stop: stops.rektorluk, mins: 22 },
        { stop: stops.ziraat, mins: 24 },
        { stop: stops.doguYurtlar, mins: 25 },
      ],
    },
    {
      name: 'Kırmızı',
      color: '#FF0000',
      polyline: redPolyline,
      stops: [
        { stop: stops.doguYurtlar, mins: 25 },
        { stop: stops.isBank, mins: 27 },
        { stop: stops.kkm, mins: 28 },
        { stop: stops.insaat, mins: 29 },
        { stop: stops.kimya, mins: 30 },
        { stop: stops.makine, mins: 31 },
        { stop: stops.endustri, mins: 32 },
        { stop: stops.yuva, mins: 33 },
        { stop: stops.mimarlik, mins: 34 },
        { stop: stops.egitimInbound, mins: 36 },
        { stop: stops.boteInbound, mins: 37 },
        { stop: stops.garajlar, mins: 38 },
        { stop: stops.a2Metro, mins: 39 },
      ],
    },
  ],
})

const brownLine = new RingLine({
  name: 'Kahverengi Ring',
  departures: brownDepartures,
  weekend: false,
  sections: [
    {
      name: 'Outbound',
      color: '#A64D00',
      polyline: brownOutboundPolyline,
      stops: [
        { stop: stops.a1Kapisi, mins: 0 },
        { stop: stops.iibf, mins: 2 },
        { stop: stops.rektorluk, mins: 3 },
        { stop: stops.devrimKavsak, mins: 4 },
        { stop: stops.insaat, mins: 5 },
        { stop: stops.kimya, mins: 6 },
      ],
    },
    {
      name: 'Inbound',
      color: '#A64D00',
      polyline: brownInboundPolyline,
      stops: [
        { stop: stops.kimya, mins: 6 },
        { stop: stops.makine, mins: 8 },
        { stop: stops.endustri, mins: 9 },
        { stop: stops.yuva, mins: 11 },
        { stop: stops.mimarlik, mins: 12 },
        { stop: stops.ydyo, mins: 13 },
        { stop: stops.a1Kapisi, mins: 15 },
      ],
    },
  ],
})

const blueLine = new RingLine({
  name: 'Lacivert Ring',
  departures: blueDepartures,
  weekend: false,
  sections: [
    {
      name: 'Outbound',
      color: '#0000FF',
      polyline: blueOutboundPolyline,
      stops: [
        { stop: stops.doguYurtlar, mins: 0 },
        { stop: stops.isBank, mins: 1 },
        { stop: stops.kkm, mins: 2 },
        { stop: stops.insaat, mins: 4 },
        { stop: stops.kimya, mins: 5 },
        { stop: stops.makine, mins: 6 },
        { stop: stops.endustri, mins: 7 },
        { stop: stops.yuva, mins: 8 },
        { stop: stops.mimarlik, mins: 9 },
        { stop: stops.teknokent, mins: 11 },
        { stop: stops.odtukentSpor, mins: 12 },
        { stop: stops.odtukentKavsak, mins: 13 },
        { stop: stops.isaOutbound, mins: 14 },
        { stop: stops.havacilik, mins: 15 },
      ],
    },
    {
      name: 'Inbound',
      color: '#0000FF',
      polyline: blueInboundPolyline,
      stops: [
        { stop: stops.isaInbound, mins: 17 },
        { stop: stops.gida, mins: 18 },
        { stop: stops.jeoloji, mins: 19 },
        { stop: stops.kimya, mins: 20 },
        { stop: stops.insaat, mins: 21 },
        { stop: stops.ziraat, mins: 23 },
        { stop: stops.doguYurtlar, mins: 25 },
      ],
    },
  ],
})

const purpleLine = new RingLine({
  name: 'Mor Ring',
  departures: purpleDepartures,
  weekend: false,
  sections: [
    {
      name: 'Outbound',
      color: '#9600CD',
      polyline: purpleOutboundPolyline,
      stops: [
        { stop: stops.a1Kapisi, mins: 0 },
        { stop: stops.iibf, mins: 2 },
        { stop: stops.rektorluk, mins: 3 },
        { stop: stops.ziraat, mins: 4 },
        { stop: stops.doguYurtlar, mins: 5 },
        { stop: stops.isBank, mins: 7 },
        { stop: stops.kkm, mins: 8 },
        { stop: stops.insaat, mins: 9 },
        { stop: stops.kimya, mins: 10 },
        { stop: stops.makine, mins: 11 },
        { stop: stops.endustri, mins: 12 },
        { stop: stops.yuva, mins: 13 },
        { stop: stops.mimarlik, mins: 14 },
        { stop: stops.teknokent, mins: 15 },
        { stop: stops.odtukentSpor, mins: 16 },
        { stop: stops.odtukentKavsak, mins: 17 },
        { stop: stops.isaOutbound, mins: 18 },
        { stop: stops.havacilik, mins: 19 },
      ],
    },
    {
      name: 'Inbound',
      color: '#9600CD',
      polyline: purpleInboundPolyline,
      stops: [
        { stop: stops.isaInbound, mins: 20 },
        { stop: stops.gida, mins: 21 },
        { stop: stops.jeoloji, mins: 22 },
        { stop: stops.kimya, mins: 23 },
        { stop: stops.insaat, mins: 24 },
        { stop: stops.kkm, mins: 25 },
        // TODO: consider adding rektörlük stop
        { stop: stops.a1Kapisi, mins: 27 },
      ],
    },
  ],
})

const grayDayLine = new RingLine({
  name: 'Gri Ring Gündüz',
  departures: grayDepartures.day,
  weekend: true,
  sections: [
    {
      name: 'Outbound',
      color: '#737373',
      polyline: grayDayOutboundPolyline,
      stops: [
        { stop: stops.a2Metro, mins: 0 },
        { stop: stops.kolej, mins: 1 },
        { stop: stops.boteOutbound, mins: 3 },
        { stop: stops.egitimOutbound, mins: 4 },
        { stop: stops.teknokent, mins: 5 },
        { stop: stops.odtukentSpor, mins: 6 },
        { stop: stops.odtukentKavsak, mins: 7 },
        { stop: stops.isaOutbound, mins: 8 },
        { stop: stops.havacilik, mins: 9 },
        { stop: stops.isaInbound, mins: 10 },
        { stop: stops.ydyo, mins: 14 },
        { stop: stops.iibf, mins: 15 },
        { stop: stops.rektorluk, mins: 16 },
        { stop: stops.ziraat, mins: 17 },
        { stop: stops.doguYurtlar, mins: 18 },
      ],
    },
    {
      name: 'Inbound',
      color: '#737373',
      polyline: grayDayInboundPolyline,
      stops: [
        { stop: stops.doguYurtlar, mins: 18 },
        { stop: stops.isBank, mins: 20 },
        { stop: stops.kkm, mins: 21 },
        { stop: stops.a1Kapisi, mins: 24 },
        { stop: stops.iibf, mins: 25 },
        { stop: stops.rektorluk, mins: 26 },
        { stop: stops.insaat, mins: 27 },
        { stop: stops.kimya, mins: 28 },
        { stop: stops.jeoloji, mins: 29 },
        { stop: stops.gida, mins: 30 },
        { stop: stops.isaOutbound, mins: 31 },
        { stop: stops.havacilik, mins: 32 },
        { stop: stops.isaInbound, mins: 33 },
        { stop: stops.egitimInbound, mins: 37 },
        { stop: stops.boteInbound, mins: 38 },
        { stop: stops.garajlar, mins: 39 },
        { stop: stops.a2Metro, mins: 40 },
      ],
    },
  ],
})

const grayNightLine = new RingLine({
  name: 'Gri Ring Gece',
  departures: grayDepartures.night,
  weekend: true,
  sections: [
    {
      name: 'Outbound',
      color: '#737373',
      polyline: grayNightOutboundPolyline,
      stops: [
        { stop: stops.a2Metro, mins: 0 },
        { stop: stops.kolej, mins: 1 },
        { stop: stops.boteOutbound, mins: 2 },
        { stop: stops.egitimOutbound, mins: 3 },
        { stop: stops.teknokent, mins: 4 },
        { stop: stops.odtukentSpor, mins: 5 },
        { stop: stops.odtukentKavsak, mins: 6 },
        { stop: stops.isaOutbound, mins: 7 },
        { stop: stops.havacilik, mins: 8 },
        { stop: stops.isaInbound, mins: 9 },
        { stop: stops.gida, mins: 10 },
        { stop: stops.jeoloji, mins: 11 },
        { stop: stops.kimya, mins: 12 },
        { stop: stops.insaat, mins: 13 },
        { stop: stops.ziraat, mins: 14 },
        { stop: stops.doguYurtlar, mins: 15 },
      ],
    },
    {
      name: 'Inbound',
      color: '#737373',
      polyline: grayNightInboundPolyline,
      stops: [
        { stop: stops.doguYurtlar, mins: 15 },
        { stop: stops.isBank, mins: 17 },
        { stop: stops.kkm, mins: 18 },
        { stop: stops.a1Kapisi, mins: 21 },
        { stop: stops.iibf, mins: 23 },
        { stop: stops.rektorluk, mins: 24 },
        { stop: stops.insaat, mins: 25 },
        { stop: stops.kimya, mins: 26 },
        { stop: stops.jeoloji, mins: 27 },
        { stop: stops.gida, mins: 28 },
        { stop: stops.isaOutbound, mins: 29 },
        { stop: stops.havacilik, mins: 30 },
        { stop: stops.isaInbound, mins: 32 },
        { stop: stops.egitimInbound, mins: 36 },
        { stop: stops.boteInbound, mins: 37 },
        { stop: stops.garajlar, mins: 38 },
        { stop: stops.a2Metro, mins: 39 },
      ],
    },
  ],
})

export const ringLines = [yellowRedLine, brownLine, blueLine, purpleLine, grayDayLine, grayNightLine]
