import type { ServerResponse } from '@/api/types';
import { BASE_URL } from '@/constants';

export async function addEmailToWaitingList(
   email: string,
): ServerResponse<{ message: string }> {
   await new Promise((r) => {
      setTimeout(r, 3000);
   });
   const endpoint = `${BASE_URL}/api/waiting-list`;
   const requestInit: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
   };

   const res = await fetch(endpoint, requestInit);
   const data = await res.json();
   if (!res.ok) {
      throw new Error(data.error.message);
   }
   return data;
}
