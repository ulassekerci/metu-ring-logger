import postgres from 'postgres'
import 'dotenv/config'

if (!process.env.PGHOST) throw new Error('PGHOST not set')
const sql = postgres(process.env.PGHOST)

export default sql
