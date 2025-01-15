import { z, TypeOf } from 'zod'

export const zodEnv = z.object({
  PGHOST: z.string(),
  OSRM: z.string(),
  JWT_SECRET: z.string(),
  DISABLE_CRAWLER: z.string().optional(),
  DISABLE_LOGGING: z.string().optional(),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof zodEnv> {}
  }
}

try {
  zodEnv.parse(process.env)
} catch (err) {
  if (!(err instanceof z.ZodError)) throw err
  const missing = err.errors.map((e) => e.path).join(', ')
  console.error(`Missing environment variables: ${missing}`)
  process.exit(1)
}
