import axios from 'axios'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

export const API_BASE_URL =
  configuredApiBaseUrl?.replace(/\/$/, '') || window.location.origin

export function getWebSocketUrl(path = '/ws') {
  const url = new URL(path, `${API_BASE_URL}/`)
  url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

const api = axios.create({
  baseURL: API_BASE_URL,
})

export default api
