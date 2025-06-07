import { handle } from 'hono/cloudflare-pages';
import waitingList from '@recoin/api/waiting-list/server';

export const onRequest = handle(waitingList);
