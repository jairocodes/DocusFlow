import client from './client'

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((r) => r.data)

export const logout = () => client.post('/auth/logout')

export const getMe = () => client.get('/auth/me').then((r) => r.data)

export const changePassword = (password_actual, password_nuevo) =>
  client.put('/auth/me/password', { password_actual, password_nuevo }).then((r) => r.data)
