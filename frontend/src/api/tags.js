import client from './client'

export const listTags = () =>
  client.get('/tags').then((r) => r.data)

export const createTag = (nombre, color_hex) =>
  client.post('/tags', { nombre, color_hex }).then((r) => r.data)

export const deleteTag = (id) =>
  client.delete(`/tags/${id}`).then((r) => r.data)
