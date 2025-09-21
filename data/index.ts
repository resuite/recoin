import type { Currency } from '@/api/database/types'
import { DbWorkerMessages, type DbWorkerResponseMap, type WorkerChannel } from '@/data/shared'
import { createChannel } from 'bidc'
import dataWorkerUrl from './data.worker?url'

const worker = new Worker(dataWorkerUrl, { type: 'module' })
const { send } = createChannel(worker) as WorkerChannel<DbWorkerResponseMap>

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
