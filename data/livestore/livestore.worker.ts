import { makeWorker } from '@livestore/adapter-web/worker'
import { RECOIN_BASE_SCHEMA } from './schema'

makeWorker({ schema: RECOIN_BASE_SCHEMA })
