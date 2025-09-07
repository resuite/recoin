import type { Config } from 'drizzle-kit'

const accountId = process.env.CF_ACCOUNT_ID as string
const databaseId = process.env.CF_DATABASE_ID as string
const token = process.env.CF_API_TOKEN as string

const config: Config = {
   dialect: 'sqlite',
   schema: './api/database/schema.ts',
   out: './migrations',
   driver: 'd1-http',
   dbCredentials: { accountId, databaseId, token }
}

export default config
