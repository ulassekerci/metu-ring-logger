import { Hono } from 'hono'

const app = new Hono()

app.get('/', async (c) => {
  return c.json(stops)
})

export const stops = [
  {
    name: 'A2 Metro Çıkışı',
    lat: 39.907035,
    lng: 32.7658664,
    address: 'ODTU A2 Kapisi',
  },
  {
    name: 'BÖTE/MYO',
    lat: 39.9014027,
    lng: 32.7727863,
    address: 'BOTE-MYO',
  },
  {
    name: 'Eğitim Fakültesi',
    lat: 39.899822,
    lng: 32.776089,
    address: 'Egitim Fak.',
  },
  {
    name: 'Teknokent',
    lat: 39.8966594,
    lng: 32.7768289,
    address: 'Teknokent',
  },
  {
    name: 'ODTÜKENT Spor Salonu',
    lat: 39.892267,
    lng: 32.777322,
    address: 'Enformatik',
  },
  {
    name: 'ODTÜKENT Kavşağı',
    lat: 39.889307,
    lng: 32.777573,
    address: null,
  },
  {
    name: 'İsa Demiray',
    lat: 39.887465,
    lng: 32.777747,
    address: 'Isa Demiray',
  },
  {
    name: 'Uzay Havacılık',
    lat: 39.885105,
    lng: 32.7778,
    address: 'Havacilik',
  },
  {
    name: 'Gıda Mühendisliği',
    lat: 39.8877157,
    lng: 32.7793614,
    address: 'Gida Muh.',
  },
  {
    name: 'Jeoloji Mühendisliği',
    lat: 39.8866786,
    lng: 32.7813511,
    address: 'Jeoloji Muh.',
  },
  {
    name: 'Makine Mühendisliği',
    lat: 39.8900906,
    lng: 32.7814463,
    address: 'Makina Muh.',
  },
  {
    name: 'Endüstri Mühendisliği',
    lat: 39.8923667,
    lng: 32.7811311,
    address: 'Endustri Muh.',
  },
  {
    name: 'Kreş (Yuva)',
    lat: 39.8958114,
    lng: 32.7808575,
    address: 'Yuva Md.',
  },
  {
    name: 'Mimarlık',
    lat: 39.8981699,
    lng: 32.7807502,
    address: 'Mimarlik',
  },
  {
    name: 'YDYO',
    lat: 39.9003082,
    lng: 32.7818915,
    address: 'YDYO',
  },
  {
    name: 'İİBF',
    lat: 39.8988328,
    lng: 32.7837235,
    address: 'IIBF',
  },
  {
    name: 'Rektörlük',
    lat: 39.8958974,
    lng: 32.7842492,
    address: 'Rektorluk',
  },
  {
    name: 'Ziraat Bankası',
    lat: 39.891827,
    lng: 32.7879459,
    address: 'Ziraat Bankasi',
  },
  {
    name: 'Doğu Yurtlar',
    lat: 39.889329,
    lng: 32.790685,
    address: 'Dogu yurtlar',
  },
  {
    name: 'İş Bankası',
    lat: 39.891848,
    lng: 32.7892272,
    address: 'Is bankasi',
  },
  {
    name: 'Kültür Kongre Merkezi',
    lat: 39.8933701,
    lng: 32.7855037,
    address: 'KKM',
  },
  {
    name: 'İnşaat Mühendisliği',
    lat: 39.8897591,
    lng: 32.7842411,
    address: 'Insaat Muh.',
  },
  {
    name: 'Kimya Mühendisliği',
    lat: 39.8873288,
    lng: 32.7825425,
    address: 'Kimya Muh.',
  },
  {
    name: 'Garajlar',
    lat: 39.9053798,
    lng: 32.7688954,
    address: 'Garajlar',
  },
  {
    name: 'A1 Kapısı',
    lat: 39.907233,
    lng: 32.7838845,
    address: 'ODTU A1 Kapisi',
  },
  {
    name: 'Devrim Kavşağı',
    lat: 39.8934101,
    lng: 32.7848768,
    address: null,
  },
]

export default app
