import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const client = axios.create({ baseURL: BASE_URL })

client.interceptors.request.use((config) => {
  const raw = localStorage.getItem('docusflow-auth')
  if (raw) {
    const { state } = JSON.parse(raw)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('docusflow-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
