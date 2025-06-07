import type { ServerResponse } from '#types';
import { getBaseUrl } from '#config';

export async function addEmailToWaitingList(
   email: string,
): ServerResponse<{ message: string }> {
   const apiUrl = getBaseUrl();
   const endpoint = `${apiUrl}/waiting-list`;
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
