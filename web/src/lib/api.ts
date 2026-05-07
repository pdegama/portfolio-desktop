import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

const api = axios.create({
  baseURL: API_BASE_URL,
})

export default api
