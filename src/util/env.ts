import { z, TypeOf } from 'zod'

export const zodEnv = z.object({
  PGHOST: z.string(),
  OSRM: z.string(),
  JWT_SECRET: z.string(),
  DISABLE_CRAWLER: z.string().optional(),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof zodEnv> {}
  }
}

export const parseEnv = () => {
  try {
    zodEnv.parse(process.env)
  } catch (err) {
    handleEnvError(err)
  }
}

const handleEnvError = (err: unknown) => {
  if (err instanceof z.ZodError) {
    const { fieldErrors } = err.flatten()
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) => (errors ? `${field}: ${errors.join(', ')}` : field))
      .join('\n  ')
    throw new Error(`Missing environment variables:\n  ${errorMessage}`)
  }
}
