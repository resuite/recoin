import type { Currency } from '@/api/database/types'
import {
   DbWorkerMessages,
   type DbWorkerResponseMap,
   type Sender,
   type WorkerChannel
} from '@/data/shared'
import { createChannel } from 'bidc'
import DbWorker from './data.worker?worker'

let send: Sender<DbWorkerResponseMap>
export function initializeDbWorker() {
   const worker = new DbWorker()
   const channel = createChannel(worker) as WorkerChannel<DbWorkerResponseMap>
   send = channel.send
}

export async function getIncomeCategories() {
   return await send({ key: DbWorkerMessages.GetIncomeCategories })
}

export async function getExpenseCategories() {
   return await send({ key: DbWorkerMessages.GetExpenseCategories })
}

export async function getCategoryById(id: string) {
   return await send({ key: DbWorkerMessages.GetCategoryById, payload: id })
}

export async function getHomeStats() {
   return await send({ key: DbWorkerMessages.GetHomeStats })
}

export const defaultCurrency: Currency = {
   id: 'currency_ngn',
   value: 'NGN'
}
