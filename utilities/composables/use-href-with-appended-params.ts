import { useRouter } from 'retend/router'

export function useHrefWithAppendedParams(record: Record<string, string>) {
   const router = useRouter()
   const currentRoute = router.getCurrentRoute().get()
   const query = new URLSearchParams(currentRoute.query)
   for (const [key, value] of Object.entries(record)) {
      query.append(key, value)
   }
   return `${currentRoute.path}?${query}`
}
