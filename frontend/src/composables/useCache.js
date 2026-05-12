import { CACHE_TTL, CACHE_KEYS } from '../config'
export function useCache() {
  const getCachedData = (key) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp > CACHE_TTL) { localStorage.removeItem(key); return null }
      return data
    } catch { return null }
  }
  const setCachedData = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })) } catch {}
  }
  return { getCachedData, setCachedData, CACHE_KEYS }
}
